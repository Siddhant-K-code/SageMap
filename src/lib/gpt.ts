import OpenAI from 'openai';
import { Belief } from './client-storage';

// Helper function to extract JSON from GPT response
function extractJSON(text: string): any { // eslint-disable-line @typescript-eslint/no-explicit-any
  try {
    // Try to parse as-is first
    return JSON.parse(text);
  } catch {
    // If that fails, try to find JSON in the response
    const jsonMatch = text.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        // If still fails, return null
        return null;
      }
    }
    return null;
  }
}

function getOpenAIClient(apiKey?: string) {
  // For Azure OpenAI, use server-side configuration
  if (process.env.AZURE_OPENAI_ENDPOINT) {
    return new OpenAI({
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`,
      defaultQuery: { 'api-version': '2024-12-01-preview' },
      defaultHeaders: {
        'api-key': process.env.AZURE_OPENAI_API_KEY,
      },
    });
  }

  // Fallback to regular OpenAI for user-provided keys
  const effectiveApiKey = apiKey || process.env.OPENAI_API_KEY;

  if (!effectiveApiKey) {
    throw new Error('OpenAI API key not found. Please add your API key in Settings or set OPENAI_API_KEY in your .env.local file.');
  }

  return new OpenAI({
    apiKey: effectiveApiKey,
  });
}

export interface ExtractedBelief {
  text: string;
  confidence: number;
  topics: string[];
  belief_type: 'core' | 'assumption' | 'derived';
  evolved_from?: string;
}

export interface ContradictionResult {
  hasContradiction: boolean;
  contradictingBeliefs: string[];
  explanation: string;
}

export interface EvolutionResult {
  hasEvolution: boolean;
  evolvedFromId?: string;
  explanation: string;
}

export async function extractBeliefsFromText(text: string, apiKey?: string): Promise<ExtractedBelief[]> {
  const prompt = `
You are an expert belief analyst specializing in extracting personal beliefs, values, and assumptions from written text. Your task is to carefully analyze the provided text and identify distinct belief statements that reveal the author's worldview.

ANALYSIS FRAMEWORK:
- Core beliefs: Fundamental values and principles that guide major life decisions
- Assumptions: Ideas taken for granted without explicit proof or evidence
- Derived beliefs: Conclusions or opinions formed from experiences or reasoning

For each identified belief, provide:
1. Clear, concise belief statement (avoid duplicating exact wording from text)
2. Confidence level (1-10 scale):
   - 1-3: Tentative, questioning, uncertain
   - 4-6: Moderate confidence, some doubt expressed
   - 7-8: Strong conviction, clearly stated
   - 9-10: Absolute certainty, no doubt expressed
3. Relevant topic categories (be specific and varied)
4. Belief classification (core/assumption/derived)

Text to analyze:
"${text}"

OUTPUT FORMAT - Return ONLY a JSON array:
[
  {
    "text": "Success is more about inner peace than external recognition",
    "confidence": 8,
    "topics": ["success", "values", "happiness", "self-worth"],
    "belief_type": "core"
  }
]

EXTRACTION RULES:
- Extract implicit beliefs, not just explicit statements
- Look for underlying assumptions and values
- Consider emotional tone and conviction level
- Distinguish between facts and personal opinions
- Capture nuanced beliefs, not just obvious ones
- Ensure each belief is distinct and meaningful
- If no clear beliefs found, return empty array []
- Maximum 10 beliefs per text to maintain quality

IMPORTANT: Return ONLY the JSON array, no explanations or additional text.
`;

  try {
    const openai = getOpenAIClient(apiKey);
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return [];

    const beliefs = extractJSON(content);
    if (!beliefs) {
      console.log('Failed to parse JSON from GPT response:', content);
      return [];
    }
    return Array.isArray(beliefs) ? beliefs : [];
  } catch (error: unknown) {
    console.error('Error extracting beliefs:', error);

    if (error instanceof Error && 'code' in error && error.code === 'invalid_api_key') {
      throw new Error('Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable.');
    }

    throw new Error(`Failed to extract beliefs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function checkForContradictions(
newBelief: ExtractedBelief,
existingBeliefs: Belief[],
apiKey?: string
): Promise<ContradictionResult> {
const relevantBeliefs = existingBeliefs.filter(belief =>
belief.topics.some(topic => newBelief.topics.includes(topic)) &&
!belief.deprecated
);

if (relevantBeliefs.length === 0) {
return { hasContradiction: false, contradictingBeliefs: [], explanation: '' };
}

const prompt = `
You are a strict contradiction detection expert. Your job is to identify direct logical contradictions between beliefs.

New belief: "${newBelief.text}"
Confidence: ${newBelief.confidence}/10
Topics: ${newBelief.topics.join(', ')}

Existing beliefs to compare against:
${relevantBeliefs.map((belief, i) =>
`${i + 1}. "${belief.text}" (Confidence: ${belief.confidence}/10, ID: ${belief.id})`
).join('\n')}

STRICT CONTRADICTION CRITERIA:
A contradiction exists when two beliefs make opposing claims about the same subject that CANNOT both be true simultaneously.

Examples of CONTRADICTIONS:
- "Money is the most important thing" vs "Money doesn't matter at all"  
- "Social media connects people" vs "Social media isolates people"
- "Success requires sacrifice" vs "Success doesn't require sacrifice"

NOT contradictions (these are evolution/refinement):
- "I used to think X" vs "Now I think Y"
- Different aspects of the same topic
- Nuanced vs general statements

Return JSON with:
{
"hasContradiction": boolean,
"contradictingBeliefs": ["id1", "id2"], // IDs of beliefs that directly contradict
"explanation": "Brief explanation of the specific contradiction"
}

Be aggressive in detecting contradictions. If beliefs make opposite claims about the same thing, mark as contradiction.
IMPORTANT: Return ONLY valid JSON object, no additional text.
`;

try {
const openai = getOpenAIClient(apiKey);
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return { hasContradiction: false, contradictingBeliefs: [], explanation: '' };

    const result = extractJSON(content);
    if (!result) {
      console.log('Failed to parse JSON from contradiction check:', content);
      return { hasContradiction: false, contradictingBeliefs: [], explanation: 'Failed to parse response' };
    }
    return result;
  } catch (error) {
    console.error('Error checking contradictions:', error);
    return { hasContradiction: false, contradictingBeliefs: [], explanation: '' };
  }
}

export async function checkForEvolution(
  newBelief: ExtractedBelief,
  existingBeliefs: Belief[],
  apiKey?: string
): Promise<EvolutionResult> {
  const relevantBeliefs = existingBeliefs.filter(belief =>
    belief.topics.some(topic => newBelief.topics.includes(topic)) &&
    !belief.deprecated
  );

  if (relevantBeliefs.length === 0) {
    return { hasEvolution: false, explanation: '' };
  }

  const prompt = `
You are a belief evolution expert. Analyze if the new belief is a natural evolution/refinement of existing beliefs.

New belief: "${newBelief.text}"
Confidence: ${newBelief.confidence}/10
Topics: ${newBelief.topics.join(', ')}

Existing beliefs:
${relevantBeliefs.map((belief, i) =>
  `${i + 1}. "${belief.text}" (Confidence: ${belief.confidence}/10, ID: ${belief.id})`
).join('\n')}

EVOLUTION CRITERIA (be conservative):
Evolution occurs when a new belief is a natural progression or refinement of an older belief, NOT when they contradict.

Examples of EVOLUTION:
- "I like coffee" → "I prefer dark roast coffee in the morning"
- "Exercise is good" → "Consistent cardio exercise improves mental health"
- "Work is important" → "Meaningful work that aligns with values is important"

NOT evolution (these are contradictions or unrelated):
- "Money is important" → "Money doesn't matter" (CONTRADICTION)
- "Social media connects" → "Social media isolates" (CONTRADICTION)
- Completely different topics or opposing viewpoints

Return JSON with:
{
  "hasEvolution": boolean,
  "evolvedFromId": "id_of_original_belief", // Only if hasEvolution is true
  "explanation": "Brief explanation of how the belief evolved"
}

Only mark as evolution if the new belief builds upon or refines the old one without contradicting it.
IMPORTANT: Return ONLY valid JSON object, no additional text.
`;

  try {
    const openai = getOpenAIClient(apiKey);
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return { hasEvolution: false, explanation: '' };

    const result = extractJSON(content);
    if (!result) {
      console.log('Failed to parse JSON from evolution check:', content);
      return { hasEvolution: false, explanation: 'Failed to parse response' };
    }
    return result;
  } catch (error) {
    console.error('Error checking evolution:', error);
    return { hasEvolution: false, explanation: '' };
  }
}

export async function generateReflectionQuestions(beliefs: Belief[], apiKey?: string): Promise<string[]> {
  if (beliefs.length === 0) return [];

  const prompt = `
Based on these beliefs, generate 3-5 thoughtful reflection questions that would help the person explore their belief system deeper.

Beliefs:
${beliefs.slice(0, 10).map(belief => `- "${belief.text}" (${belief.topics.join(', ')})`).join('\n')}

Return a JSON array of questions. Focus on:
- Exploring contradictions or tensions
- Examining the origins of beliefs
- Challenging assumptions
- Encouraging deeper self-reflection

Example: ["What experiences shaped your views on success?", "How do you reconcile your beliefs about X and Y?"]

IMPORTANT: Return ONLY a valid JSON array, no additional text or explanation.
`;

  try {
    const openai = getOpenAIClient(apiKey);
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return [];

    const questions = extractJSON(content);
    if (!questions) {
      console.log('Failed to parse JSON from reflection questions:', content);
      return [];
    }
    return Array.isArray(questions) ? questions : [];
  } catch (error) {
    console.error('Error generating reflection questions:', error);
    return [];
  }
}

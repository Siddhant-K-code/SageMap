// Client-side storage using localStorage
export interface Belief {
  id: string;
  text: string;
  confidence: number;
  topics: string[];
  created_at: string;
  belief_type: 'core' | 'assumption' | 'derived';
  source: string;
  evolved_from?: string;
  deprecated?: boolean;
}

export interface BeliefEdge {
  source: string;
  target: string;
  relation: 'contradicts' | 'reinforces' | 'evolved_from';
}

export interface JournalEntry {
  id: string;
  content: string;
  created_at: string;
  processed: boolean;
}

const STORAGE_KEYS = {
  BELIEFS: 'sagemap_beliefs',
  EDGES: 'sagemap_edges',
  JOURNAL_ENTRIES: 'sagemap_journal_entries'
} as const;

// Storage helpers
function getStorageData<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function setStorageData<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

// Belief operations
export function createBelief(belief: Omit<Belief, 'id' | 'created_at'>): Belief {
  const id = generateId();
  const created_at = new Date().toISOString();
  
  const newBelief: Belief = {
    id,
    created_at,
    deprecated: false,
    ...belief
  };
  
  const beliefs = getStorageData<Belief>(STORAGE_KEYS.BELIEFS);
  beliefs.push(newBelief);
  setStorageData(STORAGE_KEYS.BELIEFS, beliefs);
  
  return newBelief;
}

export function getBeliefs(): Belief[] {
  const beliefs = getStorageData<Belief>(STORAGE_KEYS.BELIEFS);
  return beliefs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getBelief(id: string): Belief | null {
  const beliefs = getStorageData<Belief>(STORAGE_KEYS.BELIEFS);
  return beliefs.find(belief => belief.id === id) || null;
}

export function updateBelief(id: string, updates: Partial<Belief>): void {
  const beliefs = getStorageData<Belief>(STORAGE_KEYS.BELIEFS);
  const index = beliefs.findIndex(belief => belief.id === id);
  
  if (index !== -1) {
    beliefs[index] = { ...beliefs[index], ...updates };
    setStorageData(STORAGE_KEYS.BELIEFS, beliefs);
  }
}

export function deleteBelief(id: string): void {
  const beliefs = getStorageData<Belief>(STORAGE_KEYS.BELIEFS);
  const filtered = beliefs.filter(belief => belief.id !== id);
  setStorageData(STORAGE_KEYS.BELIEFS, filtered);
}

// Edge operations
export function createEdge(edge: BeliefEdge): void {
  const edges = getStorageData<BeliefEdge>(STORAGE_KEYS.EDGES);
  const existingIndex = edges.findIndex(
    e => e.source === edge.source && e.target === edge.target && e.relation === edge.relation
  );
  
  if (existingIndex === -1) {
    edges.push(edge);
    setStorageData(STORAGE_KEYS.EDGES, edges);
    console.log('Created edge:', edge, 'Total edges:', edges.length);
  } else {
    console.log('Edge already exists:', edge);
  }
}

export function getEdges(): BeliefEdge[] {
  return getStorageData<BeliefEdge>(STORAGE_KEYS.EDGES);
}

export function getEdgesForBelief(beliefId: string): BeliefEdge[] {
  const edges = getStorageData<BeliefEdge>(STORAGE_KEYS.EDGES);
  return edges.filter(edge => edge.source === beliefId || edge.target === beliefId);
}

export function deleteEdge(edge: BeliefEdge): void {
  const edges = getStorageData<BeliefEdge>(STORAGE_KEYS.EDGES);
  const filtered = edges.filter(
    e => !(e.source === edge.source && e.target === edge.target && e.relation === edge.relation)
  );
  setStorageData(STORAGE_KEYS.EDGES, filtered);
}

// Journal operations
export function createJournalEntry(content: string): JournalEntry {
  const id = generateId();
  const created_at = new Date().toISOString();
  
  const entry: JournalEntry = {
    id,
    content,
    created_at,
    processed: false
  };
  
  const entries = getStorageData<JournalEntry>(STORAGE_KEYS.JOURNAL_ENTRIES);
  entries.push(entry);
  setStorageData(STORAGE_KEYS.JOURNAL_ENTRIES, entries);
  
  return entry;
}

export function getJournalEntries(): JournalEntry[] {
  const entries = getStorageData<JournalEntry>(STORAGE_KEYS.JOURNAL_ENTRIES);
  return entries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function markJournalEntryProcessed(id: string): void {
  const entries = getStorageData<JournalEntry>(STORAGE_KEYS.JOURNAL_ENTRIES);
  const index = entries.findIndex(entry => entry.id === id);
  
  if (index !== -1) {
    entries[index].processed = true;
    setStorageData(STORAGE_KEYS.JOURNAL_ENTRIES, entries);
  }
}

export function deleteJournalEntry(id: string): void {
  const entries = getStorageData<JournalEntry>(STORAGE_KEYS.JOURNAL_ENTRIES);
  const filtered = entries.filter(entry => entry.id !== id);
  setStorageData(STORAGE_KEYS.JOURNAL_ENTRIES, filtered);
}

// Utility functions
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function getGraphData() {
  const beliefs = getBeliefs();
  const edges = getEdges();
  
  console.log('getGraphData - beliefs:', beliefs.length, 'edges:', edges.length);
  console.log('Edges:', edges);
  
  return {
    nodes: beliefs.map(belief => ({
      id: belief.id,
      label: belief.text,
      confidence: belief.confidence,
      topics: belief.topics,
      type: belief.belief_type,
      deprecated: belief.deprecated || false,
      created_at: belief.created_at
    })),
    edges: edges.map(edge => ({
      source: edge.source,
      target: edge.target,
      relation: edge.relation
    }))
  };
}

// Data management
export function exportAllData() {
  return {
    beliefs: getBeliefs(),
    edges: getEdges(),
    journal_entries: getJournalEntries(),
    exported_at: new Date().toISOString()
  };
}

export function importAllData(data: {
  beliefs: Belief[];
  edges: BeliefEdge[];
  journal_entries: JournalEntry[];
}) {
  setStorageData(STORAGE_KEYS.BELIEFS, data.beliefs);
  setStorageData(STORAGE_KEYS.EDGES, data.edges);
  setStorageData(STORAGE_KEYS.JOURNAL_ENTRIES, data.journal_entries);
}

export function clearAllData(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(STORAGE_KEYS.BELIEFS);
  localStorage.removeItem(STORAGE_KEYS.EDGES);
  localStorage.removeItem(STORAGE_KEYS.JOURNAL_ENTRIES);
}

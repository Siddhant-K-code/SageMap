# SageMap - Agent Instructions

## Build & Development Commands

```bash
# Development
npm run dev

# Build
npm run build

# Type checking
npm run build # also runs type checking

# Linting
npm run lint
```

## Environment Setup

1. Copy `.env.example` to `.env.local`
2. Add your OpenAI API key to `OPENAI_API_KEY` in `.env.local`:
   ```
   OPENAI_API_KEY=sk-your-actual-openai-api-key-here
   ```
3. **Important**: Use `.env.local` (not `.env`) for Next.js to properly load environment variables
4. You can verify your API key is loaded by visiting `/api/verify-key` endpoint

## Architecture Overview

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui with Radix UI primitives
- **Database**: Browser localStorage (client-side storage)
- **AI**: OpenAI GPT-4o for belief extraction and analysis
- **Graph Visualization**: react-force-graph (client-side only due to SSR issues)

## Key Components

- `Journal`: Rich text input for journal entries with AI processing
- `BeliefGraph`: Interactive graph visualization of beliefs and relationships
- `BeliefNode`: Individual belief display with confidence slider and metadata
- `Settings`: Data management, export, and privacy controls

## Client-Side Storage Schema

- `sagemap_beliefs`: Core belief data with confidence, topics, and type
- `sagemap_edges`: Relationships between beliefs (contradicts, reinforces, evolved_from)
- `sagemap_journal_entries`: Original journal entries and processing status

## API Endpoints

- `POST /api/journal`: Process journal entries and extract beliefs (requires API key)
- `POST /api/graph`: Generate reflection questions (requires API key)
- Other endpoints return placeholder data as storage is now client-side

## Common Issues & Solutions

1. **SSR Issues with react-force-graph**: Use dynamic import with `ssr: false`
2. **TypeScript strict mode**: Use `any` types with eslint-disable for graph library compatibility
3. **OpenAI API errors**: Check API key configuration and rate limits

## Privacy & Security

- All data stored locally in browser localStorage
- Only journal content sent to OpenAI for processing
- Export/import functionality for data portability
- Complete data deletion option

## Development Notes

- Graph visualization requires client-side rendering
- Database initializes automatically on first use
- OpenAI API key required for belief extraction
- Build process includes type checking and linting
- API key must be passed from client to server for AI processing

# Deep AI Research Agent

A Claude-powered research assistant built with Next.js 16, TypeScript, and the Claude Agent SDK for discovering, analyzing, and synthesizing AI research papers.

![Phase 1](https://img.shields.io/badge/Phase-1-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.0.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Claude](https://img.shields.io/badge/Claude-Sonnet%204.5-orange)

## Overview

This application provides an intelligent research interface powered by Claude Agent SDK, featuring:

- **Exa Neural Search**: Semantic search for discovering academic papers and research
- **Real-time Progress Tracking**: Live updates on research progress with tool call visualization
- **Comprehensive Reports**: AI-generated markdown reports with citations
- **Modern Dashboard**: Built with shadcn/ui and Tailwind CSS
- **Agent Architecture**: Orchestrator agent with custom tool integration

## Features

### 🔍 Intelligent Research
- Neural search powered by Exa for semantic understanding
- Content retrieval from academic papers and articles
- Similarity search to find related work
- Multi-source synthesis and analysis

### 📊 Real-time Progress Tracking
- Live streaming of research progress via Server-Sent Events (SSE)
- Visual indicators for current research stage
- Detailed tool call timeline with collapsible details
- Statistics dashboard (searches, fetches, total steps)

### 📝 Report Generation
- Comprehensive markdown reports with syntax highlighting
- Metadata tracking (duration, cost, API usage)
- Copy to clipboard functionality
- Download as Markdown or export as JSON

## Quick Start

### Prerequisites

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **Anthropic API Key** ([Get one here](https://console.anthropic.com/))
- **Exa API Key** ([Get one here](https://exa.ai/))

### Installation

1. **Clone the repository**:
```bash
git clone <your-repo-url>
cd deep-ai-research
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment variables**:

Copy the example environment file and add your API keys:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your API keys:

```bash
# Anthropic API Key (required)
# Get your key at: https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here

# Exa API Key (required for search functionality)
# Get your key at: https://exa.ai/
EXA_API_KEY=your-actual-exa-key-here

# Optional: Default model
DEFAULT_MODEL=claude-haiku-4-5-20251001

# Optional: Budget limits (in USD)
MAX_BUDGET_USD=2.0

# Optional: Max turns per conversation
MAX_TURNS=20
```

4. **Run the development server**:
```bash
npm run dev
```

5. **Open the app**:
Navigate to [http://localhost:3001](http://localhost:3001)

> **Note**: The app will use port 3001 if port 3000 is already in use.

## Usage

### Example Queries

Try these research queries to see the agent in action:

- "Find latest papers on multimodal LLMs"
- "What are emerging trends in reinforcement learning?"
- "Explain mixture of experts in modern LLMs"
- "Recent advances in attention mechanisms"
- "The latest papers on multi-agent systems"

### Understanding the Interface

**Progress Tab**:
- Shows real-time research progress
- Displays current stage (searching, fetching, analyzing, etc.)
- Statistics panel with search counts
- Timeline of all tool calls (expandable for details)

**Final Report Tab**:
- Activated when research is complete
- Markdown-formatted comprehensive report
- Citations and references
- Metadata (cost, duration, API usage)
- Export options (copy, download MD, export JSON)

## Architecture

```
┌─────────────────────────────────┐
│   Claude Orchestrator Agent     │
│   (claude-haiku-4-5-20251001)  │
└──────────────┬──────────────────┘
               │
       ┌───────┴────────┐
       │                │
       ▼                ▼
┌─────────────┐  ┌─────────────┐
│ Exa Search  │  │ File Tools  │
│ - search    │  │ - Read      │
│ - contents  │  │ - Write     │
│ - similar   │  │ - Edit      │
└─────────────┘  └─────────────┘
```

**Current Phase**: Phase 1 - Exa Neural Search Integration

**Agent Memory**: Uses `CLAUDE.md` for comprehensive research instructions and workflows

## Project Structure

```
deep-ai-research/
├── app/                           # Next.js App Router
│   ├── api/
│   │   └── agent/
│   │       └── query/
│   │           └── route.ts       # SSE streaming endpoint
│   ├── page.tsx                   # Main dashboard UI
│   ├── layout.tsx                 # Root layout
│   └── globals.css                # Global styles
│
├── components/                    # React components
│   ├── ui/                        # shadcn/ui components
│   ├── ProgressTracker.tsx        # Research progress display
│   ├── ToolCallSummary.tsx        # Tool call visualization
│   └── FinalReport.tsx            # Report renderer
│
├── lib/                           # Core libraries
│   ├── agent/
│   │   ├── config.ts              # Agent configuration
│   │   ├── tools.ts               # Exa MCP tools
│   │   └── agents/                # Subagent definitions (Phase 2)
│   ├── types/
│   │   └── agent.ts               # TypeScript type definitions
│   └── utils.ts                   # Utility functions
│
├── .claude/                       # Claude Code config
│   ├── agents/                    # Future subagent definitions
│   └── settings.json              # Agent settings
│
├── CLAUDE.md                      # Agent memory & instructions
├── .env.local                     # Environment variables (create this)
└── package.json                   # Dependencies
```

## Technologies

- **Framework**: [Next.js 16.0.1](https://nextjs.org/) (App Router)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Agent SDK**: [@anthropic-ai/claude-agent-sdk v0.1.37](https://github.com/anthropics/anthropic-sdk-typescript)
- **Search**: [Exa API](https://exa.ai/)
- **UI Library**: [shadcn/ui](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Markdown**: [react-markdown](https://github.com/remarkjs/react-markdown) with syntax highlighting

## Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### Key Files to Understand

1. **`app/api/agent/query/route.ts`**: API endpoint that handles research queries and streams responses via SSE
2. **`lib/agent/config.ts`**: Agent configuration including tools, prompts, and settings
3. **`lib/agent/tools.ts`**: Exa search tool definitions using MCP (Model Context Protocol)
4. **`CLAUDE.md`**: Agent memory file with research workflows and best practices
5. **`components/ProgressTracker.tsx`**: Extracts and displays research progress from message stream

### Adding Custom Tools

To add new tools to the agent:

1. Define the tool in `lib/agent/tools.ts` using `createSdkMcpServer` and `tool`
2. Add the MCP server to `mcpServers` in `lib/agent/config.ts`
3. Add tool names to `allowedTools` array (format: `mcp__<server-name>__<tool-name>`)
4. Update UI components to recognize the new tools (icons, colors, stage mapping)

Example:
```typescript
const myToolsServer = createSdkMcpServer({
  name: "my-tools",
  version: "1.0.0",
  tools: [
    tool(
      "my_tool",
      "Description of what the tool does",
      { /* zod schema */ },
      async (args) => { /* implementation */ }
    )
  ]
});
```

## Troubleshooting

### Common Issues

**Port already in use**:
- The app will automatically try port 3001 if 3000 is busy
- Or manually specify: `PORT=3002 npm run dev`

**API Key errors**:
- Ensure `.env.local` is created in the root directory
- Verify API keys are valid and not expired
- Check keys don't have leading/trailing spaces

**Build errors**:
- Clear Next.js cache: `rm -rf .next`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 20+)

**Agent not responding**:
- Check browser console for errors
- Verify API endpoint is working: `curl http://localhost:3001/api/agent/query`
- Review server logs in terminal

### Debug Mode

Enable verbose logging by checking the terminal output where `npm run dev` is running. All agent messages and tool calls are logged.

## Roadmap

### Phase 1 (Current) ✅
- [x] Next.js + TypeScript setup
- [x] Claude Agent SDK integration
- [x] Exa neural search tools
- [x] Dashboard UI with real-time progress
- [x] SSE streaming
- [x] Report generation and export
- [x] Tool call visualization

### Phase 2 (Planned)
- [ ] Specialized subagents (web-researcher, analyzer, report-generator)
- [ ] Multi-agent orchestration
- [ ] Research database for session persistence
- [ ] Advanced filtering and search options
- [ ] PDF export capabilities
- [ ] Citation management
- [ ] Collaborative research sessions

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes and test thoroughly
4. Commit with clear messages: `git commit -m "Add: feature description"`
5. Push to your fork: `git push origin feature/my-feature`
6. Open a Pull Request

### Areas for Contribution

- Additional search integrations (arXiv API, Semantic Scholar, etc.)
- Enhanced UI components and visualizations
- Export formats (PDF, LaTeX, BibTeX)
- Testing infrastructure
- Documentation improvements
- Performance optimizations

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Built with [Claude Agent SDK](https://github.com/anthropics/anthropic-sdk-typescript)
- Search powered by [Exa](https://exa.ai/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)

---

**Built with Claude Code** 🤖

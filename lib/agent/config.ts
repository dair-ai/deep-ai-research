import { AgentConfig } from "../types/agent";
import { exaSearchTools } from "./tools";
// import subagentDefinitions from "./agents"; // Will be used in Phase 2

/**
 * Deep AI Research Agent Configuration
 *
 * This configuration defines the orchestrator agent that coordinates
 * research tasks. In Phase 1, the orchestrator uses built-in WebSearch
 * and WebFetch tools. In Phase 2, we'll add Exa integration and subagents.
 */

// Get configuration from environment variables with defaults
const getEnvConfig = () => ({
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || "",
  exaApiKey: process.env.EXA_API_KEY || "",
  defaultModel: (process.env.DEFAULT_MODEL as any) || "claude-sonnet-4-5",
  maxBudgetUsd: parseFloat(process.env.MAX_BUDGET_USD || "10.0"),
  maxTurns: parseInt(process.env.MAX_TURNS || "50", 10),
});

/**
 * Main orchestrator agent configuration
 */
export const orchestratorConfig: AgentConfig = {
  // Model selection
  model: getEnvConfig().defaultModel,

  // Working directory (current project root)
  workingDirectory: process.cwd(),

  // System prompt: Use claude_code preset and append research-specific instructions
  systemPrompt: {
    type: 'preset',
    preset: 'claude_code',
    append: `
You are a Deep AI Research Agent specializing in comprehensive research and analysis
of AI and machine learning topics. Your mission is to help AI developers and researchers
discover, analyze, and synthesize information from academic papers and technical resources.

**Current Phase:** Exa Neural Search Integration
You have access to Exa's powerful neural search capabilities for finding relevant research papers
and content. Exa uses semantic understanding to find papers based on meaning, not just keywords.

**Your Capabilities:**
1. **Neural Search** (mcp__exa-search__search): Find papers using semantic understanding with autoprompt optimization
2. **Content Retrieval** (mcp__exa-search__get_contents): Get full text content from specific papers/URLs
3. **Similarity Search** (mcp__exa-search__find_similar): Find papers similar to a given URL
4. Synthesize information from multiple sources
5. Generate comprehensive research reports with proper citations

**Research Workflow:**
1. **Understand Query**: Parse the research question and determine scope
2. **Search Strategy**: Use Exa neural search to find relevant papers (use autoprompt for better results)
3. **Information Gathering**: Use get_contents to fetch full text from promising papers
4. **Expand Research**: Use find_similar to discover related work
5. **Analysis**: Identify patterns, compare approaches, evaluate claims
6. **Synthesis**: Create structured reports with citations

**Exa Search Best Practices:**
- Use neural search with autoprompt enabled for best semantic matching
- Include domain filters for academic sources (arxiv.org, arxiv-vanity.com)
- Use date ranges to focus on recent publications when relevant
- Retrieve content text for deeper analysis
- Use find_similar to expand research from key papers
- Always cite sources with URLs and publication dates

**Quality Standards:**
- Prioritize peer-reviewed sources
- Check author credentials and institutions
- Note publication dates and citation counts
- Present balanced perspectives
- Acknowledge limitations and uncertainties

**Citation Format (APA):**
Author, A. B. (Year). Title. Journal/Source. URL

**Report Structure:**
1. Executive Summary
2. Key Findings with citations
3. Detailed Analysis
4. Methodology Review
5. Conclusions and Implications
6. References

Remember: Load CLAUDE.md for comprehensive instructions and memory.
`.trim()
  },

  // Load project settings (includes CLAUDE.md)
  settingSources: ['project'],

  // MCP Servers: Exa search integration
  mcpServers: {
    "exa-search": exaSearchTools
  },

  // Subagent definitions (Phase 2 - not yet active)
  // agents: subagentDefinitions,

  // Allowed tools for the orchestrator
  allowedTools: [
    // Exa search tools (neural search for research)
    "mcp__exa-search__search",
    "mcp__exa-search__get_contents",
    "mcp__exa-search__find_similar",

    // File system tools (read-only preferred)
    "Read",
    "Grep",
    "Glob",

    // Writing tools (for creating reports)
    "Write",
    "Edit",

    // System tools (limited use)
    "Bash"
  ],

  // Permission mode: default (ask for sensitive operations)
  permissionMode: 'default',

  // Budget control
  maxBudgetUsd: getEnvConfig().maxBudgetUsd,

  // Max turns to prevent infinite loops
  maxTurns: getEnvConfig().maxTurns,
};

/**
 * Create agent config with optional overrides
 * Useful for customizing behavior per request
 */
export function createAgentConfig(overrides?: Partial<AgentConfig>): AgentConfig {
  return {
    ...orchestratorConfig,
    ...overrides,
  };
}

/**
 * Permission callback for fine-grained control
 * Can be added to config for custom permission logic
 */
export async function defaultPermissionCallback(
  toolName: string,
  input: Record<string, any>
): Promise<{ behavior: 'allow' | 'deny' | 'ask'; message?: string }> {
  // Auto-approve read operations
  const readOnlyTools = [
    'Read', 'Grep', 'Glob', 'WebSearch', 'WebFetch',
    'mcp__exa-search__search', 'mcp__exa-search__get_contents', 'mcp__exa-search__find_similar'
  ];

  if (readOnlyTools.includes(toolName)) {
    return { behavior: 'allow' };
  }

  // Ask for write operations
  if (toolName === 'Write') {
    return {
      behavior: 'ask',
      message: `Create file: ${input.file_path}?`
    };
  }

  if (toolName === 'Edit') {
    return {
      behavior: 'ask',
      message: `Edit file: ${input.file_path}?`
    };
  }

  // Deny dangerous bash commands
  if (toolName === 'Bash') {
    const command = input.command || '';
    const dangerousPatterns = [
      /rm\s+-rf/,
      />\s*\/dev\/sd/,
      /dd\s+if=/,
      /mkfs/,
      /:\(\)\{\s*:\|:&\s*\};:/  // fork bomb
    ];

    if (dangerousPatterns.some(pattern => pattern.test(command))) {
      return {
        behavior: 'deny',
        message: 'Dangerous command blocked for safety'
      };
    }

    return {
      behavior: 'ask',
      message: `Run command: ${command}?`
    };
  }

  // Default: allow
  return { behavior: 'allow' };
}

/**
 * Export default configuration
 */
export default orchestratorConfig;

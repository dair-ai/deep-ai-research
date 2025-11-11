// Agent SDK Message Types
export type SDKMessageType =
  | 'system'
  | 'assistant'
  | 'tool_call'
  | 'tool_result'
  | 'error';

export type SDKMessage =
  | SystemMessage
  | AssistantMessage
  | ToolCallMessage
  | ToolResultMessage
  | ErrorMessage
  | ResultMessage;

export interface SystemMessage {
  type: 'system';
  subtype: 'init' | 'subagent_start' | 'subagent_end' | 'session_end';
  session_id?: string;
  agent_name?: string;
  tools?: string[];
  cost?: number;
  [key: string]: any;
}

export interface AssistantMessage {
  type: 'assistant';
  content?: string | ContentBlock[];
  // SDK wraps content in message property
  message?: {
    role: 'assistant';
    model?: string;
    id?: string;
    content: ContentBlock[];
  };
  metadata?: {
    model?: string;
    usage?: {
      input_tokens: number;
      output_tokens: number;
    };
  };
}

export interface ToolCallMessage {
  type: 'tool_call';
  tool_name: string;
  input: Record<string, any>;
  tool_call_id?: string;
}

export interface ToolResultMessage {
  type: 'tool_result';
  tool_name: string;
  result: any;
  tool_call_id?: string;
  isError?: boolean;
}

export interface ErrorMessage {
  type: 'error';
  error: {
    type: string;
    message: string;
    tool?: string;
    details?: any;
  };
}

export interface ResultMessage {
  type: 'result';
  subtype: 'success' | 'error';
  is_error: boolean;
  duration_ms: number;
  duration_api_ms: number;
  num_turns: number;
  result: string; // The final comprehensive research report
  session_id: string;
  total_cost_usd: number;
  usage: {
    input_tokens: number;
    cache_creation_input_tokens: number;
    cache_read_input_tokens: number;
    output_tokens: number;
    server_tool_use?: {
      web_search_requests: number;
      web_fetch_requests: number;
    };
  };
  modelUsage: Record<string, {
    inputTokens: number;
    outputTokens: number;
    cacheReadInputTokens: number;
    cacheCreationInputTokens: number;
    webSearchRequests: number;
    costUSD: number;
    contextWindow: number;
  }>;
  permission_denials: any[];
  uuid: string;
}

export interface ContentBlock {
  type: 'text' | 'image' | 'tool_use' | 'tool_result';
  // Text block fields
  text?: string;
  // Tool use fields
  name?: string;
  id?: string;
  input?: Record<string, any>;
  // Tool result fields
  tool_use_id?: string;
  content?: string | any;
  // Allow other properties
  [key: string]: any;
}

// Research-specific types
export interface ResearchQuery {
  query: string;
  options?: {
    searchType?: 'neural' | 'keyword';
    numResults?: number;
    dateRange?: {
      start?: string;
      end?: string;
    };
    domains?: {
      include?: string[];
      exclude?: string[];
    };
    useAutoprompt?: boolean;
  };
  sessionId?: string;
}

export interface ResearchResult {
  id: string;
  title: string;
  url: string;
  author?: string;
  publishedDate?: string;
  summary?: string;
  score?: number;
}

export interface ExaSearchResult {
  results: Array<{
    id: string;
    title: string;
    url: string;
    author?: string;
    publishedDate?: string;
    text?: string;
    highlights?: string[];
    score?: number;
  }>;
  autopromptString?: string;
}

export interface ExaContent {
  id: string;
  url: string;
  title: string;
  text: string;
  author?: string;
  publishedDate?: string;
}

// Session types
export interface Session {
  id: string;
  query: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'completed' | 'error';
  messages: SDKMessage[];
  results?: ResearchResult[];
}

// Agent configuration types
export interface AgentConfig {
  model?: string;
  workingDirectory?: string;
  systemPrompt?: string | {
    type: 'preset';
    preset: 'claude_code';
    append?: string;
  };
  settingSources?: Array<'user' | 'project' | 'local'>;
  mcpServers?: Record<string, any>;
  agents?: Record<string, AgentDefinition>;
  allowedTools?: string[];
  disallowedTools?: string[];
  permissionMode?: 'default' | 'acceptEdits' | 'bypassPermissions';
  maxBudgetUsd?: number;
  maxTurns?: number;
  resume?: string;
  forkSession?: boolean;
  continue?: boolean;
}

export interface AgentDefinition {
  description: string;
  prompt: string;
  tools?: string[];
  model?: 'sonnet' | 'opus' | 'haiku' | 'inherit';
}

// UI State types
export interface UIState {
  isLoading: boolean;
  error: string | null;
  currentSession: Session | null;
  messages: SDKMessage[];
  results: ResearchResult[];
}

// Component prop types
export interface QueryInputProps {
  onSubmit: (query: ResearchQuery) => void;
  isLoading: boolean;
}

export interface AgentOutputProps {
  messages: SDKMessage[];
  isStreaming: boolean;
}

export interface ResearchResultsProps {
  results: ResearchResult[];
  onExport?: (format: 'json' | 'markdown') => void;
}

// API Response types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

export interface StreamChunk {
  data: SDKMessage;
  done: boolean;
}

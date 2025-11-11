"use client";

import { SDKMessage, ContentBlock } from "@/lib/types/agent";
import { ToolCallSummary } from "./ToolCallSummary";
import { Loader2, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProgressTrackerProps {
  messages: SDKMessage[];
  isLoading: boolean;
}

interface ExtractedToolCall {
  id: string;
  name: string;
  input: Record<string, any>;
  result?: any;
  isError?: boolean;
  timestamp: string;
}

export function ProgressTracker({ messages, isLoading }: ProgressTrackerProps) {
  // Extract tool calls from messages
  const extractToolCalls = (): ExtractedToolCall[] => {
    const toolCalls: ExtractedToolCall[] = [];
    const toolResults = new Map<string, { result: any; isError?: boolean }>();

    // First pass: collect tool results
    messages.forEach((msg) => {
      if (msg.type === "user" && (msg as any).message?.content) {
        const content = (msg as any).message.content;
        if (Array.isArray(content)) {
          content.forEach((block: any) => {
            if (block.type === "tool_result" && block.tool_use_id) {
              toolResults.set(block.tool_use_id, {
                result: block.content,
                isError: block.is_error || false,
              });
            }
          });
        }
      }
    });

    // Second pass: extract tool calls and match with results
    messages.forEach((msg) => {
      if (msg.type === "assistant" && msg.message?.content) {
        msg.message.content.forEach((block: ContentBlock) => {
          if (block.type === "tool_use" && block.name) {
            const toolId = block.id || `${block.name}-${Date.now()}`;
            const resultData = toolResults.get(toolId);

            toolCalls.push({
              id: toolId,
              name: block.name,
              input: block.input || {},
              result: resultData?.result,
              isError: resultData?.isError,
              timestamp: new Date().toISOString(),
            });
          }
        });
      }
    });

    return toolCalls;
  };

  const toolCalls = extractToolCalls();

  // Get current stage based on recent tool calls
  const getCurrentStage = (): string => {
    if (toolCalls.length === 0) {
      return isLoading ? "Initializing research agent..." : "Ready to start";
    }

    const lastTool = toolCalls[toolCalls.length - 1];

    if (!lastTool.result) {
      // Tool is still running
      const stageMap: Record<string, string> = {
        WebSearch: "Searching for papers and articles",
        WebFetch: "Fetching and analyzing content",
        "mcp__exa-search__search": "Searching with Exa neural search",
        "mcp__exa-search__get_contents": "Fetching paper contents",
        "mcp__exa-search__find_similar": "Finding similar papers",
        Read: "Reading documents",
        Write: "Generating report",
        TodoWrite: "Planning research steps",
        Grep: "Searching in files",
        Glob: "Finding relevant files",
        Bash: "Running commands",
      };
      return stageMap[lastTool.name] || `Using ${lastTool.name}`;
    }

    // Tool completed, determine next stage
    const completedToolTypes = new Set(toolCalls.filter(tc => tc.result).map(tc => tc.name));

    if (!completedToolTypes.has("mcp__exa-search__search") && !completedToolTypes.has("WebSearch")) {
      return "Preparing to search";
    } else if (!completedToolTypes.has("mcp__exa-search__get_contents") && !completedToolTypes.has("WebFetch")) {
      return "Found sources, analyzing content";
    } else if (!completedToolTypes.has("Write")) {
      return "Synthesizing findings";
    } else {
      return "Finalizing report";
    }
  };

  // Get research stats
  const getStats = () => {
    const searches = toolCalls.filter((tc) =>
      tc.name === "WebSearch" || tc.name === "mcp__exa-search__search"
    ).length;
    const fetches = toolCalls.filter((tc) =>
      tc.name === "WebFetch" || tc.name === "mcp__exa-search__get_contents"
    ).length;
    const completed = toolCalls.filter((tc) => tc.result !== undefined).length;
    const total = toolCalls.length;

    return { searches, fetches, completed, total };
  };

  const stats = getStats();
  const currentStage = getCurrentStage();

  return (
    <div className="space-y-4">
      {/* Current Stage Banner */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
        <div className="flex items-center gap-3">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          ) : toolCalls.length > 0 ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <Clock className="w-5 h-5 text-muted-foreground" />
          )}
          <div className="flex-1">
            <div className="font-semibold text-sm">{currentStage}</div>
            {stats.total > 0 && (
              <div className="text-xs text-muted-foreground mt-1">
                {stats.completed} of {stats.total} steps completed
              </div>
            )}
          </div>
          {isLoading && (
            <Badge variant="default" className="animate-pulse">
              Active
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Panel */}
      {stats.total > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-muted rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-500">{stats.searches}</div>
            <div className="text-xs text-muted-foreground">Searches</div>
          </div>
          <div className="bg-muted rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-500">{stats.fetches}</div>
            <div className="text-xs text-muted-foreground">Fetched</div>
          </div>
          <div className="bg-muted rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-purple-500">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total Steps</div>
          </div>
        </div>
      )}

      {/* Tool Call Timeline */}
      {toolCalls.length > 0 && (
        <div>
          <div className="text-sm font-semibold mb-2">Research Steps</div>
          <div className="space-y-1">
            {toolCalls.map((toolCall) => (
              <ToolCallSummary
                key={toolCall.id}
                toolName={toolCall.name}
                input={toolCall.input}
                result={toolCall.result}
                isError={toolCall.isError}
                timestamp={toolCall.timestamp}
                collapsed={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {toolCalls.length === 0 && !isLoading && (
        <div className="text-center text-muted-foreground text-sm py-8">
          Submit a research query to begin
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, Search, FileText, Globe, Code } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolCallSummaryProps {
  toolName: string;
  input: Record<string, any>;
  result?: any;
  isError?: boolean;
  timestamp?: string;
  collapsed?: boolean;
}

const TOOL_ICONS: Record<string, React.ElementType> = {
  WebSearch: Search,
  WebFetch: Globe,
  "mcp__exa-search__search": Search,
  "mcp__exa-search__get_contents": FileText,
  "mcp__exa-search__find_similar": Globe,
  Read: FileText,
  Write: FileText,
  TodoWrite: Code,
  Grep: Search,
  Glob: Search,
  Bash: Code,
};

const TOOL_COLORS: Record<string, string> = {
  WebSearch: "text-blue-500",
  WebFetch: "text-green-500",
  "mcp__exa-search__search": "text-blue-600",
  "mcp__exa-search__get_contents": "text-green-600",
  "mcp__exa-search__find_similar": "text-purple-600",
  Read: "text-purple-500",
  Write: "text-orange-500",
  TodoWrite: "text-yellow-600",
  Grep: "text-cyan-500",
  Glob: "text-pink-500",
  Bash: "text-gray-500",
};

export function ToolCallSummary({
  toolName,
  input,
  result,
  isError = false,
  timestamp,
  collapsed: initialCollapsed = true,
}: ToolCallSummaryProps) {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);

  const Icon = TOOL_ICONS[toolName] || Code;
  const iconColor = TOOL_COLORS[toolName] || "text-gray-500";

  // Format input preview
  const getInputPreview = () => {
    if (!input) return "No input";

    // For web search, show the query
    if (input.query) {
      return `"${input.query.substring(0, 60)}${input.query.length > 60 ? '...' : ''}"`;
    }

    // For other tools, show first key-value pair
    const firstKey = Object.keys(input)[0];
    if (firstKey && input[firstKey]) {
      const value = String(input[firstKey]).substring(0, 50);
      return `${firstKey}: ${value}${String(input[firstKey]).length > 50 ? '...' : ''}`;
    }

    return "View details";
  };

  const getRelativeTime = () => {
    if (!timestamp) return "";
    const now = new Date().getTime();
    const then = new Date(timestamp).getTime();
    const diff = Math.floor((now - then) / 1000); // seconds

    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="border rounded-lg p-3 mb-2 hover:bg-accent/50 transition-colors">
      {/* Header */}
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {/* Expand/Collapse Icon */}
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}

        {/* Tool Icon */}
        <Icon className={cn("w-4 h-4 flex-shrink-0", iconColor)} />

        {/* Tool Name Badge */}
        <Badge variant={isError ? "destructive" : "secondary"} className="text-xs">
          {toolName}
        </Badge>

        {/* Input Preview */}
        <span className="text-xs text-muted-foreground truncate flex-1">
          {getInputPreview()}
        </span>

        {/* Timestamp */}
        {timestamp && (
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {getRelativeTime()}
          </span>
        )}

        {/* Status Badge */}
        {result !== undefined && (
          <Badge
            variant={isError ? "destructive" : "outline"}
            className="text-xs flex-shrink-0"
          >
            {isError ? "Error" : "Done"}
          </Badge>
        )}
        {result === undefined && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-xs text-blue-500">Running</span>
          </div>
        )}
      </div>

      {/* Expanded Content */}
      {!isCollapsed && (
        <div className="mt-3 pl-6 space-y-2">
          {/* Input */}
          <div>
            <div className="text-xs font-semibold mb-1">Input:</div>
            <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
              {JSON.stringify(input, null, 2)}
            </pre>
          </div>

          {/* Result */}
          {result !== undefined && (
            <div>
              <div className="text-xs font-semibold mb-1">
                {isError ? "Error:" : "Result:"}
              </div>
              <pre className="text-xs bg-muted p-2 rounded overflow-x-auto max-h-40 overflow-y-auto">
                {typeof result === "string"
                  ? result.substring(0, 500) + (result.length > 500 ? "\n... [truncated]" : "")
                  : JSON.stringify(result, null, 2).substring(0, 500)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

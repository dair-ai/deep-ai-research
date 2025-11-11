"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Check, Clock, DollarSign, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FinalReportProps {
  report: string;
  metadata?: {
    duration_ms: number;
    total_cost_usd: number;
    num_turns: number;
    session_id: string;
  };
  onExport?: (format: "markdown" | "json") => void;
}

export function FinalReport({ report, metadata, onExport }: FinalReportProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([report], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `research-report-${new Date().toISOString().split("T")[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="space-y-4">
      {/* Metadata Bar */}
      {metadata && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Research Metadata
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">Duration</div>
                  <div className="text-sm font-semibold">
                    {formatDuration(metadata.duration_ms)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">Cost</div>
                  <div className="text-sm font-semibold">
                    ${metadata.total_cost_usd.toFixed(3)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {metadata.num_turns} turns
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-xs text-muted-foreground truncate">
                  ID: {metadata.session_id.substring(0, 8)}...
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Bar */}
      <div className="flex items-center gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="gap-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Download MD
        </Button>

        {onExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport("json")}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </Button>
        )}
      </div>

      {/* Report Content */}
      <Card>
        <CardContent className="pt-6">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                // Customize heading styles
                h1: ({ node, ...props }) => (
                  <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-xl font-semibold mt-5 mb-3" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-lg font-semibold mt-4 mb-2" {...props} />
                ),
                // Customize list styles
                ul: ({ node, ...props }) => (
                  <ul className="list-disc list-inside space-y-1 my-3" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal list-inside space-y-1 my-3" {...props} />
                ),
                // Customize code blocks
                code: ({ node, inline, ...props }: any) =>
                  inline ? (
                    <code
                      className="bg-muted px-1 py-0.5 rounded text-sm"
                      {...props}
                    />
                  ) : (
                    <code className="block bg-muted p-3 rounded-lg overflow-x-auto text-sm" {...props} />
                  ),
                // Customize links
                a: ({ node, ...props }) => (
                  <a
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                    {...props}
                  />
                ),
                // Customize blockquotes
                blockquote: ({ node, ...props }) => (
                  <blockquote
                    className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground"
                    {...props}
                  />
                ),
                // Customize horizontal rules
                hr: ({ node, ...props }) => (
                  <hr className="my-6 border-border" {...props} />
                ),
              }}
            >
              {report}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

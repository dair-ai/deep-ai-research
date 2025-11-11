"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Send } from "lucide-react";
import { SDKMessage, ResultMessage } from "@/lib/types/agent";
import { ProgressTracker } from "@/components/ProgressTracker";
import { FinalReport } from "@/components/FinalReport";

export default function Home() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<SDKMessage[]>([]);
  const [finalReport, setFinalReport] = useState<ResultMessage | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setMessages([]);
    setFinalReport(null);

    try {
      const response = await fetch("/api/agent/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          sessionId,
          options: {
            searchType: "neural",
            numResults: 5,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No reader available");
      }

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);

            try {
              const message: SDKMessage = JSON.parse(data);

              console.log("Received message:", message.type, message);

              // Handle system init
              if (message.type === "system" && message.subtype === "init" && message.session_id) {
                setSessionId(message.session_id);
              }

              // Handle final result
              if (message.type === "result") {
                setFinalReport(message as ResultMessage);
                setIsLoading(false);
                continue;
              }

              // Handle done message
              if ((message as any).type === "done") {
                setIsLoading(false);
                continue;
              }

              setMessages((prev) => [...prev, message]);

            } catch (parseError) {
              console.error("Failed to parse SSE message:", parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error querying agent:", error);
      setMessages((prev) => [
        ...prev,
        {
          type: "error",
          error: {
            type: "CLIENT_ERROR",
            message: error instanceof Error ? error.message : "An error occurred",
          },
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6 pt-6">
          <h1 className="text-4xl font-bold mb-2">Deep AI Research Agent</h1>
          <p className="text-muted-foreground">
            Claude-powered research assistant for discovering and analyzing AI papers
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Query Panel */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Research Query</CardTitle>
                <CardDescription>
                  Ask me anything about AI and ML research. I&apos;ll search, analyze, and synthesize findings for you.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Textarea
                    placeholder="E.g., 'Find recent papers on vision transformers for medical imaging' or 'What are the latest trends in LLM fine-tuning?'"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="min-h-[100px]"
                    disabled={isLoading}
                  />
                  <Button type="submit" disabled={isLoading || !query.trim()} className="w-full">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Researching...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Start Research
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Research Output */}
            <Card>
              <CardHeader>
                <CardTitle>Research Output</CardTitle>
                <CardDescription>
                  {finalReport ? "Research complete" : (isLoading ? "Research in progress..." : "Ready to start research")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="progress" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="progress">Progress</TabsTrigger>
                    <TabsTrigger value="report" disabled={!finalReport}>
                      Final Report {finalReport && <Badge className="ml-2" variant="secondary">Ready</Badge>}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="progress" className="mt-4">
                    <ScrollArea className="h-[500px] w-full pr-4">
                      <ProgressTracker messages={messages} isLoading={isLoading} />
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="report" className="mt-4">
                    <ScrollArea className="h-[500px] w-full pr-4">
                      {finalReport ? (
                        <FinalReport
                          report={finalReport.result}
                          metadata={{
                            duration_ms: finalReport.duration_ms,
                            total_cost_usd: finalReport.total_cost_usd,
                            num_turns: finalReport.num_turns,
                            session_id: finalReport.session_id,
                          }}
                          onExport={(format) => {
                            if (format === "json") {
                              const blob = new Blob([JSON.stringify(finalReport, null, 2)], {
                                type: "application/json",
                              });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement("a");
                              a.href = url;
                              a.download = `research-data-${new Date().toISOString().split("T")[0]}.json`;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              URL.revokeObjectURL(url);
                            }
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                          Research report will appear here when complete
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <h4 className="font-semibold mb-1">Current Phase: 1</h4>
                  <p className="text-muted-foreground text-xs">
                    Built-in web search with orchestrator agent
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Capabilities</h4>
                  <ul className="text-muted-foreground text-xs space-y-1">
                    <li>• Web search and content analysis</li>
                    <li>• Multi-source synthesis</li>
                    <li>• Comprehensive reports</li>
                    <li>• Citation management</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Coming in Phase 2</h4>
                  <ul className="text-muted-foreground text-xs space-y-1">
                    <li>• Exa neural search</li>
                    <li>• Specialized subagents</li>
                    <li>• Advanced orchestration</li>
                    <li>• Research database</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session Info</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2">
                <div>
                  <span className="text-muted-foreground">Session ID:</span>
                  <p className="font-mono mt-1 break-all">
                    {sessionId || "Not started"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Messages:</span>
                  <p className="font-mono mt-1">{messages.length}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={isLoading ? "default" : "secondary"} className="ml-2">
                    {isLoading ? "Active" : "Idle"}
                  </Badge>
                </div>
                {finalReport && (
                  <div>
                    <span className="text-muted-foreground">Cost:</span>
                    <p className="font-mono mt-1">${finalReport.total_cost_usd.toFixed(3)}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Example Queries</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  "Find latest papers on multimodal LLMs",
                  "What are emerging trends in reinforcement learning?",
                  "Explain mixture of experts in modern LLMs",
                  "Recent advances in attention mechanisms",
                ].map((example, i) => (
                  <button
                    key={i}
                    onClick={() => setQuery(example)}
                    className="text-left w-full p-2 text-xs rounded-md hover:bg-muted transition-colors border border-transparent hover:border-border"
                    disabled={isLoading}
                  >
                    {example}
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

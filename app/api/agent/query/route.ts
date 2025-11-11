import { query } from "@anthropic-ai/claude-agent-sdk";
import { NextRequest, NextResponse } from "next/server";
import { createAgentConfig } from "@/lib/agent/config";
import { SDKMessage } from "@/lib/types/agent";

// Force Node.js runtime for agent SDK
export const runtime = 'nodejs';

// Allow longer execution time for research tasks (5 minutes)
export const maxDuration = 300;

/**
 * POST /api/agent/query
 *
 * Handles research queries from the UI and streams responses using Server-Sent Events (SSE).
 *
 * Request body:
 * {
 *   query: string;           // The research query
 *   sessionId?: string;      // Optional session ID to resume
 *   options?: {              // Optional query options
 *     searchType?: 'neural' | 'keyword';
 *     numResults?: number;
 *     dateRange?: { start?: string; end?: string };
 *   };
 * }
 *
 * Response: text/event-stream with SSE format
 * data: {SDKMessage JSON}\n\n
 */
export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const { query: userQuery, sessionId, options } = body;

    // Validate required fields
    if (!userQuery || typeof userQuery !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    // Check for required API keys
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY is not configured' },
        { status: 500 }
      );
    }

    if (!process.env.EXA_API_KEY) {
      return NextResponse.json(
        { error: 'EXA_API_KEY is not configured' },
        { status: 500 }
      );
    }

    // Create agent configuration
    const agentConfig = createAgentConfig({
      resume: sessionId,
      // Add any custom options here based on request
    });

    // Enhance query with search options if provided
    let enhancedQuery = userQuery;
    if (options) {
      const hints: string[] = [];

      if (options.searchType) {
        hints.push(`Prefer ${options.searchType} search`);
      }

      if (options.numResults) {
        hints.push(`Find approximately ${options.numResults} relevant sources`);
      }

      if (options.dateRange?.start || options.dateRange?.end) {
        const dateHint = [];
        if (options.dateRange.start) {
          dateHint.push(`published after ${options.dateRange.start}`);
        }
        if (options.dateRange.end) {
          dateHint.push(`published before ${options.dateRange.end}`);
        }
        hints.push(`Focus on papers ${dateHint.join(' and ')}`);
      }

      if (hints.length > 0) {
        enhancedQuery = `${userQuery}\n\nSearch preferences: ${hints.join('; ')}`;
      }
    }

    // Create readable stream for SSE
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Create async generator for MCP compatibility
          async function* generateMessages() {
            yield {
              type: "user" as const,
              message: {
                role: "user" as const,
                content: enhancedQuery
              }
            };
          }

          // Start agent query with async generator
          const response = query({
            prompt: generateMessages(),
            options: agentConfig
          });

          // Stream messages
          for await (const message of response) {
            // Format as SSE
            const sseMessage = `data: ${JSON.stringify(message)}\n\n`;
            controller.enqueue(encoder.encode(sseMessage));
          }

          // Send completion message
          const doneMessage = `data: ${JSON.stringify({ type: 'done' })}\n\n`;
          controller.enqueue(encoder.encode(doneMessage));

          controller.close();
        } catch (error: any) {
          console.error('Agent query error:', error);

          // Send error message
          const errorMessage: SDKMessage = {
            type: 'error',
            error: {
              type: 'AGENT_ERROR',
              message: error.message || 'An error occurred during research',
              details: error
            }
          };

          const sseError = `data: ${JSON.stringify(errorMessage)}\n\n`;
          controller.enqueue(encoder.encode(sseError));

          controller.close();
        }
      },

      cancel() {
        // Cleanup if connection is closed by client
        console.log('SSE connection cancelled by client');
      }
    });

    // Return SSE response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
      }
    });

  } catch (error: any) {
    console.error('Request error:', error);

    return NextResponse.json(
      {
        error: error.message || 'An error occurred processing your request',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/agent/query
 *
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Deep AI Research Agent API is running',
    version: '0.1.0',
    hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
    hasExaKey: !!process.env.EXA_API_KEY
  });
}

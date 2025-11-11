import { NextRequest, NextResponse } from "next/server";

/**
 * Session Management API
 *
 * This is a simplified session management for Phase 1.
 * Phase 2 will add proper database storage for sessions.
 */

// Force Node.js runtime
export const runtime = 'nodejs';

/**
 * GET /api/agent/session
 *
 * Get information about available sessions
 * In Phase 1, this just returns status
 */
export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({
      status: 'ok',
      message: 'Session management is available',
      sessions: [],
      note: 'Full session persistence will be added in Phase 2'
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/agent/session
 *
 * Create a new session
 * In Phase 1, sessions are managed by the SDK
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    return NextResponse.json({
      status: 'created',
      message: 'Session will be created on first query',
      note: 'The Claude Agent SDK manages session IDs automatically'
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/agent/session/:id
 *
 * Delete a session (placeholder for Phase 2)
 */
export async function DELETE(req: NextRequest) {
  try {
    return NextResponse.json({
      status: 'ok',
      message: 'Session deletion not implemented in Phase 1'
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

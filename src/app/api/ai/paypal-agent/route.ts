import { NextRequest, NextResponse } from "next/server";
import { getPayPalAgentTools, executePayPalAgentToolCall } from "@/lib/paypal-ai-toolkit";

/**
 * GET /api/ai/paypal-agent
 * Returns active PayPal AI Agent Toolkit tools and status
 */
export async function GET() {
  try {
    const tools = getPayPalAgentTools();
    return NextResponse.json({
      success: true,
      toolkit: "@paypal/agent-toolkit",
      version: "1.11.0",
      environment: "SANDBOX",
      mcpCli: "@paypal/mcp@1.8.1",
      toolsCount: tools.length,
      tools: tools.map((t: any) => ({
        name: t.function?.name,
        description: t.function?.description,
      })),
    });
  } catch (err: any) {
    console.error("PayPal AI Toolkit initialization error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to load PayPal AI Toolkit",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai/paypal-agent
 * Executes a tool call using PayPal AI Agent Toolkit
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { toolCall } = body;

    if (!toolCall) {
      return NextResponse.json(
        { success: false, error: "Missing toolCall object" },
        { status: 400 }
      );
    }

    const result = await executePayPalAgentToolCall(toolCall);
    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    console.error("PayPal AI Toolkit tool execution error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Tool execution failed" },
      { status: 500 }
    );
  }
}

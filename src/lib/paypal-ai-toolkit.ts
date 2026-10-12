/**
 * PaperTales AI - PayPal AI Agent Toolkit Integration
 * 
 * Official Toolkit: @paypal/agent-toolkit (v1.11.0)
 * Official MCP CLI: @paypal/mcp (v1.8.1)
 * Developer Docs: https://developer.paypal.com/ai-tools/get-started
 * GitHub Repository: https://github.com/paypal/AI-Toolkit
 */

import { PayPalAgentToolkit, ALL_TOOLS_ENABLED } from "@paypal/agent-toolkit/openai";

/**
 * Initialize the PayPal Agent Toolkit with live Sandbox credentials
 */
export function getPayPalAgentToolkit() {
  const clientId =
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
    process.env.PAYPAL_CLIENT_ID ||
    "sb";
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET || "";

  return new PayPalAgentToolkit({
    clientId,
    clientSecret,
    configuration: {
      actions: ALL_TOOLS_ENABLED,
      context: {
        sandbox: true,
      },
    },
  });
}

/**
 * Returns available OpenAI / AI Agent function definitions provided by PayPal AI Toolkit
 */
export function getPayPalAgentTools() {
  const toolkit = getPayPalAgentToolkit();
  return toolkit.getTools();
}

/**
 * Execute an agent tool call via PayPal AI Agent Toolkit
 */
export async function executePayPalAgentToolCall(toolCall: any) {
  const toolkit = getPayPalAgentToolkit();
  return await toolkit.handleToolCall(toolCall);
}

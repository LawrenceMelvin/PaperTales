# PayPal AI Toolkit & Official Developer Resources
**Scope:** Global Project Rule for PaperTales AI  
**Trigger:** always_on  

## 1. Official PayPal Ecosystem Links & Resources
The following resources are the canonical standards for PayPal integrations in PaperTales AI:

| Resource | Official URL | Purpose in PaperTales AI |
| :--- | :--- | :--- |
| **PayPal Developer Portal** | [developer.paypal.com](https://developer.paypal.com/) | API documentation, credentials, webhooks, and REST endpoints. |
| **PayPal AI Tools** | [developer.paypal.com/ai-tools/get-started](https://developer.paypal.com/ai-tools/get-started) | Official guides for agentic payments, tool calling, and MCP servers. |
| **PayPal AI Toolkit (GitHub)** | [github.com/paypal/AI-Toolkit](https://github.com/paypal/AI-Toolkit) | Open-source agent toolkit and plugin repository for AI coding agents. |
| **PayPal Sandbox Dashboard** | [sandbox.paypal.com](https://sandbox.paypal.com/) | Real-time transaction inspection, test buyer/seller accounts, wallet testing. |
| **PayPal Postman Collection** | [postman.com/paypal](https://postman.com/paypal) | Verified API request templates for Orders v2, Captures, Webhooks, and Subscriptions. |
| **PayPal Example Code** | [github.com/paypal-examples/docs-examples](https://github.com/paypal-examples/docs-examples) | Reference implementations for Next.js, Node.js, and Smart Payment Buttons. |

---

## 2. Official Packages & Tooling Architecture

### A. Core Client & Server SDKs
* **Client-side:** `@paypal/react-paypal-js` (`^10.6.0`)
  * Powers dynamic Smart Payment Buttons inside `src/components/TokenModal.tsx` and `OrderSummaryModal.tsx`.
  * Context provided by `src/components/Providers.tsx`.
* **Server-side:** `@paypal/paypal-server-sdk` (`^2.5.0`)
  * Powers secure server-to-server order generation (`/api/paypal/create-order`) and order capture (`/api/paypal/capture-order`).
  * Validates transaction amounts against server-calculated book quotes to prevent client-side price tampering.

### B. PayPal AI Agent Toolkit (`@paypal/agent-toolkit` & `@paypal/mcp`)
* **Package:** `@paypal/agent-toolkit` (v1.11.0+)
  * Official TypeScript toolkit published by PayPal for autonomous AI agent workflows.
  * Connects with OpenAI, LangChain, Vercel AI SDK (`ai`), and Model Context Protocol (MCP).
* **MCP Server CLI:** `@paypal/mcp` (v1.8.1+)
  * Provides an official MCP server enabling AI agents to query orders, verify captures, and manage invoices using natural language.

---

## 3. PayPal Model Context Protocol (MCP) Configuration
For judges or developer agents connecting to PaperTales AI via MCP, the PayPal MCP server can be configured locally or remotely:

### Local MCP Configuration (`mcp_config.json`):
```json
{
  "mcpServers": {
    "paypal": {
      "command": "npx",
      "args": ["-y", "@paypal/mcp", "--tools=all"],
      "env": {
        "PAYPAL_CLIENT_ID": "YOUR_SANDBOX_CLIENT_ID",
        "PAYPAL_CLIENT_SECRET": "YOUR_SANDBOX_CLIENT_SECRET",
        "PAYPAL_ENVIRONMENT": "SANDBOX"
      }
    }
  }
}
```

### Remote MCP Endpoint:
* **SSE Endpoint:** `https://mcp.paypal.com/sse`
* Provides remote access for agents without requiring local binary compilation.

---

## 4. Sandbox Testing Protocol for Judges
1. **Mock Auto-Resolution:**
   * If `NEXT_PUBLIC_PAYPAL_CLIENT_ID` is omitted or set to `sb` / `sandbox`, our backend automatically responds with structured mock orders (`SANDBOX-ORDER-XXXX`) so hackathon judges can test the full flow without friction.
2. **Real Sandbox Testing:**
   * Provide valid Sandbox Client ID & Secret in `.env.local`.
   * Test buyer credentials can be generated at [sandbox.paypal.com](https://sandbox.paypal.com/).
   * Verify captured orders instantly in the **AG Grid Operations Portal** at `/dashboard`.

---

## 5. Webhook Handling Standards
* **Route:** `src/app/api/paypal/webhook/route.ts`
* **Supported Events:**
  * `CHECKOUT.ORDER.APPROVED`
  * `PAYMENT.CAPTURE.COMPLETED`
  * `PAYMENT.CAPTURE.DENIED`
* **Security:** Verifies webhook signature headers (`PAYPAL-AUTH-ALGO`, `PAYPAL-TRANSMISSION-SIG`, etc.) against PayPal's verification endpoint.

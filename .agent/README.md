# PaperTales AI — Agent System Rules & Documentation

Welcome to the `.agent` repository directory for **PaperTales AI**.

## What is the `.agent` Folder?
The `.agent` folder is the **single source of truth and behavioral memory** for AI development agents (Antigravity, Cursor, Windsurf, Copilot, etc.) working on this codebase. 

It prevents model hallucination, ensures strict version alignment with modern SDKs, and enforces business logic, hackathon criteria, and economic parameters across every coding session.

---

## Directory Structure & Rule Index

```
.agent/
├── README.md                          # This index and architectural overview
└── rules/
    ├── 01-tech-stack-versions.md      # Approved runtime, framework, and AI model versions
    ├── 02-pricing-and-economics.md    # 62% margin model, $0.17/page pricing, 5 free pages rule
    ├── 03-hackathon-compliance.md     # Devpost rules, MIT license, < 3 min video criteria
    ├── 04-sponsor-integrations.md     # AG Grid, Channel3, Lulu Print API, Render deployment
    └── 05-paypal-ai-toolkit-resources.md # Official PayPal AI Toolkit, MCP server, Postman, & SDK guides
```

---

## Quick Reference Summary

| Domain | Rule / Decision | Detail |
| :--- | :--- | :--- |
| **Runtime & Framework** | Node.js v22.14 LTS + Next.js 15.1 | App Router, React 19, TypeScript strict mode |
| **Image Generation Model** | `gpt-image-2.5-flare` | 1024x1024 monochrome vector coloring line art (~$0.024/page) |
| **Deprecated Models** | `dall-e-2`, `dall-e-3` | ❌ Prohibited (retired by OpenAI API) |
| **Free Tier** | First 5 Pages | 100% Free on the house for all users |
| **Paid Token Pricing** | $0.17 USD (~₹14.50 INR) per page | Exact 62% profit margin on $0.065 empirical COGS |
| **Interactive Mascot** | Barnaby | Dynamic sales quoter for arbitrary page counts (5 to 60+ pages) |
| **PayPal AI Toolkit & MCP** | `@paypal/agent-toolkit` & `@paypal/mcp` | Official PayPal AI Toolkit, MCP Server CLI, and agentic workflows |
| **PayPal Payments** | Smart Buttons & Server SDK | `@paypal/react-paypal-js` & `@paypal/paypal-server-sdk` v2.5 |
| **Enterprise Data** | AG Grid v36.2 (`ag-theme-quartz`) | Operational print queue & order analytics (`/dashboard`) |
| **Agentic Commerce** | Channel3 AI Bundle Engine | Contextual art supplies recommendation (`/api/channel3/suggest`) |
| **Physical Books** | Lulu Print API v2 | Softcover 8.5x11 perfect bound / saddle stitch fulfillment |

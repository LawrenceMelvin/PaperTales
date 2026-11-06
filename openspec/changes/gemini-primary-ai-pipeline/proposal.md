# Proposal

## Why

PaperTales AI currently relies on OpenAI (`gpt-4.1` and `gpt-image-2.5-flare`) as the primary engine for the Studio AI Helper (`/api/ai/chat`), book story/chapter generation (`/api/ai/story`), text refinement (`/api/ai/refine`), and coloring/cover illustrations (`/api/ai/image`), while `GEMINI_API_KEY` in `.env.local` is set to a dummy placeholder (`sb-gemini-key`) and legacy code references retired or older Gemini models (`gemini-2.0-flash`, `gemini-2.5-flash-image`). Switching to the latest active Google Gemini models (`gemini-3.8-flash`, `gemini-3.1-flash-lite-image`, and `gemini-3.1-flash-image`) as the primary engine utilizes the creator's ₹2.49K Google Cloud credits, speeds up interior coloring page generation by nearly 5× (`3.28s` vs `15–18s`), and retains OpenAI and Groq as automatic failovers.

## What Changes

- Configure `.env.local` with the active `GEMINI_API_KEY` while retaining `OPENAI_API_KEY` and `GROQ_API_KEY` as automatic backup credentials.
- Make `gemini-3.8-flash` (the active latest GA text/JSON model replacing retired `gemini-2.0-flash`) the Tier-1 primary model for:
  - Studio AI Helper & Book Designer conversations (`/api/ai/chat`)
  - Story outline, chapter, and journal layout generation (`/api/ai/story`)
  - Highlighted passage refinement (`/api/ai/refine`)
- Make Google's latest active native multimodal image models (replacing deprecated standalone Imagen and legacy `gemini-2.5-flash-image`) the Tier-1 primary engine for illustrations (`/api/ai/image` and `/api/ai/story`):
  - **Interior Coloring & Story Pages (`pageNumber >= 1`)**: Primary `gemini-3.1-flash-lite-image` (*Nano Banana 2 Lite* — `3.28s` latency, `$0.0336` list cost / 1,120 tokens, preserving ~62% margin economics), with fallback to `gemini-3.1-flash-image` and OpenAI `gpt-image-2.5-flare`.
  - **Front Book Cover (`pageNumber === 0`)**: Primary `gemini-3.1-flash-image` (*Nano Banana 2* — high-detail cover composition), with fallback to `gemini-3.1-flash-lite-image` and OpenAI `gpt-image-2.5-flare`.

## Capabilities

### New Capabilities
- `gemini-primary-ai-pipeline`: Governs the multi-provider AI routing hierarchy where active Google Gemini models (`gemini-3.8-flash`, `gemini-3.1-flash-lite-image`, `gemini-3.1-flash-image`) serve as the Tier-1 primary engine for chat, story synthesis, text refinement, and book illustrations, with automatic failover to OpenAI (`gpt-4.1`, `gpt-image-2.5-flare`) and Groq (`llama-3.3-70b-versatile`).

### Modified Capabilities

## Impact

- **Configuration**: `.env.local` and `.env.example` (`GEMINI_API_KEY`, optional `GEMINI_CHAT_MODEL`, `GEMINI_IMAGE_MODEL`, `GEMINI_COVER_IMAGE_MODEL`).
- **API Routes**:
  - `src/app/api/ai/chat/route.ts`
  - `src/app/api/ai/story/route.ts`
  - `src/app/api/ai/image/route.ts`
  - `src/app/api/ai/refine/route.ts`
- **Economics & Latency**: Reduces interior page generation latency from ~15–18s to ~3.3s per page and routes AI compute to the creator's ₹2.49K Google Cloud credit balance while keeping OpenAI as a zero-downtime backup.

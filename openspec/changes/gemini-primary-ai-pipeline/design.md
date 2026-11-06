# Design

## Context

Currently, PaperTales AI's four AI routes (`/api/ai/chat`, `/api/ai/story`, `/api/ai/image`, and `/api/ai/refine`) prioritize OpenAI (`gpt-4.1` and `gpt-image-2.5-flare`) and only use Gemini as a partial fallback in `/api/ai/image` and `/api/ai/story` with an outdated model ID (`gemini-2.5-flash-image`) and a placeholder key (`GEMINI_API_KEY=sb-gemini-key` in `.env.local`). Furthermore, `gemini-2.0-flash` and standalone `imagen-*` endpoints have been retired on the Gemini API in favor of `gemini-3.8-flash` (text/JSON) and native multimodal `gemini-3.1-flash-lite-image` / `gemini-3.1-flash-image` (image generation). See `proposal.md` for motivation.

## Goals / Non-Goals

**Goals:**
- Route all text/JSON AI calls (`/api/ai/chat`, `/api/ai/story`, `/api/ai/refine`) to `gemini-3.8-flash` first when `GEMINI_API_KEY` is valid (not empty and not starting with `sb-` or `test_`).
- Route interior page illustrations (`pageNumber >= 1`) to `gemini-3.1-flash-lite-image` first (~3.28s latency, 1,120 image tokens / ~$0.0336 list cost) and front book covers (`pageNumber === 0`) to `gemini-3.1-flash-image` first (~10.34s latency, high composition detail).
- Preserve OpenAI (`gpt-4.1` and `gpt-image-2.5-flare`) as the immediate Tier-2 backup and Groq (`llama-3.3-70b-versatile`) / Pollinations as Tier-3 emergency fallbacks.
- Keep all existing response schemas, Studio state synchronization, and 5-free-pages + blurred preview behaviors unchanged.

**Non-Goals:**
- Changing client-side UI components (`src/app/studio/page.tsx`, `BookViewer.tsx`) or PayPal checkout flows.
- Removing OpenAI or Groq support from any route.

## Decisions

1. **Text & JSON Model Selection (`gemini-3.8-flash`)**:
   - *Decision*: Use `https://generativelanguage.googleapis.com/v1beta/models/${geminiChatModel}:generateContent?key=${geminiKey}` where `geminiChatModel = process.env.GEMINI_CHAT_MODEL || "gemini-3.8-flash"`.
   - *Rationale*: Live testing against the creator's API key confirmed `gemini-2.0-flash` returns `404 NOT_FOUND` with explicit guidance to use `models/gemini-3.8-flash`, which returned `200 OK` with `generationConfig: { responseMimeType: "application/json", temperature: 0.4 }`.
   - *Message Mapping*: Combine `system` messages into Gemini's `systemInstruction: { parts: [{ text: ... }] }` and map `user` / `assistant` messages to Gemini `contents` with roles `"user"` and `"model"`.

2. **Tiered Gemini Image Model Selection (`gemini-3.1-flash-lite-image` vs. `gemini-3.1-flash-image`)**:
   - *Decision*:
     - For interior pages (`pageNumber !== 0`): Try `gemini-3.1-flash-lite-image` -> `gemini-3.1-flash-image` -> OpenAI `gpt-image-2.5-flare`.
     - For front book covers (`pageNumber === 0`): Try `gemini-3.1-flash-image` -> `gemini-3.1-flash-lite-image` -> OpenAI `gpt-image-2.5-flare`.
   - *Rationale*: Empirical benchmarks showed `gemini-3.1-flash-lite-image` generates 1024×1024 coloring line-art in `3.28s` at `$0.0336/image` (preserving our $0.09/page retail unit economics and 5× faster than OpenAI's 15–18s), while `gemini-3.1-flash-image` provides richer detail for single cover generation (`pageNumber === 0`). Both bill against the creator's ₹2.49K GCP credits.

3. **Key Validation Helper**:
   - *Decision*: Treat `GEMINI_API_KEY` as active when `Boolean(geminiKey && !geminiKey.startsWith("sb-") && !geminiKey.startsWith("test_"))`.
   - *Rationale*: Google AI Studio / Vertex keys can start with `AIza...` or `AQ...`, so checking for non-placeholder keys rather than a rigid `AIza` prefix is essential.

## Risks / Trade-offs

- **[Risk] Gemini 3.8 Flash thinking tokens or markdown code fences in JSON responses** → *Mitigation*: Pass `responseMimeType: "application/json"` in `generationConfig` and strip any accidental ```json fences before `JSON.parse`, falling back to OpenAI `gpt-4.1` if parsing fails.
- **[Risk] Base64 image size in JSON payloads** → *Mitigation*: Both `gemini-3.1-flash-lite-image` and `gemini-3.1-flash-image` return JPEG `inlineData` (`image/jpeg`), which is compact (~150–250 KB per image) and directly compatible with `pdf-lib`'s `embedJpg` and browser `<img src="data:image/jpeg;base64,..." />`.

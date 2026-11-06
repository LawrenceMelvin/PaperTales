# Tasks

## 1. Environment & Gemini Client Configuration

- [x] 1.1 Update `.env.local` with the active `GEMINI_API_KEY` and update `.env.example` with `GEMINI_CHAT_MODEL=gemini-3.8-flash`, `GEMINI_IMAGE_MODEL=gemini-3.1-flash-lite-image`, and `GEMINI_COVER_IMAGE_MODEL=gemini-3.1-flash-image`, verifying the keys load cleanly in Node.

## 2. Studio AI Helper & Text Synthesis Routes (`gemini-3.8-flash` Primary)

- [x] 2.1 Update `src/app/api/ai/chat/route.ts` to call `gemini-3.8-flash` (`responseMimeType: "application/json"`) as the Tier-1 primary designer model when `GEMINI_API_KEY` is configured, keeping OpenAI (`gpt-4.1`) as Tier-2 and Groq (`llama-3.3-70b-versatile`) as Tier-3, and verify structured JSON responses (`bookDraft`, `discussionStage`, `titleOptions`, `quickReplies`) return with `engine: "gemini-3.8-flash"`.
- [x] 2.2 Update `src/app/api/ai/refine/route.ts` to use `gemini-3.8-flash` as the primary passage refinement model before OpenAI and Groq, and verify passage refinement returns valid `refinedText` and `explanation`.

## 3. Book Story & Illustration Generation Routes (`gemini-3.1-flash-lite-image` & `gemini-3.1-flash-image` Primary)

- [x] 3.1 Update `src/app/api/ai/image/route.ts` so front book covers (`pageNumber === 0`) call `gemini-3.1-flash-image` first (`gemini-3.1-flash-lite-image` second) and interior pages (`pageNumber >= 1`) call `gemini-3.1-flash-lite-image` first (`gemini-3.1-flash-image` second), falling back to OpenAI `gpt-image-2.5-flare`, and verify both cover and interior calls return `data:image/jpeg;base64,...` URIs.
- [x] 3.2 Update `src/app/api/ai/story/route.ts` to use `gemini-3.8-flash` as the Tier-1 outline/chapter generator (with OpenAI `gpt-4.1` and Groq `llama-3.3-70b-versatile` as backups) and `gemini-3.1-flash-lite-image` as the Tier-1 page illustration generator (replacing legacy `gemini-2.5-flash-image`, with OpenAI `gpt-image-2.5-flare` as backup), and verify Page 1 Proof and unlocked page generation succeed.

## 4. End-to-End Verification

- [x] 4.1 Run `npm test` and `npm run build` to verify all unit economics, PDF compilation, TypeScript types, and Next.js routes pass with zero errors.

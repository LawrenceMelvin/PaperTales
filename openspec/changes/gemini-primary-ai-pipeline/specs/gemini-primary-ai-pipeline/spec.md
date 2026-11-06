# Spec Delta

## Purpose

Governs the multi-provider AI routing hierarchy where active Google Gemini models (`gemini-3.8-flash`, `gemini-3.1-flash-lite-image`, and `gemini-3.1-flash-image`) serve as the Tier-1 primary engine for Studio AI Helper conversations, story/chapter outlines, passage refinement, and book illustrations, with automatic failover to OpenAI and Groq.

## ADDED Requirements

### Requirement: Gemini 3.8 Flash primary engine for Studio AI Helper and text generation
When a valid `GEMINI_API_KEY` is configured, the system SHALL route Studio AI Helper conversations (`/api/ai/chat`), book story/chapter outline synthesis (`/api/ai/story`), and passage refinement (`/api/ai/refine`) to `gemini-3.8-flash` (or `GEMINI_CHAT_MODEL`) with structured JSON output before attempting OpenAI or Groq.

#### Scenario: Studio chat turn with active Gemini API key
- **WHEN** the creator sends a message in `/studio` and `GEMINI_API_KEY` is configured
- **THEN** `/api/ai/chat` calls `gemini-3.8-flash` with `responseMimeType: "application/json"`, returns the structured `bookDraft`, `discussionStage`, `titleOptions`, and `quickReplies`, and records `gemini-3.8-flash` as the engine used

#### Scenario: Automatic failover to OpenAI and Groq when Gemini text call fails
- **WHEN** the primary `gemini-3.8-flash` request returns an error or invalid JSON and `OPENAI_API_KEY` or `GROQ_API_KEY` is configured
- **THEN** the endpoint automatically retries the request using OpenAI (`gpt-4.1`) and then Groq (`llama-3.3-70b-versatile`) without failing the user request

### Requirement: Gemini 3.1 Flash Lite Image primary engine for interior pages
When a valid `GEMINI_API_KEY` is configured, the system SHALL generate interior book illustrations (`pageNumber >= 1`) in `/api/ai/image` and `/api/ai/story` using `gemini-3.1-flash-lite-image` as the primary model to maintain fast generation latency (~3.3s) and unit cost (~$0.0336/image).

#### Scenario: Generating an interior coloring or story page illustration
- **WHEN** `/api/ai/image` or `/api/ai/story` generates an illustration for an interior page (`pageNumber >= 1` or `pageNumber` omitted) with `GEMINI_API_KEY` configured
- **THEN** the system requests `IMAGE` modality from `gemini-3.1-flash-lite-image` first and returns the resulting `data:image/...;base64,...` data URI

#### Scenario: Automatic failover to Gemini 3.1 Flash Image and OpenAI GPT-Image-2.5
- **WHEN** `gemini-3.1-flash-lite-image` fails or returns no image data
- **THEN** the system automatically falls back to `gemini-3.1-flash-image` and then to OpenAI `gpt-image-2.5-flare` (`OPENAI_API_KEY`) before using non-keyed fallback rendering

### Requirement: Gemini 3.1 Flash Image primary engine for Front Book Covers
When a valid `GEMINI_API_KEY` is configured and the system generates a Front Book Cover (`pageNumber === 0`), `/api/ai/image` SHALL use `gemini-3.1-flash-image` as the primary model for high-detail cover composition, falling back to `gemini-3.1-flash-lite-image` and OpenAI `gpt-image-2.5-flare`.

#### Scenario: Designing a Front Book Cover in Studio
- **WHEN** the creator triggers Front Book Cover generation (`pageNumber === 0`) with `GEMINI_API_KEY` configured
- **THEN** `/api/ai/image` calls `gemini-3.1-flash-image` first and returns the generated cover artwork data URI

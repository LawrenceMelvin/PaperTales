# Spec Delta

## Purpose
Protects PaperTales' paid AI generation endpoints from bots, scripted abuse, quota farming, and unsafe prompts. Real visitors still get a frictionless free preview.

## ADDED Requirements

### Requirement: App attestation on AI endpoints
Every AI generation endpoint SHALL require a valid app-attestation token proving the request came from the genuine PaperTales web app running in a real browser. Requests with a missing or invalid token SHALL be rejected before any model is called.

#### Scenario: Scripted request without attestation
- **WHEN** a script calls `/api/ai/image` with a valid identity token but no app-attestation token
- **THEN** the server responds `403` and no model call is made

#### Scenario: Development environment
- **WHEN** the app runs locally in development mode with a registered debug attestation token
- **THEN** AI endpoints accept requests carrying that debug token

### Requirement: Anonymous generation quota
An anonymous account SHALL be limited to a small, server-enforced allowance: at most 12 AI chat turns and exactly 1 Master Page 1 proof generation. Any other generation by an anonymous account SHALL be refused with a response telling the client to prompt for sign-in. This covers proof redesigns, pages 2..N, covers, refinements, and unlocks.

#### Scenario: Anonymous user generates the master proof
- **WHEN** an anonymous user requests their first Master Page 1 proof
- **THEN** the proof is generated and the anonymous master-proof allowance is marked as used

#### Scenario: Anonymous user tries a second generation
- **WHEN** an anonymous user who has used their master-proof allowance requests a redesign or page expansion
- **THEN** the server responds `401` with reason `sign_in_required` and makes no model call

#### Scenario: Anonymous chat limit
- **WHEN** an anonymous user sends their 13th chat message
- **THEN** the server responds `401` with reason `sign_in_required`

### Requirement: Per-IP anonymous account throttling
To stop a single client from farming free proofs by creating many anonymous accounts, the system SHALL limit anonymous master-proof generations per client IP address to at most 3 per 24 hours.

#### Scenario: Repeated incognito sessions
- **WHEN** a fourth anonymous account from the same IP address requests a master proof within 24 hours
- **THEN** the server responds `429` with reason `sign_in_required` and makes no model call

### Requirement: Per-user rate limits for signed-in users
Signed-in users SHALL be rate-limited on AI endpoints to at most 30 image generations and 60 chat/story requests per 10 minutes. These limits apply on top of token entitlement.

#### Scenario: Burst of image requests
- **WHEN** a signed-in user sends the 31st image generation request within 10 minutes
- **THEN** the server responds `429` with a retry-after value and makes no model call

### Requirement: Server-side entitlement check before generation
Before generating any page, the server SHALL check that the user is entitled to it. A page is entitled if it is Master Page 1, falls within the user's First-5-Free grant for the book, or is on a book unlocked by a token debit or verified PayPal payment. Client-supplied flags such as `freePagesLimit` or `unlockPagesOnly` SHALL NOT grant entitlement.

#### Scenario: Forged unlock flag
- **WHEN** a client calls story generation with `unlockPagesOnly: true` for a book that has no token debit or payment recorded
- **THEN** the server refuses to generate pages 6..N and responds `402`

#### Scenario: Forged free-page limit
- **WHEN** a client sends `freePagesLimit: 50` for a 50-page book
- **THEN** the server generates only the pages the user is actually entitled to

### Requirement: Kid-safe prompt filtering
User-provided prompt text SHALL be checked before any model call for disallowed content and prompt-injection patterns. Model safety settings SHALL block sexual, hateful, harassing, and dangerous content at low-and-above thresholds. Blocked requests SHALL return a friendly, non-technical message and SHALL NOT consume tokens or quota.

#### Scenario: Unsafe prompt
- **WHEN** a user submits a character or page description containing explicit or violent content
- **THEN** the server responds `422` with a family-friendly message, makes no image call, and debits no tokens

#### Scenario: Prompt injection attempt
- **WHEN** a user's prompt contains instructions to ignore the system prompt or change the art style rules
- **THEN** the injected instructions have no effect on the enforced style and safety instructions

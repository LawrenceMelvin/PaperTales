# Design

## Context

See `proposal.md` for motivation. Current-state facts that shape this design:

- **All trust is client-side.** `src/lib/token-store.ts` and `src/lib/order-store.ts` read and write `localStorage`. `studio/page.tsx` calls `deductClientTokens()` and *then* posts `unlockPagesOnly: true` / `freePagesLimit` to `/api/ai/story`, and the server honors those flags. `TokenModal` calls `addClientTokens()` after capture.
- **Checkout trusts client prices.** `api/paypal/create-order` takes `creationFee`, `printCost`, `shippingCost`, and `companionItem.price` from the body. `api/paypal/capture-order` persists nothing. `api/paypal/webhook` only logs.
- **Lulu print is broken in production.** `capture-order` gives Lulu `GET /api/pdf/compile?bookId=…`, but that route only implements `POST` and needs the whole `BookProject` in the body.
- **Images are base64 data URLs** returned by `/api/ai/image` (Gemini `inlineData`) and held in React state. That is roughly 1–2 MB per page, so whole books cannot be stored as one database record.
- **Bookstore PDFs** stream from `C:\Lawrence\KDP SKETCH BOOK` (141 files, ~1.77 GB).
- **Studio flow already has the gate point:** Stage 1 "Master Page 1 Proof" (`/api/ai/story`, `pageCount: 1`), then Stage 2 expansion (pages 2–5 free, 6..N blurred), then Unlock.
- **Constraints:** a brand-new GCP project `papertale` (never `auratap-505817`), small promotional credit, Next.js 15 App Router, strict TS, and every `firebase-admin` use must run in the Node runtime (not Edge middleware).

## Goals / Non-Goals

**Goals:**
- Server is authoritative for identity, balances, entitlements, prices, and fulfillment.
- Stay inside GCP always-free tiers at seed scale, with hard cost caps.
- Avoid long-lived service-account key files.
- Keep the existing studio UX. The only new friction is the single sign-in gate after the master proof.

**Non-Goals:**
- No client-side Firestore SDK or realtime listeners in v1. All data flows through our API routes.
- No rewrite of the AI prompt pipelines in `/api/ai/story` and `/api/ai/chat` beyond adding guards, entitlement clamping, and persistence.
- No Firebase Emulator-based CI in this change (optional local tool only).

## Decisions

### D1. Project, region, and services
- Project ID `papertale` (fall back to `papertale-<suffix>` if the global ID is taken), display name "PaperTale". Link to the billing account that holds the credits.
- **Region `us-central1` for everything.** The GCS 5 GB always-free tier applies only to `us-central1`/`us-east1`/`us-west1`. Colocating Firestore and Cloud Run there avoids cross-region egress, and Lulu and PayPal are US-hosted. *Alternative:* `asia-south1` (Mumbai) for lower dev latency. Rejected because it loses the GCS free tier.
- Enable only: `firebase`, `identitytoolkit`, `firestore`, `storage`, `firebaseappcheck`, `recaptchaenterprise`, `run`, `cloudbuild`, `artifactregistry`, `secretmanager`, `iamcredentials`.
- **Cost guardrails:** a billing budget on the project with email alerts at 50/90/100% of the credit amount, and Cloud Run `--max-instances=3`.

### D2. Auth: Firebase Auth with anonymous first, then Google linking
- Client: `firebase/auth` calls `signInAnonymously()` on studio mount when there is no user. The gate calls `linkWithPopup(user, GoogleAuthProvider)`.
- If linking fails with `auth/credential-already-in-use`: sign in with the returned credential, then call `POST /api/books/claim { anonymousBookId, anonymousIdToken }`. The server verifies the old anonymous token and moves the draft's owner. No free grant is created for the anonymous id.
- **Transport:** a tiny `apiFetch()` wrapper attaches `Authorization: Bearer <idToken>` and `X-Firebase-AppCheck: <token>` to every `/api/*` call. *Alternative:* httpOnly session cookies via `createSessionCookie`. Rejected for v1 because Bearer headers avoid CSRF handling, and every caller is our own SPA code.
- Server: `requireUser(req, { allowAnonymous })` in `src/lib/server/auth.ts` calls `admin.auth().verifyIdToken()`. It returns `{ uid, isAnonymous, email }`. Each protected route calls it; no Edge middleware.
- Profile docs are created lazily by `GET /api/me` on the first non-anonymous call.

### D3. Firestore data model (Native mode, deny-all client rules)
Top-level collections. All writes go through `firebase-admin`, and `firestore.rules` denies all client reads and writes.

| Collection | Key | Notes |
|---|---|---|
| `users/{uid}` | uid | `tokenBalance`, `freeGrantClaimed`, `freeGrantBookId`, profile fields, `anon: {chatTurns, proofs}` counters |
| `tokenTransactions/{autoId}` | — | append-only: `uid,type,amount,balanceBefore,balanceAfter,refId,createdAt` |
| `books/{bookId}` | bookId | owner `uid`, metadata, character anchor, `pages[]` with `imagePath` (no base64), `entitlement: {freePages, paidThrough, unlockedBy, unlockRef}`, `contentVersion`, `pdf: {interiorPath, coverPath, version}` |
| `orders/{paypalOrderId}` | PayPal order id | `uid, purpose, bookId, amounts (server), status: pending→fulfilling→paid→(in_production→shipped) / flagged / print_failed`, `captureId`, Lulu fields |
| `rateLimits/{key}` | `sha256(scope:id):window` | `count`, `expiresAt` (Firestore TTL policy deletes them) |

*Why deny-all rules:* it makes "client cannot edit balance" true by construction and keeps the Firebase client bundle to Auth + App Check only. *Alternative:* client reads with owner rules and `onSnapshot` for live balance. Deferred. `Navbar` refreshes from `/api/me` on a `tokens_updated` event, which already exists.

*Why `orders` is keyed by PayPal order id:* it gives a natural idempotency key for both capture and webhook paths.

### D4. Token ledger
`src/lib/server/ledger.ts` exposes `debit(uid, amount, refId)`, `credit(uid, amount, type, refId)`, and `refund(debitTxnId, amount)`. Each runs in `db.runTransaction`: read the user, check the balance, update `tokenBalance`, and create the `tokenTransactions` doc in the same transaction. Firestore transactions retry on contention, which satisfies the concurrent double-spend scenario.

The First-5-Free grant is not tokens. It is `freeGrantClaimed=true` plus `books/{id}.entitlement.freePages=5`, set in a transaction when a permanent user first expands a book. Eligibility also requires no paid orders, which preserves the existing spec semantics.

### D5. Entitlement enforcement in AI routes
`src/lib/server/entitlement.ts` → `allowedPages(book, user)` returns the set of page numbers the caller may generate: page 1, pages ≤ `freePages`, and pages ≤ `paidThrough`.
- `/api/ai/story` and `/api/ai/image` require `bookId`. The server loads the stored book, **ignores** client `freePagesLimit` / `unlockPagesOnly` as grants, clamps generation to the allowed pages, and writes results back to the book.
- Unlock via tokens = `POST /api/books/:id/unlock { method: "tokens" }`. This runs the ledger debit of `N-5` in one transaction and sets `paidThrough=N`. Then the client calls story generation, now entitled. Failed pages trigger `refund` (D4).
- Request shapes of the large story/chat routes stay the same except for `bookId`. This limits churn in 54 KB of prompt code.

### D6. Abuse protection stack (order of checks in `guardAiRequest()`)
1. **App Check:** `admin.appCheck().verifyToken()` with the reCAPTCHA Enterprise provider (score-based and invisible, 10k assessments/month free). Debug tokens are registered for local dev.
2. **Identity:** `requireUser` (anonymous allowed only on `chat` and stage-1 `story`).
3. **Anonymous quota:** transactional increment of `users/{anonUid}.anon` (12 chat turns, 1 proof). Plus an IP limit of `rateLimits` 3 proofs per 24 h, keyed by `sha256(ip)` from the first `X-Forwarded-For` hop (Cloud Run sets it).
4. **Signed-in rate limits:** fixed-window counters in `rateLimits` (30 image / 60 text per 10 min).
5. **Safety:** `src/lib/server/prompt-safety.ts` uses a denylist plus injection heuristics on user text. User text is wrapped in delimiters after the fixed system/style prompt. Gemini `safetySettings` are `BLOCK_LOW_AND_ABOVE` on all four harm categories.
6. Then the entitlement check (D5), then the model call.

*Rejected alternatives:* Memorystore Redis (~\$35+/mo minimum), Cloud Armor (needs an external HTTPS load balancer, ~\$18+/mo), and in-memory limiters (broken across Cloud Run instances). Firestore counters cost about 2 writes per request, which fits the 20k writes/day free tier at seed scale.

### D7. Cloud Storage
- Bucket `papertale-assets` (or `<projectId>-assets`) in `us-central1`, Standard class, uniform bucket-level access, public access prevention **enforced**.
- Layout: `bookstore/<catalogId>/interior.pdf`, `users/<uid>/books/<bookId>/pages/<n>-<contentVersion>.png`, `users/<uid>/books/<bookId>/pdf/{interior,cover}-v<version>.pdf`.
- `/api/ai/image` uploads the Gemini bytes and returns `{ imagePath, signedUrl }`. Book responses include freshly minted 1-hour V4 signed read URLs. `pdf-builder` gets an image loader that reads bytes from GCS by path instead of fetching data URLs.
- **Lulu:** at print submission, mint V4 signed URLs with **7-day** expiry (the V4 maximum) for the stored interior and cover PDFs, and pass those to `submitLuluPrintJob`. This replaces the broken `GET /api/pdf/compile?bookId=` URL.
- **Signing without key files:** on Cloud Run the runtime service account signs via IAM `signBlob` (it gets `roles/iam.serviceAccountTokenCreator` on itself). Locally, run `gcloud auth application-default login --impersonate-service-account=<runtime SA>`.
- Bookstore sync: `gcloud storage rsync "C:\Lawrence\KDP SKETCH BOOK" gs://<bucket>/bookstore-src --recursive`, plus a catalog manifest mapping `sourcePdfRelativePath` to object path. `bookstore/asset` uses GCS when `NODE_ENV=production`, otherwise the local disk, and keeps the compile fallback.

### D8. Checkout and fulfillment
- `create-order` requires a non-anonymous user. The server computes amounts:
  - **Token pack:** from `AVAILABLE_TOKEN_PACKS`.
  - **Digital unlock:** from `pricing-calculator.ts` and the stored book's page count and entitlement.
  - **Print:** from a server-side `lulu-client` quote using the client's *non-price* inputs (country, shipping level, quantity).
  - **Companion:** re-resolved by product id via Channel3; dropped if it can't be resolved.

  The server writes `orders/{paypalOrderId}` with `status: pending`.
- `fulfillOrder(paypalOrderId, capture)` is shared by `capture-order` and the webhook. In a transaction it checks status is `pending`, then compares amount and currency. On a mismatch it sets `flagged`. On a match it sets `fulfilling`, then applies side effects (ledger credit / set `paidThrough` / compile, store, and submit to Lulu), then sets `paid` or `print_failed`. A second call sees non-pending and returns the existing order.
- The webhook verifies via PayPal `POST /v1/notifications/verify-webhook-signature` using `PAYPAL_WEBHOOK_ID`.
- `/dashboard` and `OrderTrackingGrid` call `GET /api/orders`. `DEFAULT_SAMPLE_ORDERS` is removed from production paths.

### D9. Hosting and secrets
- `next.config.ts`: `output: "standalone"`, `serverExternalPackages: ["firebase-admin", "@google-cloud/storage"]`.
- Multi-stage `Dockerfile` (Node 22 alpine), deployed with `gcloud run deploy papertale-web --source . --region us-central1 --service-account papertale-runtime@… --min-instances 0 --max-instances 3 --set-secrets …`.
- Server secrets in Secret Manager: `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`, `LULU_CLIENT_SECRET`, `CHANNEL3_API_KEY`, `GEMINI_API_KEY`. Public `NEXT_PUBLIC_FIREBASE_*` config and the reCAPTCHA site key are build-time env vars, which are not secret.
- Runtime SA roles: `datastore.user`, `storage.objectAdmin` (bucket-scoped), `firebaseauth.admin`, `firebaseappcheck.tokenVerifier`, `secretmanager.secretAccessor`, and self-`serviceAccountTokenCreator`.

## Risks / Trade-offs

- **[Popup sign-in blocked on mobile Safari / in-app browsers]** → fall back to `linkWithRedirect` and restore studio state from the saved anonymous book on return.
- **[Anonymous account farming across IPs (VPNs, mobile carriers)]** → App Check plus the per-IP cap make it costly. The worst case is a bounded spend of one proof (~\$0.03–0.07) per farmed identity. Budget alerts catch anomalies.
- **[Shared-IP false positives (schools, offices) hitting the 3-proofs/day cap]** → the response asks them to sign in, which bypasses the anonymous cap. They aren't blocked.
- **[Firestore write volume from rate-limit counters]** → about 2 writes per AI request. At ~5k AI requests/day that is still under the 20k free writes/day. Revisit if traffic grows.
- **[Transaction contention on a hot user doc]** → only one user's own requests contend. Firestore retries handle it.
- **[V4 signed URL max 7 days; Lulu may fetch later on retries]** → store object paths, not URLs, and re-mint on any Lulu resubmission.
- **[Large `studio/page.tsx` (137 KB) refactor risk]** → change only the fetch calls (to `apiFetch` with `bookId`), the token calls, and add the gate. No layout changes.
- **[Promotional credit is small]** → cap instances, enforce free-tier regions, set budget alerts, and keep `min-instances=0`. Gemini image generation remains the main variable cost and is already priced into page pricing.
- **[Demo `localStorage` balances vanish]** → accepted, since they were never real money. A one-time "welcome to accounts" notice explains it.

## Migration Plan

1. Provision the `papertale` project, billing, APIs, Firestore, bucket, service account, Secret Manager entries, App Check / reCAPTCHA key, and budget (no code impact).
2. Ship the server libs and guarded routes behind `REQUIRE_AUTH=true`. Locally, `REQUIRE_AUTH=false` keeps the current behavior during development.
3. Ship the client auth, gate, and `apiFetch`. Switch token and order UIs to server APIs.
4. Sync bookstore PDFs. Deploy to Cloud Run. Register the PayPal webhook URL on the Cloud Run domain. Smoke-test in PayPal/Lulu **sandbox**.
5. Flip to PayPal/Lulu live credentials only after the sandbox checklist passes.

**Rollback:** Cloud Run revision traffic rollback (`gcloud run services update-traffic --to-revisions=<prev>=100`). Firestore and GCS data are additive and unaffected.

## Open Questions

- Should the Gemini API key move to a key created inside `papertale` (cleaner billing attribution), or keep the current key for now? This doesn't affect code; it only changes the secret value.
- Custom domain (e.g., `papertales.ai`) mapping to Cloud Run. This can be done after first deploy.
- Anonymous-account cleanup cadence (e.g., delete anonymous users and drafts older than 30 days). This can be a later scheduled job.

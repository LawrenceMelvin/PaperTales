# Tasks

## 1. GCP project `papertale` provisioning (infra only, no app code)

- [x] 1.1 Create project `papertale` (fallback `papertale-<suffix>` if the ID is taken) with `gcloud projects create`, and verify with `gcloud projects describe` that it exists and `auratap-505817` is unchanged
- [x] 1.2 Link the credit-bearing billing account and verify `gcloud billing projects describe <id>` shows `billingEnabled: true`
- [x] 1.3 Enable only the APIs listed in design D1 and verify with `gcloud services list --enabled --project <id>`
- [ ] 1.4 Add Firebase to the project, create a Web app, enable Anonymous + Google providers in Auth, and verify both providers show as enabled in the Firebase console
- [x] 1.5 Create Firestore (Native, `us-central1`), add a TTL policy on `rateLimits.expiresAt`, and verify with `gcloud firestore databases describe`
- [x] 1.6 Create bucket `<id>-assets` in `us-central1` with uniform access + public access prevention enforced, and verify with `gcloud storage buckets describe` (expect `public_access_prevention: enforced`)
- [x] 1.7 Create runtime service account `papertale-runtime` with the roles in design D9, and verify with `gcloud projects get-iam-policy`
- [x] 1.8 Create a reCAPTCHA Enterprise web key, register App Check for the web app, add a debug token for localhost, and verify the key appears in `gcloud recaptcha keys list`
- [x] 1.9 Create a billing budget with 50/90/100% email alerts, and verify it appears in `gcloud billing budgets list`
- [x] 1.10 Store server secrets in Secret Manager (PayPal, PayPal webhook id, Lulu, Channel3, Gemini) and verify with `gcloud secrets list --project <id>`
- [x] 1.11 Document the provisioning commands and required env vars in `docs/gcp-setup.md` and extend `.env.example` with `NEXT_PUBLIC_FIREBASE_*`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `GCP_PROJECT_ID`, `GCS_BUCKET`, `PAYPAL_WEBHOOK_ID`, and `REQUIRE_AUTH`. Verify no real secret values are committed.

## 2. Dependencies and Firebase/GCS foundations

- [ ] 2.1 Add `firebase`, `firebase-admin`, `@google-cloud/storage` to `package.json` and verify `npm install` and `npm run build` succeed
- [ ] 2.2 Set `output: "standalone"` and `serverExternalPackages` in `next.config.ts`, and verify `npm run build` produces `.next/standalone`
- [ ] 2.3 Create `src/lib/firebase/client.ts` (Auth + App Check init) and `src/lib/firebase/admin.ts` (ADC-based admin app singleton), and verify that a scripted `tsx` call to `admin.auth().listUsers(1)` succeeds with impersonated ADC
- [x] 2.4 Create `src/lib/api-fetch.ts` that attaches the ID token and App Check headers, with unit tests for header injection and token refresh. Verify with `npm test`.
- [ ] 2.5 Add `firestore.rules` (deny-all client access) and deploy it, and verify a client-SDK write attempt in a test script is rejected

## 3. Server auth, ledger, and rate-limit libraries (spec: user-accounts, token-ledger, ai-abuse-protection)

- [x] 3.1 Implement `src/lib/server/auth.ts` `requireUser(req, { allowAnonymous })` and `REQUIRE_AUTH` dev bypass. Add tests for missing, forged, and anonymous-disallowed tokens and for ignoring a body `uid`, and verify they pass.
- [x] 3.2 Implement `src/lib/server/ledger.ts` (`debit`, `credit`, `refund`, `claimFreeGrant`) using Firestore transactions. Add tests for sufficient, insufficient, concurrent double-spend, refund, and ledger-sum == balance, and verify they pass.
- [x] 3.3 Implement `src/lib/server/rate-limit.ts` (fixed-window Firestore counters, hashed keys, TTL). Add tests for window rollover and the 31st-request `429`, and verify they pass.
- [x] 3.4 Implement `src/lib/server/prompt-safety.ts` (denylist + injection heuristics) and shared Gemini `safetySettings`. Add tests for unsafe and injection prompts returning a `422` reason, and verify they pass.
- [x] 3.5 Implement `src/lib/server/guard.ts` `guardAiRequest()` composing App Check → identity → anonymous quota (12 chat / 1 proof) → per-IP proof cap (3/24h) → user rate limits → safety. Add tests for each rejection path and verify they pass.
- [x] 3.6 Add a `test:server` npm script that runs the server test suites, and verify `npm run test:server` passes

## 4. Books persistence and entitlement (spec: studio-page-planning-and-preview, cloud-asset-storage)

- [ ] 4.1 Implement `src/lib/server/books-repo.ts` (create, load-by-owner, save pages with `imagePath`, bump `contentVersion`) and `entitlement.ts` `allowedPages()`. Add tests that forged `freePagesLimit` / `unlockPagesOnly` grant nothing, and verify they pass.
- [ ] 4.2 Implement `src/lib/server/storage.ts` (upload image bytes, read bytes, mint V4 signed URLs at 1 h and 7 d). Verify with a `tsx` script that uploads, signs, and fetches a test object, then deletes it.
- [ ] 4.3 Add routes `GET/POST /api/books`, `GET /api/books/[id]` (returns signed image URLs), and `POST /api/books/claim` (anonymous → permanent transfer). Verify with tests for owner-only access (`404` for others) and claim transfer.
- [ ] 4.4 Add `POST /api/books/[id]/unlock` (token method: debit `N-5`, set `paidThrough`). Verify with tests for `402` on insufficient balance and a correct balance after success.
- [x] 4.5 Add `GET /api/me` (lazy profile creation, balance, free-grant status) and `GET /api/me/transactions`. Verify that a first call creates the profile with balance 0.

## 5. Guard and persist AI routes (spec: ai-abuse-protection, token-ledger)

- [ ] 5.1 Wire `guardAiRequest` into `/api/ai/chat` (anonymous allowed, counts turns). Verify that a 13th anonymous turn returns `401 sign_in_required`.
- [ ] 5.2 Wire the guard + entitlement into `/api/ai/story`: require `bookId`, allow anonymous only for the stage-1 proof, clamp pages to `allowedPages`, persist results, and claim the First-5-Free grant on first permanent expansion. Verify with tests for anonymous second-generation `401`, forged-flag clamping, and grant consumed once.
- [ ] 5.3 Wire the guard into `/api/ai/image`: upload the generated bytes to GCS, store `imagePath` on the book page, return a signed URL instead of a data URL, and refund the debit on failure. Verify a generated page has no base64 in Firestore.
- [ ] 5.4 Wire the guard + token debit into `/api/ai/refine` and the library remix path (replacing client `deductClientTokens`). Verify the balance decrements server-side and a `402` is returned when it is short.
- [ ] 5.5 Wire the guard into `/api/ai/paypal-agent` (signed-in only). Verify an anonymous call returns `401`.

## 6. Checkout, fulfillment, and orders (spec: order-persistence, token-ledger)

- [ ] 6.1 Refactor `create-order` to require a permanent user, compute all amounts server-side (packs, pricing calculator, Lulu quote, Channel3 re-resolve), and write the `orders/{paypalOrderId}` pending doc. Verify with a test that a tampered `creationFee` has no effect.
- [ ] 6.2 Implement `src/lib/server/fulfillment.ts` `fulfillOrder()` (transactional pending→fulfilling, amount/currency check → `flagged`, ledger credit / `paidThrough` / print submission, idempotent). Verify with tests for success, mismatch, and double capture.
- [ ] 6.3 Refactor `capture-order` to verify ownership and call `fulfillOrder`. For print orders, compile and store interior/cover PDFs and pass 7-day signed URLs to `submitLuluPrintJob`. Verify the Lulu payload URLs return `application/pdf`.
- [ ] 6.4 Implement PayPal webhook signature verification and route `PAYMENT.CAPTURE.COMPLETED` through `fulfillOrder`. Verify with tests that a forged event is rejected and a webhook after client capture is a no-op.
- [ ] 6.5 Add `GET /api/orders` and `GET /api/orders/[id]` (owner-only). Verify a cross-user id returns `404`.
- [ ] 6.6 Update `/api/pdf/compile` to load the book by id for its owner and serve or store PDFs from GCS (reuse when `contentVersion` is unchanged). Verify a repeat download skips recompilation.

## 7. Bookstore vault on GCS (spec: cloud-asset-storage)

- [ ] 7.1 Sync `C:\Lawrence\KDP SKETCH BOOK` PDFs to `gs://<bucket>/bookstore-src/` with `gcloud storage rsync`, and verify the object count is 141 and the total is ~1.77 GB
- [ ] 7.2 Update `src/app/api/bookstore/asset/route.ts` to redirect to a 1-hour signed URL in production, use local disk only in development, and keep the compile fallback. Verify both modes with `NODE_ENV` toggled.

## 8. Client: auth UX, gate, and server-backed stores (spec: user-accounts, studio-page-planning-and-preview)

- [ ] 8.1 Add an `AuthProvider` (anonymous sign-in on studio mount, `linkWithPopup` with redirect fallback, `credential-already-in-use` → claim flow) in `Providers.tsx`. Verify in the browser that a reload keeps the same anonymous uid.
- [ ] 8.2 Build `SignInGate` modal (Glacier Glassmorphism, shows the master proof, "Continue with Google") and show it after stage-1 proof for anonymous users and on any `sign_in_required` response. Verify that dismissing it blocks generation and signing in continues without a reload.
- [ ] 8.3 Add a user menu to `Navbar` (avatar, name, server balance from `/api/me`, dashboard link, sign-out). Verify that sign-out shows "Sign in".
- [ ] 8.4 Replace `token-store.ts` and `order-store.ts` internals with `apiFetch` calls (keep `AVAILABLE_TOKEN_PACKS` export and the `tokens_updated` / `orders_updated` events). Remove `DEFAULT_SAMPLE_ORDERS` from runtime paths. Verify that editing localStorage no longer changes the displayed balance.
- [ ] 8.5 Update `studio/page.tsx` to create/load the book via `/api/books`, send `bookId` on AI calls, call `/unlock` instead of `deductClientTokens`, and render signed image URLs. Verify the end-to-end studio flow works and the draft restores on a second browser.
- [ ] 8.6 Update `TokenModal`, `UnlockChoiceModal`, `OrderSummaryModal`, `BookViewer`, and `BookLibraryModal` to stop crediting or debiting locally and to refresh from `/api/me` after server responses. Verify that a token pack purchase shows the server-credited balance.
- [ ] 8.7 Update `/dashboard`, `OrdersDataGrid`, and `OrderTrackingGrid` to load `/api/orders`, with an empty state. Verify that a new user sees the empty state and a paid order appears.
- [ ] 8.8 Update `test-core.mjs` expectations affected by the server-side First-5-Free rule, and verify `npm test` passes

## 9. Containerize and deploy to Cloud Run

- [ ] 9.1 Add a multi-stage `Dockerfile` and `.dockerignore` (exclude `.env*`, `node_modules`, `KDP` paths). Verify that `docker build` succeeds locally, or that a Cloud Build run succeeds.
- [ ] 9.2 Deploy `papertale-web` to Cloud Run (`us-central1`, runtime SA, `--max-instances=3`, Secret Manager bindings). Verify the service URL serves `/` and `/studio`.
- [ ] 9.3 Add the Cloud Run domain to Firebase Auth authorized domains and the reCAPTCHA key domains, register the PayPal sandbox webhook URL, and verify a sandbox webhook delivery is accepted
- [ ] 9.4 Document the deploy and rollback commands in `docs/gcp-setup.md`, and verify the rollback command works against a previous revision

## 10. End-to-end verification (sandbox)

- [ ] 10.1 Run `npm test`, `npm run test:server`, and `npm run build`, and verify all pass
- [ ] 10.2 On the deployed sandbox, verify the anonymous journey: chat → 1 master proof → gate → a second generation is blocked; a fourth incognito proof from the same IP within 24h returns `429`
- [ ] 10.3 On the deployed sandbox, verify the signed-in journey: Google sign-in keeps the proof → pages 2–5 free once → token pack purchase credits server balance → unlock 6..N debits → PDF download via signed URL → draft restores on another device
- [ ] 10.4 On the deployed sandbox, verify a physical order: server-priced PayPal order → capture → Lulu sandbox job created with fetchable PDF URLs → order visible on `/dashboard`; and verify that a replayed capture or webhook does not double-fulfill
- [ ] 10.5 Verify the GCP billing report shows the project within free-tier usage after the sandbox run, and the budget alerts are active

## Workflow follow-up

- Switch PayPal and Lulu to live credentials only after section 10 passes.
- Archive the change with `/opsx-archive` after review.

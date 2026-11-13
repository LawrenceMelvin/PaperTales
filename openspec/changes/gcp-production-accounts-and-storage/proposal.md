# Proposal

## Why

PaperTales was built as a hackathon demo: token balances, "first-time customer" status, orders, and generated books all live in the browser's `localStorage`, and the server trusts whatever the client sends. That means tokens can be minted from DevTools, the "First 5 Free" offer resets in every incognito window, a cleared cache wipes a parent's paid books, the AI endpoints are open to anyone who can send a `POST`, and Lulu print jobs point at a PDF URL the server cannot actually serve. The hackathon is over. To take real money and ship real books we need server-owned accounts, ledgers, storage, and abuse controls, all on a dedicated Google Cloud project.

## What Changes

- **Dedicated GCP project `papertale`**: new project (separate from `auratap-505817` and every other existing project) with billing linked, and only the APIs we need enabled: Firebase Auth / Identity Platform, Firestore, Cloud Storage, reCAPTCHA Enterprise (via Firebase App Check), and Cloud Run.
- **Accounts with value-first onboarding**: visitors start as Firebase **anonymous** users. They can chat and generate **one Master Page 1 proof** without signing in. Expanding the book (pages 2..N), redesigning the proof, unlocking, buying, or downloading requires upgrading to a permanent **Google Sign-In** account. The anonymous account is *linked* (not replaced), so the in-progress book carries over.
- **Server-side token ledger**: token balance and First-5-Free eligibility move to Firestore and change only inside server transactions, with an append-only `token_transactions` audit log. **BREAKING**: `deductClientTokens` / `addClientTokens` / `markFirstBookClaimed` stop being the source of truth. Existing `localStorage` balances are **not** migrated (demo data only).
- **Server-priced checkout**: `create-order` recomputes book and print prices on the server from the stored book and the Lulu quote instead of accepting client-supplied `creationFee`/`printCost`. `capture-order` checks the captured amount against the stored pending order, credits tokens / unlocks the book / persists the order idempotently, and the PayPal webhook becomes a verified backup path.
- **AI abuse protection** on every `/api/ai/*` route: Firebase ID-token verification, App Check (reCAPTCHA Enterprise) attestation, per-user and per-IP rate limits stored in Firestore, an anonymous quota (a few chat turns plus one master proof), server-side entitlement checks before any paid generation, and a kid-safe prompt pre-filter with Gemini safety settings.
- **Cloud asset storage**: generated illustrations go to a private GCS bucket instead of base64 in React state. Compiled PDFs are stored per user/book. The 141 bookstore PDFs (~1.77 GB) are synced from `C:\Lawrence\KDP SKETCH BOOK` into the bucket. Downloads and Lulu fetches use short-lived **V4 signed URLs**. Local-disk fallback stays for development only.
- **Persistent books & orders**: books (with Master Page / character anchor) auto-save to Firestore and load on any device. `/dashboard` and order tracking read the signed-in user's real orders instead of `DEFAULT_SAMPLE_ORDERS`.
- **Hosting**: containerize Next.js (`output: "standalone"`) and deploy to Cloud Run in `papertale`. Secrets live in Secret Manager.

## Capabilities

### New Capabilities
- `user-accounts`: anonymous-first identity, Google Sign-In upgrade with account linking, server-side session verification, and the user profile document.
- `token-ledger`: server-owned token balances, the First-5-Free grant, atomic debit/credit/refund, and the immutable transaction audit log.
- `ai-abuse-protection`: authentication, App Check attestation, rate limits, anonymous quotas, entitlement gating, and kid-safe prompt filtering for AI generation endpoints.
- `cloud-asset-storage`: GCS bucket layout, illustration and PDF persistence, bookstore vault sync, and signed-URL delivery to users and Lulu.
- `order-persistence`: server-priced PayPal order creation, verified idempotent capture, webhook reconciliation, persisted orders, and per-user order history for the dashboard.

### Modified Capabilities
- `dynamic-pricing-and-commission`: "First 5 pages free restricted to first-time customers on first book" is now decided per **account** on the server, not per client device or `localStorage`.
- `studio-page-planning-and-preview`: the post-Master-Page expansion requires a signed-in (non-anonymous) account, and unlocking pages 6..N debits tokens on the server before generation instead of on the client.

## Impact

- **New dependencies**: `firebase` (client), `firebase-admin` (server), `@google-cloud/storage`; optional `@google-cloud/recaptcha-enterprise` if App Check alone isn't enough.
- **New code**: `src/lib/firebase/*` (client and admin init), `src/lib/server/*` (auth guard, token ledger, rate limiter, entitlement checks, storage, book and order repositories), auth UI (`AuthGate`/sign-in modal, user menu in `Navbar`), and `firestore.rules` / `storage` CORS config.
- **Modified routes**: all `src/app/api/ai/*`, `paypal/create-order`, `paypal/capture-order`, `paypal/webhook`, `pdf/compile` (adds an authenticated GET-by-bookId path for Lulu), `bookstore/asset`. New `api/books/*` and `api/me` routes.
- **Modified clients**: `studio/page.tsx`, `TokenModal`, `UnlockChoiceModal`, `OrderSummaryModal`, `BookViewer`, `BookLibraryModal`, `Navbar`, `OrderTrackingGrid`, `dashboard/page.tsx`. `token-store.ts`/`order-store.ts` become thin API clients (static `AVAILABLE_TOKEN_PACKS` stays).
- **Infra**: GCP project `papertale`, Firestore (Native mode), GCS bucket, Secret Manager, Cloud Run service, Artifact Registry. Runs within free tiers at seed scale. Gemini image generation remains the main variable cost.
- **Out of scope**: email magic-link and Apple sign-in, admin back-office, migrating existing `localStorage` demo data, multi-region and CDN, and moving image generation from the Gemini API key to Vertex AI.

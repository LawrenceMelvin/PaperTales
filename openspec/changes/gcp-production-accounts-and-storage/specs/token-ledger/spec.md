# Spec Delta

## Purpose
Makes the server the only source of truth for PaperTales token balances and free-page entitlements. Every credit and debit is atomic and recorded in an append-only audit log tied to a payment, book, or order.

## ADDED Requirements

### Requirement: Server-owned token balance
A user's token balance SHALL be stored and changed only on the server. The client SHALL display the balance reported by the server and SHALL NOT be able to raise or lower it through local storage or direct database writes.

#### Scenario: Tampering with local storage
- **WHEN** a user edits `papertales_user_tokens` in browser local storage to `9999`
- **THEN** the displayed balance is refreshed from the server and no generation or unlock is allowed beyond the server balance

### Requirement: Atomic debit before paid generation
Any action that costs tokens SHALL debit the balance in one atomic server transaction before the paid AI work starts. Examples: unlocking pages 6..N, AI page refinement, and remixing a library book. If the balance is too low, the transaction SHALL fail and no AI call SHALL be made.

#### Scenario: Sufficient balance
- **WHEN** a user with 10 tokens unlocks 7 paid pages
- **THEN** the balance becomes 3, a `usage` transaction of `-7` referencing the book is recorded, and generation of the paid pages begins

#### Scenario: Insufficient balance
- **WHEN** a user with 4 tokens attempts to unlock 7 paid pages
- **THEN** the server responds `402` with the shortfall, the balance stays 4, and no AI generation call is made

#### Scenario: Concurrent double-spend
- **WHEN** two unlock requests costing 7 tokens each arrive at the same time for a user with 10 tokens
- **THEN** exactly one succeeds, the other fails with `402`, and the final balance is 3

### Requirement: Automatic refund on failed paid generation
If paid generation fails after a debit and produces no usable output, the system SHALL credit back the debited tokens with a `refund` transaction that references the original debit.

#### Scenario: Image generation fails after debit
- **WHEN** the unlock for 7 pages is debited but generation of all 7 pages fails
- **THEN** a `refund` transaction of `+7` is recorded and the balance is restored

#### Scenario: Partial failure
- **WHEN** 7 pages are debited and 5 succeed while 2 fail
- **THEN** 2 tokens are refunded and the 2 failed pages can be retried

### Requirement: Token pack credit only from verified payment
Tokens from a token pack SHALL be credited only after the server verifies a completed PayPal capture whose amount and currency match the pack's server-side price. Each PayPal capture SHALL credit tokens at most once.

#### Scenario: Valid token pack purchase
- **WHEN** a signed-in user completes PayPal checkout for the Creator Bundle and capture succeeds for `9.99 USD`
- **THEN** 70 tokens (60 + 10 bonus) are credited and a `purchase` transaction referencing the PayPal capture id is recorded

#### Scenario: Replayed capture
- **WHEN** the same PayPal order id is submitted to capture a second time, or the webhook arrives after the client capture
- **THEN** no additional tokens are credited

#### Scenario: Client-side credit attempt
- **WHEN** the client calls any endpoint claiming a purchase without a verifiable completed PayPal capture
- **THEN** no tokens are credited

### Requirement: Immutable transaction audit log
Every balance change SHALL record a transaction with user id, type (`purchase`, `usage`, `free_grant`, `refund`, `adjustment`), signed amount, balance before and after, reference id, and timestamp. Transactions SHALL never be edited or deleted. Users SHALL be able to read only their own transactions.

#### Scenario: Ledger reconciles with balance
- **WHEN** all of a user's transactions are summed
- **THEN** the sum equals the user's current token balance

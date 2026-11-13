# Spec Delta

## Purpose
Gives every PaperTales visitor a server-verifiable identity. Visitors start anonymous so they can try the studio right away, then upgrade to a permanent Google account without losing their in-progress work.

## ADDED Requirements

### Requirement: Anonymous identity on first studio visit
The system SHALL silently establish an anonymous account for any visitor who opens the studio without a session. No sign-in prompt is shown at this point, and every studio API request carries a server-verifiable identity token.

#### Scenario: First-time visitor opens the studio
- **WHEN** a visitor with no existing session loads `/studio`
- **THEN** an anonymous account is created in the background, no sign-in UI is shown, and subsequent studio API requests are attributed to that anonymous account

#### Scenario: Returning anonymous visitor on the same browser
- **WHEN** a visitor who previously received an anonymous account returns on the same browser
- **THEN** the same anonymous account is reused rather than a new one being created

### Requirement: Google Sign-In upgrade preserves in-progress work
When an anonymous user signs in with Google, the system SHALL link the Google identity to the existing anonymous account so its books, master page, and quotas carry over. If that Google identity already has an account, the system SHALL sign into it and transfer the anonymous user's in-progress book to it.

#### Scenario: Upgrading after the Master Page proof
- **WHEN** an anonymous user with a generated Master Page 1 proof completes Google Sign-In
- **THEN** the account becomes permanent with the same user id, the book and master page remain visible without a page reload, and the studio continues at the page-planning step

#### Scenario: Google account already exists
- **WHEN** an anonymous user signs in with a Google account that already has a PaperTales account
- **THEN** the user is signed into the existing account, the anonymous user's in-progress book is moved to it, and the anonymous account receives no free-page grant

### Requirement: Server-side identity verification
Every API route that reads or writes user data, spends tokens, or invokes AI generation SHALL verify the caller's identity token on the server. The user id SHALL come from the verified token, never from the request body.

#### Scenario: Request without a valid token
- **WHEN** a protected API route receives a request with a missing, expired, or forged identity token
- **THEN** the route responds `401` and performs no AI call, ledger change, or data write

#### Scenario: Request body claims a different user
- **WHEN** a request body contains a `uid` or `userId` that differs from the verified token's user id
- **THEN** the server ignores the body value and acts only on the verified user id

### Requirement: User profile document
The system SHALL keep exactly one profile per permanent account, holding display name, email, photo, token balance, First-5-Free status, and timestamps. Users SHALL be able to read only their own profile, and profile fields that affect money SHALL be writable only by the server.

#### Scenario: Profile created on first sign-in
- **WHEN** a user completes Google Sign-In for the first time
- **THEN** a profile exists with their Google display name and email, a token balance of 0, and First-5-Free marked as unclaimed

#### Scenario: Client attempts to edit balance
- **WHEN** a signed-in client tries to write its own `tokenBalance` or First-5-Free fields directly to the database
- **THEN** the write is rejected by database security rules

### Requirement: Signed-in user menu and sign-out
The navigation bar SHALL show the signed-in user's avatar, name, and server-reported token balance, with links to the dashboard and a sign-out action. Anonymous users SHALL instead see a "Sign in" action.

#### Scenario: Signing out
- **WHEN** a signed-in user selects sign-out
- **THEN** the session ends, the user menu shows "Sign in", and no further API calls are made with the previous identity

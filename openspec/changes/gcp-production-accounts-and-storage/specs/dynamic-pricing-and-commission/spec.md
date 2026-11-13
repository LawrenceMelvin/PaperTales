# Spec Delta

## MODIFIED Requirements

### Requirement: First 5 pages free restricted to first-time customers on first book
The system SHALL deduct 5 free pages if and only if the creator is verified as a first-time customer creating their first book. Eligibility SHALL be determined on the server per permanent account, not per client device or browser storage. The grant SHALL be consumed exactly once per account. For returning creators or any subsequent book, all pages (1..N) SHALL be 100% billable.

#### Scenario: First-time customer creates their first book
- **WHEN** a new creator without prior saved orders or claimed book tokens creates a book of 12 pages
- **THEN** the system grants 5 free pages and calculates billable pages as 7 (`12 - 5`)

#### Scenario: Returning customer creates their second book
- **WHEN** a creator who has previously purchased a digital book, token pack, or physical book creates a second book of 12 pages
- **THEN** the system calculates billable pages as 12 (`12 - 0`) with zero free pages deducted

#### Scenario: Clearing browser storage does not reset eligibility
- **WHEN** a signed-in creator who already claimed their free pages clears browser storage or opens an incognito window and signs in again
- **THEN** the system still treats them as a returning customer and grants zero free pages

#### Scenario: Anonymous accounts cannot claim the grant
- **WHEN** an anonymous visitor attempts to expand a book past the Master Page 1 proof
- **THEN** no free-page grant is consumed until they sign in with a permanent account

# Spec Delta

## Purpose
Makes PaperTales checkout trustworthy and durable. The server prices every order, verifies every PayPal capture, fulfills each payment exactly once, and keeps each user's order history for the dashboard.

## ADDED Requirements

### Requirement: Server-computed order pricing
When creating a PayPal order, the server SHALL compute every line item amount itself: token pack price, digital book price from the stored book's page count and pricing rules, Lulu print and shipping cost from a server-side quote, and companion item price from the catalog. Client-supplied amounts SHALL be ignored.

#### Scenario: Client sends a tampered price
- **WHEN** a client sends `creationFee: 0.01` and `printCost: 0` for a physical order of a 24-page book
- **THEN** the PayPal order is created with the server-computed amounts and the client values have no effect

### Requirement: Pending order record before payment
Creating a PayPal order SHALL store a pending order that holds the signed-in user, purpose (token pack, digital unlock, or physical print), book reference, server-computed amounts, and PayPal order id. Only permanent (non-anonymous) accounts SHALL be able to create orders.

#### Scenario: Anonymous checkout attempt
- **WHEN** an anonymous user calls create-order
- **THEN** the server responds `401` with reason `sign_in_required`

### Requirement: Verified idempotent capture and fulfillment
On capture, the server SHALL confirm that the PayPal capture is completed, belongs to a pending order owned by the caller, and matches its stored amount and currency. Only then SHALL it fulfill the order: credit tokens, unlock the book, or submit the print job. Fulfillment SHALL happen at most once per PayPal order.

#### Scenario: Successful digital unlock payment
- **WHEN** a user captures a PayPal order for a digital book unlock with matching amount
- **THEN** the order is marked paid, the book is marked unlocked, and the user can generate and download all pages

#### Scenario: Amount mismatch
- **WHEN** the captured amount differs from the stored pending order amount
- **THEN** the order is flagged for review, nothing is fulfilled, and the client receives an error

#### Scenario: Capture called twice
- **WHEN** capture is called again for an already-fulfilled PayPal order
- **THEN** the server returns the existing order without fulfilling it a second time

### Requirement: Verified webhook reconciliation
The PayPal webhook SHALL verify the event signature with PayPal before acting. For a verified `PAYMENT.CAPTURE.COMPLETED` event whose order is still pending, it SHALL complete fulfillment using the same idempotent path as client capture.

#### Scenario: Browser closed before capture response
- **WHEN** a buyer approves payment and closes the browser before the client capture finishes, and PayPal sends a verified capture-completed webhook
- **THEN** the order is fulfilled exactly once

#### Scenario: Forged webhook
- **WHEN** the webhook endpoint receives an event that fails PayPal signature verification
- **THEN** the event is rejected and nothing is fulfilled

### Requirement: Per-user order history
Paid orders SHALL be stored with fulfillment status, Lulu job id, tracking number, and tracking URL. The dashboard and order tracking views SHALL show only the signed-in user's own orders, newest first, with no built-in sample orders.

#### Scenario: New user opens dashboard
- **WHEN** a signed-in user with no orders opens `/dashboard`
- **THEN** an empty state is shown instead of sample orders

#### Scenario: User sees their print order
- **WHEN** a user who placed a physical print order opens `/dashboard`
- **THEN** the order appears with its current fulfillment status and, once available, its tracking link

#### Scenario: Cross-user access
- **WHEN** a user requests another user's order by id
- **THEN** the server responds `404`

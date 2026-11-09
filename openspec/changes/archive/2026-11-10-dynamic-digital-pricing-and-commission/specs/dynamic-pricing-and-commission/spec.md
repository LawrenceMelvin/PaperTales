# Spec Delta: dynamic-pricing-and-commission

## Purpose

Provides a dynamic pricing calculation engine enforcing an exact 65% profit margin over live compute costs, restricts the first 5 free pages offer exclusively to first-time customer accounts, and applies a 10% platform commission on Lulu physical print manufacturing.

## ADDED Requirements

### Requirement: First 5 pages free restricted to first-time customers on first book
The system SHALL deduct 5 free pages if and only if the creator is verified as a first-time customer creating their first book. For returning creators or any subsequent book created on the client device, all pages (1..N) SHALL be 100% billable.

#### Scenario: First-time customer creates their first book
- **WHEN** a new creator without prior saved orders or claimed book tokens creates a book of 12 pages
- **THEN** the system grants 5 free pages and calculates billable pages as 7 (`12 - 5`)

#### Scenario: Returning customer creates their second book
- **WHEN** a creator who has previously purchased a digital book, token pack, or physical book creates a second book of 12 pages
- **THEN** the system calculates billable pages as 12 (`12 - 0`) with zero free pages deducted

### Requirement: Dynamic digital pricing calibrated at 65% profit margin
The pricing engine SHALL compute the retail price per page based on live model compute costs with an exact target net profit margin of 65%.

#### Scenario: Pricing illustrated coloring line-art pages
- **WHEN** the pricing engine calculates the price for illustrated linework pages with $0.035 COGS
- **THEN** the rate per billable page is set to $0.10 USD (`$0.035 / (1 - 0.65)`), ensuring an effective margin of 65%

#### Scenario: Pricing text and storybook pages
- **WHEN** the pricing engine calculates the price for words and storybook pages with $0.011 COGS
- **THEN** the rate per billable page is set to $0.035 USD (`$0.011 / (1 - 0.65)`), ensuring an effective margin of 65%

### Requirement: Ten percent platform commission on physical manufacturing
The checkout system SHALL compute a platform commission of exactly 10% on Lulu physical manufacturing costs (unit print cost plus shipping cost) and credit any prior digital creation payments.

#### Scenario: Calculating physical softcover book checkout total
- **WHEN** a user orders a physical softcover book with Lulu print cost of $4.50 and shipping of $3.99
- **THEN** the system applies a 10% platform commission of $0.85 (`($4.50 + $3.99) * 0.10`) added to the digital creation fee

#### Scenario: Ordering physical book after digital unlock
- **WHEN** a user who has already purchased and unlocked the digital edition of a book orders a physical copy
- **THEN** the digital creation price is 100% credited, and the user is charged only the physical print cost, shipping cost, and the 10% platform commission

### Requirement: Customer UI privacy for profit margin and commission figures
The customer-facing checkout interfaces, pricing calculators, book viewer modals, and invoices SHALL NOT disclose internal profit margins, COGS breakdowns, or platform commission percentages to the user. All user-facing price presentations SHALL display clean retail prices without exposing internal business metrics.

#### Scenario: Displaying digital book price in checkout and viewer
- **WHEN** a user reviews the price to unlock or purchase a digital book
- **THEN** the interface displays the final retail price (such as `$1.90` or `$0.10/page`) without mentioning a 65% profit margin, model costs, or markup percentage

#### Scenario: Displaying physical softcover order breakdown in checkout
- **WHEN** a user reviews the checkout summary for a physical softcover book
- **THEN** the 10% platform commission is seamlessly bundled into the physical printing fee or presented as a standard retail line item without being labeled as a platform commission or revealing internal Lulu base costs

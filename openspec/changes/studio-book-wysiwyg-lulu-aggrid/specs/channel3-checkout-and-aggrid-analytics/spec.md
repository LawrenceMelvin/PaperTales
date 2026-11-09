# channel3-checkout-and-aggrid-analytics Specification Delta

## Purpose

Governs live Channel3 product search and multi-item recommendation browsing inside `OrderSummaryModal`, plus the AG Grid AI Operations Copilot, interactive KPI cross-filtering, and PayPal/Lulu/Channel3 unit economics telemetry in `OrdersDataGrid` and `OrderTrackingGrid`.

## ADDED Requirements

### Requirement: Live Channel3 product search and expanded recommendations in Checkout
The `OrderSummaryModal` component SHALL display up to 6 Channel3 companion recommendations and provide a search input allowing the buyer to query `/api/channel3/suggest?query=...` for any specific product to bundle into their PayPal order.

#### Scenario: Searching for a specific art supply in Checkout
- **WHEN** the buyer types a product query (e.g., `"watercolor brush pens"` or `"prismacolor"`) into the Channel3 search input in `OrderSummaryModal` and submits
- **THEN** the modal fetches matching products from `/api/channel3/suggest`, renders the results with price and merchant domain, and allows selecting an item to update the PayPal order total

### Requirement: AG Grid Natural-Language AI Copilot and KPI cross-filtering
The `OrdersDataGrid` (`/dashboard`) and `OrderTrackingGrid` (`My Orders` modal) components SHALL provide a natural-language AI Grid Copilot bar and interactive KPI filter pills that programmatically filter, sort, and highlight rows in the AG Grid instance.

#### Scenario: Filtering AG Grid with a natural-language prompt
- **WHEN** the user submits a natural-language query in the AG Grid AI Copilot bar (e.g., `"Show physical print orders in production"` or `"High margin orders over $12"`)
- **THEN** the copilot applies the corresponding filter/sort state to the AG Grid API and displays a concise financial/operational summary badge

### Requirement: PayPal, Lulu POD, and Channel3 unit economics columns in AG Grid
The `OrdersDataGrid` component SHALL display unit economics columns including AI COGS (`$0.065/page`), Net Profit & Margin (`62% target`), Lulu POD manufacturing status, and bundled Channel3 companion commission attribution, along with an interactive row action to simulate Lulu webhook stage progression.

#### Scenario: Viewing unit economics and advancing Lulu fulfillment stage in AG Grid
- **WHEN** the operator views `/dashboard` and clicks the stage-advance action on an order row
- **THEN** the grid displays the order's COGS, net profit margin badge, and Channel3 companion bundle, and advances the order's Lulu fulfillment status (`paid` -> `in_production` -> `shipped` -> `delivered`) in real time

# Dynamic Pricing & Economic Guardrails
**Scope:** Global Project Rule for PaperTales AI  
**Trigger:** always_on  

## 1. Core Economic Model & Profit Margin
* **Target Net Profit Margin:** **Exact 62%**
* **Empirical Page Generation COGS:** **$0.065 USD (~₹5.40 INR)** per page
  * Based on empirical testing: `gpt-image-2.5-flare` (~$0.024/page) + text generation + PDF compilation + server compute buffer.
  * Verified against real-world Gemini 3.1 Flash benchmark (46 pages = ₹250 INR / ~$0.064/page).
* **Consumer Retail Price per Paid Page:**
  $$\text{Retail Price} = \frac{\text{COGS}}{1 - 0.62} = \frac{\$0.065}{0.38} \approx \mathbf{\$0.171 \implies \$0.17\text{ USD (~₹14.50 INR)}}$$
* **Net Profit per Paid Page:**
  $$\mathbf{+\$0.105\text{ USD (~₹8.95 INR)}}\text{ per page}$$

## 2. Freemium & Quoting Strategy
1. **The "First 5 Free" Rule:**
   * Every user gets the first **5 pages 100% free** on the house.
   * Enables zero-friction trial, emotional buy-in, and immediate book preview.
   * If total requested pages $\le 5$, total cost is **$0.00 (0 Tokens)**.
2. **Dynamic Scaling (No Artificial Caps):**
   * The studio supports arbitrary page counts from **5 up to 60+ pages**.
   * Billable pages: $\text{Paid Pages} = \max(0, \text{Total Pages} - 5)$.
   * Paid tokens consumed: $1 \text{ token per paid page}$.
   * Example: 
     * **15 pages:** 10 paid pages $\times \$0.17 = \mathbf{\$1.70}$ (Profit: $+\$1.05$)
     * **25 pages:** 20 paid pages $\times \$0.17 = \mathbf{\$3.40}$ (Profit: $+\$2.10$)
     * **30 pages:** 25 paid pages $\times \$0.17 = \mathbf{\$4.25}$ (Profit: $+\$2.63$)
     * **46 pages:** 41 paid pages $\times \$0.17 = \mathbf{\$6.97}$ (Profit: $+\$4.305$)
     * **60 pages:** 55 paid pages $\times \$0.17 = \mathbf{\$9.35}$ (Profit: $+\$5.775$)

## 3. Interactive Mascot Sales Quoter ("Barnaby")
* When the user adjusts the page count slider above 5 pages, Barnaby the Mascot appears dynamically:
  * Informs the parent cheerfully how many pages are free vs. paid.
  * Shows exact transparent token count and price in USD and INR.
  * Displays transparent breakdown without aggressive paywalls.
  * Offers 1-click token top-up via PayPal Smart Buttons.

## 4. Physical Lulu Print-on-Demand Pricing
* **Lulu Softcover (8.5x11 Saddle Stitch / Perfect Bound):**
  * Base print cost: ~\$3.50 - \$4.50 + shipping.
  * Retail price: \$14.99 - \$19.99 (includes PDF generation, Lulu printing, and packaging).
  * Direct print API payload validation via Lulu Print API v2 sandbox.

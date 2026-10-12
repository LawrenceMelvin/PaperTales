/**
 * PaperTales AI Unit Economics & Dynamic Token Pricing Engine
 * Calibrated with real-world benchmark COGS ($0.065 / page ~ ₹5.4 INR)
 * Target Profit Margin: 62%
 */

export const PRICING_CONFIG = {
  // Real-world generation COGS based on empirical API usage (Gemini / GPT Image output tokens + story text + PDF assembly)
  RAW_COGS_PER_PAGE: 0.065,  // $0.065 USD (~₹5.4 INR) per page
  TARGET_MARGIN: 0.62,       // 62% Target Margin
  PRICE_PER_PAGE_USD: 0.17,  // $0.17 USD (~₹14.5 INR) per paid page (61.8% - 62% Margin)
  FREE_PAGES_TIER: 5,        // First 5 pages are 100% free
};

export interface BookQuote {
  totalPages: number;
  freePages: number;
  paidPages: number;
  tokensRequired: number;
  priceUsd: number;
  priceInrApprox: number;
  rawCogsUsd: number;
  netProfitUsd: number;
  effectiveMarginPercent: number;
}

export function calculateBookQuote(totalPages: number): BookQuote {
  const count = Math.max(5, totalPages);
  const freePages = Math.min(count, PRICING_CONFIG.FREE_PAGES_TIER);
  const paidPages = Math.max(0, count - PRICING_CONFIG.FREE_PAGES_TIER);
  const tokensRequired = paidPages; // 1 Token = 1 Page

  const priceUsd = Number((paidPages * PRICING_CONFIG.PRICE_PER_PAGE_USD).toFixed(2));
  const priceInrApprox = Math.round(priceUsd * 85); // Estimated INR equivalent at 85 INR/USD
  const rawCogsUsd = Number((count * PRICING_CONFIG.RAW_COGS_PER_PAGE).toFixed(2));
  const netProfitUsd = Number((priceUsd - rawCogsUsd).toFixed(2));
  const effectiveMarginPercent = priceUsd > 0
    ? Math.round(((priceUsd - rawCogsUsd) / priceUsd) * 100)
    : 0;

  return {
    totalPages: count,
    freePages,
    paidPages,
    tokensRequired,
    priceUsd,
    priceInrApprox,
    rawCogsUsd,
    netProfitUsd,
    effectiveMarginPercent,
  };
}

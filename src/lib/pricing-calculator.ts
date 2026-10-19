/**
 * PaperTales AI Unit Economics & Dynamic Token Pricing Engine
 * Calibrated with OpenAI gpt-image-2.5-sunburst ($0.024 / image) & GPT-4.1 text ($0.003 / page)
 * Target Profit Margin: 62%
 */

export const PRICING_CONFIG = {
  // Empirical OpenAI API COGS measured live
  TEXT_GEN_COGS_PER_PAGE: 0.003,      // ~$0.003 USD for GPT-4.1 text / prompts
  IMAGE_GEN_COGS_PER_PAGE: 0.024,     // ~$0.0237 USD for gpt-image-2.5-sunburst 1024x1024 line art
  PDF_ASSEMBLY_COGS_PER_PAGE: 0.008,  // ~$0.008 USD for serverless vector & raster assembly

  // Combined COGS
  ILLUSTRATED_COGS_PER_PAGE: 0.035,   // $0.024 (image) + $0.003 (text) + $0.008 (PDF) = $0.035 USD
  WORDS_COGS_PER_PAGE: 0.011,         // $0.003 (text) + $0.008 (PDF) = $0.011 USD

  TARGET_MARGIN: 0.62,                // 62% Target Margin

  // Prices calibrated for exactly ~62% Margin: Price = COGS / (1 - 0.62) = COGS / 0.38
  PRICE_PER_ILLUSTRATED_PAGE_USD: 0.09, // $0.035 / 0.38 = $0.092 -> $0.09 USD (61.1% - 62% margin)
  PRICE_PER_WORDS_PAGE_USD: 0.03,       // $0.011 / 0.38 = $0.0289 -> $0.03 USD (63.3% margin)

  FREE_PAGES_TIER: 5,                 // First 5 pages are 100% free
};

export interface BookQuote {
  totalPages: number;
  freePages: number;
  paidPages: number;
  bookType: "words" | "illustrated";
  pricePerPageUsd: number;
  tokensRequired: number;
  priceUsd: number;
  priceInrApprox: number;
  rawCogsUsd: number;
  netProfitUsd: number;
  effectiveMarginPercent: number;
}

export function calculateBookQuote(
  totalPages: number,
  bookType: "words" | "illustrated" = "illustrated"
): BookQuote {
  const count = Math.max(5, totalPages);
  const freePages = Math.min(count, PRICING_CONFIG.FREE_PAGES_TIER);
  const paidPages = Math.max(0, count - PRICING_CONFIG.FREE_PAGES_TIER);
  const tokensRequired = paidPages; // 1 Token = 1 Page

  const isIllustrated = bookType === "illustrated";
  const pricePerPageUsd = isIllustrated
    ? PRICING_CONFIG.PRICE_PER_ILLUSTRATED_PAGE_USD
    : PRICING_CONFIG.PRICE_PER_WORDS_PAGE_USD;
  const cogsPerPageUsd = isIllustrated
    ? PRICING_CONFIG.ILLUSTRATED_COGS_PER_PAGE
    : PRICING_CONFIG.WORDS_COGS_PER_PAGE;

  const priceUsd = Number((paidPages * pricePerPageUsd).toFixed(2));
  const priceInrApprox = Math.round(priceUsd * 85); // Estimated INR equivalent at 85 INR/USD
  const rawCogsUsd = Number((count * cogsPerPageUsd).toFixed(2));
  const netProfitUsd = Number((priceUsd - rawCogsUsd).toFixed(2));
  const effectiveMarginPercent = priceUsd > 0
    ? Math.round(((priceUsd - rawCogsUsd) / priceUsd) * 100)
    : 0;

  return {
    totalPages: count,
    freePages,
    paidPages,
    bookType,
    pricePerPageUsd,
    tokensRequired,
    priceUsd,
    priceInrApprox,
    rawCogsUsd,
    netProfitUsd,
    effectiveMarginPercent,
  };
}

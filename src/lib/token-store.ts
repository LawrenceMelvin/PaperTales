import { TokenPack } from "@/types/order";

export const AVAILABLE_TOKEN_PACKS: TokenPack[] = [
  {
    id: "pack_starter",
    name: "Starter Story Pack",
    tokens: 25,
    priceUsd: 4.99,
    features: [
      "Generate 1 complete 12-page coloring book",
      "Instant high-res PDF export",
      "Character consistency locking",
    ],
  },
  {
    id: "pack_creator",
    name: "Creator Bundle",
    tokens: 60,
    priceUsd: 9.99,
    bonusTokens: 10,
    badge: "Most Popular",
    features: [
      "Generate ~3 full coloring books",
      "Print-ready 300 DPI vector PDF",
      "Commercial self-publishing license",
      "Companion product discounts",
    ],
  },
  {
    id: "pack_pro_teacher",
    name: "Educator & Pro Studio",
    tokens: 150,
    priceUsd: 19.99,
    bonusTokens: 30,
    badge: "Best Value",
    features: [
      "Generate classroom sets (8+ books)",
      "Bulk PDF compile & Lulu direct-order",
      "Priority AI queue",
      "Custom page layouts & fonts",
    ],
  },
];

// In-memory / client-safe token balance management
const TOKEN_STORAGE_KEY = "papertales_user_tokens";
const DEFAULT_INITIAL_TOKENS = 12; // Free starter tokens for new users

export function getClientTokenBalance(): number {
  if (typeof window === "undefined") return DEFAULT_INITIAL_TOKENS;
  const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (stored === null) {
    localStorage.setItem(TOKEN_STORAGE_KEY, DEFAULT_INITIAL_TOKENS.toString());
    return DEFAULT_INITIAL_TOKENS;
  }
  return parseInt(stored, 10) || 0;
}

export function deductClientTokens(amount: number): boolean {
  if (typeof window === "undefined") return true;
  const current = getClientTokenBalance();
  if (current < amount) return false;
  const updated = current - amount;
  localStorage.setItem(TOKEN_STORAGE_KEY, updated.toString());
  window.dispatchEvent(new Event("tokens_updated"));
  return true;
}

export function addClientTokens(amount: number): number {
  if (typeof window === "undefined") return amount;
  const current = getClientTokenBalance();
  const updated = current + amount;
  localStorage.setItem(TOKEN_STORAGE_KEY, updated.toString());
  window.dispatchEvent(new Event("tokens_updated"));
  return updated;
}

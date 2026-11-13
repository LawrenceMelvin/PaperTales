import { TokenPack } from "@/types/order";
import { apiFetch } from "@/lib/api-fetch";

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

export interface ServerUserStatus {
  tokenBalance: number;
  freeGrantClaimed: boolean;
}

export async function fetchServerUserStatus(): Promise<ServerUserStatus> {
  if (typeof window === "undefined") {
    return { tokenBalance: 0, freeGrantClaimed: false };
  }
  try {
    const res = await apiFetch("/api/me");
    if (!res.ok) {
      return { tokenBalance: 0, freeGrantClaimed: false };
    }
    const data = await res.json();
    return {
      tokenBalance: typeof data.tokenBalance === "number" ? data.tokenBalance : 0,
      freeGrantClaimed: Boolean(data.freeGrantClaimed),
    };
  } catch {
    return { tokenBalance: 0, freeGrantClaimed: false };
  }
}

export function dispatchTokensUpdated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("tokens_updated"));
  window.dispatchEvent(new Event("tokens_updated_server"));
  window.dispatchEvent(new Event("customer_status_updated"));
}

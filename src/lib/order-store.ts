import { PublishOrder } from "@/types/order";
import { apiFetch } from "@/lib/api-fetch";

export async function fetchServerOrders(): Promise<PublishOrder[]> {
  if (typeof window === "undefined") return [];
  try {
    const res = await apiFetch("/api/orders");
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.orders) ? data.orders : [];
  } catch (err) {
    console.warn("Failed to load orders from server:", err);
    return [];
  }
}

export function dispatchOrdersUpdated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("orders_updated"));
}

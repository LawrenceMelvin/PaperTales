import { PublishOrder } from "@/types/order";

const ORDER_STORAGE_KEY = "papertales_user_orders";

const DEFAULT_SAMPLE_ORDERS: PublishOrder[] = [
  {
    id: "PT-94821",
    bookTitle: "Leo & The Web-Weaver",
    authorName: "Leo's Family",
    genre: "coloring_book",
    characterName: "Web-Weaver Hero",
    pageCount: 12,
    printRiskStatus: "safe",
    fulfillmentStatus: "shipped",
    luluJobId: "LULU-782104-US",
    trackingNumber: "9400111899562534012948",
    trackingUrl: "https://tools.usps.com/go/TrackConfirmAction?tLabels=9400111899562534012948",
    paypalTxnId: "PAYID-M7K3X9A410294",
    totalAmountUsd: 11.83,
    tokensUsed: 6,
    createdAt: "2026-10-12T14:32:00Z",
  },
  {
    id: "PT-94805",
    bookTitle: "Barnaby's Whispering Woods",
    authorName: "Sarah Jenkins",
    genre: "coloring_book",
    characterName: "Barnaby the Golden Pup",
    pageCount: 8,
    printRiskStatus: "safe",
    fulfillmentStatus: "printing",
    luluJobId: "LULU-781992-UK",
    trackingNumber: "GB20491823901",
    trackingUrl: "https://www.royalmail.com/track-your-item#/tracking-results/GB20491823901",
    paypalTxnId: "PAYID-M7J8W2B391083",
    totalAmountUsd: 9.83,
    tokensUsed: 4,
    createdAt: "2026-10-13T09:15:00Z",
  },
  {
    id: "PT-94770",
    bookTitle: "Princess Elsa & Frost Magic",
    authorName: "Maya Lin",
    genre: "coloring_book",
    characterName: "Princess Elsa",
    pageCount: 16,
    printRiskStatus: "custom_requested",
    fulfillmentStatus: "sent_to_lulu",
    luluJobId: "LULU-781604-US",
    paypalTxnId: "PAYID-M7H4V1C281902",
    totalAmountUsd: 13.83,
    tokensUsed: 8,
    createdAt: "2026-10-13T18:40:00Z",
  },
  {
    id: "PT-94622",
    bookTitle: "Grandma Nora's Kitchen Secrets",
    authorName: "The Sterling Family",
    genre: "memory_book",
    characterName: "Grandma Nora",
    pageCount: 24,
    printRiskStatus: "safe",
    fulfillmentStatus: "proof_confirmed",
    paypalTxnId: "PAYID-M6D9U5D172891",
    totalAmountUsd: 17.83,
    tokensUsed: 12,
    createdAt: "2026-10-13T20:05:00Z",
  },
];

export function getClientOrders(): PublishOrder[] {
  if (typeof window === "undefined") return DEFAULT_SAMPLE_ORDERS;
  try {
    const raw = localStorage.getItem(ORDER_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(DEFAULT_SAMPLE_ORDERS));
      return DEFAULT_SAMPLE_ORDERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SAMPLE_ORDERS;
  } catch (err) {
    console.warn("Failed to load orders from localStorage:", err);
    return DEFAULT_SAMPLE_ORDERS;
  }
}

export function addClientOrder(order: PublishOrder): void {
  if (typeof window === "undefined") return;
  try {
    const current = getClientOrders();
    const updated = [order, ...current];
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("orders_updated"));
  } catch (err) {
    console.error("Failed to save order:", err);
  }
}

export function updateOrderStatus(
  orderId: string,
  fulfillmentStatus: PublishOrder["fulfillmentStatus"],
  trackingNumber?: string
): void {
  if (typeof window === "undefined") return;
  try {
    const current = getClientOrders();
    const updated = current.map((ord) =>
      ord.id === orderId
        ? {
            ...ord,
            fulfillmentStatus,
            trackingNumber: trackingNumber || ord.trackingNumber,
          }
        : ord
    );
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("orders_updated"));
  } catch (err) {
    console.error("Failed to update order status:", err);
  }
}

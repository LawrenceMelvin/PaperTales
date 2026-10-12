export type FulfillmentType = "digital_pdf" | "physical_print";

export type OrderStatus =
  | "draft"
  | "payment_pending"
  | "paid"
  | "in_production"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface ShippingAddress {
  recipientName: string;
  street1: string;
  street2?: string;
  city: string;
  stateOrProvince: string;
  postalCode: string;
  countryCode: string; // ISO 2-letter (e.g., "US")
  phoneNumber?: string;
}

export interface CompanionProduct {
  id: string;
  title: string;
  brand: string;
  price: number;
  currency: string;
  imageUrl: string;
  category: string;
  buyUrl?: string;
  retailerDomain?: string;
}

export interface LuluQuoteResponse {
  podPackageId: string;
  unitPrintCost: number;
  shippingCost: number;
  carrierLevel: string; // "Economy" | "Standard" | "Express"
  totalCost: number;
  currency: string;
  estimatedDeliveryDays: string;
}

export interface PaperTalesOrder {
  id: string;
  bookId: string;
  bookTitle: string;
  authorName: string;
  fulfillmentType: FulfillmentType;
  status: OrderStatus;
  pageCount: number;
  quantity: number;
  
  // Financial breakdown
  creationFee: number;
  printCost: number;
  shippingCost: number;
  companionItem?: CompanionProduct;
  totalAmount: number;
  currency: string;

  // Logistics & PayPal identifiers
  paypalOrderId?: string;
  paypalCaptureId?: string;
  shippingAddress?: ShippingAddress;
  luluJobId?: string;
  luluTrackingNumber?: string;
  luluCarrier?: string;
  pdfDownloadUrl?: string;

  createdAt: string;
  updatedAt: string;
}

export interface TokenPack {
  id: string;
  name: string;
  tokens: number;
  priceUsd: number;
  bonusTokens?: number;
  badge?: string;
  features: string[];
}

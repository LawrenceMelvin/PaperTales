import { getAdminDb } from "@/lib/firebase/admin";
import { creditTokens } from "@/lib/server/ledger";
import {
  getBookForOwner,
  hydrateBookSignedUrls,
} from "@/lib/server/books-repo";
import { compileBookPdf } from "@/lib/pdf-builder";
import { submitLuluPrintJob } from "@/lib/lulu-client";
import {
  getSignedReadUrl,
  SEVEN_DAYS_SECONDS,
  uploadBuffer,
} from "@/lib/server/storage";
import { BookProject } from "@/types/book";
import { PaperTalesOrder } from "@/types/order";

export interface PendingOrderDoc {
  id: string; // PayPal order ID
  uid: string;
  purpose: "token_pack" | "book_order";
  tokenPackId?: string;
  tokensToCredit?: number;
  bookId?: string;
  fulfillmentType?: "digital_pdf" | "physical_print";
  status: "pending" | "fulfilling" | "paid" | "in_production" | "shipped" | "delivered" | "flagged" | "print_failed";
  totalAmount: number;
  currency: string;
  creationFee: number;
  printCost: number;
  shippingCost: number;
  orderDetails?: Record<string, any>;
  paypalCaptureId?: string;
  luluJobId?: string;
  luluTrackingNumber?: string;
  luluCarrier?: string;
  shippingAddress?: any;
  finalizedOrder?: PaperTalesOrder;
  createdAt: string;
  updatedAt: string;
}

export interface CaptureVerificationInput {
  captureId: string;
  amountValue?: number;
  currencyCode?: string;
  shippingAddress?: any;
}

export interface FulfillmentStore {
  claimForFulfillment(
    orderId: string,
    callerUid: string | null,
    amountValue?: number,
    currencyCode?: string
  ): Promise<{ alreadyDone: boolean; order: PendingOrderDoc }>;
  markStatus(orderId: string, patch: Partial<PendingOrderDoc>): Promise<void>;
}

export function createFirestoreFulfillmentStore(): FulfillmentStore {
  const db = getAdminDb();
  return {
    async claimForFulfillment(orderId, callerUid, amountValue, currencyCode) {
      const ref = db.collection("orders").doc(orderId);
      return db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists) {
          throw new FulfillmentError(404, "order_not_found", "Pending order not found.");
        }
        const order = snap.data() as PendingOrderDoc;
        if (callerUid && order.uid !== callerUid) {
          throw new FulfillmentError(404, "order_not_found", "Order not found.");
        }

        if (order.status !== "pending") {
          return { alreadyDone: true, order };
        }

        const expectedCurrency = order.currency || "USD";
        const receivedCurrency = currencyCode || expectedCurrency;
        const amountMismatch =
          typeof amountValue === "number" &&
          Math.abs(amountValue - order.totalAmount) > 0.02;

        if (amountMismatch || receivedCurrency !== expectedCurrency) {
          tx.set(
            ref,
            {
              status: "flagged",
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
          throw new FulfillmentError(
            400,
            "amount_mismatch",
            "Captured payment amount does not match expected order total."
          );
        }

        tx.set(
          ref,
          {
            status: "fulfilling",
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
        return { alreadyDone: false, order: { ...order, status: "fulfilling" } };
      });
    },
    async markStatus(orderId, patch) {
      await db
        .collection("orders")
        .doc(orderId)
        .set({ ...patch, updatedAt: new Date().toISOString() }, { merge: true });
    },
  };
}

export class FulfillmentError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "FulfillmentError";
  }
}

export interface FulfillmentSideEffects {
  creditTokens: (uid: string, amount: number, refId: string, desc: string) => Promise<void>;
  unlockBook: (uid: string, bookId: string, captureId: string) => Promise<void>;
  submitPrint: (
    uid: string,
    bookId: string,
    orderDetails: Record<string, any>
  ) => Promise<{ jobId?: string; trackingNumber?: string }>;
}

const defaultSideEffects: FulfillmentSideEffects = {
  async creditTokens(uid, amount, refId, desc) {
    await creditTokens(uid, amount, "purchase", refId, desc);
  },
  async unlockBook(uid, bookId, captureId) {
    const db = getAdminDb();
    const book = await getBookForOwner(bookId, uid);
    if (!book) return;
    await db
      .collection("books")
      .doc(bookId)
      .set(
        {
          entitlement: {
            ...book.entitlement,
            paidThrough: book.pageCount || book.pages.length || 12,
            unlockedBy: "paypal",
            unlockRef: captureId,
          },
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
  },
  async submitPrint(uid, bookId, orderDetails) {
    const stored = await getBookForOwner(bookId, uid);
    let interiorUrl = "";
    let coverUrl = "";

    if (stored) {
      const hydrated = await hydrateBookSignedUrls(stored);
      const bookProject = hydrated as unknown as BookProject;
      const version = stored.contentVersion || 1;
      const interiorPath = `users/${uid}/books/${bookId}/pdf/lulu_interior-v${version}.pdf`;
      const coverPath = `users/${uid}/books/${bookId}/pdf/lulu_cover-v${version}.pdf`;

      const [interiorBytes, coverBytes] = await Promise.all([
        compileBookPdf(bookProject, { mode: "lulu_interior" }),
        compileBookPdf(bookProject, { mode: "lulu_cover" }),
      ]);

      await Promise.all([
        uploadBuffer(interiorPath, Buffer.from(interiorBytes), "application/pdf"),
        uploadBuffer(coverPath, Buffer.from(coverBytes), "application/pdf"),
      ]);

      [interiorUrl, coverUrl] = await Promise.all([
        getSignedReadUrl(interiorPath, SEVEN_DAYS_SECONDS),
        getSignedReadUrl(coverPath, SEVEN_DAYS_SECONDS),
      ]);
    }

    const res = await submitLuluPrintJob(orderDetails as any, interiorUrl, coverUrl);
    return { jobId: res.jobId, trackingNumber: res.trackingNumber };
  },
};

export async function fulfillOrder(
  paypalOrderId: string,
  callerUid: string | null,
  capture: CaptureVerificationInput,
  store: FulfillmentStore = createFirestoreFulfillmentStore(),
  effects: FulfillmentSideEffects = defaultSideEffects
): Promise<PendingOrderDoc> {
  const { alreadyDone, order } = await store.claimForFulfillment(
    paypalOrderId,
    callerUid,
    capture.amountValue,
    capture.currencyCode
  );

  if (alreadyDone) {
    return order;
  }

  let nextStatus: PendingOrderDoc["status"] = "paid";
  let luluJobId: string | undefined;
  let luluTrackingNumber: string | undefined;

  if (order.purpose === "token_pack" && order.tokensToCredit) {
    await effects.creditTokens(
      order.uid,
      order.tokensToCredit,
      capture.captureId,
      `Purchased token pack ${order.tokenPackId || ""}`
    );
  } else if (order.purpose === "book_order" && order.bookId) {
    await effects.unlockBook(order.uid, order.bookId, capture.captureId);

    if (order.fulfillmentType === "physical_print") {
      try {
        const printRes = await effects.submitPrint(
          order.uid,
          order.bookId,
          order.orderDetails || {}
        );
        luluJobId = printRes.jobId;
        luluTrackingNumber = printRes.trackingNumber;
        nextStatus = "in_production";
      } catch (err) {
        console.error("Lulu print submission failed after payment:", err);
        nextStatus = "print_failed";
      }
    }
  }

  const now = new Date().toISOString();
  const finalizedOrder: PaperTalesOrder = {
    id: `ORD-${paypalOrderId.slice(-8).toUpperCase()}`,
    bookId: order.bookId || "token_pack",
    bookTitle: order.orderDetails?.bookTitle || "PaperTales Order",
    authorName: order.orderDetails?.authorName || "PaperTales Author",
    fulfillmentType: order.fulfillmentType || "digital_pdf",
    status: nextStatus === "in_production" ? "in_production" : "paid",
    pageCount: order.orderDetails?.pageCount || 0,
    quantity: order.orderDetails?.quantity || 1,
    creationFee: order.creationFee,
    printCost: order.printCost,
    shippingCost: order.shippingCost,
    companionItem: order.orderDetails?.companionItem,
    totalAmount: order.totalAmount,
    currency: order.currency,
    paypalOrderId,
    paypalCaptureId: capture.captureId,
    shippingAddress: capture.shippingAddress,
    luluJobId,
    luluTrackingNumber,
    luluCarrier: order.fulfillmentType === "physical_print" ? "Standard Ground (Tracked)" : undefined,
    createdAt: order.createdAt,
    updatedAt: now,
  };

  await store.markStatus(paypalOrderId, {
    status: nextStatus,
    paypalCaptureId: capture.captureId,
    luluJobId,
    luluTrackingNumber,
    shippingAddress: capture.shippingAddress,
    finalizedOrder,
  });

  return {
    ...order,
    status: nextStatus,
    paypalCaptureId: capture.captureId,
    luluJobId,
    luluTrackingNumber,
    shippingAddress: capture.shippingAddress,
    finalizedOrder,
    updatedAt: now,
  };
}

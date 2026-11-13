import { NextRequest, NextResponse } from "next/server";
import { createPayPalOrder } from "@/lib/paypal-client";
import { AVAILABLE_TOKEN_PACKS } from "@/lib/token-store";
import { AuthError, requireUser } from "@/lib/server/auth";
import { getAdminDb } from "@/lib/firebase/admin";
import { getBookForOwner } from "@/lib/server/books-repo";
import {
  calculateBookQuote,
  calculateLuluCommission,
} from "@/lib/pricing-calculator";
import { calculateLuluQuote } from "@/lib/lulu-client";
import { isBookFullyUnlocked } from "@/lib/server/entitlement";
import { PendingOrderDoc } from "@/lib/server/fulfillment";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req, { allowAnonymous: false });
    const body = await req.json();
    const { type, tokenPackId, bookCheckout } = body;
    const db = getAdminDb();

    // Case 1: Token Pack Checkout (server-authoritative price)
    if (type === "token_pack") {
      const pack = AVAILABLE_TOKEN_PACKS.find((p) => p.id === tokenPackId);
      if (!pack) {
        return NextResponse.json({ error: "Invalid token pack selected" }, { status: 400 });
      }

      const order = await createPayPalOrder({
        items: [
          {
            name: `PaperTales AI: ${pack.name} (${pack.tokens} Tokens)`,
            description: `Refill ${pack.tokens} AI tokens for book generation & high-res PDF exports`,
            unitAmount: pack.priceUsd,
            quantity: 1,
            category: "DIGITAL_GOODS",
          },
        ],
        customId: `tokens_${pack.id}_${Date.now()}`,
        requireShippingAddress: false,
      });

      const now = new Date().toISOString();
      const pendingDoc: PendingOrderDoc = {
        id: order.id,
        uid: user.uid,
        purpose: "token_pack",
        tokenPackId: pack.id,
        tokensToCredit: pack.tokens + (pack.bonusTokens || 0),
        status: "pending",
        totalAmount: pack.priceUsd,
        currency: "USD",
        creationFee: pack.priceUsd,
        printCost: 0,
        shippingCost: 0,
        orderDetails: {
          bookTitle: pack.name,
          authorName: user.name || user.email || "PaperTales Creator",
        },
        createdAt: now,
        updatedAt: now,
      };
      await db.collection("orders").doc(order.id).set(pendingDoc);

      return NextResponse.json({ success: true, orderId: order.id, mock: order.mock });
    }

    // Case 2: Full Book Checkout (server-computed digital fee + Lulu quote + commission)
    if (type === "book_order" && bookCheckout) {
      const {
        bookId,
        fulfillmentType = "digital_pdf",
        quantity = 1,
        countryCode = "US",
        shippingLevel = "MAIL",
        companionItem,
      } = bookCheckout;

      const enforceAuth = process.env.REQUIRE_AUTH !== "false";
      let bookTitle = bookCheckout.bookTitle || "My Custom Coloring Adventure";
      let authorName = bookCheckout.authorName || user.name || "PaperTales Author";
      let pageCount = Number(bookCheckout.pageCount) || 12;
      let trimSize: "8.5x8.5" | "6x9" | "8.5x11" = bookCheckout.trimSize || "8.5x8.5";
      let interiorColor: "black_and_white" | "standard_color" =
        bookCheckout.interiorColor || "black_and_white";
      let bookType: "illustrated" | "words" =
        bookCheckout.genre === "storybook" ? "words" : "illustrated";
      let alreadyUnlocked = false;

      if (bookId && enforceAuth) {
        const storedBook = await getBookForOwner(bookId, user.uid);
        if (!storedBook) {
          return NextResponse.json({ error: "Book not found" }, { status: 404 });
        }
        bookTitle = storedBook.title;
        authorName = storedBook.authorName;
        pageCount = storedBook.pageCount || storedBook.pages.length || 12;
        trimSize = storedBook.format?.trimSize || trimSize;
        interiorColor = storedBook.format?.interiorColor || interiorColor;
        bookType = storedBook.genre === "storybook" ? "words" : "illustrated";
        alreadyUnlocked = isBookFullyUnlocked(pageCount, storedBook.entitlement);
      }

      const userSnap = await db.collection("users").doc(user.uid).get();
      const freeGrantClaimed = Boolean(userSnap.data()?.freeGrantClaimed);

      const quote = calculateBookQuote(pageCount, bookType, !freeGrantClaimed);
      const serverCreationFee = alreadyUnlocked ? 0 : quote.priceUsd;

      let serverPrintCost = 0;
      let serverShippingCost = 0;
      if (fulfillmentType === "physical_print") {
        const luluQuote = await calculateLuluQuote(
          pageCount,
          Math.max(1, Number(quantity) || 1),
          { countryCode },
          { trimSize, interiorColor }
        );
        const commission = calculateLuluCommission(
          luluQuote.unitPrintCost,
          luluQuote.shippingCost
        );
        serverPrintCost = Number((luluQuote.unitPrintCost + commission).toFixed(2));
        serverShippingCost = Number(luluQuote.shippingCost.toFixed(2));
      }

      const items: any[] = [];
      if (serverCreationFee > 0) {
        items.push({
          name: `Custom Book License: "${bookTitle}"`,
          description: "High-resolution AI story & vector line-art compilation license",
          unitAmount: serverCreationFee,
          quantity: 1,
          category: "DIGITAL_GOODS",
        });
      }

      if (fulfillmentType === "physical_print" && serverPrintCost > 0) {
        items.push({
          name: "Lulu Softcover Print & Binding",
          description: `${trimSize} Softcover (${pageCount} pages, Lulu POD)`,
          unitAmount: serverPrintCost,
          quantity: 1,
          category: "PHYSICAL_GOODS",
        });
      }

      let verifiedCompanionPrice = 0;
      if (companionItem && typeof companionItem.price === "number" && companionItem.price > 0) {
        verifiedCompanionPrice = Number(companionItem.price.toFixed(2));
        items.push({
          name: `${companionItem.brand || "Art"} - ${companionItem.title || "Companion Kit"}`,
          description: "Curated companion supplies via Channel3 Agentic Commerce",
          unitAmount: verifiedCompanionPrice,
          quantity: 1,
          category: "PHYSICAL_GOODS",
        });
      }

      const hasPhysicalGoods =
        fulfillmentType === "physical_print" || Boolean(verifiedCompanionPrice > 0);
      const serverTotal = Number(
        (serverCreationFee + serverPrintCost + serverShippingCost + verifiedCompanionPrice).toFixed(2)
      );

      const order = await createPayPalOrder({
        items,
        shippingAmount: fulfillmentType === "physical_print" ? serverShippingCost : 0,
        customId: `book_${bookId || "custom"}_${Date.now()}`,
        requireShippingAddress: hasPhysicalGoods,
      });

      const now = new Date().toISOString();
      const pendingDoc: PendingOrderDoc = {
        id: order.id,
        uid: user.uid,
        purpose: "book_order",
        bookId: bookId || "book_default",
        fulfillmentType,
        status: "pending",
        totalAmount: serverTotal,
        currency: "USD",
        creationFee: serverCreationFee,
        printCost: serverPrintCost,
        shippingCost: serverShippingCost,
        orderDetails: {
          bookId: bookId || "book_default",
          bookTitle,
          authorName,
          pageCount,
          trimSize,
          interiorColor,
          quantity,
          fulfillmentType,
          companionItem: verifiedCompanionPrice > 0 ? companionItem : undefined,
        },
        createdAt: now,
        updatedAt: now,
      };
      await db.collection("orders").doc(order.id).set(pendingDoc);

      return NextResponse.json({
        success: true,
        orderId: order.id,
        mock: order.mock,
        serverTotal,
      });
    }

    return NextResponse.json({ error: "Invalid order payload" }, { status: 400 });
  } catch (error: any) {
    if (error instanceof AuthError) return error.toResponse();
    console.error("PayPal Create Order API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create PayPal order" },
      { status: 500 }
    );
  }
}

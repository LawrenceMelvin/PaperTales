import { NextRequest, NextResponse } from "next/server";
import { createPayPalOrder } from "@/lib/paypal-client";
import { AVAILABLE_TOKEN_PACKS } from "@/lib/token-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, tokenPackId, bookCheckout } = body;

    // Case 1: Token Pack Checkout
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
        customId: `tokens_${pack.id}`,
        requireShippingAddress: false,
      });

      return NextResponse.json({ success: true, orderId: order.id, mock: order.mock });
    }

    // Case 2: Full Book Checkout (Digital or Physical + Lulu Print + Channel3 Companion)
    if (type === "book_order" && bookCheckout) {
      const {
        bookTitle,
        fulfillmentType,
        creationFee = 3.5,
        printCost = 0,
        shippingCost = 0,
        companionItem,
      } = bookCheckout;

      const items: any[] = [
        {
          name: `Custom Book License: "${bookTitle}"`,
          description: "High-resolution AI story & vector line-art compilation license",
          unitAmount: creationFee,
          quantity: 1,
          category: "DIGITAL_GOODS",
        },
      ];

      if (fulfillmentType === "physical_print") {
        items.push({
          name: "Lulu Softcover Print & Saddle-Stitch Binding",
          description: "8.5x8.5 Square Softcover 60# Uncoated White Interior (Lulu POD)",
          unitAmount: printCost,
          quantity: 1,
          category: "PHYSICAL_GOODS",
        });

        if (companionItem) {
          items.push({
            name: `${companionItem.brand} - ${companionItem.title}`,
            description: "Curated companion art supplies via Channel3 Agentic Commerce",
            unitAmount: companionItem.price,
            quantity: 1,
            category: "PHYSICAL_GOODS",
          });
        }
      }

      const order = await createPayPalOrder({
        items,
        shippingAmount: fulfillmentType === "physical_print" ? shippingCost : 0,
        customId: `book_${Date.now()}`,
        requireShippingAddress: fulfillmentType === "physical_print",
      });

      return NextResponse.json({ success: true, orderId: order.id, mock: order.mock });
    }

    return NextResponse.json({ error: "Invalid order payload" }, { status: 400 });
  } catch (error: any) {
    console.error("PayPal Create Order API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create PayPal order" },
      { status: 500 }
    );
  }
}

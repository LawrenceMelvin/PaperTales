import { NextRequest, NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal-client";
import { AuthError, requireUser } from "@/lib/server/auth";
import { fulfillOrder, FulfillmentError } from "@/lib/server/fulfillment";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req, { allowAnonymous: false });
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const captureResult = await capturePayPalOrder(orderId);
    if (captureResult.status !== "COMPLETED") {
      return NextResponse.json(
        { error: `Payment status is ${captureResult.status}` },
        { status: 400 }
      );
    }

    const fulfilled = await fulfillOrder(orderId, user.uid, {
      captureId: captureResult.captureId || `CAP-${orderId}`,
      amountValue: (captureResult as any).capturedAmount,
      currencyCode: (captureResult as any).capturedCurrency,
      shippingAddress: captureResult.shippingAddress,
    });

    return NextResponse.json({
      success: true,
      capture: captureResult,
      order: fulfilled.finalizedOrder || fulfilled,
    });
  } catch (error: any) {
    if (error instanceof AuthError) return error.toResponse();
    if (error instanceof FulfillmentError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status }
      );
    }
    console.error("PayPal Capture Order API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to capture PayPal order" },
      { status: 500 }
    );
  }
}

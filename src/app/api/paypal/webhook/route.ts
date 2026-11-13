import { NextRequest, NextResponse } from "next/server";
import { verifyPayPalWebhookSignature } from "@/lib/paypal-client";
import { fulfillOrder, FulfillmentError } from "@/lib/server/fulfillment";

export async function POST(req: NextRequest) {
  try {
    const event = await req.json();
    const valid = await verifyPayPalWebhookSignature(req.headers, event);
    if (!valid) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
    }

    const eventType = event.event_type;
    if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
      const resource = event.resource || {};
      const paypalOrderId = resource.supplementary_data?.related_ids?.order_id;
      const captureId = resource.id;
      const amountValue = resource.amount?.value ? Number(resource.amount.value) : undefined;
      const currencyCode = resource.amount?.currency_code;

      if (paypalOrderId && captureId) {
        try {
          await fulfillOrder(paypalOrderId, null, {
            captureId,
            amountValue,
            currencyCode,
          });
        } catch (err) {
          if (err instanceof FulfillmentError && err.status === 404) {
            return NextResponse.json({ received: true, ignored: "unknown_order" });
          }
          throw err;
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("PayPal Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook handling failed" }, { status: 400 });
  }
}

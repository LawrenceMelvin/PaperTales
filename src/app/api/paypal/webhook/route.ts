import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const event = await req.json();

    // PayPal Webhook Event processing
    const eventType = event.event_type;
    console.log(`[PayPal Webhook] Received event: ${eventType}`, event.id);

    if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
      const resource = event.resource;
      const captureId = resource.id;
      const amount = resource.amount?.value;
      console.log(`[PayPal Webhook] Payment Captured: ${captureId} for $${amount}`);
      // Here you would update your persistent database / dispatch Lulu print order
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("PayPal Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook handling failed" }, { status: 400 });
  }
}

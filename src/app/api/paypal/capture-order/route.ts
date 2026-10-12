import { NextRequest, NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal-client";
import { submitLuluPrintJob } from "@/lib/lulu-client";
import { PaperTalesOrder } from "@/types/order";

export async function POST(req: NextRequest) {
  try {
    const { orderId, orderDetails } = await req.json();

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

    let luluJobId: string | undefined;
    let luluTracking: string | undefined;

    // If this is a physical print order, trigger the Lulu print job
    if (orderDetails?.fulfillmentType === "physical_print") {
      const luluRes = await submitLuluPrintJob(orderDetails, "dummy_interior.pdf", "dummy_cover.pdf");
      luluJobId = luluRes.jobId;
      luluTracking = luluRes.trackingNumber;
    }

    const finalizedOrder: PaperTalesOrder = {
      id: `ORD-${Date.now().toString(36).toUpperCase()}`,
      bookId: orderDetails?.bookId || "book_default",
      bookTitle: orderDetails?.bookTitle || "My Custom Coloring Adventure",
      authorName: orderDetails?.authorName || "Little Author",
      fulfillmentType: orderDetails?.fulfillmentType || "digital_pdf",
      status: orderDetails?.fulfillmentType === "physical_print" ? "in_production" : "paid",
      pageCount: orderDetails?.pageCount || 6,
      quantity: orderDetails?.quantity || 1,
      creationFee: orderDetails?.creationFee || 3.5,
      printCost: orderDetails?.printCost || 0,
      shippingCost: orderDetails?.shippingCost || 0,
      companionItem: orderDetails?.companionItem,
      totalAmount: orderDetails?.totalAmount || 3.5,
      currency: "USD",
      paypalOrderId: orderId,
      paypalCaptureId: captureResult.captureId,
      shippingAddress: captureResult.shippingAddress,
      luluJobId: luluJobId,
      luluTrackingNumber: luluTracking,
      luluCarrier: "Standard Ground (Tracked)",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      capture: captureResult,
      order: finalizedOrder,
    });
  } catch (error: any) {
    console.error("PayPal Capture Order API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to capture PayPal order" },
      { status: 500 }
    );
  }
}

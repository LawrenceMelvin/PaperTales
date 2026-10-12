import { NextRequest, NextResponse } from "next/server";
import { calculateLuluQuote } from "@/lib/lulu-client";

export async function POST(req: NextRequest) {
  try {
    const { pageCount = 12, quantity = 1, address } = await req.json();

    const quote = await calculateLuluQuote(pageCount, quantity, address);

    return NextResponse.json({
      success: true,
      quote,
    });
  } catch (error: any) {
    console.error("Lulu quote calculation error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to calculate print quote" },
      { status: 500 }
    );
  }
}

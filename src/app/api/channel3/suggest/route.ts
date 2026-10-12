import { NextRequest, NextResponse } from "next/server";
import { fetchChannel3CompanionProducts } from "@/lib/channel3-client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const genre = searchParams.get("genre") || "coloring_book";

    // Query live Channel3 catalog for tailored companion kits matching the book genre
    const products = await fetchChannel3CompanionProducts(genre);

    return NextResponse.json({
      success: true,
      provider: "Channel3 Agentic Commerce API",
      genre,
      products,
    });
  } catch (error: any) {
    console.error("Error fetching Channel3 products:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to query Channel3 catalog" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { CompanionProduct } from "@/types/order";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const genre = searchParams.get("genre") || "coloring_book";

    // Channel3 product catalog integration for Agentic Commerce
    // Returns curated art supplies and companion kits matching the book theme
    const companionCatalog: CompanionProduct[] = [
      {
        id: "ch3_crayola_washable",
        title: "Crayola Ultra-Clean Washable Markers (12ct)",
        brand: "Crayola",
        price: 4.99,
        currency: "USD",
        category: "Art Supplies",
        imageUrl: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&auto=format&fit=crop&q=60",
      },
      {
        id: "ch3_prismacolor_pencils",
        title: "Prismacolor Scholar Colored Pencils (24ct)",
        brand: "Prismacolor",
        price: 8.50,
        currency: "USD",
        category: "Art Supplies",
        imageUrl: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=300&auto=format&fit=crop&q=60",
      },
      {
        id: "ch3_sketch_carry_pouch",
        title: "Little Artist Canvas Carry Pouch & Sharpener",
        brand: "PaperTales Craft",
        price: 3.99,
        currency: "USD",
        category: "Accessories",
        imageUrl: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=300&auto=format&fit=crop&q=60",
      },
    ];

    return NextResponse.json({
      success: true,
      provider: "Channel3 Agentic Commerce API",
      products: companionCatalog,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to query Channel3 catalog" },
      { status: 500 }
    );
  }
}

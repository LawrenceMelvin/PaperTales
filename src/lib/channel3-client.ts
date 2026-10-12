import { Channel3 } from "@channel3/sdk";
import { CompanionProduct } from "@/types/order";

// Initialize Channel3 client with environment variable (never hardcoded)
export function getChannel3Client(): Channel3 | null {
  const apiKey = process.env.CHANNEL3_API_KEY;
  if (!apiKey || apiKey.startsWith("sb-") || apiKey === "test_channel3_key") {
    return null;
  }
  return new Channel3({ apiKey });
}

// Genre-to-Query mapping for intelligent companion discovery
const GENRE_QUERIES: Record<string, string> = {
  coloring_book: "crayola crayons colored pencils washable markers",
  memory_book: "scrapbook memory stickers photo corners kids journal",
  math_book: "counting abacus math flash cards educational puzzle",
  science_book: "kids magnifying glass science kit astronomy telescope",
};

const FALLBACK_COMPANIONS: Record<string, CompanionProduct[]> = {
  coloring_book: [
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
  ],
};

export async function fetchChannel3CompanionProducts(
  genre: string = "coloring_book",
  customQuery?: string
): Promise<CompanionProduct[]> {
  const apiKey = process.env.CHANNEL3_API_KEY;
  const isMock = !apiKey || apiKey.startsWith("sb-") || apiKey === "test_channel3_key";

  if (!isMock && apiKey) {
    try {
      const query = customQuery?.trim() || GENRE_QUERIES[genre] || GENRE_QUERIES.coloring_book;

      // Direct REST search call for high performance and clean attribute mapping
      const res = await fetch("https://api.trychannel3.com/v1/search", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          limit: 6,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const products = data.products || data.data || [];

        if (products.length > 0) {
          return products
            .filter((p: any) => p.offers && p.offers.length > 0 && p.offers[0].price?.price)
            .map((p: any) => {
              const bestOffer = p.offers[0];
              const mainImg = p.images?.find((img: any) => img.is_main_image) || p.images?.[0];

              return {
                id: `ch3_${p.id}`,
                title: p.title,
                brand: p.brands?.[0]?.name || p.brand?.name || "Curated Brand",
                price: Number(bestOffer.price.price),
                currency: bestOffer.price.currency || "USD",
                category: p.category?.name || "Activities & Supplies",
                imageUrl: mainImg?.cleaned_url || mainImg?.url || "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&auto=format&fit=crop&q=60",
                buyUrl: bestOffer.url,
                retailerDomain: bestOffer.domain,
              };
            });
        }
      }
    } catch (err) {
      console.warn("Channel3 live search error, using curated fallbacks:", err);
    }
  }

  // Graceful fallback if offline or mock
  return FALLBACK_COMPANIONS[genre] || FALLBACK_COMPANIONS.coloring_book;
}

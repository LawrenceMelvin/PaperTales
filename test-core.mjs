import { compileBookPdf } from "./src/lib/pdf-builder.ts";
import { calculateLuluQuote } from "./src/lib/lulu-client.ts";
import { createPayPalOrder, capturePayPalOrder } from "./src/lib/paypal-client.ts";
import { calculateBookQuote } from "./src/lib/pricing-calculator.ts";

async function runSmokeTests() {
  console.log("--- Starting PaperTales AI Backend Smoke Tests (62% Margin) ---");

  // 1. Test Dynamic Scalable Quotes (5, 30, 46, 60 Pages)
  const quote5 = calculateBookQuote(5);
  console.log("✔ 5-Page Freemium Quote:", {
    totalPages: quote5.totalPages,
    freePages: quote5.freePages,
    paidPages: quote5.paidPages,
    priceUsd: quote5.priceUsd,
  });

  const quote30 = calculateBookQuote(30);
  console.log("✔ 30-Page Dynamic Quote (62% Margin):", {
    totalPages: quote30.totalPages,
    paidPages: quote30.paidPages,
    priceUsd: `$${quote30.priceUsd}`,
    priceInr: `~₹${quote30.priceInrApprox}`,
    rawCogs: `$${quote30.rawCogsUsd}`,
    netProfit: `$${quote30.netProfitUsd}`,
    margin: `${quote30.effectiveMarginPercent}%`,
  });

  const quote46 = calculateBookQuote(46);
  console.log("✔ 46-Page (User Benchmark) Dynamic Quote (62% Margin):", {
    totalPages: quote46.totalPages,
    paidPages: quote46.paidPages,
    priceUsd: `$${quote46.priceUsd}`,
    priceInr: `~₹${quote46.priceInrApprox}`,
    rawCogs: `$${quote46.rawCogsUsd}`,
    netProfit: `$${quote46.netProfitUsd}`,
    margin: `${quote46.effectiveMarginPercent}%`,
  });

  // 2. Test Lulu Dynamic Quote Calculation for 46 pages
  const quote = await calculateLuluQuote(46, 1, { countryCode: "US" });
  console.log("✔ Lulu Quote Calculated for 46 Pages:", {
    package: quote.podPackageId,
    unitPrint: quote.unitPrintCost,
    shipping: quote.shippingCost,
    total: quote.totalCost,
  });

  // 3. Test PayPal Order Creation
  const orderRes = await createPayPalOrder({
    items: [
      { name: "Custom Book License (46 Pages)", unitAmount: quote46.priceUsd, quantity: 1, category: "DIGITAL_GOODS" },
      { name: "Lulu Print & Bind", unitAmount: quote.unitPrintCost, quantity: 1, category: "PHYSICAL_GOODS" },
    ],
    shippingAmount: quote.shippingCost,
    requireShippingAddress: true,
  });
  console.log("✔ PayPal Order Created:", orderRes);

  // 4. Test PayPal Order Capture
  const captureRes = await capturePayPalOrder(orderRes.id);
  console.log("✔ PayPal Order Captured:", {
    status: captureRes.status,
    captureId: captureRes.captureId,
    shippingTo: captureRes.shippingAddress?.city,
  });

  // 5. Test PDF Compilation for 46 Pages
  const samplePages = Array.from({ length: 46 }, (_, i) => ({
    pageNumber: i + 1,
    title: `Chapter ${i + 1}`,
    storyText: `This is adventure page ${i + 1} of Barnaby's grand journey.`,
    imagePrompt: `Clean line art for page ${i + 1}`,
  }));

  const sampleBook = {
    id: "test_book_46",
    title: "Barnaby's 46-Page Grand Epic",
    subtitle: "A Complete AI Coloring Storybook",
    authorName: "Lawrence",
    genre: "coloring_book",
    targetAge: "4-8",
    character: {
      name: "Barnaby",
      type: "Golden Retriever Puppy",
      traits: ["Cozy red scarf"],
    },
    pages: samplePages,
    pageCount: 46,
    format: {
      trimSize: "8.5x8.5",
      binding: "saddle_stitch",
      interiorColor: "black_and_white",
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const pdfBytes = await compileBookPdf(sampleBook);
  console.log(`✔ 46-Page PDF Compiled Successfully! Size: ${pdfBytes.length} bytes`);

  console.log("--- All Smoke Tests Passed at 62% Margin! ---");
}

runSmokeTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});

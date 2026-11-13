import { compileBookPdf } from "./src/lib/pdf-builder.ts";
import { calculateLuluQuote } from "./src/lib/lulu-client.ts";
import { createPayPalOrder, capturePayPalOrder } from "./src/lib/paypal-client.ts";
import { calculateBookQuote, calculateLuluCommission, PRICING_CONFIG } from "./src/lib/pricing-calculator.ts";
import { getCleanIllustrationPrompt } from "./src/lib/illustration-prompt.ts";

async function runSmokeTests() {
  console.log("--- Starting PaperTales AI Backend Smoke Tests (65% Margin & Commission) ---");

  // 1. Test First-Time vs. Returning Customer Quotes (First 5 Pages Free Rule)
  const firstTimeQuote = calculateBookQuote(12, "illustrated", true);
  console.log("✔ First-Time Customer Quote (12 Pages, First 5 Free):", {
    totalPages: firstTimeQuote.totalPages,
    freePages: firstTimeQuote.freePages,
    paidPages: firstTimeQuote.paidPages,
    priceUsd: `$${firstTimeQuote.priceUsd}`,
  });
  if (firstTimeQuote.freePages !== 5 || firstTimeQuote.paidPages !== 7) {
    throw new Error(`Expected 5 free and 7 paid pages for first-time customer, got ${firstTimeQuote.freePages}/${firstTimeQuote.paidPages}`);
  }

  const returningQuote = calculateBookQuote(12, "illustrated", false);
  console.log("✔ Returning Customer Quote (12 Pages, 100% Paid):", {
    totalPages: returningQuote.totalPages,
    freePages: returningQuote.freePages,
    paidPages: returningQuote.paidPages,
    priceUsd: `$${returningQuote.priceUsd}`,
  });
  if (returningQuote.freePages !== 0 || returningQuote.paidPages !== 12) {
    throw new Error(`Expected 0 free and 12 paid pages for returning customer, got ${returningQuote.freePages}/${returningQuote.paidPages}`);
  }

  // 2. Test Dynamic Scalable Quotes (5, 30, 46 Pages at 65% Target Margin)
  const quote5 = calculateBookQuote(5, "illustrated", true);
  console.log("✔ 5-Page Freemium Quote:", {
    totalPages: quote5.totalPages,
    freePages: quote5.freePages,
    paidPages: quote5.paidPages,
    priceUsd: quote5.priceUsd,
  });

  const quote30 = calculateBookQuote(30, "illustrated", true);
  console.log("✔ 30-Page Dynamic Quote (65% Margin):", {
    totalPages: quote30.totalPages,
    paidPages: quote30.paidPages,
    priceUsd: `$${quote30.priceUsd}`,
    priceInr: `~₹${quote30.priceInrApprox}`,
    rawCogs: `$${quote30.rawCogsUsd}`,
    netProfit: `$${quote30.netProfitUsd}`,
    margin: `${quote30.effectiveMarginPercent}%`,
  });

  const quote46 = calculateBookQuote(46, "illustrated", true);
  console.log("✔ 46-Page Dynamic Quote (65% Margin):", {
    totalPages: quote46.totalPages,
    paidPages: quote46.paidPages,
    priceUsd: `$${quote46.priceUsd}`,
    priceInr: `~₹${quote46.priceInrApprox}`,
    rawCogs: `$${quote46.rawCogsUsd}`,
    netProfit: `$${quote46.netProfitUsd}`,
    margin: `${quote46.effectiveMarginPercent}%`,
  });

  // 3. Test Lulu Dynamic Quote Calculation & 10% Platform Commission
  const quote = await calculateLuluQuote(46, 1, { countryCode: "US" });
  const commission = calculateLuluCommission(quote.unitPrintCost, quote.shippingCost);
  const expectedCommission = Number(((quote.unitPrintCost + quote.shippingCost) * 0.10).toFixed(2));
  console.log("✔ Lulu Quote Calculated & 10% Platform Commission Verified:", {
    package: quote.podPackageId,
    unitPrint: quote.unitPrintCost,
    shipping: quote.shippingCost,
    platformCommission10Pct: commission,
    totalWithCommission: Number((quote.totalCost + commission).toFixed(2)),
  });
  if (commission !== expectedCommission) {
    throw new Error(`Expected platform commission $${expectedCommission}, got $${commission}`);
  }

  // 4. Test PayPal Order Creation with Commission Bundled
  const bundledPrintCost = Number((quote.unitPrintCost + commission).toFixed(2));
  const orderRes = await createPayPalOrder({
    items: [
      { name: "Custom Book License (46 Pages)", unitAmount: quote46.priceUsd, quantity: 1, category: "DIGITAL_GOODS" },
      { name: "Lulu Print & Bind (Archival Softcover)", unitAmount: bundledPrintCost, quantity: 1, category: "PHYSICAL_GOODS" },
    ],
    shippingAmount: quote.shippingCost,
    requireShippingAddress: true,
  });
  console.log("✔ PayPal Order Created with Bundled Print & Commission:", orderRes);

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

  // 6. Test Cover Prompt Fidelity (Zero Forced Children's/Text Boilerplate) & Midnight Black Cover PDF
  const customCoverScene =
    "I want a black cover with the golden man standing in the bottom middle and money is pouring on him";
  const enhancedCoverPrompt = getCleanIllustrationPrompt(
    customCoverScene,
    "",
    "",
    "standard_color",
    { isCover: true, coverColorScheme: "midnight_black" }
  );
  if (
    !enhancedCoverPrompt.includes(customCoverScene) ||
    enhancedCoverPrompt.includes("Children's book illustration") ||
    !enhancedCoverPrompt.includes("NO text") ||
    !enhancedCoverPrompt.includes("#0A0A0C")
  ) {
    throw new Error(`Cover prompt failed fidelity check: ${enhancedCoverPrompt}`);
  }
  console.log("✔ Custom Midnight Black Cover Prompt Fidelity Verified");

  const blackCoverBook = {
    ...sampleBook,
    id: "test_book_black_cover",
    title: "The Golden Rain",
    subtitle: "Wealth & Mindset Logbook",
    authorName: "",
    pages: samplePages.slice(0, 6),
    pageCount: 6,
    cover: {
      title: "The Golden Rain",
      subtitle: "Wealth & Mindset Logbook",
      coverPrompt: customCoverScene,
      backCoverText: "Daily reflections on abundance and discipline.",
      colorScheme: "midnight_black",
      isDesigned: true,
    },
  };
  const blackCoverPdfBytes = await compileBookPdf(blackCoverBook);
  if (!blackCoverPdfBytes || blackCoverPdfBytes.length < 1000) {
    throw new Error("Midnight black cover PDF compilation failed");
  }
  console.log(`✔ Midnight Black Clean Cover PDF Compiled! Size: ${blackCoverPdfBytes.length} bytes`);

  console.log("--- All Smoke Tests Passed at 65% Margin & 10% Commission! ---");
}

runSmokeTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});

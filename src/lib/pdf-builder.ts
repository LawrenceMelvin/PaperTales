import { PDFDocument, rgb, StandardFonts, PDFImage, degrees } from "pdf-lib";
import { BookProject } from "@/types/book";

export type PdfCompileMode = "wysiwyg_full" | "lulu_cover" | "lulu_interior";

export interface PdfCompileOptions {
  mode?: PdfCompileMode;
}

/**
 * Helper to safely embed an image from either a Data URL or external HTTP/HTTPS URL
 */
async function tryEmbedImage(pdfDoc: PDFDocument, url?: string): Promise<PDFImage | null> {
  if (!url) return null;
  try {
    if (url.startsWith("data:image/png;base64,")) {
      const base64Data = url.replace(/^data:image\/png;base64,/, "");
      return await pdfDoc.embedPng(Buffer.from(base64Data, "base64"));
    }
    if (url.startsWith("data:image/jpeg;base64,") || url.startsWith("data:image/jpg;base64,")) {
      const base64Data = url.replace(/^data:image\/jpe?g;base64,/, "");
      return await pdfDoc.embedJpg(Buffer.from(base64Data, "base64"));
    }
    if (url.startsWith("http://") || url.startsWith("https://")) {
      const res = await fetch(url, { signal: AbortSignal.timeout(8500) });
      if (res.ok) {
        const arrayBuffer = await res.arrayBuffer();
        try {
          return await pdfDoc.embedPng(arrayBuffer);
        } catch {
          return await pdfDoc.embedJpg(arrayBuffer);
        }
      }
    }
  } catch (err) {
    console.warn("Could not embed image into PDF:", err);
  }
  return null;
}

/**
 * Calculates Lulu POD spine width in inches and points based on page count & paper stock (60# Uncoated)
 */
export function calculateLuluSpineWidth(pageCount: number): { spineInches: number; spinePoints: number } {
  if (pageCount < 32) {
    // Saddle-stitch binding: no spine thickness
    return { spineInches: 0, spinePoints: 0 };
  }
  // Perfect-bound formula for 60# White paper (PPI = 444)
  const spineInches = Number(((pageCount / 444) + 0.06).toFixed(3));
  return { spineInches, spinePoints: spineInches * 72 };
}

/**
 * Assembles high-resolution print-ready PDFs:
 * - mode === "wysiwyg_full": Exact 2-page spread parity with the Studio BookViewer (Spread 0 = Wraparound Cover, Spread 1..N = Story + Edge-to-Edge illustration)
 * - mode === "lulu_cover": Single-page [Back Cover | Spine | Front Cover] wraparound cover PDF with 0.125" (9 pt) outer bleed
 * - mode === "lulu_interior": Interior-only PDF with 0.125" bleed, inserting blank backing pages if singleSidedColoring is true
 */
export async function compileBookPdf(book: BookProject, options?: PdfCompileOptions): Promise<Uint8Array> {
  const mode = options?.mode || "wysiwyg_full";
  const pdfDoc = await PDFDocument.create();

  const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const timesNormal = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const courier = await pdfDoc.embedFont(StandardFonts.Courier);
  const courierBold = await pdfDoc.embedFont(StandardFonts.CourierBold);

  // Base trim dimensions (72 pt / inch)
  const trimSize = book.format?.trimSize || "8.5x8.5";
  let TRIM_WIDTH = 612; // 8.5"
  let TRIM_HEIGHT = 612; // 8.5"

  if (trimSize === "6x9") {
    TRIM_WIDTH = 432;  // 6.00 inches
    TRIM_HEIGHT = 648; // 9.00 inches
  } else if (trimSize === "8.5x11") {
    TRIM_WIDTH = 612;  // 8.50 inches
    TRIM_HEIGHT = 792; // 11.00 inches
  }

  const BLEED_PT = 9; // 0.125 inches (Lulu POD bleed standard)
  const pageCount = book.pageCount || book.pages.length || 6;
  const { spinePoints } = calculateLuluSpineWidth(pageCount);

  const coverTitle = book.cover?.title || book.title;
  const coverSubtitle = book.cover?.subtitle || book.subtitle;
  const coverAuthor = book.cover?.authorByline || book.authorName || "Personal Keepsake Edition";

  // =========================================================================
  // MODE 1: LULU COVER PDF (Single Wraparound Page: Back + Spine + Front)
  // =========================================================================
  if (mode === "lulu_cover") {
    const totalCoverWidth = (TRIM_WIDTH * 2) + spinePoints + (BLEED_PT * 2);
    const totalCoverHeight = TRIM_HEIGHT + (BLEED_PT * 2);
    const coverPage = pdfDoc.addPage([totalCoverWidth, totalCoverHeight]);

    // Background color (e.g. Midnight Glacier)
    const isDark = book.cover?.colorScheme !== "warm_cream" && book.cover?.colorScheme !== "minimal_monochrome";
    if (isDark) {
      coverPage.drawRectangle({
        x: 0,
        y: 0,
        width: totalCoverWidth,
        height: totalCoverHeight,
        color: rgb(0.06, 0.09, 0.14), // #0f1524
      });
    }

    // 1. Back Cover Area: x = BLEED_PT, width = TRIM_WIDTH
    const backX = BLEED_PT;
    const backY = BLEED_PT;
    coverPage.drawText("BACK COVER • KEEPSAKE EDITION", {
      x: backX + 36,
      y: backY + TRIM_HEIGHT - 54,
      size: 9,
      font: helveticaBold,
      color: rgb(0.49, 0.83, 0.99),
    });

    coverPage.drawText(coverTitle, {
      x: backX + 36,
      y: backY + TRIM_HEIGHT - 90,
      size: 18,
      font: timesBold,
      color: isDark ? rgb(1, 1, 1) : rgb(0.1, 0.1, 0.1),
      maxWidth: TRIM_WIDTH - 72,
    });

    const backText = book.cover?.backCoverText ||
      `Step inside a personalized bedtime journey crafted with love. Starring ${book.character?.name || "our hero"}, this archival edition preserves precious memories and sparks boundless imagination.`;

    coverPage.drawText(backText, {
      x: backX + 36,
      y: backY + TRIM_HEIGHT - 130,
      size: 11,
      font: timesNormal,
      color: isDark ? rgb(0.8, 0.85, 0.9) : rgb(0.2, 0.2, 0.2),
      maxWidth: TRIM_WIDTH - 72,
      lineHeight: 16,
    });

    // Back Cover Barcode placeholder
    coverPage.drawText("ISBN 978-0-PT-AI-2026 • Lulu Direct POD", {
      x: backX + 36,
      y: backY + 45,
      size: 9,
      font: courier,
      color: rgb(0.5, 0.5, 0.5),
    });

    // 2. Spine Area (if perfect bound with thickness)
    const spineX = BLEED_PT + TRIM_WIDTH;
    if (spinePoints > 14) {
      coverPage.drawText(coverTitle, {
        x: spineX + (spinePoints / 2) - 4,
        y: backY + TRIM_HEIGHT / 2,
        size: 8,
        font: helveticaBold,
        color: isDark ? rgb(1, 1, 1) : rgb(0.1, 0.1, 0.1),
        rotate: degrees(270),
      });
    }

    // 3. Front Cover Area: x = BLEED_PT + TRIM_WIDTH + spinePoints
    const frontX = BLEED_PT + TRIM_WIDTH + spinePoints;
    const frontY = BLEED_PT;

    // Header
    coverPage.drawText(coverTitle, {
      x: frontX + 36,
      y: frontY + TRIM_HEIGHT - 54,
      size: 20,
      font: timesBold,
      color: isDark ? rgb(1, 1, 1) : rgb(0.1, 0.1, 0.1),
    });

    if (coverSubtitle) {
      coverPage.drawText(coverSubtitle, {
        x: frontX + 36,
        y: frontY + TRIM_HEIGHT - 74,
        size: 11,
        font: timesItalic,
        color: isDark ? rgb(0.7, 0.8, 0.9) : rgb(0.3, 0.3, 0.3),
      });
    }

    // Embed Front Cover Image edge-to-edge
    const coverImg = await tryEmbedImage(pdfDoc, book.cover?.imageUrl || book.pages[0]?.imageUrl);
    if (coverImg) {
      const imgWidth = TRIM_WIDTH - 72;
      const imgHeight = TRIM_HEIGHT - 160;
      const dims = coverImg.scaleToFit(imgWidth, imgHeight);
      coverPage.drawImage(coverImg, {
        x: frontX + 36 + (imgWidth - dims.width) / 2,
        y: frontY + 70 + (imgHeight - dims.height) / 2,
        width: dims.width,
        height: dims.height,
      });
    }

    // Footer
    coverPage.drawText(`By: ${coverAuthor}`, {
      x: frontX + 36,
      y: frontY + 40,
      size: 11,
      font: timesNormal,
      color: isDark ? rgb(0.9, 0.9, 0.9) : rgb(0.2, 0.2, 0.2),
    });

    return await pdfDoc.save();
  }

  // =========================================================================
  // MODE 2: LULU INTERIOR PDF (Interior Pages Only with 0.125" Bleed)
  // =========================================================================
  if (mode === "lulu_interior") {
    const pageWidthWithBleed = TRIM_WIDTH + (BLEED_PT * 2);
    const pageHeightWithBleed = TRIM_HEIGHT + (BLEED_PT * 2);

    for (const page of book.pages) {
      // 1. Story / Text Leaf (Left page)
      const pStory = pdfDoc.addPage([pageWidthWithBleed, pageHeightWithBleed]);
      pStory.drawText(page.title, {
        x: BLEED_PT + 36,
        y: BLEED_PT + TRIM_HEIGHT - 54,
        size: 16,
        font: timesBold,
        color: rgb(0.1, 0.1, 0.1),
      });

      pStory.drawText(page.storyText || "", {
        x: BLEED_PT + 36,
        y: BLEED_PT + TRIM_HEIGHT - 80,
        size: 12,
        font: timesNormal,
        color: rgb(0.2, 0.2, 0.2),
        maxWidth: TRIM_WIDTH - 72,
        lineHeight: 18,
      });

      if (book.singleSidedColoring) {
        pStory.drawText("🛡️ Single-Sided Bleed Guard (Reverse side kept blank for paints & markers)", {
          x: BLEED_PT + 36,
          y: BLEED_PT + 36,
          size: 9,
          font: helvetica,
          color: rgb(0.3, 0.6, 0.8),
        });
      }

      // 2. Illustration Leaf (Right page)
      const pArt = pdfDoc.addPage([pageWidthWithBleed, pageHeightWithBleed]);
      const pageImage = await tryEmbedImage(pdfDoc, page.imageUrl);
      if (pageImage) {
        const maxWidth = TRIM_WIDTH - 40;
        const maxHeight = TRIM_HEIGHT - 60;
        const dims = pageImage.scaleToFit(maxWidth, maxHeight);
        pArt.drawImage(pageImage, {
          x: BLEED_PT + 20 + (maxWidth - dims.width) / 2,
          y: BLEED_PT + 30 + (maxHeight - dims.height) / 2,
          width: dims.width,
          height: dims.height,
        });
      }

      // If singleSidedColoring is enabled for physical POD, insert a blank backing page
      if (book.singleSidedColoring) {
        pdfDoc.addPage([pageWidthWithBleed, pageHeightWithBleed]);
      }
    }

    return await pdfDoc.save();
  }

  // =========================================================================
  // MODE 3: WYSIWYG FULL SPREAD PDF (Exact 2-Page Spread Matching BookViewer)
  // =========================================================================
  const SPREAD_WIDTH = TRIM_WIDTH * 2;
  const SPREAD_HEIGHT = TRIM_HEIGHT;

  // Spread 0: Wraparound Cover [Back Cover | Front Cover]
  const coverSpread = pdfDoc.addPage([SPREAD_WIDTH, SPREAD_HEIGHT]);
  const isDarkCover = book.cover?.colorScheme !== "warm_cream" && book.cover?.colorScheme !== "minimal_monochrome";
  if (isDarkCover) {
    coverSpread.drawRectangle({
      x: 0,
      y: 0,
      width: SPREAD_WIDTH,
      height: SPREAD_HEIGHT,
      color: rgb(0.06, 0.09, 0.14),
    });
  }

  // Left Leaf: Back Cover
  coverSpread.drawText("BACK COVER • KEEPSAKE EDITION", {
    x: 40,
    y: SPREAD_HEIGHT - 54,
    size: 9,
    font: helveticaBold,
    color: rgb(0.49, 0.83, 0.99),
  });

  coverSpread.drawText(coverTitle, {
    x: 40,
    y: SPREAD_HEIGHT - 90,
    size: 20,
    font: timesBold,
    color: isDarkCover ? rgb(1, 1, 1) : rgb(0.1, 0.1, 0.1),
    maxWidth: TRIM_WIDTH - 80,
  });

  const backBlurb = book.cover?.backCoverText ||
    `Step into the magical world of ${coverTitle}. Starring ${book.character?.name || "our hero"}, this personalized keepsake edition preserves precious memories and sparks boundless imagination.`;

  coverSpread.drawText(backBlurb, {
    x: 40,
    y: SPREAD_HEIGHT - 130,
    size: 11,
    font: timesNormal,
    color: isDarkCover ? rgb(0.8, 0.85, 0.9) : rgb(0.2, 0.2, 0.2),
    maxWidth: TRIM_WIDTH - 80,
    lineHeight: 16,
  });

  coverSpread.drawText("ISBN 978-0-PT-AI-2026 • Lulu Direct 300 DPI", {
    x: 40,
    y: 40,
    size: 9,
    font: courier,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Center Spine Divider
  coverSpread.drawLine({
    start: { x: TRIM_WIDTH, y: 0 },
    end: { x: TRIM_WIDTH, y: SPREAD_HEIGHT },
    thickness: 1,
    color: isDarkCover ? rgb(0.2, 0.3, 0.4) : rgb(0.8, 0.8, 0.8),
  });

  // Right Leaf: Front Cover
  const frontStartX = TRIM_WIDTH;
  coverSpread.drawText(coverTitle, {
    x: frontStartX + 40,
    y: SPREAD_HEIGHT - 54,
    size: 22,
    font: timesBold,
    color: isDarkCover ? rgb(1, 1, 1) : rgb(0.1, 0.1, 0.1),
  });

  if (coverSubtitle) {
    coverSpread.drawText(coverSubtitle, {
      x: frontStartX + 40,
      y: SPREAD_HEIGHT - 76,
      size: 12,
      font: timesItalic,
      color: isDarkCover ? rgb(0.7, 0.8, 0.9) : rgb(0.3, 0.3, 0.3),
    });
  }

  const coverImg = await tryEmbedImage(pdfDoc, book.cover?.imageUrl || book.pages[0]?.imageUrl);
  if (coverImg) {
    const imgWidth = TRIM_WIDTH - 80;
    const imgHeight = SPREAD_HEIGHT - 160;
    const dims = coverImg.scaleToFit(imgWidth, imgHeight);
    coverSpread.drawImage(coverImg, {
      x: frontStartX + 40 + (imgWidth - dims.width) / 2,
      y: 70 + (imgHeight - dims.height) / 2,
      width: dims.width,
      height: dims.height,
    });
  }

  coverSpread.drawText(`By: ${coverAuthor}`, {
    x: frontStartX + 40,
    y: 40,
    size: 11,
    font: timesNormal,
    color: isDarkCover ? rgb(0.9, 0.9, 0.9) : rgb(0.2, 0.2, 0.2),
  });

  // Interior Spreads
  for (const page of book.pages) {
    const spread = pdfDoc.addPage([SPREAD_WIDTH, SPREAD_HEIGHT]);

    // Center seam line
    spread.drawLine({
      start: { x: TRIM_WIDTH, y: 0 },
      end: { x: TRIM_WIDTH, y: SPREAD_HEIGHT },
      thickness: 0.75,
      color: rgb(0.85, 0.85, 0.85),
    });

    // Left Leaf: Story Text & Title
    spread.drawText(page.title, {
      x: 40,
      y: SPREAD_HEIGHT - 54,
      size: 18,
      font: timesBold,
      color: rgb(0.1, 0.1, 0.1),
    });

    spread.drawText(page.storyText || "", {
      x: 40,
      y: SPREAD_HEIGHT - 85,
      size: 12,
      font: timesNormal,
      color: rgb(0.2, 0.2, 0.2),
      maxWidth: TRIM_WIDTH - 80,
      lineHeight: 18,
    });

    if (book.singleSidedColoring) {
      spread.drawText("🛡️ Single-Sided Bleed Guard (Back page protected for markers & watercolors)", {
        x: 40,
        y: 40,
        size: 9,
        font: helvetica,
        color: rgb(0.2, 0.5, 0.7),
      });
    }

    spread.drawText(`Page ${page.pageNumber}`, {
      x: 40,
      y: 24,
      size: 9,
      font: helvetica,
      color: rgb(0.6, 0.6, 0.6),
    });

    // Right Leaf: Edge-to-Edge Illustration without any thick outer black border
    const rightStartX = TRIM_WIDTH;
    const pageImage = await tryEmbedImage(pdfDoc, page.imageUrl);
    if (pageImage) {
      const maxWidth = TRIM_WIDTH - 40;
      const maxHeight = SPREAD_HEIGHT - 60;
      const dims = pageImage.scaleToFit(maxWidth, maxHeight);
      spread.drawImage(pageImage, {
        x: rightStartX + 20 + (maxWidth - dims.width) / 2,
        y: 30 + (maxHeight - dims.height) / 2,
        width: dims.width,
        height: dims.height,
      });
    } else {
      spread.drawText(`[ Page ${page.pageNumber} Illustration ]`, {
        x: rightStartX + TRIM_WIDTH / 2 - 60,
        y: SPREAD_HEIGHT / 2,
        size: 12,
        font: helvetica,
        color: rgb(0.5, 0.5, 0.5),
      });
    }

    spread.drawText(`Page ${page.pageNumber} Art`, {
      x: rightStartX + TRIM_WIDTH - 90,
      y: 24,
      size: 9,
      font: helvetica,
      color: rgb(0.6, 0.6, 0.6),
    });
  }

  return await pdfDoc.save();
}

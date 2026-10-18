import { PDFDocument, rgb, StandardFonts, PDFImage, degrees } from "pdf-lib";
import { BookProject } from "@/types/book";

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
 * Assembles high-resolution print-ready PDFs formatted for Lulu POD:
 * - 6" x 9" US Trade Digest (432 x 648 pt) for Personal Guided Journals & Planners
 * - 8.5" x 8.5" Square (612 x 612 pt) for Personalized Bedtime Storybooks & Coloring
 * - 8.5" x 11" Letter (612 x 792 pt) for Activity & Workbooks
 */
export async function compileBookPdf(book: BookProject): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const timesNormal = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const courier = await pdfDoc.embedFont(StandardFonts.Courier);
  const courierBold = await pdfDoc.embedFont(StandardFonts.CourierBold);

  // Determine trim size dimensions in standard 72 pt/in
  const trimSize = book.format?.trimSize || "8.5x8.5";
  let PAGE_WIDTH = 612;
  let PAGE_HEIGHT = 612;

  if (trimSize === "6x9") {
    PAGE_WIDTH = 432;  // 6.00 inches
    PAGE_HEIGHT = 648; // 9.00 inches
  } else if (trimSize === "8.5x11") {
    PAGE_WIDTH = 612;  // 8.50 inches
    PAGE_HEIGHT = 792; // 11.00 inches
  }

  const isJournal =
    trimSize === "6x9" ||
    book.genre === "memory_book" ||
    Boolean(book.pages.some((p) => p.journalData)) ||
    /\b(journal|diary|planner|reflection|gratitude|notes)\b/i.test(book.title || "");

  const safeMargin = 36; // 0.5 inches safe margin for Lulu POD

  // =========================================================================
  // 1. FRONT COVER SPREAD
  // =========================================================================
  const coverPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const { width: cWidth, height: cHeight } = coverPage.getSize();

  // Double decorative border
  coverPage.drawRectangle({
    x: 20,
    y: 20,
    width: cWidth - 40,
    height: cHeight - 40,
    borderColor: rgb(0.15, 0.15, 0.15),
    borderWidth: 2,
  });

  coverPage.drawRectangle({
    x: 24,
    y: 24,
    width: cWidth - 48,
    height: cHeight - 48,
    borderColor: rgb(0.4, 0.4, 0.4),
    borderWidth: 0.75,
  });

  // Top Category Pill
  coverPage.drawText(
    isJournal ? "PERSONAL REFLECTION JOURNAL" : "PERSONALIZED COLORING & STORYBOOK",
    {
      x: safeMargin,
      y: cHeight - 55,
      size: 9,
      font: helveticaBold,
      color: rgb(0.35, 0.35, 0.35),
    }
  );

  // Book Title
  const titleFontSize = trimSize === "6x9" ? 22 : 26;
  coverPage.drawText(book.title, {
    x: safeMargin,
    y: cHeight - 85,
    size: titleFontSize,
    font: timesBold,
    color: rgb(0.08, 0.08, 0.08),
    maxWidth: cWidth - safeMargin * 2,
  });

  // Subtitle
  if (book.subtitle) {
    coverPage.drawText(book.subtitle, {
      x: safeMargin,
      y: cHeight - 110,
      size: 11,
      font: timesItalic,
      color: rgb(0.3, 0.3, 0.3),
      maxWidth: cWidth - safeMargin * 2,
    });
  }

  // Cover Graphic Frame / Embedded Illustration
  const coverBoxY = 125;
  const coverBoxHeight = cHeight - 250;
  const coverBoxWidth = cWidth - safeMargin * 2;

  coverPage.drawRectangle({
    x: safeMargin,
    y: coverBoxY,
    width: coverBoxWidth,
    height: coverBoxHeight,
    borderColor: rgb(0.2, 0.2, 0.2),
    borderWidth: 1.5,
  });

  // Check if first page has an image to feature on the cover
  const featuredImage = await tryEmbedImage(pdfDoc, book.pages[0]?.imageUrl);
  if (featuredImage) {
    const imgDims = featuredImage.scaleToFit(coverBoxWidth - 10, coverBoxHeight - 10);
    coverPage.drawImage(featuredImage, {
      x: safeMargin + (coverBoxWidth - imgDims.width) / 2,
      y: coverBoxY + (coverBoxHeight - imgDims.height) / 2,
      width: imgDims.width,
      height: imgDims.height,
    });
  } else {
    // Vector cover placeholder
    coverPage.drawText(
      isJournal ? "[ Guided Reflection & Creativity Edition ]" : `[ Featuring ${book.character.name} ]`,
      {
        x: cWidth / 2 - (isJournal ? 95 : 65),
        y: coverBoxY + coverBoxHeight / 2,
        size: 13,
        font: helvetica,
        color: rgb(0.45, 0.45, 0.45),
      }
    );
  }

  // Author byline & Lulu POD print marks
  coverPage.drawText(`Created by: ${book.authorName}`, {
    x: safeMargin,
    y: 55,
    size: 11,
    font: timesNormal,
    color: rgb(0.2, 0.2, 0.2),
  });

  coverPage.drawText(
    trimSize === "6x9" ? "Lulu POD 6\" × 9\" US Trade" : "Lulu POD 8.5\" × 8.5\" Square",
    {
      x: cWidth - safeMargin - 120,
      y: 55,
      size: 9,
      font: helvetica,
      color: rgb(0.5, 0.5, 0.5),
    }
  );

  // =========================================================================
  // 2. INTERIOR PAGES
  // =========================================================================
  for (const page of book.pages) {
    const p = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    const { width, height } = p.getSize();

    if (isJournal) {
      // ---------------------------------------------------------------------
      // DUAL-ENGINE JOURNAL LAYOUT: College-Ruled + Guided Reflection
      // ---------------------------------------------------------------------
      const isBlackAndWhite = book.format?.interiorColor === "black_and_white";
      const rawBorder = page.journalData?.borderText;
      const borderText =
        rawBorder && typeof rawBorder === "string" && rawBorder.trim().length <= 30 && !rawBorder.includes(".")
          ? rawBorder.trim()
          : undefined;
      const borderStyle = page.journalData?.borderStyle || "none";
      const cornerDecorations = page.journalData?.cornerDecorations || "none";
      const isRobotic = borderStyle === "robotic" || cornerDecorations === "tech_brackets";
      const layoutType = page.journalData?.layoutType;
      const isEmptyLined = layoutType === "empty_lined";
      const bFont = isRobotic ? courierBold : helveticaBold;

      // Draw Perimeter Border Text & Corner Brackets (if requested)
      if (borderText) {
        const bSize = 6.5;
        const bColor = rgb(0.35, 0.35, 0.35);
        const topBottomRepeat = Array(6).fill(borderText).join("  --  ");
        const leftRightRepeat = Array(5).fill(borderText).join("  --  ");

        // Top perimeter
        const topW = bFont.widthOfTextAtSize(topBottomRepeat, bSize);
        p.drawText(topBottomRepeat, {
          x: Math.max(16, (width - topW) / 2),
          y: height - 16,
          size: bSize,
          font: bFont,
          color: bColor,
        });

        // Bottom perimeter
        const botW = bFont.widthOfTextAtSize(topBottomRepeat, bSize);
        p.drawText(topBottomRepeat, {
          x: Math.max(16, (width - botW) / 2),
          y: 12,
          size: bSize,
          font: bFont,
          color: bColor,
        });

        // Left perimeter (rotated 90 degrees)
        const leftW = bFont.widthOfTextAtSize(leftRightRepeat, bSize);
        p.drawText(leftRightRepeat, {
          x: 15,
          y: Math.max(20, (height - leftW) / 2),
          size: bSize,
          font: bFont,
          color: bColor,
          rotate: degrees(90),
        });

        // Right perimeter (rotated 270 degrees)
        const rightW = bFont.widthOfTextAtSize(leftRightRepeat, bSize);
        p.drawText(leftRightRepeat, {
          x: width - 11,
          y: Math.min(height - 20, (height + rightW) / 2),
          size: bSize,
          font: bFont,
          color: bColor,
          rotate: degrees(270),
        });
      }

      // Corner Tech Decorations (e.g. <code_day_1> and </code_day_1>)
      if (cornerDecorations === "tech_brackets") {
        const tagSize = 7.5;
        const tagColor = rgb(0.2, 0.2, 0.2);
        p.drawText(`<code_day_${page.pageNumber}>`, {
          x: safeMargin,
          y: height - 28,
          size: tagSize,
          font: courierBold,
          color: tagColor,
        });
        p.drawText(`</code_day_${page.pageNumber}>`, {
          x: width - safeMargin - 65,
          y: height - 28,
          size: tagSize,
          font: courierBold,
          color: tagColor,
        });
        p.drawText(`[0x${page.pageNumber.toString(16).padStart(2, "0")}]`, {
          x: safeMargin,
          y: 22,
          size: tagSize,
          font: courierBold,
          color: tagColor,
        });
        p.drawText(`_EOF`, {
          x: width - safeMargin - 25,
          y: 22,
          size: tagSize,
          font: courierBold,
          color: tagColor,
        });
      }

      // Top Header Row: Day & Date
      p.drawText(`DAY ${page.pageNumber}`, {
        x: safeMargin,
        y: height - 48,
        size: 13,
        font: isRobotic ? courierBold : helveticaBold,
        color: rgb(0.1, 0.1, 0.1),
      });

      // Header Row Category/Title
      const dayHeader =
        page.journalData?.headerCategory ||
        book.title ||
        `Day ${page.journalData?.dayNumber || page.pageNumber}`;

      p.drawText(dayHeader, {
        x: safeMargin + 54,
        y: height - 48,
        size: 11,
        font: isRobotic ? courierBold : helveticaBold,
        color: rgb(0.1, 0.1, 0.1),
        maxWidth: width - safeMargin * 2 - 200,
      });

      p.drawText(page.journalData?.datePlaceholder || "Date: ________________________", {
        x: width - safeMargin - 150,
        y: height - 48,
        size: 10,
        font: isRobotic ? courier : helvetica,
        color: rgb(0.4, 0.4, 0.4),
      });

      let currentY = height - 60;

      // Mood Tracker Checkboxes (Rendered only if requested and NOT empty lined)
      if (page.journalData?.moodTracker && !isEmptyLined) {
        p.drawText("Today's Mood:  [ ] Radiant   [ ] Joyful   [ ] Calm   [ ] Pensive   [ ] Inspired", {
          x: safeMargin,
          y: currentY,
          size: 8.5,
          font: helvetica,
          color: rgb(0.35, 0.35, 0.35),
        });
        currentY -= 12;
      }

      // Divider
      p.drawLine({
        start: { x: safeMargin, y: currentY },
        end: { x: width - safeMargin, y: currentY },
        thickness: 0.75,
        color: rgb(0.7, 0.7, 0.7),
      });
      currentY -= 18;

      // Optional Daily Inspiration Quote Box
      const hasQuote = Boolean(page.journalData?.quote && page.journalData.quote.trim() !== "");

      if (hasQuote && !isEmptyLined) {
        const quoteText = page.journalData!.quote!;
        p.drawRectangle({
          x: safeMargin,
          y: currentY - 32,
          width: width - safeMargin * 2,
          height: 38,
          borderColor: rgb(0.8, 0.8, 0.8),
          borderWidth: 0.75,
          color: rgb(0.97, 0.98, 0.99),
        });

        p.drawText("DAILY INSPIRATION:", {
          x: safeMargin + 8,
          y: currentY - 10,
          size: 7.5,
          font: helveticaBold,
          color: isBlackAndWhite ? rgb(0.2, 0.2, 0.2) : rgb(0.2, 0.45, 0.65),
        });

        p.drawText(`"${quoteText}"`, {
          x: safeMargin + 8,
          y: currentY - 24,
          size: 9,
          font: timesItalic,
          color: rgb(0.2, 0.2, 0.2),
          maxWidth: width - safeMargin * 2 - 16,
        });

        currentY -= 50;
      }

      const sections = page.journalData?.sections;
      const hasSections = Boolean(sections && sections.length > 0);

      if (isEmptyLined) {
        // 1. EMPTY LINED LAYOUT: Continuous ruled lines with zero unsolicited prompts
        const bottomLimit = 46;
        while (currentY >= bottomLimit) {
          p.drawLine({
            start: { x: safeMargin, y: currentY },
            end: { x: width - safeMargin, y: currentY },
            thickness: 0.6,
            color: rgb(0.82, 0.82, 0.82),
          });
          currentY -= 22;
        }
      } else if (hasSections) {
        // 2. Multi-section layout (e.g. Upper "I will do", Lower "What I did")
        for (let sIdx = 0; sIdx < sections!.length; sIdx++) {
          const sec = sections![sIdx];
          // Section Title
          p.drawText(sec.title.toUpperCase(), {
            x: safeMargin,
            y: currentY,
            size: 10,
            font: isRobotic ? courierBold : helveticaBold,
            color: isBlackAndWhite ? rgb(0.1, 0.1, 0.1) : rgb(0.12, 0.35, 0.6),
          });

          // Optional prompt
          if (sec.prompt) {
            p.drawText(sec.prompt, {
              x: safeMargin + Math.min(sec.title.length * 6.5 + 8, 140),
              y: currentY,
              size: 8.5,
              font: timesItalic,
              color: rgb(0.4, 0.4, 0.4),
              maxWidth: width - safeMargin * 2 - 150,
            });
          }

          currentY -= 18;

          // Ruled lines for this section
          const secLines = sec.linesCount || 7;
          for (let l = 0; l < secLines; l++) {
            if (currentY < 46) break;
            p.drawLine({
              start: { x: safeMargin, y: currentY },
              end: { x: width - safeMargin, y: currentY },
              thickness: 0.6,
              color: rgb(0.82, 0.82, 0.82),
            });
            currentY -= 20;
          }

          currentY -= 10; // Spacing before next section
        }
      } else {
        // 3. Guided Reflection Question or Section Title
        const reflectionText =
          page.journalData?.reflectionPrompt ||
          "Notes & Daily Reflection:";
        p.drawText(reflectionText, {
          x: safeMargin,
          y: currentY,
          size: 9.5,
          font: timesBold,
          color: rgb(0.15, 0.15, 0.15),
          maxWidth: width - safeMargin * 2,
        });

        currentY -= 22;

        // Authentic College-Ruled Lines for Pen & Pencil (Spacing = 22 pt)
        const bottomLimit = 46;
        while (currentY >= bottomLimit) {
          p.drawLine({
            start: { x: safeMargin, y: currentY },
            end: { x: width - safeMargin, y: currentY },
            thickness: 0.6,
            color: rgb(0.82, 0.82, 0.82),
          });
          currentY -= 22;
        }
      }

      // Embed daily themed spot illustration if present (Bottom-Right Corner)
      if (page.imageUrl) {
        const spotImg = await tryEmbedImage(pdfDoc, page.imageUrl);
        if (spotImg) {
          const imgSize = 75; // 75 pt x 75 pt spot illustration
          const imgX = width - safeMargin - imgSize - 4;
          const imgY = 46; // sits right above bottom margin

          // Clean white box to cleanly mask lines behind the illustration
          p.drawRectangle({
            x: imgX - 4,
            y: imgY - 4,
            width: imgSize + 8,
            height: imgSize + 8,
            color: rgb(1, 1, 1),
            borderColor: rgb(0.8, 0.8, 0.8),
            borderWidth: 0.75,
          });

          p.drawImage(spotImg, {
            x: imgX,
            y: imgY,
            width: imgSize,
            height: imgSize,
          });
        }
      }

      // Page Number Footer
      p.drawText(`Page ${page.pageNumber}`, {
        x: width / 2 - 14,
        y: 22,
        size: 8.5,
        font: isRobotic ? courier : helvetica,
        color: rgb(0.45, 0.45, 0.45),
      });
    } else {
      // ---------------------------------------------------------------------
      // STANDARD STORYBOOK & COLORING ADVENTURE LAYOUT
      // ---------------------------------------------------------------------

      // Page Title
      p.drawText(page.title, {
        x: safeMargin,
        y: height - 50,
        size: 16,
        font: timesBold,
        color: rgb(0.1, 0.1, 0.1),
      });

      // Story Text / Reading Prompt Caption
      p.drawText(page.storyText, {
        x: safeMargin,
        y: height - 72,
        size: 11,
        font: timesNormal,
        color: rgb(0.2, 0.2, 0.2),
        maxWidth: width - safeMargin * 2,
        lineHeight: 14,
      });

      // Coloring Vector Box / Frame
      const artBoxY = 60;
      const artBoxHeight = height - 150;
      const artBoxWidth = width - safeMargin * 2;

      p.drawRectangle({
        x: safeMargin,
        y: artBoxY,
        width: artBoxWidth,
        height: artBoxHeight,
        borderColor: rgb(0.15, 0.15, 0.15),
        borderWidth: 1.5,
      });

      // Embed illustration if generated
      const pageImage = await tryEmbedImage(pdfDoc, page.imageUrl);
      if (pageImage) {
        const dims = pageImage.scaleToFit(artBoxWidth - 10, artBoxHeight - 10);
        p.drawImage(pageImage, {
          x: safeMargin + (artBoxWidth - dims.width) / 2,
          y: artBoxY + (artBoxHeight - dims.height) / 2,
          width: dims.width,
          height: dims.height,
        });
      } else {
        p.drawText(`[ Page ${page.pageNumber}: Vector Coloring Art ]`, {
          x: width / 2 - 90,
          y: artBoxY + artBoxHeight / 2,
          size: 12,
          font: helvetica,
          color: rgb(0.45, 0.45, 0.45),
        });
      }

      // Page Number Footer
      p.drawText(`Page ${page.pageNumber}`, {
        x: width / 2 - 16,
        y: 28,
        size: 10,
        font: helvetica,
        color: rgb(0.4, 0.4, 0.4),
      });
    }
  }

  return await pdfDoc.save();
}

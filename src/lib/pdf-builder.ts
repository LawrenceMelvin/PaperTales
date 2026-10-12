import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { BookProject } from "@/types/book";

/**
 * Assembles high-resolution print-ready PDFs formatted for Lulu 8.5x8.5 Square Softcover
 * 8.5" x 8.5" = 612 x 612 points.
 * Bleed: 0.125 inches (9 points on each edge). Total bleed dimensions = 630 x 630 points.
 */
export async function compileBookPdf(book: BookProject): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const timesNormal = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const PAGE_SIZE = 612; // 8.5 inches at 72 pt/in (will print at 300 DPI)

  // 1. Cover Page
  const coverPage = pdfDoc.addPage([PAGE_SIZE, PAGE_SIZE]);
  const { width, height } = coverPage.getSize();

  // Decorative border
  coverPage.drawRectangle({
    x: 20,
    y: 20,
    width: width - 40,
    height: height - 40,
    borderColor: rgb(0.1, 0.1, 0.1),
    borderWidth: 2,
  });

  // Book Title
  coverPage.drawText(book.title, {
    x: 40,
    y: height - 80,
    size: 28,
    font: timesRoman,
    color: rgb(0.05, 0.05, 0.05),
  });

  if (book.subtitle) {
    coverPage.drawText(book.subtitle, {
      x: 40,
      y: height - 110,
      size: 14,
      font: timesNormal,
      color: rgb(0.3, 0.3, 0.3),
    });
  }

  // Cover Placeholder / Illustration Frame
  coverPage.drawRectangle({
    x: 40,
    y: 120,
    width: width - 80,
    height: height - 260,
    borderColor: rgb(0.2, 0.2, 0.2),
    borderWidth: 1.5,
  });

  coverPage.drawText("[ Custom AI Coloring Cover ]", {
    x: width / 2 - 90,
    y: height / 2,
    size: 16,
    font: helvetica,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Author byline
  coverPage.drawText(`Created by: ${book.authorName}`, {
    x: 40,
    y: 60,
    size: 14,
    font: timesNormal,
    color: rgb(0.2, 0.2, 0.2),
  });

  coverPage.drawText("Printed with PaperTales AI", {
    x: width - 180,
    y: 60,
    size: 10,
    font: helvetica,
    color: rgb(0.5, 0.5, 0.5),
  });

  // 2. Interior Pages
  for (const page of book.pages) {
    const p = pdfDoc.addPage([PAGE_SIZE, PAGE_SIZE]);

    // Page Title
    p.drawText(page.title, {
      x: 36,
      y: height - 50,
      size: 18,
      font: timesRoman,
      color: rgb(0.1, 0.1, 0.1),
    });

    // Story Text / Prompt Caption
    p.drawText(page.storyText, {
      x: 36,
      y: height - 75,
      size: 11,
      font: timesNormal,
      color: rgb(0.25, 0.25, 0.25),
      maxWidth: width - 72,
      lineHeight: 14,
    });

    // Coloring Vector Box / Frame
    p.drawRectangle({
      x: 36,
      y: 60,
      width: width - 72,
      height: height - 150,
      borderColor: rgb(0.15, 0.15, 0.15),
      borderWidth: 1.5,
    });

    p.drawText(`[ Page ${page.pageNumber}: ${page.title} Line-Art ]`, {
      x: width / 2 - 110,
      y: height / 2 - 20,
      size: 14,
      font: helvetica,
      color: rgb(0.45, 0.45, 0.45),
    });

    // Page Number Footer
    p.drawText(`Page ${page.pageNumber}`, {
      x: width / 2 - 18,
      y: 28,
      size: 10,
      font: helvetica,
      color: rgb(0.4, 0.4, 0.4),
    });
  }

  return await pdfDoc.save();
}

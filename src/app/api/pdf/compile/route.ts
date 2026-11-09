import { NextRequest, NextResponse } from "next/server";
import { compileBookPdf, PdfCompileMode } from "@/lib/pdf-builder";
import { BookProject } from "@/types/book";

export async function POST(req: NextRequest) {
  try {
    const urlMode = req.nextUrl.searchParams.get("mode") as PdfCompileMode | null;
    const body = await req.json();
    const book: BookProject = body.book || body;
    const mode: PdfCompileMode = urlMode || body.mode || "wysiwyg_full";

    if (!book || !book.pages || book.pages.length === 0) {
      return NextResponse.json(
        { error: "Invalid book payload. Pages are required." },
        { status: 400 }
      );
    }

    const pdfBytes = await compileBookPdf(book, { mode });
    const cleanTitle = (book.title || "papertales_book").replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const filename =
      mode === "lulu_cover"
        ? `${cleanTitle}_lulu_cover.pdf`
        : mode === "lulu_interior"
        ? `${cleanTitle}_lulu_interior.pdf`
        : `${cleanTitle}_wysiwyg_spread.pdf`;

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("PDF compilation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to compile PDF" },
      { status: 500 }
    );
  }
}

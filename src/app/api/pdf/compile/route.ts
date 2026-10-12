import { NextRequest, NextResponse } from "next/server";
import { compileBookPdf } from "@/lib/pdf-builder";
import { BookProject } from "@/types/book";

export async function POST(req: NextRequest) {
  try {
    const book: BookProject = await req.json();

    if (!book || !book.pages || book.pages.length === 0) {
      return NextResponse.json(
        { error: "Invalid book payload. Pages are required." },
        { status: 400 }
      );
    }

    const pdfBytes = await compileBookPdf(book);

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${book.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_lulu_print.pdf"`,
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

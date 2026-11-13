import { NextRequest, NextResponse } from "next/server";
import { compileBookPdf, PdfCompileMode } from "@/lib/pdf-builder";
import { BookProject } from "@/types/book";
import { AuthError, requireUser } from "@/lib/server/auth";
import { getBookForOwner, hydrateBookSignedUrls } from "@/lib/server/books-repo";
import {
  getSignedReadUrl,
  objectExists,
  ONE_HOUR_SECONDS,
  uploadBuffer,
} from "@/lib/server/storage";

async function getOrCompileStoredPdfUrl(
  uid: string,
  bookId: string,
  mode: PdfCompileMode
): Promise<string | null> {
  const stored = await getBookForOwner(bookId, uid);
  if (!stored) return null;

  const version = stored.contentVersion || 1;
  const objectPath = `users/${uid}/books/${bookId}/pdf/${mode}-v${version}.pdf`;
  const cached = await objectExists(objectPath);
  if (!cached) {
    const hydrated = await hydrateBookSignedUrls(stored);
    const pdfBytes = await compileBookPdf(hydrated as unknown as BookProject, { mode });
    await uploadBuffer(objectPath, Buffer.from(pdfBytes), "application/pdf");
  }

  return getSignedReadUrl(objectPath, ONE_HOUR_SECONDS);
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req, { allowAnonymous: false });
    const bookId = req.nextUrl.searchParams.get("bookId");
    const mode = (req.nextUrl.searchParams.get("mode") as PdfCompileMode) || "wysiwyg_full";

    if (!bookId) {
      return NextResponse.json({ error: "bookId is required" }, { status: 400 });
    }

    const signedUrl = await getOrCompileStoredPdfUrl(user.uid, bookId, mode);
    if (!signedUrl) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    if (req.nextUrl.searchParams.get("format") === "json") {
      return NextResponse.json({ signedUrl });
    }
    return NextResponse.redirect(signedUrl, 302);
  } catch (error: any) {
    if (error instanceof AuthError) return error.toResponse();
    console.error("GET PDF compilation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to compile PDF" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const urlMode = req.nextUrl.searchParams.get("mode") as PdfCompileMode | null;
    const body = await req.json();
    const mode: PdfCompileMode = urlMode || body.mode || "wysiwyg_full";

    if (body.bookId && process.env.REQUIRE_AUTH !== "false") {
      const user = await requireUser(req, { allowAnonymous: false });
      const signedUrl = await getOrCompileStoredPdfUrl(user.uid, body.bookId, mode);
      if (!signedUrl) {
        return NextResponse.json({ error: "Book not found" }, { status: 404 });
      }
      if (req.nextUrl.searchParams.get("format") === "json") {
        return NextResponse.json({ signedUrl });
      }
      return NextResponse.redirect(signedUrl, 302);
    }

    const book: BookProject = body.book || body;
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
    if (error instanceof AuthError) return error.toResponse();
    console.error("PDF compilation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to compile PDF" },
      { status: 500 }
    );
  }
}

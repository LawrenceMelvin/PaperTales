import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { BOOKSTORE_CATALOG, bookstoreItemToBookProject } from "@/lib/bookstore-catalog";
import { compileBookPdf } from "@/lib/pdf-builder";

const KDP_VAULT_ROOT = "C:\\Lawrence\\KDP SKETCH BOOK";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing book id" }, { status: 400 });
    }

    const item = BOOKSTORE_CATALOG.find((b) => b.id === id);
    if (!item) {
      return NextResponse.json({ error: "Book not found in catalog" }, { status: 404 });
    }

    const safeFilename = `${item.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_print_ready.pdf`;

    // 1. Check if the original print-ready PDF exists in C:\Lawrence\KDP SKETCH BOOK
    if (item.sourcePdfRelativePath) {
      const fullPdfPath = path.join(KDP_VAULT_ROOT, item.sourcePdfRelativePath);
      if (fs.existsSync(fullPdfPath)) {
        const stat = fs.statSync(fullPdfPath);
        const nodeStream = fs.createReadStream(fullPdfPath);
        const webStream = new ReadableStream({
          start(controller) {
            nodeStream.on("data", (chunk) => {
              controller.enqueue(new Uint8Array(Buffer.from(chunk)));
            });
            nodeStream.on("end", () => {
              controller.close();
            });
            nodeStream.on("error", (err) => {
              controller.error(err);
            });
          },
          cancel() {
            nodeStream.destroy();
          },
        });

        return new NextResponse(webStream, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Length": stat.size.toString(),
            "Content-Disposition": `attachment; filename="${safeFilename}"`,
            "Cache-Control": "private, max-age=3600",
          },
        });
      }
    }

    // 2. Fallback: compile a 300 DPI PDF using our vector PDF builder & preview pages
    const project = bookstoreItemToBookProject(item);
    const pdfBytes = await compileBookPdf(project);

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeFilename}"`,
      },
    });
  } catch (err: any) {
    console.error("Bookstore asset streaming error:", err);
    return NextResponse.json(
      { error: "Failed to stream bookstore PDF", details: err?.message },
      { status: 500 }
    );
  }
}

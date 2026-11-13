import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { AuthError, requireUser } from "@/lib/server/auth";
import { getBookForOwner } from "@/lib/server/books-repo";
import { debitTokens, InsufficientTokensError } from "@/lib/server/ledger";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser(req, { allowAnonymous: false });
    const { id } = await context.params;
    const { method = "tokens" } = await req.json().catch(() => ({}));

    if (method !== "tokens") {
      return NextResponse.json(
        { error: "Unsupported unlock method. Use PayPal checkout for direct payment." },
        { status: 400 }
      );
    }

    const book = await getBookForOwner(id, user.uid);
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const totalPages = book.pageCount || book.pages.length || 12;
    const alreadyCovered = Math.max(
      book.entitlement?.freePages ?? 1,
      book.entitlement?.paidThrough ?? 0
    );
    const tokensNeeded = Math.max(0, totalPages - alreadyCovered);

    let balanceAfter: number | undefined;
    let txnId: string | undefined;

    if (tokensNeeded > 0) {
      const res = await debitTokens(
        user.uid,
        tokensNeeded,
        id,
        `Unlock ${tokensNeeded} pages for "${book.title}"`
      );
      balanceAfter = res.balanceAfter;
      txnId = res.txnId;
    }

    await getAdminDb()
      .collection("books")
      .doc(id)
      .set(
        {
          entitlement: {
            ...book.entitlement,
            paidThrough: totalPages,
            unlockedBy: "tokens",
            ...(txnId ? { unlockRef: txnId } : {}),
          },
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

    return NextResponse.json({
      success: true,
      tokensDeducted: tokensNeeded,
      paidThrough: totalPages,
      balanceAfter,
      txnId,
    });
  } catch (err) {
    if (err instanceof AuthError) return err.toResponse();
    if (err instanceof InsufficientTokensError) {
      return NextResponse.json(
        {
          error: err.message,
          code: err.code,
          required: err.required,
          available: err.available,
          shortfall: err.required - err.available,
        },
        { status: 402 }
      );
    }
    console.error("POST /api/books/[id]/unlock error:", err);
    return NextResponse.json({ error: "Failed to unlock book" }, { status: 500 });
  }
}

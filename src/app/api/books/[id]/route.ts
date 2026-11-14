import { NextRequest, NextResponse } from "next/server";
import { AuthError, requireUser } from "@/lib/server/auth";
import {
  getBookForOwner,
  hydrateBookSignedUrls,
  updateBookForOwner,
} from "@/lib/server/books-repo";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser(req, { allowAnonymous: true });
    const { id } = await context.params;
    if (process.env.REQUIRE_AUTH === "false" && process.env.NODE_ENV !== "production") {
      try {
        const book = await getBookForOwner(id, user.uid);
        if (!book) {
          return NextResponse.json({ error: "Book not found" }, { status: 404 });
        }
        const hydrated = await hydrateBookSignedUrls(book);
        return NextResponse.json({ book: hydrated });
      } catch (err) {
        console.warn("GET /api/books/[id] Firestore unavailable in dev:", err);
        return NextResponse.json({ error: "Book not found" }, { status: 404 });
      }
    }
    const book = await getBookForOwner(id, user.uid);
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }
    const hydrated = await hydrateBookSignedUrls(book);
    return NextResponse.json({ book: hydrated });
  } catch (err) {
    if (err instanceof AuthError) return err.toResponse();
    console.error("GET /api/books/[id] error:", err);
    return NextResponse.json({ error: "Failed to load book" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser(req, { allowAnonymous: true });
    const { id } = await context.params;
    const patch = await req.json();

    // Never allow client to overwrite uid, entitlement, or pdf artifacts directly
    const {
      uid: _u,
      id: _id,
      entitlement: _e,
      pdf: _pdf,
      createdAt: _c,
      ...safePatch
    } = patch;

    if (process.env.REQUIRE_AUTH === "false" && process.env.NODE_ENV !== "production") {
      try {
        const updated = await updateBookForOwner(id, user.uid, safePatch, true);
        if (!updated) {
          return NextResponse.json({ error: "Book not found" }, { status: 404 });
        }
        const hydrated = await hydrateBookSignedUrls(updated);
        return NextResponse.json({ book: hydrated });
      } catch (err) {
        console.warn("PATCH /api/books/[id] Firestore unavailable in dev:", err);
        return NextResponse.json({ book: { id, ...safePatch } });
      }
    }
    const updated = await updateBookForOwner(id, user.uid, safePatch, true);
    if (!updated) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }
    const hydrated = await hydrateBookSignedUrls(updated);
    return NextResponse.json({ book: hydrated });
  } catch (err) {
    if (err instanceof AuthError) return err.toResponse();
    console.error("PATCH /api/books/[id] error:", err);
    return NextResponse.json({ error: "Failed to update book" }, { status: 500 });
  }
}

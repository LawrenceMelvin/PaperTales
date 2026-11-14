import { NextRequest, NextResponse } from "next/server";
import { AuthError, requireUser } from "@/lib/server/auth";
import {
  createBook,
  hydrateBookSignedUrls,
  listBooksForOwner,
} from "@/lib/server/books-repo";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req, { allowAnonymous: true });
    if (process.env.REQUIRE_AUTH === "false" && process.env.NODE_ENV !== "production") {
      try {
        const books = await listBooksForOwner(user.uid);
        const hydrated = await Promise.all(books.map((b) => hydrateBookSignedUrls(b)));
        return NextResponse.json({ books: hydrated });
      } catch (err) {
        console.warn("GET /api/books Firestore unavailable in dev; returning empty list:", err);
        return NextResponse.json({ books: [] });
      }
    }
    const books = await listBooksForOwner(user.uid);
    const hydrated = await Promise.all(books.map((b) => hydrateBookSignedUrls(b)));
    return NextResponse.json({ books: hydrated });
  } catch (err) {
    if (err instanceof AuthError) return err.toResponse();
    console.error("GET /api/books error:", err);
    return NextResponse.json({ error: "Failed to load books" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req, { allowAnonymous: true });
    const body = await req.json();
    if (process.env.REQUIRE_AUTH === "false" && process.env.NODE_ENV !== "production") {
      try {
        const created = await createBook(user.uid, body);
        const hydrated = await hydrateBookSignedUrls(created);
        return NextResponse.json({ book: hydrated }, { status: 201 });
      } catch (err) {
        console.warn("POST /api/books Firestore unavailable in dev; returning local book:", err);
        return NextResponse.json(
          {
            book: {
              ...body,
              id: body?.id || `bk_${Date.now().toString(36)}`,
              uid: user.uid,
            },
          },
          { status: 201 }
        );
      }
    }
    const created = await createBook(user.uid, body);
    const hydrated = await hydrateBookSignedUrls(created);
    return NextResponse.json({ book: hydrated }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return err.toResponse();
    console.error("POST /api/books error:", err);
    return NextResponse.json({ error: "Failed to create book" }, { status: 500 });
  }
}

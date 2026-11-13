import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { AuthError, requireUser } from "@/lib/server/auth";
import { claimAnonymousBook, hydrateBookSignedUrls } from "@/lib/server/books-repo";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req, { allowAnonymous: false });
    const { anonymousBookId, anonymousIdToken } = await req.json();

    if (!anonymousBookId || !anonymousIdToken) {
      return NextResponse.json(
        { error: "anonymousBookId and anonymousIdToken are required" },
        { status: 400 }
      );
    }

    let anonUid: string;
    try {
      const decoded = await getAdminAuth().verifyIdToken(anonymousIdToken, false);
      if (decoded.firebase?.sign_in_provider !== "anonymous") {
        return NextResponse.json(
          { error: "Provided token is not an anonymous session" },
          { status: 400 }
        );
      }
      anonUid = decoded.uid;
    } catch {
      return NextResponse.json(
        { error: "Invalid anonymous session token" },
        { status: 401 }
      );
    }

    const transferred = await claimAnonymousBook(anonymousBookId, anonUid, user.uid);
    if (!transferred) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const hydrated = await hydrateBookSignedUrls(transferred);
    return NextResponse.json({ book: hydrated });
  } catch (err) {
    if (err instanceof AuthError) return err.toResponse();
    console.error("POST /api/books/claim error:", err);
    return NextResponse.json({ error: "Failed to claim book" }, { status: 500 });
  }
}

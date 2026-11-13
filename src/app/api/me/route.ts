import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { AuthError, requireUser } from "@/lib/server/auth";
import { UserProfileDoc } from "@/lib/server/ledger";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req, { allowAnonymous: true });
    if (user.isAnonymous) {
      return NextResponse.json({
        uid: user.uid,
        isAnonymous: true,
        tokenBalance: 0,
        freeGrantClaimed: false,
      });
    }

    const db = getAdminDb();
    const ref = db.collection("users").doc(user.uid);
    const snap = await ref.get();
    const now = new Date().toISOString();

    if (!snap.exists) {
      const created: UserProfileDoc = {
        uid: user.uid,
        email: user.email,
        displayName: user.name || user.email || "PaperTales Author",
        photoUrl: user.picture,
        tokenBalance: 0,
        freeGrantClaimed: false,
        createdAt: now,
        updatedAt: now,
      };
      await ref.set(created);
      return NextResponse.json({ ...created, isAnonymous: false });
    }

    const data = snap.data() as UserProfileDoc;
    return NextResponse.json({
      ...data,
      isAnonymous: false,
    });
  } catch (err) {
    if (err instanceof AuthError) return err.toResponse();
    console.error("GET /api/me error:", err);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

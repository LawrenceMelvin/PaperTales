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

    const devBypass =
      process.env.REQUIRE_AUTH === "false" && process.env.NODE_ENV !== "production";
    if (devBypass) {
      return NextResponse.json({
        uid: user.uid,
        isAnonymous: false,
        email: user.email,
        displayName: user.name || user.email || "Local Developer",
        photoUrl: user.picture,
        tokenBalance: 0,
        freeGrantClaimed: false,
      });
    }

    try {
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
    } catch (dbErr) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("GET /api/me Firestore unavailable in dev; returning fallback profile:", dbErr);
        return NextResponse.json({
          uid: user.uid,
          isAnonymous: false,
          email: user.email,
          displayName: user.name || user.email || "Local Developer",
          photoUrl: user.picture,
          tokenBalance: 0,
          freeGrantClaimed: false,
        });
      }
      throw dbErr;
    }
  } catch (err) {
    if (err instanceof AuthError) return err.toResponse();
    console.error("GET /api/me error:", err);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

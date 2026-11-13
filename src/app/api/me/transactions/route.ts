import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { AuthError, requireUser } from "@/lib/server/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req, { allowAnonymous: false });
    const snap = await getAdminDb()
      .collection("tokenTransactions")
      .where("uid", "==", user.uid)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    const transactions = snap.docs.map((d) => d.data());
    return NextResponse.json({ transactions });
  } catch (err) {
    if (err instanceof AuthError) return err.toResponse();
    console.error("GET /api/me/transactions error:", err);
    return NextResponse.json({ error: "Failed to load transactions" }, { status: 500 });
  }
}

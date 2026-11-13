import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { AuthError, requireUser } from "@/lib/server/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req, { allowAnonymous: false });
    const snap = await getAdminDb()
      .collection("orders")
      .where("uid", "==", user.uid)
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    const orders = snap.docs
      .map((d) => d.data())
      .filter((o) => o.status !== "pending")
      .map((o) => o.finalizedOrder || o);

    return NextResponse.json({ orders });
  } catch (err) {
    if (err instanceof AuthError) return err.toResponse();
    console.error("GET /api/orders error:", err);
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  }
}

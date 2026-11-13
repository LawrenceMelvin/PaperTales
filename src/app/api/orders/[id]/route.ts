import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { AuthError, requireUser } from "@/lib/server/auth";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser(req, { allowAnonymous: false });
    const { id } = await context.params;

    const snap = await getAdminDb().collection("orders").doc(id).get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    const data = snap.data()!;
    if (data.uid !== user.uid) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order: data.finalizedOrder || data });
  } catch (err) {
    if (err instanceof AuthError) return err.toResponse();
    console.error("GET /api/orders/[id] error:", err);
    return NextResponse.json({ error: "Failed to load order" }, { status: 500 });
  }
}

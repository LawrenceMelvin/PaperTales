import crypto from "node:crypto";
import { getAdminDb } from "@/lib/firebase/admin";

export interface RateLimitResult {
  allowed: boolean;
  count: number;
  limit: number;
  retryAfterSeconds: number;
}

export interface RateLimitStore {
  incrementWindow(key: string, windowMs: number, nowMs: number): Promise<{ count: number; resetAtMs: number }>;
}

export function createFirestoreRateLimitStore(): RateLimitStore {
  const db = getAdminDb();
  return {
    async incrementWindow(key: string, windowMs: number, nowMs: number) {
      const windowBucket = Math.floor(nowMs / windowMs);
      const resetAtMs = (windowBucket + 1) * windowMs;
      const docId = `${key}_${windowBucket}`;
      const docRef = db.collection("rateLimits").doc(docId);

      return db.runTransaction(async (tx) => {
        const snap = await tx.get(docRef);
        const current = snap.exists ? Number(snap.data()?.count ?? 0) : 0;
        const next = current + 1;
        tx.set(
          docRef,
          {
            count: next,
            expiresAt: new Date(resetAtMs + 60_000),
          },
          { merge: true }
        );
        return { count: next, resetAtMs };
      });
    },
  };
}

export function hashRateLimitKey(scope: string, identifier: string): string {
  return crypto
    .createHash("sha256")
    .update(`${scope}:${identifier}`)
    .digest("hex")
    .slice(0, 32);
}

export async function checkRateLimit(
  scope: string,
  identifier: string,
  limit: number,
  windowMs: number,
  store: RateLimitStore = createFirestoreRateLimitStore(),
  nowMs: number = Date.now()
): Promise<RateLimitResult> {
  const hashed = hashRateLimitKey(scope, identifier);
  const { count, resetAtMs } = await store.incrementWindow(hashed, windowMs, nowMs);
  const retryAfterSeconds = Math.max(1, Math.ceil((resetAtMs - nowMs) / 1000));

  return {
    allowed: count <= limit,
    count,
    limit,
    retryAfterSeconds,
  };
}

import { NextRequest, NextResponse } from "next/server";
import { getAdminAppCheck, getAdminDb } from "@/lib/firebase/admin";
import { AuthenticatedUser, AuthError, requireUser, TokenVerifier } from "@/lib/server/auth";
import { checkRateLimit, createFirestoreRateLimitStore, RateLimitStore } from "@/lib/server/rate-limit";
import { checkPromptSafety } from "@/lib/server/prompt-safety";

export type AiEndpointKind =
  | "chat"
  | "story_proof"
  | "story_expand"
  | "image"
  | "refine"
  | "paypal_agent";

export const ANON_MAX_CHAT_TURNS = 12;
export const ANON_MAX_PROOFS = 1;
export const ANON_IP_MAX_PROOFS_PER_24H = 3;
export const USER_IMAGE_LIMIT_PER_10M = 30;
export const USER_TEXT_LIMIT_PER_10M = 60;

const TEN_MINUTES_MS = 10 * 60 * 1000;
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export class GuardError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly extra?: Record<string, unknown>
  ) {
    super(message);
    this.name = "GuardError";
  }

  toResponse(): NextResponse {
    const headers: Record<string, string> = {};
    if (this.extra?.retryAfterSeconds) {
      headers["Retry-After"] = String(this.extra.retryAfterSeconds);
    }
    return NextResponse.json(
      { error: this.message, code: this.code, ...this.extra },
      { status: this.status, headers }
    );
  }
}

export type AppCheckVerifier = (token: string) => Promise<void>;
export type AnonQuotaConsumer = (uid: string, field: "chatTurns" | "proofs", max: number) => Promise<boolean>;

export interface GuardDeps {
  verifyAppCheck?: AppCheckVerifier;
  verifyIdToken?: TokenVerifier;
  consumeAnonQuota?: AnonQuotaConsumer;
  rateLimitStore?: RateLimitStore;
  nowMs?: number;
}

const defaultAppCheckVerifier: AppCheckVerifier = async (token: string) => {
  await getAdminAppCheck().verifyToken(token);
};

const defaultAnonQuotaConsumer: AnonQuotaConsumer = async (uid, field, max) => {
  const db = getAdminDb();
  const ref = db.collection("users").doc(uid);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.exists ? snap.data() : {};
    const anon = (data?.anon as { chatTurns?: number; proofs?: number } | undefined) || {};
    const current = Number(anon[field] ?? 0);
    if (current >= max) {
      return false;
    }
    tx.set(
      ref,
      {
        uid,
        anon: {
          chatTurns: field === "chatTurns" ? current + 1 : Number(anon.chatTurns ?? 0),
          proofs: field === "proofs" ? current + 1 : Number(anon.proofs ?? 0),
        },
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  });
};

export function extractClientIp(req: NextRequest | Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip") || "unknown";
}

export async function guardAiRequest(
  req: NextRequest | Request,
  options: { kind: AiEndpointKind; texts?: Array<string | undefined | null> },
  deps: GuardDeps = {}
): Promise<AuthenticatedUser> {
  const devBypass =
    process.env.REQUIRE_AUTH === "false" && process.env.NODE_ENV !== "production";

  // 1. App Check attestation
  if (!devBypass || deps.verifyAppCheck) {
    const appCheckToken =
      req.headers.get("x-firebase-appcheck") || req.headers.get("X-Firebase-AppCheck");
    if (!appCheckToken) {
      throw new GuardError(403, "app_check_required", "App attestation is required.");
    }
    try {
      const verifyAppCheck = deps.verifyAppCheck ?? defaultAppCheckVerifier;
      await verifyAppCheck(appCheckToken);
    } catch {
      throw new GuardError(403, "app_check_invalid", "App attestation verification failed.");
    }
  }

  // 2. Identity verification
  const allowAnonymous = options.kind === "chat" || options.kind === "story_proof";
  let user: AuthenticatedUser;
  try {
    user = await requireUser(req, { allowAnonymous }, deps.verifyIdToken);
  } catch (err) {
    if (err instanceof AuthError) {
      throw new GuardError(err.status, err.code, err.message);
    }
    throw err;
  }

  const rateLimitStore = deps.rateLimitStore ?? createFirestoreRateLimitStore();
  const nowMs = deps.nowMs ?? Date.now();

  // 3. Anonymous quotas + per-IP proof cap
  if (user.isAnonymous) {
    const consumeQuota = deps.consumeAnonQuota ?? defaultAnonQuotaConsumer;

    if (options.kind === "chat") {
      const ok = await consumeQuota(user.uid, "chatTurns", ANON_MAX_CHAT_TURNS);
      if (!ok) {
        throw new GuardError(
          401,
          "sign_in_required",
          "Free preview chat limit reached. Sign in with Google to continue."
        );
      }
    } else if (options.kind === "story_proof") {
      const ip = extractClientIp(req);
      const ipLimit = await checkRateLimit(
        "anon_proof_ip",
        ip,
        ANON_IP_MAX_PROOFS_PER_24H,
        TWENTY_FOUR_HOURS_MS,
        rateLimitStore,
        nowMs
      );
      if (!ipLimit.allowed) {
        throw new GuardError(
          429,
          "sign_in_required",
          "Daily anonymous preview limit reached for this network. Please sign in with Google.",
          { retryAfterSeconds: ipLimit.retryAfterSeconds }
        );
      }

      const ok = await consumeQuota(user.uid, "proofs", ANON_MAX_PROOFS);
      if (!ok) {
        throw new GuardError(
          401,
          "sign_in_required",
          "Your Master Page 1 proof is ready! Sign in with Google to continue."
        );
      }
    } else {
      throw new GuardError(
        401,
        "sign_in_required",
        "Please sign in with Google to continue."
      );
    }
  } else {
    // 4. Signed-in user rate limits
    const isImageKind = options.kind === "image" || options.kind === "refine";
    const scope = isImageKind ? "user_ai_image" : "user_ai_text";
    const limit = isImageKind ? USER_IMAGE_LIMIT_PER_10M : USER_TEXT_LIMIT_PER_10M;
    const rl = await checkRateLimit(scope, user.uid, limit, TEN_MINUTES_MS, rateLimitStore, nowMs);
    if (!rl.allowed) {
      throw new GuardError(
        429,
        "rate_limited",
        "You're creating very fast! Please wait a moment and try again.",
        { retryAfterSeconds: rl.retryAfterSeconds }
      );
    }
  }

  // 5. Kid-safe prompt filtering
  if (options.texts && options.texts.length > 0) {
    const safety = checkPromptSafety(options.texts);
    if (!safety.safe) {
      throw new GuardError(
        422,
        safety.reason || "unsafe_prompt",
        safety.message || "Please try a family-friendly prompt."
      );
    }
  }

  return user;
}

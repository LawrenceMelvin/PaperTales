import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";

export interface AuthenticatedUser {
  uid: string;
  isAnonymous: boolean;
  email?: string;
  name?: string;
  picture?: string;
}

export interface RequireUserOptions {
  allowAnonymous?: boolean;
}

export class AuthError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "AuthError";
  }

  toResponse(): NextResponse {
    return NextResponse.json(
      { error: this.message, code: this.code },
      { status: this.status }
    );
  }
}

export type TokenVerifier = (idToken: string) => Promise<{
  uid: string;
  firebase?: { sign_in_provider?: string };
  email?: string;
  name?: string;
  picture?: string;
}>;

const defaultVerifier: TokenVerifier = async (idToken: string) => {
  return getAdminAuth().verifyIdToken(idToken, true);
};

/**
 * Verifies the caller's Firebase ID token from `Authorization: Bearer <token>`.
 * Never trusts `uid` / `userId` from the request body.
 */
export async function requireUser(
  req: NextRequest | Request,
  options: RequireUserOptions = {},
  verifier: TokenVerifier = defaultVerifier
): Promise<AuthenticatedUser> {
  const { allowAnonymous = false } = options;

  // Dev-only bypass when REQUIRE_AUTH=false
  if (process.env.REQUIRE_AUTH === "false" && process.env.NODE_ENV !== "production") {
    const devHeader = req.headers.get("authorization");
    if (!devHeader) {
      return {
        uid: "dev-local-user",
        isAnonymous: false,
        email: "dev@papertales.local",
        name: "Local Developer",
      };
    }
  }

  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AuthError(401, "missing_token", "Authentication required.");
  }

  const idToken = authHeader.slice("Bearer ".length).trim();
  if (!idToken) {
    throw new AuthError(401, "missing_token", "Authentication required.");
  }

  let decoded: Awaited<ReturnType<TokenVerifier>>;
  try {
    decoded = await verifier(idToken);
  } catch {
    throw new AuthError(401, "invalid_token", "Invalid or expired authentication token.");
  }

  const isAnonymous = decoded.firebase?.sign_in_provider === "anonymous";
  if (isAnonymous && !allowAnonymous) {
    throw new AuthError(
      401,
      "sign_in_required",
      "Please sign in with Google to continue."
    );
  }

  return {
    uid: decoded.uid,
    isAnonymous,
    email: decoded.email,
    name: decoded.name,
    picture: decoded.picture,
  };
}

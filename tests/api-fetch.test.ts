import assert from "node:assert/strict";
import { apiFetch, setApiFetchHeaderProvider } from "../src/lib/api-fetch";

async function run() {
  const originalFetch = globalThis.fetch;
  let capturedHeaders: Headers | null = null;

  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    capturedHeaders = new Headers(init?.headers);
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }) as typeof fetch;

  try {
    let callCount = 0;
    setApiFetchHeaderProvider(async () => {
      callCount++;
      return {
        Authorization: `Bearer token-${callCount}`,
        "X-Firebase-AppCheck": `appcheck-${callCount}`,
      };
    });

    await apiFetch("/api/me", { method: "GET" });
    assert.equal(capturedHeaders?.get("Authorization"), "Bearer token-1");
    assert.equal(capturedHeaders?.get("X-Firebase-AppCheck"), "appcheck-1");

    // Second call refreshes tokens from provider
    await apiFetch("/api/me", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    assert.equal(capturedHeaders?.get("Authorization"), "Bearer token-2");
    assert.equal(capturedHeaders?.get("X-Firebase-AppCheck"), "appcheck-2");
    assert.equal(capturedHeaders?.get("Content-Type"), "application/json");

    // Explicit caller Authorization header is preserved
    await apiFetch("/api/me", {
      headers: { Authorization: "Bearer custom-override" },
    });
    assert.equal(capturedHeaders?.get("Authorization"), "Bearer custom-override");

    console.log("✔ api-fetch unit tests passed");
  } finally {
    setApiFetchHeaderProvider(null);
    globalThis.fetch = originalFetch;
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

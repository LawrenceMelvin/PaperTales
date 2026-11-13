import { getClientAuthHeaders } from "@/lib/firebase/client";

export type HeaderProvider = () => Promise<Record<string, string>>;

let customHeaderProvider: HeaderProvider | null = null;

/** Override header provider in unit tests. Pass null to restore default Firebase provider. */
export function setApiFetchHeaderProvider(provider: HeaderProvider | null): void {
  customHeaderProvider = provider;
}

export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const provider = customHeaderProvider ?? getClientAuthHeaders;
  const authHeaders = await provider();

  const merged = new Headers(init.headers);
  for (const [k, v] of Object.entries(authHeaders)) {
    if (!merged.has(k)) {
      merged.set(k, v);
    }
  }

  return fetch(input, {
    ...init,
    headers: merged,
  });
}

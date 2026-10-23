import type { JWK } from "@supabase/auth-js/dist/module/lib/types";

type CachedJwks = {
  keys: JWK[];
  fetchedAt: number;
};

const JWKS_TTL_MS = 10 * 60 * 1000;

let cache: CachedJwks | null = null;

/**
 * Caches Supabase's JWT signing keys so proxy.ts does not refetch the JWKS
 * on every request. Without this, each navigation would hit
 * /auth/v1/.well-known/jwks.json.
 */
export async function getJwks(): Promise<{ keys: JWK[] }> {
  if (cache && Date.now() - cache.fetchedAt < JWKS_TTL_MS) {
    return { keys: cache.keys };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) {
    return { keys: [] };
  }

  try {
    const response = await fetch(`${baseUrl}/auth/v1/.well-known/jwks.json`, {
      headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! },
      cache: "no-store",
    });

    if (!response.ok) {
      return { keys: [] };
    }

    const data = (await response.json()) as { keys: JWK[] };
    cache = { keys: data.keys, fetchedAt: Date.now() };
    return { keys: data.keys };
  } catch {
    return { keys: [] };
  }
}

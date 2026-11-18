// COW-37 cached access-token provider for the dashboard API client.
// Supabase refreshes tokens internally; this avoids a getSession() call for
// every panel request while still honouring the session expiry.
const REFRESH_SKEW_MS = 60_000;

export interface TokenSession {
  access_token: string;
  /** Supabase session expiry in seconds since the Unix epoch. */
  expires_at?: number;
}

export interface SessionTokenProvider {
  getToken: () => Promise<string | null>;
  clear: () => void;
}

export function createSessionTokenProvider(
  getSession: () => Promise<TokenSession | null>,
): SessionTokenProvider {
  let cached: TokenSession | null = null;

  return {
    async getToken() {
      const now = Date.now();
      if (cached && cached.access_token && (cached.expires_at ?? 0) * 1000 - REFRESH_SKEW_MS > now) {
        return cached.access_token;
      }
      cached = await getSession();
      return cached?.access_token ?? null;
    },
    clear() {
      cached = null;
    },
  };
}

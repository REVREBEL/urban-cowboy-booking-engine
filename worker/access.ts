// Cloudflare Access JWT verification for private Worker routes.
//
// The Worker trusts only a token signed by the team's Access JWKS and addressed
// to this application's AUD. Nothing from client-controlled headers or query
// parameters (including ?tenant=) is used to establish identity or roles.
// Any verification failure fails closed.

export interface AccessEnv {
  CF_ACCESS_TEAM_DOMAIN?: string;
  CF_ACCESS_AUD?: string;
}

export interface AccessClaims {
  sub?: unknown;
  email?: unknown;
  groups?: unknown;
  iss?: unknown;
  aud?: unknown;
  exp?: unknown;
  nbf?: unknown;
}

type Jwk = {
  kid?: string;
  kty?: string;
  n?: string;
  e?: string;
  alg?: string;
  use?: string;
};

type JwksCache = { team: string; keys: Jwk[]; fetchedAt: number };

const JWKS_TTL_MS = 10 * 60 * 1000;
const MAX_TOKEN_LENGTH = 16 * 384;
let cache: JwksCache | null = null;

function teamDomain(value: string | undefined): string | null {
  const team = (value ?? "").trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  // Only a hostname is accepted: no path, query, userinfo or port smuggling.
  return /^[a-z0-9][a-z0-9.-]*$/i.test(team) ? team.toLowerCase() : null;
}

function decodeBase64Url(value: string): string {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return atob(padded);
}

function decodeBytes(value: string): Uint8Array {
  const text = decodeBase64Url(value);
  const bytes = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i++) bytes[i] = text.charCodeAt(i);
  return bytes;
}

async function jwks(team: string, forceRefresh = false): Promise<Jwk[]> {
  if (!forceRefresh && cache && cache.team === team && Date.now() - cache.fetchedAt < JWKS_TTL_MS) {
    return cache.keys;
  }
  // Fail closed: a JWKS fetch failure never falls back to stale keys here.
  const response = await fetch(`https://${team}/cdn-cgi/access/certs`, {
    headers: { accept: "application/json" },
  });
  if (!response.ok) return [];
  let body: { keys?: unknown };
  try {
    body = await response.json() as { keys?: unknown };
  } catch {
    return [];
  }
  if (!Array.isArray(body.keys)) return [];
  const keys = body.keys.filter((key): key is Jwk =>
    !!key && typeof key === "object" && typeof (key as Jwk).kid === "string" &&
    (key as Jwk).kty === "RSA",
  );
  cache = { team, keys, fetchedAt: Date.now() };
  return keys;
}

function audienceMatches(aud: unknown, expected: string): boolean {
  if (typeof aud === "string") return aud === expected;
  if (Array.isArray(aud)) return aud.some((value) => value === expected);
  return false;
}

/**
 * Returns verified claims, or null for every failure mode. The caller must
 * treat null as unauthenticated and never inspect the token itself.
 */
export async function verifyAccessJwt(token: string | null, env: AccessEnv): Promise<AccessClaims | null> {
  const team = teamDomain(env.CF_ACCESS_TEAM_DOMAIN);
  const aud = env.CF_ACCESS_AUD?.trim();
  if (!team || !aud || !token || token.length > MAX_TOKEN_LENGTH) return null;

  const parts = token.split(".");
  if (parts.length !== 3 || parts.some((part) => !part)) return null;

  let header: { alg?: unknown; kid?: unknown };
  let claims: AccessClaims;
  try {
    header = JSON.parse(decodeBase64Url(parts[0])) as typeof header;
    claims = JSON.parse(decodeBase64Url(parts[1])) as AccessClaims;
  } catch {
    return null;
  }
  if (header.alg !== "RS256" || typeof header.kid !== "string") return null;

  const matches = (keys: Jwk[]) => keys.find((candidate) =>
    candidate.kid === header.kid &&
    candidate.alg === "RS256" &&
    (candidate.use === "sig" || candidate.use === undefined) &&
    typeof candidate.n === "string" && typeof candidate.e === "string",
  );
  // A rotated signing key must not lock principals out until the TTL expires.
  let key = matches(await jwks(team));
  if (!key) key = matches(await jwks(team, true));
  if (!key) return null;

  let verified = false;
  try {
    const cryptoKey = await crypto.subtle.importKey(
      "jwk",
      { kty: "RSA", n: key.n, e: key.e, alg: "RS256", ext: false } as JsonWebKey,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    );
    verified = await crypto.subtle.verify(
      { name: "RSASSA-PKCS1-v1_5" },
      cryptoKey,
      decodeBytes(parts[2]),
      new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
    );
  } catch {
    return null;
  }
  if (!verified) return null;

  const issuer = `https://${team}`;
  if (claims.iss !== issuer || !audienceMatches(claims.aud, aud)) return null;
  const now = Math.floor(Date.now() / 1000);
  if (typeof claims.exp !== "number" || !Number.isFinite(claims.exp) || claims.exp <= now) return null;
  if (typeof claims.nbf === "number" && claims.nbf > now + 60) return null;
  return claims;
}

/** Access sends the JWT in its own header; Bearer is accepted for service setups. */
export function tokenFromRequest(request: Request): string | null {
  const assertion = request.headers.get("cf-access-jwt-assertion");
  if (assertion?.trim()) return assertion.trim();
  const bearer = /^Bearer\s+(.+)$/i.exec(request.headers.get("authorization") ?? "");
  return bearer?.[1]?.trim() ?? null;
}

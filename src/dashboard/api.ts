// COW-37 centralized dashboard API client.
//
// One place builds /api URLs and turns failed responses into typed errors.
// Protected Worker routes use Cloudflare Access (COW-31): the browser sends the
// Access cookie on same-origin requests and Cloudflare injects the verified JWT
// header before the request reaches the Worker. No Supabase token is forwarded
// here; that token authorizes Supabase data only.

export const DASHBOARD_TENANT = "urban-cowboy";

export type DashboardModule = "events" | "add-ons" | "offers" | "upgrades";

export class DashboardApiError extends Error {
  readonly status: number;
  readonly code: string | null;

  constructor(message: string, status: number, code: string | null = null) {
    super(message);
    this.name = "DashboardApiError";
    this.status = status;
    this.code = code;
  }
}

export interface DashboardApiOptions {
  fetchImpl?: typeof fetch;
}

// Bound every dashboard network call so a stalled connection rejects into the
// panel's existing error/retry state instead of leaving it loading forever.
const REQUEST_TIMEOUT_MS = 10_000;

interface DeadlineSignal {
  signal: AbortSignal;
  /** Release timers and listeners once the fetch settles. */
  dispose: () => void;
}

/**
 * Combine the deadline with the caller's signal. A runtime can have timeout()
 * but not any(), so composition must not depend on any() being present or the
 * caller's cancellation would be silently dropped.
 */
function requestSignal(existing?: AbortSignal | null): DeadlineSignal {
  if (typeof AbortSignal.timeout === "function" && typeof AbortSignal.any === "function") {
    const deadline = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
    return {
      signal: AbortSignal.any(existing ? [existing, deadline] : [deadline]),
      dispose: () => {},
    };
  }

  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let deadline: AbortSignal | undefined;
  if (typeof AbortSignal.timeout === "function") {
    deadline = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  } else {
    timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  }

  const abortFromDeadline = () => controller.abort(deadline?.reason);
  if (deadline) {
    if (deadline.aborted) abortFromDeadline();
    else deadline.addEventListener("abort", abortFromDeadline, { once: true });
  }
  const abortFromCaller = () => controller.abort(existing?.reason);
  if (existing) {
    if (existing.aborted) abortFromCaller();
    else existing.addEventListener("abort", abortFromCaller, { once: true });
  }

  return {
    signal: controller.signal,
    dispose: () => {
      if (timer) clearTimeout(timer);
      deadline?.removeEventListener("abort", abortFromDeadline);
      existing?.removeEventListener("abort", abortFromCaller);
    },
  };
}

export interface DashboardApi {
  get<T>(path: string, params?: Record<string, string | number | undefined>, init?: RequestInit): Promise<T>;
  post<T>(path: string, body: unknown): Promise<T>;
  patch<T>(path: string, body: unknown): Promise<T>;
  getD1Module<T>(module: DashboardModule, tenant?: string): Promise<T[]>;
  getContentItems<T>(kind?: string, tenant?: string, location?: string): Promise<T[]>;
  getAdminRooms<T>(): Promise<T[]>;
  getRoomGallery<T>(roomId: string): Promise<T[]>;
}

function errorFrom(status: number, text: string): DashboardApiError {
  let code: string | null = null;
  let message = `Request failed with ${status}`;
  try {
    const body: unknown = JSON.parse(text);
    if (body && typeof body === "object") {
      const record = body as { error?: unknown; message?: unknown };
      if (typeof record.error === "string") code = record.error;
      if (typeof record.message === "string") message = record.message;
      else if (code) message = code;
    }
  } catch {
    if (text.trim()) message = text.trim().slice(0, 300);
  }
  return new DashboardApiError(message, status, code);
}

export function createDashboardApi(options: DashboardApiOptions = {}): DashboardApi {
  const doFetch = options.fetchImpl ?? fetch;

  async function get<T>(
    path: string,
    params: Record<string, string | number | undefined> = {},
    init: RequestInit = {},
  ): Promise<T> {
    if (!path.startsWith("/api/")) throw new Error("Dashboard API paths must start with /api/");
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") query.set(key, String(value));
    }
    const search = query.toString();
    const requestPath = search ? `${path}?${search}` : path;
    const headers = new Headers(init.headers);
    headers.set("accept", "application/json");
    // Same-origin credentials carry the Access cookie. Workers verify the JWT
    // that Cloudflare injects; the dashboard never fabricates that header.
    const timed = requestSignal(init.signal);
    try {
      const response = await doFetch(requestPath, {
        ...init,
        headers,
        credentials: "same-origin",
        signal: timed.signal,
      });
      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw errorFrom(response.status, text);
      }
      return (await response.json()) as T;
    } finally {
      timed.dispose();
    }
  }

  return {
    get,
    async post<T>(path: string, body: unknown): Promise<T> {
      if (!path.startsWith("/api/")) throw new Error("Dashboard API paths must start with /api/");
      const timed = requestSignal();
      try {
        const response = await doFetch(path, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          signal: timed.signal,
          body: JSON.stringify(body),
        });
        if (!response.ok) {
          const text = await response.text().catch(() => "");
          throw errorFrom(response.status, text);
        }
        return (await response.json()) as T;
      } finally {
        timed.dispose();
      }
    },
    async patch<T>(path: string, body: unknown): Promise<T> {
      if (!path.startsWith("/api/")) throw new Error("Dashboard API paths must start with /api/");
      const timed = requestSignal();
      try {
        const response = await doFetch(path, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          signal: timed.signal,
          body: JSON.stringify(body),
        });
        if (!response.ok) {
          const text = await response.text().catch(() => "");
          throw errorFrom(response.status, text);
        }
        return (await response.json()) as T;
      } finally {
        timed.dispose();
      }
    },
    async getD1Module<T>(module: DashboardModule, tenant = DASHBOARD_TENANT): Promise<T[]> {
      // Only add-ons has a dedicated /api/d1 route. events, offers and upgrades
      // are served by /api/content/<module> in worker/index.ts.
      const path = module === "add-ons" ? "/api/d1/add-ons" : `/api/content/${module}`;
      const data = await get<{ items?: T[] }>(path, { tenant });
      return data.items ?? [];
    },
    async getContentItems<T>(kind?: string, tenant = DASHBOARD_TENANT, location?: string): Promise<T[]> {
      const data = await get<{ items?: T[] }>("/api/content/items", { tenant, kind, location });
      return data.items ?? [];
    },
    async getAdminRooms<T>(): Promise<T[]> {
      const data = await get<{ items?: T[] }>("/api/admin/rooms");
      return data.items ?? [];
    },
    async getRoomGallery<T>(roomId: string): Promise<T[]> {
      const data = await get<{ items?: T[] }>(`/api/admin/rooms/${encodeURIComponent(roomId)}/photos`);
      return data.items ?? [];
    },
  };
}

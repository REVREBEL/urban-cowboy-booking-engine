// COW-37 centralized dashboard API client.
//
// One place builds URLs, attaches the verified session token and turns failed
// responses into typed errors. Panel components never assemble /api URLs or
// read credentials themselves.

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
  getToken: () => Promise<string | null>;
  fetchImpl?: typeof fetch;
}

export interface DashboardApi {
  get<T>(path: string, params?: Record<string, string | number | undefined>, init?: RequestInit): Promise<T>;
  getD1Module<T>(module: DashboardModule, tenant?: string): Promise<T[]>;
  getContentItems<T>(kind?: string, tenant?: string, location?: string): Promise<T[]>;
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

export function createDashboardApi(options: DashboardApiOptions): DashboardApi {
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
    const token = await options.getToken();
    const headers = new Headers(init.headers);
    headers.set("accept", "application/json");
    // The token travels in a header, never in the URL or a query parameter.
    if (token) headers.set("authorization", `Bearer ${token}`);
    const response = await doFetch(requestPath, {
      ...init,
      headers,
      credentials: "omit",
    });
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw errorFrom(response.status, text);
    }
    return (await response.json()) as T;
  }

  return {
    get,
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
  };
}

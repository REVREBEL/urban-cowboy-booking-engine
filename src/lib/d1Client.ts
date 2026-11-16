export async function fetchD1Content<T = unknown>(
  kind?: string,
  tenant = "urban-cowboy",
  location?: string,
): Promise<T[]> {
  const params = new URLSearchParams({ tenant });
  if (kind) params.set("kind", kind);
  if (location) params.set("location", location);
  const res = await fetch(`/api/content/items?${params.toString()}`);
  if (!res.ok) throw new Error(`D1 content fetch failed: ${res.status}`);
  const data = (await res.json()) as { items: T[] };
  return data.items ?? [];
}

export async function fetchD1Module<T = unknown>(
  module: "events" | "add-ons" | "offers" | "upgrades",
  tenant = "urban-cowboy",
): Promise<T[]> {
  const path = module === "add-ons" ? "/api/d1/add-ons" : `/api/content/${module}`;
  const res = await fetch(`${path}?tenant=${encodeURIComponent(tenant)}`);
  if (!res.ok) throw new Error(`D1 ${module} fetch failed: ${res.status}`);
  const data = (await res.json()) as { items: T[] };
  return data.items ?? [];
}
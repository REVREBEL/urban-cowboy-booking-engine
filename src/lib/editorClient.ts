/** Browser client for the role-gated editorial draft/publish API (COW-38). */

import type {
  CreateDraftInput,
  SaveDraftInput,
} from "../types/editor-contracts.ts";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error ?? `editor request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export interface EditorItemSummary {
  id: string;
  kind: string;
  slug: string;
  status: string;
  /** Published pointer: never moved by a draft save. */
  currentRevisionId: string | null;
  /** Working pointer: the latest draft revision. */
  workingRevisionId: string | null;
  updatedAt: string;
}

export function fetchEditorItems(): Promise<{ items: EditorItemSummary[] }> {
  return request("/api/content/editor/items");
}

export interface EditorItemDetail {
  item: EditorItemSummary;
  revisions: Array<{
    id: string; revision: number; publishedAt: string | null;
    createdBy: string | null; createdAt: string;
  }>;
  preview: Record<string, unknown> | null;
}

export function fetchEditorItem(id: string, revisionId?: string): Promise<EditorItemDetail> {
  const query = revisionId ? `?revisionId=${encodeURIComponent(revisionId)}` : "";
  return request(`/api/content/editor/items/${encodeURIComponent(id)}${query}`);
}

export function createEditorDraft(input: CreateDraftInput): Promise<{ id: string; revisionId: string }> {
  return request("/api/content/editor/items", { method: "POST", body: JSON.stringify(input) });
}

export interface DraftSaveResult {
  id: string;
  revisionId: string;
  status: string;
  snapshotRefreshed: boolean;
}

export function saveEditorDraft(id: string, input: SaveDraftInput): Promise<DraftSaveResult> {
  return request(`/api/content/editor/items/${encodeURIComponent(id)}`, {
    method: "PATCH", body: JSON.stringify(input),
  });
}

export interface PublishResult {
  id: string; revisionId: string; status: string; snapshotRefreshed: boolean;
}

export function publishEditorItem(id: string, revisionId?: string): Promise<PublishResult> {
  return request(`/api/content/editor/items/${encodeURIComponent(id)}/publish`, {
    method: "POST", body: JSON.stringify(revisionId ? { revisionId } : {}),
  });
}

export function rollbackEditorItem(id: string, revisionId: string): Promise<PublishResult> {
  return request(`/api/content/editor/items/${encodeURIComponent(id)}/rollback`, {
    method: "POST", body: JSON.stringify({ revisionId }),
  });
}

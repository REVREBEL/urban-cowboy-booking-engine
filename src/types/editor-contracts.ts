/** Contracts for the editorial draft/publish API (COW-38). */
import { z } from "zod";

export const EDITOR_KINDS = [
  "rate_card", "add_on", "event", "offer", "upgrade", "policy", "instagram", "outlet", "site_settings",
] as const;
export type EditorKind = (typeof EDITOR_KINDS)[number];

const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);
const MAX_PAYLOAD_BYTES = 200_000;

/** Staged editor payloads are JSON objects, bounded and free of injection keys. */
export const draftPayloadSchema = z.record(z.string(), z.unknown())
  .refine((value) => Object.keys(value).every((key) => !FORBIDDEN_KEYS.has(key)), "forbidden payload key")
  .refine((value) => {
    try { return JSON.stringify(value).length <= MAX_PAYLOAD_BYTES; }
    catch { return false; }
  }, "payload too large or not JSON-serializable");

export const createDraftSchema = z.object({
  kind: z.enum(EDITOR_KINDS),
  slug: z.string().min(1).max(200),
  locationId: z.string().min(1).nullable().optional(),
  payload: draftPayloadSchema,
});
export type CreateDraftInput = z.infer<typeof createDraftSchema>;

/** An expected revision is required so a stale editor cannot overwrite a newer draft. */
export const saveDraftSchema = z.object({
  payload: draftPayloadSchema,
  expectedRevisionId: z.string().min(1),
});
export type SaveDraftInput = z.infer<typeof saveDraftSchema>;

export const publishSchema = z.object({
  revisionId: z.string().min(1).optional(),
});

export const rollbackSchema = z.object({
  revisionId: z.string().min(1),
});

export const contentStatusSchema = z.enum(["draft", "published", "archived"]);

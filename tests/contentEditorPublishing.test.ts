// COW-38: draft edits stay out of published snapshots until publish.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import {
  createEditorDraft,
  getEditorItem,
  publishEditorItem,
  rollbackEditorItem,
  saveEditorDraft,
  type Authorize,
  type EditorCtx,
} from "../worker/content-editor.ts";
import { getSnapshot } from "../worker/published-snapshots.ts";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");
const TENANT = "urban-cowboy";

function makeDb() {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON");
  for (const file of [
    "migrations/0001_init.sql",
    "migrations/0002_module_list_indexes.sql",
    "migrations/0003_property_scoped_contracts.sql",
    "migrations/0004_published_snapshots.sql",
    "migrations/0005_media_registry.sql",
  ]) db.exec(read(file));
  db.exec("INSERT INTO tenants (id, slug, name) VALUES ('urban-cowboy','urban-cowboy','Urban Cowboy')");
  return db;
}

function d1(db: DatabaseSync): any {
  return {
    prepare(sql: string) {
      let params: unknown[] = [];
      return {
        bind(...values: unknown[]) { params = values; return this; },
        async all() { return { results: db.prepare(sql).all(...params) }; },
        async first() { return db.prepare(sql).get(...params) ?? null; },
        async run() { db.prepare(sql).run(...params); return { success: true }; },
      };
    },
  };
}

const principal = {
  sub: "editor-1", email: "editor@example.test", groups: [], roles: ["viewer", "admin"] as ("viewer" | "admin")[],
  tenantId: TENANT,
};
const allowAdmin: Authorize = async (_request, _env, role) =>
  role === "admin" ? principal : new Response(JSON.stringify({ error: "forbidden" }), { status: 403 });

function ctx(db: DatabaseSync, body?: unknown): EditorCtx {
  return {
    request: new Request("https://example.test/api/content/editor/items", body === undefined ? {} : {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
    env: { DB: d1(db) } as any,
    waitUntil: () => {},
  };
}

async function create(db: DatabaseSync, payload: Record<string, unknown>) {
  const body = { kind: "policy", slug: "policy-a", payload };
  const res = await createEditorDraft(ctx(db, body), allowAdmin);
  assert.equal(res.status, 201);
  return res.json() as Promise<{ id: string; revisionId: string }>;
}

async function snapshotVersion(db: DatabaseSync): Promise<string | null> {
  return (await getSnapshot(d1(db), { tenantId: TENANT }, "contentItems"))?.version ?? null;
}

test("draft creation and draft edits never change the published snapshot", async () => {
  const db = makeDb();
  const before = await snapshotVersion(db);
  const { id, revisionId } = await create(db, { title: "v1" });
  assert.equal(await snapshotVersion(db), before);

  const saved = await saveEditorDraft(ctx(db, {
    payload: { title: "v2" }, expectedRevisionId: revisionId,
  }), id, allowAdmin);
  assert.equal(saved.status, 200);
  const savedBody = await saved.json() as any;
  assert.equal(savedBody.status, "draft");
  assert.equal(savedBody.snapshotRefreshed, false);
  assert.equal(await snapshotVersion(db), before);

  const item = db.prepare("SELECT status, current_revision_id FROM content_items WHERE id=?").get(id) as any;
  assert.equal(item.status, "draft");
  assert.equal(item.current_revision_id, savedBody.revisionId);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM audit_log WHERE action='draft_saved'").get().n, 1);
  db.close();
});

test("stale edits are rejected with a conflict instead of overwriting", async () => {
  const db = makeDb();
  const { id, revisionId } = await create(db, { title: "v1" });
  await saveEditorDraft(ctx(db, { payload: { title: "v2" }, expectedRevisionId: revisionId }), id, allowAdmin);
  const stale = await saveEditorDraft(ctx(db, { payload: { title: "v3" }, expectedRevisionId: revisionId }), id, allowAdmin);
  assert.equal(stale.status, 409);
  assert.equal((await stale.json() as any).error, "edit_conflict");
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM content_revisions WHERE content_item_id=?").get(id).n, 2);
  db.close();
});

test("publish makes a revision live and refresh; rollback repoints an earlier one", async () => {
  const db = makeDb();
  const before = await snapshotVersion(db);
  const { id, revisionId: v1 } = await create(db, { title: "v1" });
  const saved = await saveEditorDraft(ctx(db, { payload: { title: "v2" }, expectedRevisionId: v1 }), id, allowAdmin);
  const v2 = (await saved.json() as any).revisionId as string;

  const published = await publishEditorItem(ctx(db, { revisionId: v2 }), id, allowAdmin);
  assert.equal(published.status, 200);
  assert.equal((await published.json() as any).snapshotRefreshed, true);
  const afterPublish = await snapshotVersion(db);
  assert.ok(afterPublish && afterPublish !== before);
  assert.equal(db.prepare("SELECT status FROM content_items WHERE id=?").get(id).status, "published");
  assert.ok(db.prepare("SELECT published_at FROM content_revisions WHERE id=?").get(v2).published_at);

  const rolled = await rollbackEditorItem(ctx(db, { revisionId: v1 }), id, allowAdmin);
  assert.equal(rolled.status, 200);
  assert.equal((await rolled.json() as any).revisionId, v1);
  assert.equal(db.prepare("SELECT current_revision_id FROM content_items WHERE id=?").get(id).current_revision_id, v1);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM audit_log WHERE action='content_rolled_back'").get().n, 1);
  const previewCtx: EditorCtx = {
    ...ctx(db),
    request: new Request(`https://example.test/api/content/editor/items/${id}?revisionId=${v1}`),
  };
  const preview = await getEditorItem(previewCtx, id, allowAdmin);
  assert.equal(preview.status, 200);
  assert.deepEqual((await preview.json() as any).preview, { title: "v1" });
  db.close();
});

test("role and tenant checks live on the API, not only the UI", async () => {
  const db = makeDb();
  const deny: Authorize = async (_r, _e, role) =>
    role === "admin" ? new Response(JSON.stringify({ error: "forbidden" }), { status: 403 }) : principal;
  const denied = await createEditorDraft(ctx(db, { kind: "policy", slug: "x", payload: {} }), deny);
  assert.equal(denied.status, 403);

  const { id } = await create(db, { title: "owned" });
  const otherTenant: Authorize = async () => ({ ...principal, tenantId: "other" });
  const read = await getEditorItem({
    ...ctx(db),
    request: new Request(`https://example.test/api/content/editor/items/${id}`),
  }, id, otherTenant);
  assert.equal(read.status, 404);
  db.close();
});

test("staged payloads are validated before any write", async () => {
  const db = makeDb();
  const badKey = await createEditorDraft(ctx(db, {
    kind: "policy", slug: "x", payload: JSON.parse('{"__proto__":{"polluted":true}}'),
  }), allowAdmin);
  assert.equal(badKey.status, 400);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM content_items").get().n, 0);

  const tooLarge = await createEditorDraft(ctx(db, {
    kind: "policy", slug: "x", payload: { blob: "x".repeat(250_000) },
  }), allowAdmin);
  assert.equal(tooLarge.status, 400);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM content_items").get().n, 0);
  db.close();
});

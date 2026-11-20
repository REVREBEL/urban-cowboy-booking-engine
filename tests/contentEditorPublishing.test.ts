// COW-38: draft edits stay out of published snapshots until publish.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import {
  createEditorDraft,
  getEditorItem,
  listEditorItems,
  publishEditorItem,
  rollbackEditorItem,
  saveEditorDraft,
  type Authorize,
  type EditorCtx,
} from "../worker/content-editor.ts";
import { getSnapshot, saveSnapshot } from "../worker/published-snapshots.ts";
import { buildSnapshot, loadPublishedCollection } from "../worker/content-provider.ts";

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
    "migrations/0006_working_revision_pointer.sql",
    "migrations/0007_amenity_editorial.sql",
  ]) db.exec(read(file));
  db.exec("INSERT INTO tenants (id, slug, name) VALUES ('urban-cowboy','urban-cowboy','Urban Cowboy')");
  db.exec("INSERT INTO locations (id, tenant_id, slug, name) VALUES ('catskills','urban-cowboy','catskills','Catskills')");
  return db;
}

function d1(db: DatabaseSync, failBatch = false): any {
  return {
    prepare(sql: string) {
      let params: unknown[] = [];
      return {
        get sql() { return sql; },
        get params() { return params; },
        bind(...values: unknown[]) { params = values; return this; },
        async all() { return { results: db.prepare(sql).all(...params) }; },
        async first() { return db.prepare(sql).get(...params) ?? null; },
        async run() {
          db.prepare(sql).run(...params);
          return { success: true, meta: { changes: (db.prepare("SELECT changes() AS n").get() as any).n } };
        },
      };
    },
    async batch(statements: Array<{ sql: string; params: unknown[] }>) {
      db.exec("BEGIN");
      try {
        if (failBatch) throw new Error("injected batch failure");
        const results = statements.map((s) => {
          db.prepare(s.sql).run(...s.params);
          return { success: true, meta: { changes: (db.prepare("SELECT changes() AS n").get() as any).n } };
        });
        db.exec("COMMIT");
        return results;
      } catch (err) {
        db.exec("ROLLBACK");
        throw err;
      }
    },
  };
}

const principal = {
  sub: "editor-1", email: "editor@example.test", groups: [], roles: ["viewer", "admin"] as ("viewer" | "admin")[],
  tenantId: TENANT,
};
const allowAdmin: Authorize = async (_request, _env, role) =>
  role === "admin" ? principal : new Response(JSON.stringify({ error: "forbidden" }), { status: 403 });

function ctx(db: DatabaseSync, body?: unknown, failBatch = false): EditorCtx {
  return {
    request: new Request("https://example.test/api/content/editor/items", body === undefined ? {} : {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
    env: { DB: d1(db, failBatch) } as any,
    waitUntil: () => {},
  };
}

async function create(db: DatabaseSync, payload: Record<string, unknown>, slug = "policy-a") {
  const body = { kind: "policy", slug, payload };
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
  assert.equal(item.current_revision_id, null); // published pointer never moves on edit
  const working = db.prepare("SELECT working_revision_id FROM content_item_pointers WHERE tenant_id=? AND content_item_id=?").get(TENANT, id) as any;
  assert.equal(working.working_revision_id, savedBody.revisionId);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM audit_log WHERE action='draft_saved'").get().n, 1);
  db.close();
});

test("competing saves with the same expected revision produce one winner and no partial writes", async () => {
  const db = makeDb();
  const { id, revisionId } = await create(db, { title: "v1" });
  const [first, second] = await Promise.all([
    saveEditorDraft(ctx(db, { payload: { title: "winner" }, expectedRevisionId: revisionId }), id, allowAdmin),
    saveEditorDraft(ctx(db, { payload: { title: "loser" }, expectedRevisionId: revisionId }), id, allowAdmin),
  ]);
  const statuses = [first.status, second.status].sort();
  assert.deepEqual(statuses, [200, 409]);
  const loser = first.status === 409 ? first : second;
  assert.equal((await loser.json() as any).error, "edit_conflict");

  // Exactly one revision and one audit row were committed; the pointer points
  // at the winner, and no draft was silently overwritten.
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM content_revisions WHERE content_item_id=?").get(id).n, 2);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM audit_log WHERE action='draft_saved'").get().n, 1);
  const working = db.prepare("SELECT working_revision_id FROM content_item_pointers WHERE content_item_id=?").get(id).working_revision_id;
  assert.equal(working, `${id}-r2`);
  assert.equal(db.prepare("SELECT payload_json FROM content_revisions WHERE id=?").get(working).payload_json, '{"title":"winner"}');
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
  assert.equal(db.prepare("SELECT working_revision_id FROM content_item_pointers WHERE tenant_id=? AND content_item_id=?").get(TENANT, id).working_revision_id, v1);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM audit_log WHERE action='content_rolled_back'").get().n, 1);
  const previewCtx: EditorCtx = {
    ...ctx(db),
    request: new Request(`https://example.test/api/content/editor/items/${id}?revisionId=${v1}`),
  };
  const preview = await getEditorItem(previewCtx, id, allowAdmin);
  assert.equal(preview.status, 200);
  assert.deepEqual((await preview.json() as any).preview, { title: "v1" });

  const unknownRevision: EditorCtx = {
    ...ctx(db),
    request: new Request(`https://example.test/api/content/editor/items/${id}?revisionId=missing`),
  };
  const missing = await getEditorItem(unknownRevision, id, allowAdmin);
  assert.equal(missing.status, 404);
  assert.equal((await missing.json() as any).error, "revision_not_found");

  const list = await listEditorItems(ctx(db), allowAdmin);
  assert.equal(list.status, 200);
  const listed = (await list.json() as any).items[0];
  assert.equal(listed.currentRevisionId, v1);
  assert.ok(listed.updatedAt);
  assert.equal(listed.current_revision_id, undefined);
  const detail = await getEditorItem({ ...ctx(db), request: new Request(`https://example.test/api/content/editor/items/${id}`) }, id, allowAdmin);
  assert.equal((await detail.json() as any).item.currentRevisionId, v1);
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

test("editing a published item cannot leak into an independent snapshot refresh", async () => {
  const db = makeDb();
  const { id, revisionId: v1 } = await create(db, { title: "v1" });
  await publishEditorItem(ctx(db, { revisionId: v1 }), id, allowAdmin);
  const publishedVersion = await snapshotVersion(db);
  assert.ok(publishedVersion);

  const saved = await saveEditorDraft(ctx(db, {
    payload: { title: "draft-v2" }, expectedRevisionId: v1,
  }), id, allowAdmin);
  assert.equal(saved.status, 200);

  // Simulate an independent/manual COW-32 refresh after the draft edit.
  const api = d1(db);
  const records = await loadPublishedCollection(api, { tenantId: TENANT }, "contentItems");
  await saveSnapshot(api, { tenantId: TENANT }, "contentItems", await buildSnapshot("contentItems", records));
  assert.equal(await snapshotVersion(db), publishedVersion);
  assert.equal(db.prepare("SELECT current_revision_id FROM content_items WHERE id=?").get(id).current_revision_id, v1);

  const explicit = await publishEditorItem(ctx(db, {}), id, allowAdmin);
  assert.equal(explicit.status, 200);
  assert.notEqual(await snapshotVersion(db), publishedVersion);
  db.close();
});

test("a caller-supplied location must belong to the authorized tenant", async () => {
  const db = makeDb();
  const foreign = await createEditorDraft(ctx(db, {
    kind: "policy", slug: "x", locationId: "foreign-location", payload: {},
  }), allowAdmin);
  assert.equal(foreign.status, 400);
  assert.equal((await foreign.json() as any).error, "invalid_location");

  const own = await createEditorDraft(ctx(db, {
    kind: "policy", slug: "x", locationId: "catskills", payload: {},
  }), allowAdmin);
  assert.equal(own.status, 201);
  db.close();
});

test("an injected batch failure leaves no partial revision or audit writes", async () => {
  const db = makeDb();
  const { id, revisionId } = await create(db, { title: "v1" });
  await assert.rejects(() => saveEditorDraft(ctx(db, {
    payload: { title: "v2" }, expectedRevisionId: revisionId,
  }, true), id, allowAdmin));
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM content_revisions WHERE content_item_id=?").get(id).n, 1);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM audit_log WHERE action='draft_saved'").get().n, 0);
  assert.equal(db.prepare("SELECT working_revision_id FROM content_item_pointers WHERE content_item_id=?").get(id).working_revision_id, revisionId);
  db.close();
});

test("duplicate slugs and revisions with nothing to publish are handled explicitly", async () => {
  const db = makeDb();
  await create(db, { title: "v1" });
  const duplicate = await createEditorDraft(ctx(db, {
    kind: "policy", slug: "policy-a", payload: {},
  }), allowAdmin);
  assert.equal(duplicate.status, 409);
  assert.equal((await duplicate.json() as any).error, "slug_conflict");

  const { id } = await create(db, { title: "v1" }, "policy-b");
  db.exec(`UPDATE content_items SET current_revision_id = NULL WHERE id='${id}'`);
  db.exec(`DELETE FROM content_item_pointers WHERE content_item_id='${id}'`);
  const nothing = await publishEditorItem(ctx(db, {}), id, allowAdmin);
  assert.equal(nothing.status, 409);
  assert.equal((await nothing.json() as any).error, "no_revision_to_publish");
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

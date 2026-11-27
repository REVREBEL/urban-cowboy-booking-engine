import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';

function database() {
  const db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys=ON');
  const dir = new URL('../migrations/', import.meta.url);
  for (const name of readdirSync(dir).filter(n => /^\d{4}_.*\.sql$/.test(n) && n < '0013_').sort()) {
    db.exec(readFileSync(new URL(name, dir), 'utf8'));
  }
  db.exec(`INSERT INTO tenants(id,slug,name) VALUES ('t1','a','A'),('t2','b','B');
    INSERT INTO locations(id,tenant_id,slug,name) VALUES ('l1','t1','a','A'),('l2','t2','b','B');
    INSERT INTO amenities(id,tenant_id,name) VALUES ('a1','t1','Wifi'),('a2','t2','Spa');`);
  const sql = readFileSync(new URL('0013_amenity_foundation.sql', dir), 'utf8');
  db.exec(sql);
  db.exec(sql);
  return db;
}

test('property assignments enforce tenant ownership, uniqueness, and inherited defaults', () => {
  const db = database();
  db.exec("INSERT INTO location_amenities(tenant_id,location_id,amenity_id) VALUES ('t1','l1','a1')");
  for (const row of ["'t1','l1','a1'", "'t1','l1','a2'", "'t1','l2','a1'"]) {
    assert.throws(() => db.exec(`INSERT INTO location_amenities(tenant_id,location_id,amenity_id) VALUES (${row})`));
  }
  const overrides = db.prepare('SELECT short_name_override,short_description_override,image_path_override FROM location_amenities').get();
  assert.deepEqual(Object.values(overrides!), [null, null, null]);
  assert.deepEqual(db.prepare('PRAGMA foreign_key_check').all(), []);
  db.close();
});

test('lookup defaults exist for existing and future tenants without overwriting edits', () => {
  const db = database();
  db.exec("UPDATE amenity_types SET name='Custom feature' WHERE tenant_id='t1' AND id='feature'");
  db.exec(readFileSync(new URL('../migrations/0013_amenity_foundation.sql', import.meta.url), 'utf8'));
  db.exec("INSERT INTO tenants(id,slug,name) VALUES ('t3','c','C')");
  for (const tenant of ['t1','t3']) {
    assert.equal(db.prepare('SELECT count(*) AS n FROM amenity_types WHERE tenant_id=?').get(tenant)!.n, 5);
    assert.equal(db.prepare('SELECT count(*) AS n FROM amenity_categories WHERE tenant_id=?').get(tenant)!.n, 5);
  }
  assert.equal(db.prepare("SELECT name FROM amenity_types WHERE tenant_id='t1' AND id='feature'").get()!.name,'Custom feature');
  db.close();
});

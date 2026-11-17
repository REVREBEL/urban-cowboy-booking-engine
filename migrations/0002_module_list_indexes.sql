-- Indexes for the commercial module list endpoints in worker/d1-modules.ts.
-- Each endpoint filters by tenant_id plus publication state and orders by
-- created_at DESC; these indexes cover both the predicate and the sort.
--
-- This is a separate migration because 0001_init.sql is already applied in
-- production and D1 will not re-run an edited migration.

CREATE INDEX IF NOT EXISTS idx_add_ons_tenant_status_created
  ON add_ons (tenant_id, status, created_at);

CREATE INDEX IF NOT EXISTS idx_offers_tenant_status_created
  ON offers (tenant_id, status, created_at);

CREATE INDEX IF NOT EXISTS idx_upgrades_tenant_status_created
  ON upgrades (tenant_id, status, created_at);

CREATE INDEX IF NOT EXISTS idx_events_tenant_display_created
  ON events (tenant_id, display_flag, created_at);

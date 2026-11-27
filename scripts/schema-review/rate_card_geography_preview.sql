-- Local DbGate review only. Apply after rate_card_foundation_preview.py.
PRAGMA foreign_keys=ON;
BEGIN IMMEDIATE;
CREATE TABLE rate_card_global_settings (
  tenant_id TEXT PRIMARY KEY REFERENCES tenants(id),
  configurable_rate_cards INTEGER CHECK(configurable_rate_cards IN (0,1))
);
INSERT INTO rate_card_global_settings (tenant_id) SELECT id FROM tenants;
ALTER TABLE rate_card_configuration ADD COLUMN miles_from_center REAL CHECK(miles_from_center >= 0);
ALTER TABLE rate_card_configuration ADD COLUMN postal_code TEXT;
CREATE TABLE rate_card_geographic_settings (
  tenant_id TEXT NOT NULL,
  rate_id TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'none' CHECK(mode IN ('none','exclude_us','exclude_north_america','international_all','international_selected')),
  PRIMARY KEY (tenant_id,rate_id),
  UNIQUE (tenant_id,rate_id,mode),
  FOREIGN KEY (tenant_id,rate_id) REFERENCES rate_card_configuration(tenant_id,rate_id)
);
CREATE TABLE rate_card_eligible_regions (
  tenant_id TEXT NOT NULL,
  rate_id TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'international_selected' CHECK(mode='international_selected'),
  region TEXT NOT NULL CHECK(region IN ('europe','asia','mexico','canada','united_states')),
  PRIMARY KEY (tenant_id,rate_id,region),
  FOREIGN KEY (tenant_id,rate_id,mode) REFERENCES rate_card_geographic_settings(tenant_id,rate_id,mode) ON DELETE CASCADE
);
INSERT INTO rate_card_geographic_settings (tenant_id,rate_id) SELECT tenant_id,rate_id FROM rate_card_configuration;
COMMIT;

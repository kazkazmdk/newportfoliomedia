-- Penta platform schema. Postgres-compatible. No invented commercial rows.

CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  kind TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS memberships (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  UNIQUE (organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  site TEXT NOT NULL,
  environment TEXT NOT NULL,
  label TEXT NOT NULL,
  prefix TEXT NOT NULL,
  hash TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL,
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS api_key_scopes (
  key_id TEXT NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  scope TEXT NOT NULL,
  PRIMARY KEY (key_id, scope)
);

CREATE TABLE IF NOT EXISTS api_usage (
  organization_id TEXT NOT NULL,
  site TEXT NOT NULL,
  feature TEXT NOT NULL,
  period_start TEXT NOT NULL,
  used INTEGER NOT NULL,
  PRIMARY KEY (organization_id, site, feature, period_start)
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  site TEXT NOT NULL,
  name TEXT NOT NULL,
  path TEXT,
  entity_id TEXT,
  properties JSONB NOT NULL DEFAULT '{}',
  at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  organization_id TEXT,
  site TEXT NOT NULL,
  kind TEXT NOT NULL,
  state TEXT NOT NULL,
  entity_id TEXT,
  message TEXT NOT NULL,
  contact TEXT NOT NULL,
  assigned_partner_id TEXT,
  consent_version TEXT NOT NULL,
  consent_timestamp TIMESTAMPTZ NOT NULL,
  source_page TEXT,
  privacy_notice_version TEXT NOT NULL,
  ip_hash TEXT,
  user_agent_hash TEXT,
  retention_until TIMESTAMPTZ NOT NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS observations (
  id TEXT PRIMARY KEY,
  site TEXT NOT NULL,
  kind TEXT NOT NULL,
  entity_id TEXT,
  field TEXT,
  value TEXT NOT NULL,
  source_type TEXT NOT NULL,
  state TEXT NOT NULL,
  payload JSONB,
  moderator_note TEXT,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS widget_installations (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  site TEXT NOT NULL,
  environment TEXT NOT NULL,
  name TEXT NOT NULL,
  public_key TEXT NOT NULL,
  theme TEXT,
  branding_mode TEXT NOT NULL,
  features JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS widget_domains (
  installation_id TEXT NOT NULL REFERENCES widget_installations(id) ON DELETE CASCADE,
  origin TEXT NOT NULL,
  PRIMARY KEY (installation_id, origin)
);

CREATE TABLE IF NOT EXISTS widget_usage (
  installation_id TEXT NOT NULL,
  day TEXT NOT NULL,
  checks INTEGER NOT NULL,
  PRIMARY KEY (installation_id, day)
);

CREATE TABLE IF NOT EXISTS partners (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS partner_capabilities (
  partner_id TEXT NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  capability TEXT NOT NULL,
  PRIMARY KEY (partner_id, capability)
);

CREATE TABLE IF NOT EXISTS partner_regions (
  partner_id TEXT NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  region TEXT NOT NULL,
  PRIMARY KEY (partner_id, region)
);

CREATE TABLE IF NOT EXISTS merchants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  merchant_id TEXT REFERENCES merchants(id),
  site TEXT NOT NULL,
  sku TEXT,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS offers (
  id TEXT PRIMARY KEY,
  merchant_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  country TEXT NOT NULL,
  currency TEXT NOT NULL,
  price NUMERIC,
  availability TEXT NOT NULL,
  source_url TEXT NOT NULL,
  affiliate_url TEXT,
  commission_model TEXT,
  checked_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS affiliate_programs (
  id TEXT PRIMARY KEY,
  merchant_id TEXT NOT NULL,
  network TEXT,
  status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS entitlements (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  site TEXT NOT NULL,
  feature TEXT NOT NULL,
  limit_value INTEGER NOT NULL,
  period TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  contact_sales BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS data_exports (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  dataset TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS data_license_requests (
  id TEXT PRIMARY KEY,
  organization_id TEXT,
  site TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor TEXT,
  action TEXT NOT NULL,
  subject TEXT,
  at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS request_logs (
  request_id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  organization_id TEXT,
  key_id TEXT,
  site TEXT NOT NULL,
  route TEXT NOT NULL,
  status INTEGER NOT NULL,
  latency_ms INTEGER NOT NULL,
  error_code TEXT,
  entity_id TEXT,
  environment TEXT
);

CREATE TABLE IF NOT EXISTS revenue_events (
  id TEXT PRIMARY KEY,
  channel TEXT NOT NULL,
  site TEXT NOT NULL,
  organization_id TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  source TEXT,
  external_reference TEXT,
  occurred_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS product_variants (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  sku TEXT,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS affiliate_links (
  id TEXT PRIMARY KEY,
  program_id TEXT NOT NULL,
  merchant_id TEXT NOT NULL,
  click_id TEXT,
  sub_id TEXT,
  commission_status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS price_observations (
  id TEXT PRIMARY KEY,
  offer_id TEXT NOT NULL,
  price NUMERIC,
  currency TEXT NOT NULL,
  observed_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS availability_observations (
  id TEXT PRIMARY KEY,
  offer_id TEXT NOT NULL,
  availability TEXT NOT NULL,
  observed_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS datasets (
  id TEXT PRIMARY KEY,
  site TEXT NOT NULL,
  name TEXT NOT NULL,
  schema_version TEXT NOT NULL,
  refresh_cadence TEXT NOT NULL,
  coverage TEXT,
  provenance_summary TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS dataset_versions (
  id TEXT PRIMARY KEY,
  dataset_id TEXT NOT NULL REFERENCES datasets(id),
  version TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS dataset_fields (
  dataset_id TEXT NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  field_type TEXT NOT NULL,
  licensable BOOLEAN NOT NULL,
  PRIMARY KEY (dataset_id, name)
);

CREATE TABLE IF NOT EXISTS export_jobs (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  dataset_id TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS sponsor_campaigns (
  id TEXT PRIMARY KEY,
  site TEXT NOT NULL,
  label TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  disclosure TEXT NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS placements (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES sponsor_campaigns(id),
  surface TEXT NOT NULL,
  creative_id TEXT NOT NULL
);

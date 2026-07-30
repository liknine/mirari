CREATE TABLE IF NOT EXISTS product_overrides (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL CHECK (action IN ('upsert', 'delete')),
  is_new INTEGER NOT NULL DEFAULT 0 CHECK (is_new IN (0, 1)),
  name TEXT,
  brand TEXT,
  gender TEXT,
  category TEXT,
  subcategory TEXT,
  product_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  admin_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_product_overrides_updated_at
  ON product_overrides(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_product_overrides_search
  ON product_overrides(action, name, brand, id);

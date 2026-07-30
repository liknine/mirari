import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const sourcePath = resolve('..', 'docs', 'data', 'catalog-overrides.json');
const outputPath = resolve('migrations', '0002_import_static_overrides.sql');
const parsed = JSON.parse(await readFile(sourcePath, 'utf8'));
const products = parsed.products && typeof parsed.products === 'object' ? parsed.products : {};
const deleted = new Set(Array.isArray(parsed.deletedIds) ? parsed.deletedIds.map(String) : []);
const now = new Date().toISOString();

function sql(value) {
  if (value == null) return 'NULL';
  return `'${String(value).replaceAll("'", "''")}'`;
}

const statements = ['BEGIN TRANSACTION;'];
for (const [id, product] of Object.entries(products)) {
  const action = deleted.has(String(id)) ? 'delete' : 'upsert';
  const isNew = String(id).startsWith('custom-') ? 1 : 0;
  statements.push(`INSERT INTO product_overrides (id, action, is_new, name, brand, gender, category, subcategory, product_json, created_at, updated_at, admin_id) VALUES (${sql(id)}, ${sql(action)}, ${isNew}, ${sql(product.name || '')}, ${sql(product.brand || '')}, ${sql(product.gender || '')}, ${sql(product.category || '')}, ${sql(product.subcategory || 'none')}, ${sql(JSON.stringify(product))}, ${sql(product.createdAt || now)}, ${sql(product.updatedAt || now)}, 'static-import') ON CONFLICT(id) DO NOTHING;`);
}
for (const id of deleted) {
  if (products[id]) continue;
  statements.push(`INSERT INTO product_overrides (id, action, is_new, name, brand, gender, category, subcategory, product_json, created_at, updated_at, admin_id) VALUES (${sql(id)}, 'delete', 0, '', '', '', '', 'none', NULL, ${sql(now)}, ${sql(now)}, 'static-import') ON CONFLICT(id) DO NOTHING;`);
}
statements.push('COMMIT;');
await writeFile(outputPath, `${statements.join('\n')}\n`, 'utf8');
console.log(`Created ${outputPath}: ${Object.keys(products).length} products, ${deleted.size} deleted IDs.`);

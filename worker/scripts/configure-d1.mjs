import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const databaseId = String(process.argv[2] || '').trim();
const databaseName = String(process.argv[3] || 'mirari-catalog').trim();

if (!/^[a-f0-9-]{20,}$/i.test(databaseId)) {
  console.error('Usage: node scripts/configure-d1.mjs <DATABASE_ID> [DATABASE_NAME]');
  process.exit(1);
}

const configPath = resolve('wrangler.jsonc');
let source = await readFile(configPath, 'utf8');
const block = `"d1_databases": [\n    {\n      "binding": "CATALOG_DB",\n      "database_name": ${JSON.stringify(databaseName)},\n      "database_id": ${JSON.stringify(databaseId)}\n    }\n  ]`;

if (/"d1_databases"\s*:/.test(source)) {
  source = source.replace(/"d1_databases"\s*:\s*\[[\s\S]*?\n\s*\]/, block);
} else {
  const lastBrace = source.lastIndexOf('}');
  if (lastBrace < 0) throw new Error('wrangler.jsonc is invalid');
  const before = source.slice(0, lastBrace).trimEnd();
  const comma = before.endsWith(',') ? '' : ',';
  source = `${before}${comma}\n  ${block}\n}\n`;
}

await writeFile(configPath, source, 'utf8');
console.log(`Configured D1 binding CATALOG_DB -> ${databaseName} (${databaseId})`);

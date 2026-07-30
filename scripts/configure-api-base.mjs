import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const apiBase = String(process.argv[2] || '').trim().replace(/\/+$/, '');
if (!/^https:\/\/.+\.workers\.dev$/i.test(apiBase) && !/^https:\/\//i.test(apiBase)) {
  console.error('Usage: node scripts/configure-api-base.mjs https://YOUR-WORKER.workers.dev');
  process.exit(1);
}

const filePath = resolve('docs/config.js');
let source = await readFile(filePath, 'utf8');
const line = `  apiBase: ${JSON.stringify(apiBase)},`;

if (/\bapiBase\s*:/.test(source)) {
  source = source.replace(/^\s*apiBase\s*:\s*.*,$/m, line);
} else {
  source = source.replace(/window\.MIRARI_CONFIG\s*=\s*\{\s*\n/, (match) => `${match}${line}\n`);
}

await writeFile(filePath, source, 'utf8');
console.log(`Mini App API configured: ${apiBase}`);

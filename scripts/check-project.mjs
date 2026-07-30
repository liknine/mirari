import { access, readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const required = [
  'docs/index.html', 'docs/style.css', 'docs/app.js', 'docs/config.js',
  'docs/catalog-data/manifest.json', 'docs/catalog-data/search.json',
  'docs/data/catalog-overrides.json', 'worker/src/index.ts', 'worker/wrangler.jsonc'
];
for (const path of required) await access(new URL(path, root));
const manifest = JSON.parse(await readFile(new URL('docs/catalog-data/manifest.json', root), 'utf8'));
const overrides = JSON.parse(await readFile(new URL('docs/data/catalog-overrides.json', root), 'utf8'));
if (manifest.total !== 17618) throw new Error(`Unexpected catalog total: ${manifest.total}`);
if (!manifest.genders?.male?.categories?.length || !manifest.genders?.female?.categories?.length) throw new Error('Gender categories missing');
if (!overrides.products || !Array.isArray(overrides.deletedIds)) throw new Error('Invalid overrides schema');
for (const gender of ['male', 'female']) {
  for (const slug of ['clothes', 'shoes', 'bags', 'accessories', 'belts', 'watches', 'perfume']) {
    await access(new URL(`docs/category-covers/${gender}/${slug}.webp`, root));
  }
}
console.log('OK: Mirari project structure is valid.');
console.log(`Catalog: ${manifest.total.toLocaleString('ru-RU')} products.`);

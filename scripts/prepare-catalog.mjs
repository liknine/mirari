import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('../docs/catalog-data/', import.meta.url);
const manifestPath = new URL('manifest.json', root);

function correctByn(item) {
  if (!item || item.pricingStatus !== 'source-fallback') return false;
  const rub = Number(item.priceRub ?? item.price) || 0;
  if (rub <= 0) return false;
  const next = Math.round(((rub / 12.7) * 0.455) / 5) * 5;
  if (Number(item.priceByn) === next) return false;
  item.priceByn = next;
  return true;
}

async function walk(dirUrl) {
  const entries = await readdir(dirUrl, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const child = new URL(`${entry.name}${entry.isDirectory() ? '/' : ''}`, dirUrl);
    if (entry.isDirectory()) files.push(...await walk(child));
    else if (entry.name.endsWith('.json') && entry.name !== 'manifest.json') files.push(child);
  }
  return files;
}

let changedPrices = 0;
for (const file of await walk(root)) {
  const data = JSON.parse(await readFile(file, 'utf8'));
  if (!Array.isArray(data.items)) continue;
  let changed = 0;
  for (const item of data.items) if (correctByn(item)) changed += 1;
  if (changed) {
    changedPrices += changed;
    await writeFile(file, JSON.stringify(data));
  }
}

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
for (const gender of ['male', 'female']) {
  const categories = manifest?.genders?.[gender]?.categories || [];
  for (const category of categories) {
    const local = `/category-covers/${gender}/${category.slug}.webp`;
    if (['clothes', 'shoes', 'bags', 'accessories', 'belts', 'watches', 'perfume'].includes(category.slug)) {
      category.coverImage = local;
    }
  }
}
const maleClothes = manifest.genders.male.categories.find((item) => item.slug === 'clothes');
if (maleClothes) {
  for (const sub of maleClothes.subcategories || []) {
    if (['jeans-sub', 'pants-sub'].includes(sub.slug)) sub.coverImage = '/category-covers/male/clothes-jeans.webp';
    if (sub.slug === 'polo-sub') sub.coverImage = '/category-covers/male/clothes.webp';
  }
}
const maleAccessories = manifest.genders.male.categories.find((item) => item.slug === 'accessories');
if (maleAccessories) {
  for (const sub of maleAccessories.subcategories || []) {
    if (sub.slug === 'jewelry-sub') sub.coverImage = '/category-covers/male/accessories.webp';
  }
}
manifest.generatedAt = new Date().toISOString();
await writeFile(manifestPath, JSON.stringify(manifest));
console.log(`Catalog prepared. Corrected BYN values: ${changedPrices}.`);

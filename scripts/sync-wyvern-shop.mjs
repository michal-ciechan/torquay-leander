// Refresh the Merchandise page's fallback snapshot from the live Wyvern shop, and report
// what changed (new or removed items, price changes, single price vs "from").
//   npm run sync:shop            fetch, verify, show changes, rewrite the snapshot
//   npm run sync:shop -- --check fetch, verify, show changes; exit 1 if any (no write)
import { readFileSync, writeFileSync } from 'node:fs';
import { fetchVerifiedProducts, SHOP_URL } from '../src/data/wyvern-feed.mjs';

const FILE = new URL('../src/data/wyvern-shop-fallback.json', import.meta.url);
const check = process.argv.includes('--check');
const gbp = (n) => `£${n.toFixed(2)}`;
const label = (i) => (i.priceMax > i.price ? `from ${gbp(i.price)} (up to ${gbp(i.priceMax)})` : gbp(i.price));

const items = await fetchVerifiedProducts();
const old = JSON.parse(readFileSync(FILE, 'utf8'));
const oldByUrl = new Map(old.map((i) => [i.url, i]));
const newUrls = new Set(items.map((i) => i.url));

console.log(`${SHOP_URL}: ${items.length} items, all priced in GBP and matching their product pages\n`);
for (const i of items) console.log(`  ${label(i).padEnd(30)} ${i.title}`);

const changes = [];
for (const i of items) {
  const o = oldByUrl.get(i.url);
  if (!o) changes.push(`+ new: ${i.title}, ${label(i)}`);
  else if (o.price !== i.price || o.priceMax !== i.priceMax) changes.push(`~ ${i.title}: ${label(o)} -> ${label(i)}`);
  else if (o.title !== i.title || o.image !== i.image) changes.push(`~ ${i.title}: title or image changed`);
}
for (const o of old) if (!newUrls.has(o.url)) changes.push(`- gone: ${o.title}`);

console.log(changes.length ? `\nChanges since the snapshot:\n  ${changes.join('\n  ')}` : '\nSnapshot already up to date.');
if (check) process.exit(changes.length ? 1 : 0);
if (changes.length) {
  writeFileSync(FILE, JSON.stringify(items, null, 2) + '\n');
  console.log('\nWrote src/data/wyvern-shop-fallback.json');
}

// Club kit sold through Wyvern Swimwear, grouped for the Merchandise page. Fetched at
// build time (wyvern-feed.mjs) - the weekly scheduled deploy keeps prices and new items
// current. If Wyvern can't be reached or a price fails its checks, the build uses the
// snapshot in wyvern-shop-fallback.json, refreshed with `npm run sync:shop`.
import fallback from './wyvern-shop-fallback.json';
import { fetchVerifiedProducts } from './wyvern-feed.mjs';

export { SHOP_URL } from './wyvern-feed.mjs';

// First match wins, so the catch-all goes last.
const GROUPS = [
  { key: 'swimwear', label: 'Swimwear', strap: 'Club costumes, jammers and kneesuits for training and galas.', match: /costume|jammer|kneesuit|brief/i },
  { key: 'training', label: 'Training Kit', strap: 'Lightweight tech kit for poolside, warm-ups and travelling to meets.', match: /tech|shorts/i },
  { key: 'leisure', label: 'Leisurewear', strap: 'Cotton club wear for everyday.', match: /cotton|jogger|hood/i },
  { key: 'bags', label: 'Bags & Accessories', strap: 'Everything else to get your kit to the pool.', match: /./ },
];

async function fetchProducts() {
  try {
    return await fetchVerifiedProducts();
  } catch (err) {
    console.warn(`[wyvern-shop] using fallback snapshot: ${err.message}`);
    return fallback;
  }
}

export async function loadShop() {
  const items = await fetchProducts();
  return GROUPS.map((g) => ({ ...g, items: items.filter((i) => GROUPS.find((x) => x.match.test(i.title)) === g) }))
    .filter((g) => g.items.length);
}

// Club kit sold through Wyvern Swimwear (a Shopify store): the Torquay Leander
// collection. Fetched at build time - the weekly scheduled deploy keeps prices and
// new items current. If Wyvern can't be reached, the build uses the snapshot in
// wyvern-shop-fallback.json (the same feed run through normalise(), saved by hand).
import fallback from './wyvern-shop-fallback.json';

const STORE = 'https://www.wyvernswimwear.co.uk';
export const SHOP_URL = `${STORE}/collections/torquay-leander`;

// First match wins, so the catch-all goes last.
const GROUPS = [
  { key: 'swimwear', label: 'Swimwear', strap: 'Club costumes, jammers and kneesuits for training and galas.', match: /costume|jammer|kneesuit|brief/i },
  { key: 'training', label: 'Training Kit', strap: 'Lightweight tech kit for poolside, warm-ups and travelling to meets.', match: /tech|shorts/i },
  { key: 'leisure', label: 'Leisurewear', strap: 'Cotton club wear for everyday.', match: /cotton|jogger|hood/i },
  { key: 'bags', label: 'Bags & Accessories', strap: 'Everything else to get your kit to the pool.', match: /./ },
];

// Shopify's public collection feed -> the few fields the page shows.
export function normalise(products) {
  return products.map((p) => {
    const image = p.images?.[0];
    let src = image?.src || '';
    if (src) {
      const u = new URL(src);
      u.searchParams.set('width', '600');
      src = u.href;
    }
    return {
      title: p.title.replace(/^Torquay Leander\s*-\s*/i, '').replace(/\s*-\s*Umiko$/i, ''),
      url: `${STORE}/products/${p.handle}`,
      price: Math.min(...p.variants.map((v) => Number(v.price))),
      image: src,
    };
  });
}

async function fetchProducts() {
  try {
    const res = await fetch(`${SHOP_URL}/products.json?limit=250`, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const items = normalise((await res.json()).products);
    if (!items.length) throw new Error('empty collection');
    return items;
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

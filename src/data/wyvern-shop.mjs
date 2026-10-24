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

// Shopify Markets prices by the visitor's location, and GitHub's runners are in the US:
// without these the feed comes back in dollars (a £23.95 shirt read as 33.00). Pin GB
// both ways - query string and the localization cookie Shopify sets for a chosen country.
const GB = 'country=GB&currency=GBP';
const getJson = async (url) => {
  const res = await fetch(url, { headers: { cookie: 'localization=GB' }, signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
};

async function fetchProducts() {
  try {
    // The feed carries no currency, so ask the cart which one these requests are priced in.
    const { currency } = await getJson(`${STORE}/cart.js?${GB}`);
    if (currency !== 'GBP') throw new Error(`store priced the build in ${currency}, not GBP`);
    const products = (await getJson(`${SHOP_URL}/products.json?limit=250&${GB}`)).products;
    const items = normalise(products);
    if (!items.length) throw new Error('empty collection');
    // Cross-check every price against the product's own endpoint (pence, lowest variant).
    await Promise.all(products.map(async (p, i) => {
      const { price_min } = await getJson(`${STORE}/products/${p.handle}.js?${GB}`);
      if (Math.round(items[i].price * 100) !== price_min) {
        throw new Error(`${p.handle}: feed says £${items[i].price}, product page says £${(price_min / 100).toFixed(2)}`);
      }
    }));
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

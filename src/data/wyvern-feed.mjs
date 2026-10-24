// Torquay Leander collection on Wyvern Swimwear (a Shopify store): fetch, normalise
// and verify. Plain Node with no JSON imports, so both the build (wyvern-shop.mjs) and
// `npm run sync:shop` (scripts/sync-wyvern-shop.mjs) can use it.

export const STORE = 'https://www.wyvernswimwear.co.uk';
export const SHOP_URL = `${STORE}/collections/torquay-leander`;

// Shopify Markets prices by the visitor's location, and GitHub's runners are in the US:
// without these the feed comes back in dollars (a £23.95 shirt read as 33.00). Pin GB
// both ways - query string and the localization cookie Shopify sets for a chosen country.
const GB = 'country=GB&currency=GBP';
const getJson = async (url) => {
  const res = await fetch(url, { headers: { cookie: 'localization=GB' }, signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
};

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
    const prices = p.variants.map((v) => Number(v.price));
    return {
      title: p.title.replace(/^Torquay Leander\s*-\s*/i, '').replace(/\s*-\s*Umiko$/i, ''),
      url: `${STORE}/products/${p.handle}`,
      price: Math.min(...prices),
      // Above price when some sizes cost more, so the card can say "from".
      priceMax: Math.max(...prices),
      image: src,
    };
  });
}

// Fetches the collection and throws unless every price is verifiably in GBP and agrees
// with the product's own page.
export async function fetchVerifiedProducts() {
  // The feed carries no currency, so ask the cart which one these requests are priced in.
  const { currency } = await getJson(`${STORE}/cart.js?${GB}`);
  if (currency !== 'GBP') throw new Error(`store priced the request in ${currency}, not GBP`);
  const products = (await getJson(`${SHOP_URL}/products.json?limit=250&${GB}`)).products;
  const items = normalise(products);
  if (!items.length) throw new Error('empty collection');
  // Cross-check every price range against the product's own endpoint (in pence).
  await Promise.all(products.map(async (p, i) => {
    const { price_min, price_max } = await getJson(`${STORE}/products/${p.handle}.js?${GB}`);
    const { price, priceMax } = items[i];
    if (Math.round(price * 100) !== price_min || Math.round(priceMax * 100) !== price_max) {
      throw new Error(`${p.handle}: feed says £${price}-£${priceMax}, product page says £${(price_min / 100).toFixed(2)}-£${(price_max / 100).toFixed(2)}`);
    }
  }));
  return items;
}

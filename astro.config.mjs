import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import { writeFile } from 'node:fs/promises';

// Base path comes from ASTRO_BASE so the same source can be built for the
// stable site (/torquay-leander, master) and the preview (/torquay-leander/preview,
// preview branch) - see .github/workflows/deploy.yml.
const base = (process.env.ASTRO_BASE || '/torquay-leander').replace(/\/$/, '');

// The club domain, where the master build is served at the root by the WP
// plugin (wp-preview-plugin/). The sitemap and canonical links point here.
const liveSite = 'https://torquayleander.co.uk';

// Old URLs kept working via meta-refresh pages. Destinations must carry the
// base themselves — Astro emits them verbatim.
const redirects = {
  // The /galas/ section was renamed to /competitions/ (002-mail-changes).
  '/galas/': `${base}/competitions/`,
  '/galas/club-championships/': `${base}/competitions/club-championships/`,
  '/galas/ribbon-gala/': `${base}/competitions/ribbon-gala/`,
  '/galas/competition-guide/': `${base}/competitions/competition-guide/`,
  // Old WordPress page slugs (Google, Facebook posts, bookmarks). Without these
  // the live proxy falls through to the old WP page and its old footer.
  '/home/': `${base}/`,
  '/codes-of-conduct/': `${base}/about/codes-of-conduct/`,
  '/policies-and-procedures/': `${base}/about/codes-of-conduct/`,
  '/882-2/': `${base}/safeguarding/`,
  '/club-championships/': `${base}/competitions/club-championships/`,
  '/competition-guide/': `${base}/competitions/competition-guide/`,
  '/our-meets/': `${base}/competitions/`,
  '/calendar/': `${base}/competitions/`,
  '/125-celebration/': `${base}/about/`,
  '/latest-news/': `${base}/`,
  '/sign-up/': `${base}/about/join/`,
  '/how-to-join/': `${base}/about/join/`,
  '/our-facilities/': `${base}/about/facilities/`,
  '/learn-to-swim/': `${base}/training/learn-to-swim/`,
  '/our-coaches/': `${base}/training/#coaches`,
  '/training-sessions/': `${base}/training/#timetable`,
  '/training-kit/': `${base}/training/equipment/`,
};

// Tooling, auth and redirect stubs that should not be in the sitemap.
const redirectPaths = new Set(Object.keys(redirects).map((p) => p.replace(/^\//, '')));
const sitemapExclude = /^(dev|samples|login|404)(\/|$)/;

export default defineConfig({
  site: 'https://michal-ciechan.github.io',
  base,
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
  redirects,
  // Dev-only: adds a "Dev Pages" app to the Astro dev toolbar (the bar at the
  // bottom during `astro dev`) linking to the /dev/ hub + tooling pages. The
  // toolbar never ships to `astro build`, and the `command === 'dev'` guard keeps
  // the entrypoint out of production builds entirely.
  integrations: [
    // Writes sitemap.xml with every public page on the club domain. robots.txt
    // (public/) points Google at it.
    {
      name: 'live-sitemap',
      hooks: {
        'astro:build:done': async ({ dir, pages }) => {
          const urls = pages
            .map((p) => p.pathname.replace(/^\//, ''))
            .filter((p) => !sitemapExclude.test(p) && !redirectPaths.has(p))
            .sort()
            .map((p) => `  <url><loc>${liveSite}/${p}</loc></url>`);
          const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
          await writeFile(new URL('sitemap.xml', dir), xml);
        },
      },
    },
    {
      name: 'dev-links-toolbar',
      hooks: {
        'astro:config:setup': ({ command, addDevToolbarApp }) => {
          if (command !== 'dev') return;
          addDevToolbarApp({
            id: 'dev-links',
            name: 'Dev Pages',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>',
            entrypoint: fileURLToPath(new URL('./src/dev-toolbar/dev-links.js', import.meta.url)),
          });
        },
      },
    },
  ],
  // Dev-only: lets the Caddy reverse proxy front the dev server over HTTPS at
  // https://torquay.desktop.codeperf.net/torquay-leander/ . Astro's own
  // `server.host: true` binds all interfaces so host.docker.internal reaches it;
  // vite.server.allowedHosts accepts the proxied Host header (both the machine
  // domain and the machine-agnostic localhost one that gen-caddy emits). All
  // ignored by `astro build` (GitHub Pages unaffected).
  server: {
    host: true,
  },
  vite: {
    server: {
      allowedHosts: [
        'torquay.desktop.codeperf.net',
        'torquay.localhost.codeperf.net',
      ],
    },
  },
});

import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  site: 'https://michal-ciechan.github.io',
  base: '/torquay-leander',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
  // Dev-only: adds a "Dev Pages" app to the Astro dev toolbar (the bar at the
  // bottom during `astro dev`) linking to the /dev/ hub + tooling pages. The
  // toolbar never ships to `astro build`, and the `command === 'dev'` guard keeps
  // the entrypoint out of production builds entirely.
  integrations: [
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

import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://michal-ciechan.github.io',
  base: '/torquay-leander',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
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

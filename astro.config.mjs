import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://michal-ciechan.github.io',
  base: '/torquay-leander',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
});

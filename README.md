# Torquay Leander

Website for the Torquay Leander swimming club, built with Astro and deployed to GitHub Pages.

## Published site

https://michal-ciechan.github.io/torquay-leander/

The `/dev/` sub-route is the design hub for sub-pages and component variations.

## Dev server

```
npm install
npm run dev
```

Serves on http://localhost:12700 with HMR. Port 12700 avoids the usual 3000/5173/8080 clashes.

## Build

```
npm run build
```

Outputs the static site to `dist/`. `npm run preview` serves that output locally on port 12700.

## Deploy

Every push to `master` triggers `.github/workflows/deploy.yml`, which builds the site and publishes `dist/` to GitHub Pages. Enable it once under **Settings → Pages → Source → GitHub Actions**.

## Layout

- `src/pages/index.astro` — home (hero, programs, gallery, join form, Plainmoor map).
- `src/pages/{login,training,competitions,gallery}/` — shared sub-pages.
- `src/pages/dev/index.astro` — design hub (scarlet-themed dark variant, intentionally isolated).
- `src/layouts/BaseLayout.astro` — shared HTML shell, CDNs (Alpine/Tailwind/Lucide), `Nav` and `Footer`.
- `src/components/{Nav,Footer}.astro` — shared navigation and footer.
- `src/styles/global.css` — site-wide design tokens and shared component styles.
- `astro.config.mjs` — `base: '/torquay-leander'`, `trailingSlash: 'ignore'`.
- `contrast-check.mjs` — WCAG 2.1 contrast audit. Run with `node contrast-check.mjs`.

# torquay-leander

Astro static site for the Torquay Leander swimming club, deployed to GitHub Pages at `https://michal-ciechan.github.io/torquay-leander/`.

## Commands

- `npm run dev` — dev server on http://localhost:12700 with HMR.
- `npm run build` — static build to `dist/`.
- `npm run preview` — serve `dist/` locally on port 12700.
- `node contrast-check.mjs` — WCAG audit of the site's colour pairs.

## Project shape

- `src/pages/` — file-based routes. `index.astro`, `login.astro`, `training/`, `competitions/`, `gallery/`, `dev/`.
- `src/layouts/BaseLayout.astro` — HTML shell + Nav/Footer + CDN scripts (Alpine 3.14.3, Tailwind, Lucide). Used by the public site pages.
- `src/components/Nav.astro`, `src/components/Footer.astro` — shared nav (Alpine-driven dropdowns + mobile menu) and footer.
- `src/styles/global.css` — design tokens (`--red`, `--black`, etc.) and shared component styles.
- `astro.config.mjs` — `base: '/torquay-leander'`, `trailingSlash: 'ignore'`, `build.format: 'directory'`.
- `.github/workflows/deploy.yml` — Pages deploy on push to `master`.

## Conventions

- Internal links use `${base}/path/` where `const base = import.meta.env.BASE_URL.replace(/\/$/, '')`, so routes keep working under the `/torquay-leander` base in production.
- Public pages extend `BaseLayout`. `login.astro` and `dev/index.astro` are intentionally standalone (isolated visual treatments) and scope their CSS via a body class (e.g. `body.login-page`, `body.hub-page`) with `<style is:global>`.
- Inline JS that runs in the browser uses `is:inline`. Tailwind's preflight is disabled via `window.tailwind = { corePlugins: { preflight: false } }` before the Tailwind CDN script loads.
- Lucide icons render on `DOMContentLoaded` via `lucide.createIcons()`.

## Palette

Red/white/black club colours (scarlet primary `#dc2626`, black `#0a0a0a`). The `/dev/` hub and `/login/` page keep a dark navy-blue aesthetic to distinguish tooling/auth surfaces from the public site.

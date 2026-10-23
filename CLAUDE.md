# torquay-leander

Astro static site for the Torquay Leander swimming club, deployed to GitHub Pages at `https://michal-ciechan.github.io/torquay-leander/`.

## URLs

When asked for "the URL", always give **both** the local and the public URL:

- **Local (dev):** http://localhost:12700/torquay-leander/ (also over HTTPS at `https://torquay.desktop.codeperf.net/torquay-leander/`)
- **Public preview (`preview` branch, GitHub Pages):** https://michal-ciechan.github.io/torquay-leander/preview/
- **Public stable (`master` branch, GitHub Pages):** https://michal-ciechan.github.io/torquay-leander/
- **On the club domain (WP proxy plugin, `wp-preview-plugin/`):** https://torquayleander.co.uk/preview/ (preview branch) and https://torquayleander.co.uk/rc/ (master) — needs plugin v1.1.0+ installed
- **Live site (plugin v1.2.0, "Serve the new site" switch in WP Settings > TL Preview, on since 23 Oct 2026):** https://torquayleander.co.uk/ serves the master build. WordPress still answers wp-admin, wp-login, wp-json, `?p=`-style URLs, non-GET requests and anything GitHub 404s. Untick the switch to roll back; it purges the SiteGround cache.

## Enquiry forms

- Every `form[data-enquiry="membership|general"]` is posted by the handler in `BaseLayout.astro` to `https://torquayleander.co.uk/wp-json/tl/v1/enquiry` (`wp-preview-plugin/tl-preview/enquiries.php`). The plugin emails it and keeps a private copy under WP admin > Enquiries.
- Recipients are set in WP Settings > TL Preview, not in code: live forms go to `enquiries.torquayleander@gmail.com`; `/preview/` and local dev send `channel=preview` to the separate preview address, with "[Preview]" in the subject.
- Hotmail silently drops mail sent straight from SiteGround, so live enquiries go to that Gmail first. An Apps Script there ("Website enquiry forwarder", 5-minute trigger) re-sends each one to the club Hotmail with Reply-To set to the sender. Gmail forwarding itself wasn't available on the new account. Credentials: Bitwarden item "Torquay Leander Enquiries Gmail".

## Branches

- **Work on `preview`.** Every push to `preview` deploys to https://michal-ciechan.github.io/torquay-leander/preview/.
- **`master` is the signed-off release candidate** (becomes the real site at cutover), served at the Pages root.
- **Promote** with a fast-forward: `git push origin preview:master`. Never merge; rebase `preview` if it diverges.
- `.github/workflows/deploy.yml` builds **both** branches on any push (one Pages site per repo, each deploy replaces everything): master with `ASTRO_BASE=/torquay-leander` at the root, preview with `ASTRO_BASE=/torquay-leander/preview` under `preview/`. Keep the workflow and this file identical on both branches.
- `astro.config.mjs` reads `base` from `ASTRO_BASE` (default `/torquay-leander`), so never hard-code `/torquay-leander` in src — use `import.meta.env.BASE_URL`. From Git Bash, set `MSYS_NO_PATHCONV=1` when passing `ASTRO_BASE`, or MSYS rewrites it to a Windows path.

## Commands

- `npm run dev` — dev server on http://localhost:12700 with HMR. Also live over HTTPS at `https://torquay.desktop.codeperf.net/torquay-leander/` (Caddy proxy + links dashboard tile; see `.claude/skills/run/SKILL.md` → "Preview over HTTPS").
- `npm run build` — static build to `dist/`.
- `npm run preview` — serve `dist/` locally on port 12700.
- `node contrast-check.mjs` — WCAG audit of the site's colour pairs.

## Project shape

- `src/pages/` — file-based routes. `index.astro`, `login.astro`, `training/`, `competitions/`, `gallery/`, `dev/`.
- `src/layouts/BaseLayout.astro` — HTML shell + Nav/Footer + CDN scripts (Alpine 3.14.3, Tailwind, Lucide). Used by the public site pages.
- `src/components/Nav.astro`, `src/components/Footer.astro` — shared nav (Alpine-driven dropdowns + mobile menu) and footer.
- `src/styles/global.css` — design tokens (`--red`, `--black`, etc.) and shared component styles.
- `astro.config.mjs` — `base` from `ASTRO_BASE` (default `/torquay-leander`), `trailingSlash: 'ignore'`, `build.format: 'directory'`.
- `.github/workflows/deploy.yml` — Pages deploy of both branches on push to `master` or `preview`.

## Conventions

- Internal links use `${base}/path/` where `const base = import.meta.env.BASE_URL.replace(/\/$/, '')`, so routes keep working under the `/torquay-leander` base in production.
- Public pages extend `BaseLayout`. `login.astro` and `dev/index.astro` are intentionally standalone (isolated visual treatments) and scope their CSS via a body class (e.g. `body.login-page`, `body.hub-page`) with `<style is:global>`.
- Inline JS that runs in the browser uses `is:inline`. Tailwind's preflight is disabled via `window.tailwind = { corePlugins: { preflight: false } }` before the Tailwind CDN script loads.
- Lucide icons render on `DOMContentLoaded` via `lucide.createIcons()`.

## Palette

Red/white/black club colours (scarlet primary `#dc2626`, black `#0a0a0a`). The `/dev/` hub and `/login/` page keep a dark navy-blue aesthetic to distinguish tooling/auth surfaces from the public site.

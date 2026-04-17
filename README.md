# Torquay Leander

Static website samples for the Torquay Leander swimming club.

## Published site

https://michal-ciechan.github.io/torquay-leander/ (GitHub Pages)

## Dev server

```
npm install
npm run serve-samples
```

Serves `pages/samples` on http://localhost:12700 with live reload (via `live-server`). Port 12700 is picked to avoid clashing with common dev ports. `npm run dev` is an equivalent alias.

## Layout

- `pages/samples/index.html` — design hub landing page.
- `pages/samples/site/` — current working site (scarlet & black palette).
- `pages/samples/login.html`, `competitions/`, `gallery/`, `training/` — shared sub-pages linked from the site.
- `pages/CLAUDE.md` — notes for Claude Code when working in `pages/`.
- `contrast-check.mjs` — WCAG 2.1 contrast audit script for the current site's colour pairs. Run with `node contrast-check.mjs`.

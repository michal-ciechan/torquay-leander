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

- `pages/samples/` — site1-aqua through site6-scarlet design variants, plus `index.html`, `login.html`, `competitions/`, `gallery/`, `training/`.
- `pages/CLAUDE.md` — notes for Claude Code when working in `pages/`.
- `contrast-check.mjs` — WCAG 2.1 contrast audit script for site6-scarlet colour pairs. Run with `node contrast-check.mjs`.

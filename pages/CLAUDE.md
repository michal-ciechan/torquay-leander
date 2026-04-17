# pages/

Static HTML for the club site under `samples/`:

- `samples/index.html` — design hub landing page.
- `samples/site/` — current working site (scarlet & black palette).
- `samples/login.html`, `competitions/`, `gallery/`, `training/` — shared sub-pages.

## Serving locally

From the repo root, run:

```
npm run serve-samples
```

This uses `live-server` to serve `pages/samples` on http://localhost:12700. It auto-opens the browser and hot-reloads the page on file changes via an injected websocket. `npm run dev` is an equivalent alias.

Port 12700 is chosen to avoid clashing with other dev servers commonly running on 3000/5173/8080.

Note: we previously used `browser-sync` for live reload, but it crashes on Node 24 (bug in bundled `eazy-logger`). `live-server` works on Node 24.

## Published site

The repo is hosted on GitHub Pages at https://michal-ciechan.github.io/torquay-leander/ .

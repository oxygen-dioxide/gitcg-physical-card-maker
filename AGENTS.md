# AGENTS.md

Vanilla JS + Vite app that renders custom Genshin TCG ("七圣召唤") physical card images onto a `<canvas>`

## Commands
- `npm run dev` — Vite dev server (port 5173, `open: true`). `npm run build` / `preview` also available.
- `biome format --write` - code formatting

## Architecture
- `index.html` → `src/main.js` (loads fonts, calls `ui.init`) → `src/ui.js` (UI/state) → `src/renderer.js` (canvas drawing).
- `src/renderer.js:1` and `src/constants.js` hold card layout math. Card size is `CARD_W/CARD_H = 63:88` at `SCALE=12` (constant; ratio fixed).
- `src/crop.js` is the image crop editor; `src/data.js` supplies card data.

## Data & assets (gotchas)
- Card data extracted from Genshin Impact client lives under `data/<version>/CHS/*.json` (many patches: 3.3.0 … 7.0.0), all committed. Only `action_cards.json` is used currently.
- `src/data.js:1` **hardcodes** the version: `import ... from "../data/7.0.0/CHS/action_cards.json"`. To switch data version, edit that single import line.
- Card artwork is **not local** — fetched from remote `https://static-data.piovium.org/api/v4/image/<id>` (`data.js:imageUrlFor`). Needs network.
- Element/tag/cost icons are local PNGs under `public/assets/`; icon filenames are mapped in `src/constants.js` (`COST_DEFS`, `TAG_DEFS`, `HIDDEN_TAGS`).
- Fonts load at runtime via `FontFace` in `src/main.js`. Card effect descriptions use **HYWH-55W**; titles use **HYWH** (fallbacks: Microsoft YaHei / Noto Sans SC).
- `src/style.css` comments note font runtime loading.

## Conventions
- `vite.config.js` sets `base: "./"` so the built site works from any subpath — keep relative asset references.
- Element/cost/tag internal IDs use `GCG_*` constants; labels are Chinese (`constants.js`).
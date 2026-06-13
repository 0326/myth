# 华夏神话 · Huaxia Myth — 中国神话可交互知识引擎

A bilingual, SSR-first, interactive knowledge engine for Chinese mythology:
a Shan Hai Jing (《山海经》) bestiary, a force-directed genealogy graph, and
open structured data. Product brief: [doc/myth-brd.md](doc/myth-brd.md).

## Stack

- [**React Router v7**](https://reactrouter.com/) (framework mode) — SSR + nested
  routes + `loader`/`meta`. Server-rendered HTML carries titles, hreflang and
  schema.org JSON-LD for SEO (the BRD's #1 growth lever).
- [**React 19**](https://react.dev/) + [**Vite**](https://vite.dev/)
- [**Hono**](https://hono.dev/) — the data API, mounted at `/api/*`.
- [**Cloudflare Workers**](https://developers.cloudflare.com/workers/) via the
  Cloudflare Vite plugin (streaming SSR with `renderToReadableStream`).
- [**d3-force** style](https://github.com/d3/d3-force) self-contained canvas
  force simulation for the genealogy graph.

## Project layout

```
app/
  root.tsx              # <html> shell + LangProvider + Nav
  entry.server.tsx      # streaming SSR (renderToReadableStream)
  routes.ts             # route table
  routes/               # home · bestiary · creature.$id · graph · sitemap · robots
  components/           # Nav LangToggle Footer SealStamp CreatureCard
                        # FilterChips ShareCard ForceGraph ConstellationCanvas
  data/                 # types · dict · creatures · graph · repo (★ data access)
  i18n/LangContext.tsx  # zh|en, cookie-driven SSR + localStorage persistence
  lib/                  # seo (meta/hreflang/JSON-LD) · drawCard (share canvas)
  styles/               # tokens.css · app.css · pages.css
workers/app.ts          # Hono (/api) + React Router request handler
```

`app/data/repo.ts` is the data-access seam: Phase 1 reads local typed TS; Phase 2
swaps the function bodies to `fetch('/api/...')` (D1 + Hono) with **no change to
route components**.

## Development

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

## Scripts

```bash
pnpm build        # react-router build (client + SSR bundles)
pnpm preview      # build + vite preview
pnpm typecheck    # react-router typegen + tsc -b
pnpm lint         # eslint
pnpm check        # typegen + tsc + build + wrangler deploy --dry-run
pnpm deploy       # build + wrangler deploy
pnpm cf-typegen   # regenerate worker-configuration.d.ts from wrangler.json
```

## Content & licensing (hard lines, BRD §7)

- Original text only from the **public-domain《山海经》**.
- **Do not** introduce Yuan Ke's (袁珂) retellings, classifications or dictionary
  entries; **do not** scrape ctext.org value-added/RDF data for commercial use.
- Ancient illustrations are placeholders ("ART SLOT"); replace with verified
  Wikimedia Commons public-domain scans.

## Roadmap

Phase 2: D1 + `/api/creatures`·`/api/graph`, server-side OG images, content to
50–100 entries (Wikidata CC0 base). Phase 3: MapLibre atlas, public dataset API,
quizzes/merch, ad + membership monetization. See [doc/myth-brd.md](doc/myth-brd.md).

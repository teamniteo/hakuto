# Scaffold Migration Registry

One entry per plugin version that shipped a scaffold change existing sites may need to apply
by hand. Read only the entries **newer than the site's `last_synced_plugin_version`** — this
file grows with every release and reading it end to end is wasted context.

Entries are listed oldest first.

Every **Detect:** block answers one question: *has this migration been applied?* It exits 0
(all markers present) only when the site is in the post-migration state. Guard every negated
grep with `test -f` — `! grep -q … missing-file` succeeds, which would report a migration as
applied on a site that never had the file.

## Contents

- [0.1.2 — Unpic/WebP image service](#012-unpicwebp-image-service)
- [0.1.10 — Agent annotate dev toolbar](#0110-agent-annotate-dev-toolbar)
- [0.4.0 — Drop Unpic, return to Astro's sharp service](#040-drop-unpic-return-to-astros-sharp-service)
- [0.7.0 — SEO/agent-surface fixes (three live defects)](#070-seoagent-surface-fixes-three-live-defects)
- [0.10.0 — WebMCP on by default, backed by Pagefind](#0100-webmcp-on-by-default-backed-by-pagefind)
- [0.16.0 — Worker passes `env` to handlers; CLAUDE.md restructure](#0160-worker-passes-env-to-handlers-claudemd-restructure)
- [0.17.0 — AGENTS.md is the instruction file](#0170-agentsmd-is-the-instruction-file)

---

### 0.1.2 — Unpic/WebP image service

**Detect:** superseded by 0.4.0, which removed Unpic. Only reachable if 0.4.0's markers fail.
```sh
grep -q '"@unpic/astro"' package.json          # present ⇒ site is at 0.1.2, not 0.4.0
```

Apply from scaffold when not heavily customized:
- `astro.config.mjs`
- `package.json`
- `bun.lock`
- `CLAUDE.md`
- any scaffold page examples that still show `formats={['avif', 'webp']}`

> ⚠️ **Superseded by 0.4.0** — Unpic was removed. Only `formats={['webp']}` and
> the native-`<img>` SVG rule still stand.

Manual edits for customized sites:
- set Cloudflare adapter image service to `imageService: "custom"`
- change local raster `<Picture>` usage to `formats={['webp']}`. `fallbackFormat` is **per-source-format**: **set `fallbackFormat="webp"` on `.webp`/`.avif` sources** — neither is in Astro's `specialFormatsFallback`, so omitting it ships a PNG fallback — and omit it on `.jpg`/`.jpeg`/`.gif`/`.svg`, which already fall back to themselves. On `.png` it is optional (setting it halves the emitted files; the old `ENOENT` failure is fixed in Astro >= 6.4)
- render imported SVG assets with native `<img src={asset.src} width={asset.width} height={asset.height}>`

After applying:
- run `bun install` if `package.json` or `bun.lock` changed
- run `bun run build`
- verify optimized Astro image assets are real WebP files and no AVIF files are emitted


### 0.1.10 — Agent annotate dev toolbar

**Detect:**
```sh
grep -q '"astro-agent-annotate"' package.json &&
  ! grep -q '"astro-grab"' package.json
```

Apply from scaffold when not heavily customized:
- `astro.config.mjs`
- `package.json`
- `bun.lock`
- `src/layouts/Layout.astro`

Manual edits for customized sites:
- remove `astro-grab`
- add `astro-agent-annotate`
- enable `devToolbar` only in development
- register `astroAgentAnnotate()` only when the dev toolbar is enabled

After applying:
- run `bun install` if `package.json` or `bun.lock` changed
- clear stale Vite/Astro caches with `rm -rf .astro/vite node_modules/.vite` if dev reports missing `virtual:astro:*` modules
- run `bun run build`
- run `bun run dev` and verify the toolbar shows `Agent Annotate`

---


### 0.4.0 — Drop Unpic, return to Astro's sharp service

Unpic ignored the `widths` prop, turned `width`/`height` into inline styles that
overrode Tailwind classes, and emitted `style="[object Object]"` on content-collection
images. Sites carrying it should expect broken markup and oversized ladders until
this migration is applied.

**Detect:**
```sh
test -f package.json &&
  ! grep -q '"@unpic/astro"' package.json &&
  grep -q 'imageService: *"custom"' astro.config.mjs
```

Apply from scaffold when not heavily customized:
- `astro.config.mjs`
- `package.json`
- `bun.lock`
- `CLAUDE.md`
- `src/index.css`

Manual edits for customized sites:
- remove `@unpic/astro` from `package.json`, then `bun install`
- remove the `import { imageService } from "@unpic/astro/service"` line
- **delete the `image: { service: … }` key entirely** — Astro's schema default is
  already `astro/assets/services/sharp`
- keep `imageService: "custom"` on the Cloudflare adapter. Do **not** switch to
  `"compile"`: on adapter v13 that returns the workerd service unconditionally,
  and on v14 `hasUserImageService()` explicitly excludes sharp, so sharp is
  replaced either way
- delete any `.img-uncap` (or other `max-width: none !important`) image utility
  from `src/index.css` **and every class list that uses it**
- add `w-full` to images that were relying on unpic's inline `width:100%` to fill
  their container — otherwise they shrink to their `width` prop
- add `widths={[W, W * 2]}` to every `<Image>`/`<Picture>` that has a `sizes` but
  no `widths`; without it Astro emits no `srcset` at all and `sizes` is inert
- drop `height` where it disagrees with the source's aspect ratio and CSS already
  crops (`object-cover`) — sharp resizes with `fit: cover`, so a mismatch crops
- if a rehype plugin right-sizes markdown images, give it a `widths` ladder too

`wrangler.toml` defaults changed in the same release (commit `cdc738b`) — review by hand, since
`wrangler.toml` is always customized (`name`, routes):
- `compatibility_flags = ["nodejs_compat"]` was **removed**. Nothing in the scaffold worker
  imports Node built-ins. Drop the flag unless the site's own worker code (or a dependency it
  bundles) needs `node:*` modules — removing it there breaks the worker at runtime.
- `compatibility_date` bumped to `2026-06-24`, and `workers_dev = true` added explicitly.

After applying:
- run `bun run build`, then grep `dist/` for `style="[object Object]"`, `url=` and
  `format=` on `<img>` — all three should be gone
- watch for images that visually shrank (the missing `w-full` case) and for any
  `<img>`/`<source>` that now ships a single candidate (the missing `widths` case)


### 0.7.0 — SEO/agent-surface fixes (three live defects)

Every site built before 0.7.0 carries all three. They are silent — no build error, no
deploy error — so nothing surfaces them except an audit.

**Detect:** all four must hold — each corresponds to one of the defects.
```sh
test -f worker/problem.js &&                    # typed worker errors
  test -f src/pages/robots.txt.ts &&            # Sitemap line from context.site
  test -f package.json &&
  ! grep -q '"astro-seo-schema"' package.json &&  # JSON-LD not entity-escaped
  test -f public/_headers &&
  ! grep -qE '^/$' public/_headers              # no rule scoped to the bare `/`
```

Apply from scaffold when not heavily customized:
- `public/_headers`
- `src/pages/robots.txt.ts` (new)
- `src/components/Schema.astro` (new)
- `src/layouts/Layout.astro`
- `astro.config.mjs`
- `package.json`

Manual edits for customized sites:

1. **`_headers`: move every site-wide rule under `/*`.** A rule scoped to the literal `/`
   is an exact path match, so the headers reach the homepage and nothing else. Fold the
   `Link` and `Content-Signal` lines into the `/*` block and delete the `/` stanza. Add
   `Strict-Transport-Security` and `X-Frame-Options` while there.
2. **Delete `public/robots.txt`, add `src/pages/robots.txt.ts`.** The static file has no
   `Sitemap:` line and `@astrojs/sitemap` does not write one, so the site ships without it.
   The endpoint reads `context.site` and always names the real host. Deleting the `public/`
   file is required — it would otherwise collide with the route.
3. **Replace `astro-seo-schema` with `src/components/Schema.astro`.** Its
   `safeJsonLdReplacer` HTML-escapes `& < > " '` inside JSON string values, and
   `<script type="application/ld+json">` is a raw-text element that is never entity-decoded
   — so every apostrophe in the site's own copy reaches consumers as a literal `&apos;`.
   Update the `Layout.astro` import and drop the dependency. The `schema` prop API is
   unchanged, so no page code changes.
4. **Set `build.inlineStylesheets: "auto"`** if it was forced to `"always"`.
5. Optional: pass `feedUrl` from blog routes for RSS autodiscovery (new `Layout` prop).

Agent-readiness surfaces added in the same release (apply if the site is graded by an
agent-readiness scanner, or just to bring it level with the scaffold):

6. **`worker/problem.js`** (new) — RFC 9457 `application/problem+json` errors. `worker/index.js`
   now returns typed errors through it instead of plain-text `'Not Found'` / `'Internal Server
   Error'`. Point existing route handlers at `problem()` too so the shape is consistent.
7. **`src/lib/site.ts` + `src/lib/schema.ts`** (new) — `SITE_NAME` / `SITE_DESCRIPTION` moved
   out of `Layout.astro`, joined by `SITE_CONTACT`, feeding `Organization` + `WebSite` JSON-LD
   on the homepage. Sites with their own schema module should merge rather than adopt this
   wholesale; sites with none get an identity type they were missing.
8. **`src/pages/404.astro`** — adds a "Where to look next" list pointing at `/`,
   `/sitemap-index.xml` and `/llms.txt`. Adapt the list to the site's real sections.
9. **`public/llms.txt`** — adds a `## When to use this` section, and drops the `/docs/` Key
   Pages line that 404s on sites without a docs section. If the site's `llms.txt` is already
   written, add the section by hand rather than overwriting the file.

After applying:
- run `bun install` (`package.json` changed)
- run `bun run build`, then confirm `dist/client/robots.txt` has a `Sitemap:` line with the
  production host, and that no built page contains `&apos;` inside a JSON-LD block
- **Redeploy.** The JSON-LD and header fixes only take effect on the live site after a deploy.
- Verify headers with `curl -sI <origin>/some/inner/page/` — **not** `curl -sI <origin>/`.
  The homepage passes even with the bug present.

### 0.10.0 — WebMCP on by default, backed by Pagefind

Sites built before 0.10.0 ship `ENABLE_WEBMCP = false` in `src/layouts/Layout.astro`, so the
`search-site` / `get-page-content` / `navigate` tools never register. The old comment said the
search tool needed a search integration first — that was wrong: `pagefind()` is in every
site's `astro.config.mjs`, so `astro build` always writes `dist/client/pagefind/`, search page
or not. The tools also returned bare objects instead of MCP `CallToolResult`s, and only looked
at `navigator.modelContext` — the spec has since moved to `document.modelContext`.

**Detect:** either marker means the migration is applied — the flag is on, or the block was
updated to the new registry lookup (sites that deliberately keep tools off still get the
`document.modelContext` code).
```sh
grep -q 'ENABLE_WEBMCP = true' src/layouts/Layout.astro ||
  grep -q 'document.modelContext' src/layouts/Layout.astro
```

Apply from scaffold when not heavily customized:
- `src/layouts/Layout.astro`

Manual edits for customized sites — in the `ENABLE_WEBMCP` block of `Layout.astro`:

1. **Flip `ENABLE_WEBMCP` to `true`.** No other wiring is needed; the Pagefind index already
   exists in every production build.
2. **Resolve the registry from either global**:
   `document.modelContext || navigator.modelContext`, and bail unless `registerTool` is a
   function. Shipping implementations are split across the two spellings.
3. **Return MCP `CallToolResult` objects** — `{ content: [{ type: "text", text }] }`, not the
   raw result object. Agents that follow the spec discard anything else. The scaffold does
   this through a small `reply()` helper.
4. **Make `search-site` useful**: cache the `pagefind.js` import (but not a failed one), take
   an optional `limit` (1–20, default 5), absolutize `r.url` against
   `window.location.origin`, and strip Pagefind's `<mark>` tags out of the excerpt.
5. **Constrain `navigate` to the same origin.** The old version assigned
   `window.location.href` from the raw argument, which let an agent be steered off-site.

Sites that deliberately do not want to expose tools to agents keep `ENABLE_WEBMCP = false` —
that is now the only reason to leave it off.

After applying:
- run `bun run build`, then `grep -c search-site dist/client/index.html` (expect a hit)
- the tools are inert on `astro dev` — `/pagefind/` only exists in a build, so verify on a
  deploy preview

---

### 0.16.0 — Worker passes `env` to handlers; CLAUDE.md restructure

Before 0.16.0, `worker/index.js` called route handlers as `handler(request, ctx)`, so no
handler could reach `wrangler.toml` `[vars]`, secrets or bindings. It now calls
`handler(request, env, ctx)`. The shipped `worker/README.md` and `CLAUDE.md` also claimed
`bun run dev` runs the worker "1:1 with production" — it doesn't: dev is plain `astro dev`
with the Cloudflare adapter disabled, so `/~/*` routes 404 there. Worker routes run under
`bun run preview` (build + `wrangler dev` on `127.0.0.1:8787`) and in production.

**Detect:** the entry point passes `env` through.
```sh
test -f worker/index.js &&
  grep -q 'handler(request, env, ctx)' worker/index.js
```

Apply from scaffold when not heavily customized:
- `worker/index.js` — only if `ROUTES` is still empty; otherwise edit by hand (below)
- `worker/README.md`
- `CLAUDE.md`

Manual edits for customized sites:

1. **Update the call in `worker/index.js`** to `return await handler(request, env, ctx);`.
2. **Update every registered handler's signature** in the same change — `(request, ctx)` →
   `(request, env, ctx)`. A handler left on the old signature receives `env` in its `ctx`
   parameter, so `ctx.waitUntil(…)` throws `TypeError: ctx.waitUntil is not a function` and
   the route returns a 500. Grep for them:
   `grep -rnE 'export (async )?function \w+\(request, ctx\)' worker/`. Handlers declared as
   `(request)` alone need no change.
3. **`worker/README.md`** — replace with the scaffold copy unless the site documented its own
   routes there; at minimum, correct any "`bun run dev` runs the worker" / "don't use
   `wrangler dev`" text to point at `bun run preview`.
4. **`CLAUDE.md`** was restructured and roughly halved — image internals, the agent-readiness
   table, unshallow deploy steps and adapter internals moved into the `hakuto-review`,
   `seo-audit` and `prelaunch-checklist` skill references. An uncustomized copy fast-forwards
   cleanly. If the site's copy is customized, port at least these corrections:
   - `bun run dev` has no worker or adapter; test `/~/` routes with `bun run preview`.
   - `.tsx` is correct for interactive islands (compound components, forms); pages, layouts
     and static sections stay `.astro`. Static shadcn use needs no client directive.
   - `AGENTS.md` is regenerated by every build — never hand-edit it. (Superseded by 0.17.0:
     `AGENTS.md` now holds the rules, and only its `page_summary` block is regenerated.)
   - Prerendered constants live in `src/lib/site.ts`, not `src/config.ts`.
5. **Project Plan** — if `CLAUDE.md` still ends with a `## Project Plan` section, move it to
   `site-specification.md` under `## Project Plan` before taking the new `CLAUDE.md`, or the
   replace deletes it.

After applying:
- run `bun run preview` and request each `/~/` route — expect the handler's response, not a
  `route_not_found` problem body or a 500
- for a handler that uses `ctx.waitUntil`, check the `bun run preview` terminal for
  `ctx.waitUntil is not a function`

---

### 0.17.0 — AGENTS.md is the instruction file

Before 0.17.0 the site's agent rules lived in `CLAUDE.md`, and `AGENTS.md` held nothing but
the page index `@nuasite/agent-summary` writes on every build. Codex and other agents read
`AGENTS.md`, so they never saw the rules. Now `AGENTS.md` carries the full rules, followed by a
`## Page index` heading and the generated `page_summary` block at the very end, and
`CLAUDE.md` is a stub whose first line is `@AGENTS.md`.

The build only rewrites the block — it replaces from the first occurrence of the opening tag
to the closing tag and preserves everything else, appending a block if none exists. So never
write the opening tag in angle brackets anywhere above the block: the next build would replace
everything from that mention down.

Claude Code v2.1.277+ reads `AGENTS.md` natively, but by default only when no `CLAUDE.md` or
`CLAUDE.local.md` exists, and older or restricted sessions read `CLAUDE.md` only. The
`@AGENTS.md` import covers every case and never loads the file twice. A symlink is not used:
Claude Code's Edit/Write refuse to write through one, and Windows checkouts break it.

**Detect:** `CLAUDE.md` is the stub and `AGENTS.md` carries the rules and the block.
```sh
test -f CLAUDE.md && grep -qx '@AGENTS.md' CLAUDE.md &&
  test -f AGENTS.md && grep -q '^<page_summary>' AGENTS.md &&
  grep -q '^## Mandatory Workflow' AGENTS.md
```

Apply from scaffold when not heavily customized:
- `AGENTS.md` — the rules from the scaffold, but keep the site's own `page_summary` block at
  the end (never copy the scaffold's, which indexes the demo pages)
- `CLAUDE.md`

Manual edits for customized sites — do these in order, before replacing `CLAUDE.md`:

1. **Move the rules.** Insert the site's current `CLAUDE.md` content — customizations included
   — into `AGENTS.md` above the existing `page_summary` block. If the site's `CLAUDE.md` is an
   uncustomized older scaffold copy, use the current scaffold `AGENTS.md` rules instead and
   port only the site's own additions. Add a `## Page index` heading directly above the block.
2. **Project Plan** — if the content still has a `## Project Plan` section, move it to
   `site-specification.md` under `## Project Plan` instead of into `AGENTS.md`.
3. **Fix self-references** in the moved text: "this CLAUDE.md" → "this AGENTS.md", and any
   "`AGENTS.md` is regenerated, never hand-edit it" → only its `page_summary` block is
   regenerated. Make sure no line above the block contains the opening tag in angle brackets.
4. **Replace `CLAUDE.md`** with the scaffold stub. Claude-Code-only notes, if the site has any,
   go below the `@AGENTS.md` line.
5. A `CLAUDE.local.md` needs no change — Claude Code loads it alongside `CLAUDE.md`, and the
   stub's import still brings in `AGENTS.md`.

After applying:
- `grep -c '<page_summary>' AGENTS.md` — expect exactly `1`
- run `bun run build`, then `git diff AGENTS.md` — only lines inside the block may change

---
name: hakuto-review
description: Hakuto-specific source audit for Astro + Tailwind v4 + shadcn/ui sites. Audits source code against the project's CLAUDE.md rules — image optimization (right-sizing via `width`/`sizes`, oversized images), className vs class, Tailwind v4 setup, Fonts API, Cloudflare adapter, internal links (trailing-slash convention), accessibility (aria-labels, semantic elements), LCP / critical-render-path performance, deferred marketing pixels, static-asset caching and security headers in `_headers`, code hygiene. Can review a single file, recently changed files, or the whole src/ tree. Report-only — no fixes applied. Use when user requests "Hakuto review", "review my site source", "audit the site source", "check site code quality", or "lint the site".
---

# Hakuto Review Skill

Audit Hakuto-built sites against the project's own CLAUDE.md rules.

This skill is the **source-side** counterpart to `seo-audit` (which audits the built `_dist/` HTML): it catches issues in `src/`, `astro.config.mjs`, and `src/index.css` before build; `seo-audit` catches what the build produces.

**Flexible Scope:** parses the user request to choose what to review:
- **Single file**: "Review src/pages/index.astro" or "Audit Header.astro"
- **Changed files**: "Review my changes" or "Review recent changes"
- **Whole project** (default): "Run a Hakuto review", "Audit the site"

---

## Execution Flow

### 0. Determine Scope

Parse the user prompt:

- **Single file** — explicit path mentioned → review only that file plus its directly-imported configs.
- **Changed files** — phrases like "my changes" / "recent changes" / "what I edited" → run `git diff --name-only HEAD` and also include unstaged/untracked under `src/` (`git status --short`). Restrict checks to those files.
- **Whole project (default)** — walk `src/**/*.{astro,ts,tsx,css}`, plus the project's `astro.config.mjs`, `src/index.css`, `package.json`, and `tailwind.config.*` if present.

If the user names a file that doesn't exist, list nearby candidates and stop.

### 1. Read Project Context

Always read these first — many checks depend on them:

- `package.json` — confirm `bun` scripts, dependency versions, that `tailwind.config.mjs` is NOT present.
- `astro.config.mjs` — Cloudflare adapter options, `experimental.fonts` configuration, integrations.
- `src/index.css` — verify Tailwind v4 ordering and `@theme` / `@layer base` structure.
- `src/layouts/Layout.astro` (top ~80 lines) — `<Font />` preloads, schema/SEO setup.

### 2. Initialize Trackers

```
critical = []   # blocking issues
warnings = []   # should-fix but non-blocking
passed   = []   # checks that passed
```

Each entry should be `{ rule, file, line, message }` so the report can show `file:line`.

### 3. Run Checks

Run every category below that applies to the in-scope files. Each violation cites the CLAUDE.md rule it ties to so future rule changes flow through automatically.

### 4. Optional Type-Check

If the scope contains any `.astro`, `.ts`, or `.tsx` file, run `bun run check` ONCE at the end. Surface only **new** errors introduced by the in-scope files; do not fix pre-existing ones (per CLAUDE.md "Verification Before Completion"). If `bun` is not on PATH, log a single warning and continue with static checks.

---

## Check Categories

### A. Tailwind v4 Setup (`src/index.css`, project root)

- **Critical**: `@import 'tailwindcss'` is not the first non-comment line of `src/index.css`.
- **Critical**: `tailwind.config.mjs` / `tailwind.config.js` / `tailwind.config.ts` exists at the project root (v4 ignores it — must be deleted).
- **Warning**: custom design tokens (colors, fonts, radius, spacing) defined outside an `@theme { … }` block.
- **Warning**: CSS custom properties (`--foo: …`) defined outside `@layer base { … }`.
- **Pass**: `@import 'tailwindcss'` first → `@plugin 'tailwindcss-animate'` → `@theme` → `@layer base` (the canonical order).

### B. Astro File Types (`src/pages/`, `src/layouts/`)

- **Critical**: any `.tsx` or `.jsx` file under `src/pages/` or `src/layouts/` (CLAUDE.md: "Use .astro files only for pages and layouts").
- **Warning**: a `.tsx` component imported into a page without a clear interactivity reason (CLAUDE.md prefers native JS over React for simple toggles/animations).

### C. shadcn / React Component Props

Scan `.astro` and `.tsx` files for shadcn/React component usages (capitalised tag names like `<Button>`, `<Card>`, `<Badge>`, `<Tabs>`, etc.). React components only recognise `className`; using `class` produces a TypeScript error and silently drops the styling at runtime.
- **Critical**: remove unused components, so that we have leaner CSS.
- **Critical**: `class=` used on a React/shadcn component (must be `className=`).
- **Warning**: `style={{ … }}` used on a shadcn component (use Tailwind utility classes; for animation delays use `delay-*` or `@theme` tokens).
- **Pass**: HTML elements (lowercase tags) using `class=` — that is correct.

### D. Image Optimization

For each `.astro` file:

- **Critical**: a local image is `import`-ed (e.g. `import hero from '@/assets/…'`) and rendered with a bare `<img>` tag. CLAUDE.md mandates `<Picture>` / `<Image>` from `astro:assets` for local raster images. **Exception**: local `.svg` imports rendered as `<img src={logo.src}>` are correct (CLAUDE.md → Image Optimization keeps SVGs out of the raster pipeline).
- **Warning**: `<Picture>` missing `formats={['webp']}`.
- **`fallbackFormat` — resolve the SOURCE file's extension first; never flag it blanket.** Astro's `specialFormatsFallback` is `['gif','svg','jpg','jpeg']`; every other format defaults to a **PNG** `<img>` fallback. Follow the `import` to its real extension before judging, and skip the tag entirely if you cannot (a content-collection `featuredImage`, a `.map()` over a mixed array).
  - **Critical**: a `.webp` or `.avif` source with **no** `fallbackFormat="webp"`. The fallback is silently transcoded to PNG — for photos routinely megabytes, often larger than the source. This is the only genuinely wrong combination.
  - **Warning (advisory)**: a `<Picture>` whose `src` is a content-collection image or otherwise dynamic, in a project whose collection contains any `.webp`/`.avif` asset, with a hardcoded or absent `fallbackFormat`. Recommend the computed form: `fallbackFormat={img.format === "webp" ? "webp" : undefined}`.
  - **Pass**: `.jpg`/`.jpeg`/`.gif`/`.svg` with no `fallbackFormat` (they fall back to themselves), and `.png` either way — omitted it falls back to PNG, set to `"webp"` it reuses the webp files and emits half as many.
  - **Do NOT flag** `.png` + `fallbackFormat="webp"` as build-breaking. That was true on Astro < 6.4 and is now guarded by `referencedImages` in `dist/assets/build/generate.js`; it builds clean on 6.4.8 and 7.1.3.
- **Warning**: an above-the-fold image (in the first section of a page) without `loading="eager"`, or a below-the-fold image without `loading="lazy"`.
- **Pass (do NOT flag)**: bare `<img>` whose `src` is an external URL such as `https://images.unsplash.com/…` — CLAUDE.md explicitly allows this for placeholder/external imagery.

#### D1. Right-Sizing — `width` and `sizes`

A prop-presence review misses most of what goes wrong here, because the failure modes look like correct markup. Two rules from Astro's sharp service (`node_modules/astro/dist/assets/services/service.js`) drive everything below:

- `getSrcSet` returns `[]` unless `widths` **or** `densities` is present. So `width` + `sizes` with no `widths` emits a **single candidate** and an inert `sizes`.
- `getTargetDimensions` derives the missing dimension from the intrinsic aspect ratio. When both `width` and `height` are given and they disagree with that ratio, sharp resizes with `fit: cover` — a silent crop.

- **Critical** — *local `<Picture>` / `<Image>` with no explicit `width` prop*. Ships the full-resolution asset to every visitor and tanks LCP. Rule: `CLAUDE.md → Image Optimization → Right-Sizing`. Report the file:line and, where you can read it off the surrounding markup, the container width the image should have been sized to.
  - Detect: `<Picture` / `<Image` tags in `.astro` files whose props include `src={<imported local asset>}` but no `width=`. A `widths` array does not substitute — with no `width`, `getTargetDimensions` falls back to the intrinsic size, so the `<img>` fallback still ships full-resolution.
- **Critical** — *`sizes` present but no `widths` / `densities`*. The tag ships one candidate and the `sizes` does nothing, so the right-sizing is only apparent. Expected form: `width={W} widths={[W, W * 2]} sizes="…"`.
- **Warning** — *`width` present but no `sizes`, or an explicit `sizes="100vw"` on a slot that isn't full-bleed*. Without a measured `sizes`, the browser assumes the image spans the viewport and downloads the largest srcset candidate regardless of the slot. Expected form: `sizes="(min-width: 1024px) 350px, (min-width: 640px) 50vw, 100vw"`.
  - Full-bleed images (`w-screen`, a hero whose wrapper has no `max-w-*`) legitimately use `100vw` — pass those.
- **Warning** — *both `width` and `height` on an image whose box is CSS-controlled* (`w-full`, `h-*`, `aspect-*`, `object-cover`). If the pair's ratio differs from the source's, sharp crops the file and CSS then crops it again. Phrase as "drop `height` unless the crop is intended" — this skill can't read the asset's intrinsic size, so don't assert the ratio is wrong.
  - Pass: square `width`/`height` on a round avatar (`rounded-full`, `size-*`) — the crop is the point.
- **Warning (advisory)** — *`width` looks like an intrinsic asset size, not a display size*. Heuristic: `width` ≥ 1600 on an image inside a card/tile/grid container (`grid`, `md:grid-cols-*`, `max-w-sm|md|lg|xl`, `w-*` on the wrapper), or a value that matches a common capture dimension (1920, 2560, 3024, 5120). This skill cannot compute layout — phrase the finding as "verify `width={N}` against the rendered slot" rather than asserting it's wrong.
- **Warning** — *markdown-content images not centrally right-sized*. The project has a blog or docs content collection (`src/content/**` with `.md`/`.mdx`) but `astro.config.mjs` registers no rehype plugin that sets `width`/`widths`/`sizes` on content `<img>` elements. Article columns are ~710–766px while pipeline images render at intrinsic resolution (1024–2220px). The fix is one rehype plugin (`width = 768`, `widths = [384, 768, 1536]`, `sizes = "(min-width: 768px) 768px, 100vw"`), not per-post annotation.
  - **Check both config shapes.** Astro 6 takes `markdown.rehypePlugins: [...]`; Astro 7 takes `markdown.processor: unified({ rehypePlugins: [...] })` and *rejects* the legacy key with `unified is not a function`. Looking only for `markdown.rehypePlugins` false-positives on every Astro 7 project.
  - If such a plugin exists but sets `width` without `widths`, flag it: every in-article image loses its srcset entirely.
- **Critical** — *content images referenced by an absolute `/…` public path*. A markdown body containing `![alt](/images/foo.png)` resolves to `public/`, which **never enters the asset pipeline** — no webp, no srcset, full resolution on every viewport, regardless of any rehype cap. A rehype plugin cannot fix these: public-dir images are absent from `file.data.astro.localImagePaths`, which is what such plugins key off. The fix is to move the asset into `src/assets/` and reference it *relatively* from the markdown. Detect: `!\[[^\]]*\]\(/` in any `src/content/**` markdown file.
- **Warning** — *`max-width: none !important` utilities on images*. Sharp emits no inline cap to override, and the `!important` defeats Tailwind preflight's `img { max-width: 100% }` plus any `max-w-*` on the element. A slot that should fill its container wants `w-full`.
- **Pass** — every local `<Picture>`/`<Image>` declares `width` and `widths`, plus `sizes` unless full-bleed.

> Note for the reviewer: `width` controls the *file*; it does not make the element fill its container. Don't recommend removing `w-full` from a right-sized image — without it the element renders at the `width` prop, which is usually a visible shrink.

### E. Fonts

Generic system fonts (Inter, Roboto, Arial) are the visual fingerprint of "AI slop" — sites built with them blend into a sea of identical-looking output. CLAUDE.md's `<frontend_aesthetics>` rules push toward distinctive faces specifically because typography is the highest-leverage signal that a site was made with care.

- **Critical**: `@font-face` or `@import url('https://fonts.googleapis.com/…')` present in `src/index.css` (CLAUDE.md: "NEVER use @import or @font-face in CSS for custom fonts").
- **Critical**: custom fonts referenced in `index.css` (`--font-sans`, `--font-mono`, etc.) but `astro.config.mjs` has no `experimental.fonts` array configuring them.
- **Warning**: primary font family is a generic AI-default (Inter, Roboto, Arial, system-ui) — CLAUDE.md's `<frontend_aesthetics>` block explicitly rejects these.
- **Pass**: fonts declared via `experimental.fonts`, exposed as CSS variables in `@theme`, preloaded via `<Font />` in Layout.astro.

### F. Cloudflare Adapter (`astro.config.mjs`)

If the project uses `@astrojs/cloudflare`:

The scaffold relies on Astro's built-in **sharp** service, so the only job here is checking the adapter doesn't replace it. Ground truth is `node_modules/@astrojs/cloudflare/dist/utils/image-config.js` → `setImageConfig()`.

- **Critical**: `imageService: "passthrough"` — swaps in a noop service and breaks `<Picture>`/`<Image>` in dev and build.
- **Critical**: `imageService: "compile"` — **despite the name, this does not keep sharp.** On adapter v13 `case "compile"` returns `WORKERD_IMAGE_SERVICE` unconditionally; on v14 it returns `hasUserImageService(config) ? config.service : WORKERD_IMAGE_SERVICE`, and `hasUserImageService()` explicitly excludes the sharp entrypoint. Either way sharp is replaced and builds outside Cloudflare's runtime break.
- **Critical**: missing `prerenderEnvironment: "node"` — the default `"workerd"` fails prerendering with a 404 outside Cloudflare's infra, and sharp needs to run in Node.
- **Warning**: `imageService` not set at all — the adapter defaults to `"cloudflare-binding"`, which needs an Images binding.
- **Warning**: an `image: { service: … }` key in `astro.config.mjs` pointing at a third-party service. The scaffold expects the key to be **absent** so Astro's sharp default applies.
- **Warning**: adapter not gated to production. An unconditional adapter in dev routes `/_image` through a workerd endpoint needing runtime bindings, 404-ing every image on `bun run dev`.
- **Pass**: no `image.service` key + `imageService: "custom"` + `prerenderEnvironment: "node"`, adapter gated to production.

### G. Internal Links — Trailing-slash convention

Read `trailingSlash` from `astro.config.mjs` (absent ⇒ Astro default `"ignore"`). Extract every internal *path* link — `href="/…"` and `href={` `` `/…` `` `}` template literals — from `.astro` / `.ts` / `.tsx` files. Before judging, strip any `#fragment` / `?query`, and **ignore**: external links (`http://`, `https://`, protocol-relative `//`, `mailto:`, `tel:`), the bare root `/`, pure fragments (`#…`), and **file** targets whose last path segment contains a dot (`/rss.xml`, `/sitemap-index.xml`, `/.well-known/security.txt`).

A link is *mismatched* when its slash form contradicts the resolved convention:

- `trailingSlash: "always"` → internal link with **no** trailing slash (`href="/product"`).
- `trailingSlash: "never"` → internal link **with** a trailing slash (`href="/product/"`).
- `trailingSlash: "ignore"` (the default) **and** the project uses `@astrojs/cloudflare` (or otherwise serves from Cloudflare static assets) → bare links still `301`-redirect to the slash form at the edge, so treat as the `"always"` case.

- **Warning** — *Internal link contradicts the `trailingSlash` convention*. Each mismatch sends the browser through a `301` redirect to the canonical form — an extra round-trip on every navigation, and on crawlers it wastes crawl budget and dilutes link equity. Fix the link to match the convention; don't rely on the redirect. Report each `file:line`; for many repeats in one file you may append "(+N more in this file)".
- **Pass** — every internal link already matches the configured convention (or `trailingSlash: "ignore"` on a host that doesn't redirect).

> Detect with `Grep`: for the `"always"` / Cloudflare case, `href="/[^"#?]*[^/"#?]"`, then drop matches whose path contains a dot (those are files). For `"never"`, search `href="/[^"#?]*/"`. **Always confirm `trailingSlash` and the adapter in `astro.config.mjs` first** — the same bare link is a finding on an `"always"` site and a non-issue on a true `"never"` site, so the config read decides the direction.

### H. Accessibility & Semantic HTML

Per `.astro` page:

- **Warning**: icon-only `<button>` / `<a>` (lucide-react `<Icon>` as the only child) without `aria-label`.
- **Warning**: `<button>` styled to look like a link when an `<a>` is semantically correct (or vice versa).
- **Pass**: interactive elements named, correct element chosen for the semantics.

### I. Favicon Source Location

`public/` holds files generated by the `astro-favicons` plugin from a single source in `src/assets/`. Putting an editable favicon in `public/` confuses source-of-truth: regenerations will overwrite it, and the next dev to look for "the favicon" will edit the wrong file.

- **Critical**: an editable favicon source file (`.svg`, `.png`) is found in `public/` rather than `src/assets/`. CLAUDE.md: `public/` contains auto-generated files only; sources live in `src/assets/`.
- **Warning**: `astro-favicons` plugin block in `astro.config.mjs` is missing or still references the template default name (`Hakuto`, `Site Name`).
- **Pass**: source under `src/assets/`, plugin configured with project-specific `name` and `short_name`.

### J. Code Hygiene

Run only if scope includes `.astro` / `.ts` / `.tsx`:

- **Critical**: `bun run check` reports a NEW error caused by an in-scope file (unused imports, type errors, implicit `any` in middleware/Vite plugin callbacks).
- **Warning**: `bun run check` reports pre-existing errors (list separately so the user can decide).
- **Warning**: a file imports something it never references (`import * as fs from "node:fs"` with no `fs.` usage) — detect with a simple grep where possible.
- **Pass**: `bun run check` clean over the in-scope files.

### K. Template Cleanup

Generated sites must scrub the scaffold's placeholder strings before shipping:

- **Critical**: `Layout.astro` still has `SITE_NAME = "Hakuto"` / `SITE_DESCRIPTION = "…"` defaults when the project is clearly customised.
- **Warning**: lorem-ipsum copy (`Lorem ipsum`, `Placeholder`, `TODO`, `[Your headline here]`) present in any page.
- **Warning**: page `<title>` is the literal string `Astro` or empty.

### L. Performance — Critical Render Path & LCP

PageSpeed's mobile LCP target is ≤2.5s, and on Hakuto sites the LCP element is **usually the hero `<h1>` text**, not an image — the dashboard/hero image typically renders below-the-fold on phone-width viewports. Two source-side patterns cause LCP regressions that this skill can catch statically:

- **Warning** — *Hero H1 LCP blocked by custom heading font (mobile)*. The first `<h1>` in `src/pages/index.astro` (or any landing page) inherits a custom-font CSS variable (e.g. `var(--font-heading)` resolving to a non-system family like Eina01, Crimson Pro, Sora) without a mobile-only system-font override. On 4G-throttled mobile, the H1 waits for the woff2 to download and adds 1–3s of "element render delay" (visible in PSI's LCP breakdown). The recommended fix is a `max-md:font-system` class on the hero H1 plus a `--font-system: system-ui, -apple-system, …` token in `@theme`, so phones paint the H1 in a system font and tablets/desktops keep the brand face.
  - Detect: page contains an `<h1>` whose computed font resolves through `--font-heading` (or another `--font-*` token that maps to a custom family declared in `experimental.fonts`/`fonts` array), and the same element has no `max-md:font-*` / `md:font-heading`-style override.
- **Critical** — *Third-party tracking scripts loaded on the critical render path*. Any `<script>` whose `src` (static or constructed inside an inline script) resolves to a known tracking domain — `googletagmanager.com`, `googleadservices.com`, `connect.facebook.net`, `consent.cookiebot.com`, `firstpromoter.com` / `fpr.*`, `clarity.ms`, `static.hotjar.com`, `cdn.amplitude.com`, `js.hs-scripts.com` — must be wrapped in a deferred loader gated on **first user interaction OR `window.load` + small timeout**, not loaded synchronously or with bare `async`/`defer`. Loading marketing pixels before LCP burns the main thread during the critical render and inflates LCP/TBT.
  - Detect: a static `<script src="https://{tracking-domain}/…">` in `Layout.astro` or any always-included component, OR an inline script that calls `document.createElement('script')` with one of those URLs *not* inside an `addEventListener("load", …)` / `["click","keydown","touchstart","scroll"].forEach(…, { once:true })` / `requestIdleCallback(…)` wrapper. A bare `setTimeout(load, N)` on one pixel while others load inline is still flagged (inconsistent deferral).
  - Recommended pattern: a single `fire()` closure that initializes all pixels, triggered by the first of (a) any of `click`/`keydown`/`touchstart`/`scroll`, (b) `setTimeout(fire, 500)` chained off the `load` event. See `easyblognetworks/src/components/MarketingPixels.astro` for a reference implementation.
- **Warning** — *Above-the-fold image missing `fetchpriority="high"`*. A `<Picture>` or `<Image>` in the first section of a page using `loading="eager"` but with no `fetchpriority="high"` prop. The LCP element should be both eagerly loaded and high-priority so the browser fetches it before lower-priority subresources.
- **Warning** — *`google.si` / localized Google TLD ping note*. If the project includes a Google Ads conversion tag (id like `AW-…`) and the user hasn't opted out of cross-domain remarketing (`allow_google_signals: false`), Google's gtag fires a country-localized `google.{tld}` pixel in addition to `google.com`. Not a source-code defect — just surface this as an informational note when an `AW-` tag is present, pointing to the Google Ads → Conversion settings opt-out.

### M. Static Asset Caching (`public/_headers`)

Cloudflare Workers' Static Assets binding (`[assets]` block in `wrangler.toml`) defaults responses to `cache-control: public, max-age=0, must-revalidate` for every path — including content-hashed `/_astro/*` files that are immutable by construction. Browsers re-validate every CSS/JS/image asset on every visit unless `_headers` overrides this. Cloudflare Pages's older defaults were more permissive; Workers is not, and the skill should treat the bare scaffold `_headers` as incomplete.

- **Critical** — *`/_astro/*` not configured for long-immutable cache*. Project uses `@astrojs/cloudflare` AND `wrangler.toml` has an `[assets]` block AND `public/_headers` does **not** contain a `/_astro/*` rule whose `Cache-Control` includes both `max-age >= 31536000` and `immutable`. Hashed Astro outputs change filename whenever content changes, so caching them for a year is always safe.
- **Warning** — *Favicon / app-icon / manifest paths uncached or cached too aggressively*. `public/_headers` missing a rule for the favicon family — `/favicon.ico`, `/favicon.svg`, `/favicon-*`, `/apple-touch-icon*`, `/android-chrome-*`, `/mstile-*`, `/manifest.webmanifest`, `/browserconfig.xml` — OR an existing rule sets `max-age > 86400` (>1 day). Favicons get swapped during rebrands; a 1-day cache (`max-age=86400`) lets new icons propagate to returning visitors within a day. Anything longer "would prevent new changes" from appearing.
- **Warning** — *Pagefind index uncached*. `astro-pagefind` is in `astro.config.mjs` integrations AND `_headers` has no `/pagefind/*` rule. Pagefind regenerates each build; a 1-day cache (`max-age=86400`) is the conventional value.
- **Pass** — `_headers` has explicit `Cache-Control` rules for `/_astro/*` (immutable+1y) and a `max-age=86400` (1 day) cap on favicons/manifests/`/pagefind/*`. HTML responses can keep Cloudflare's `max-age=0` default — that's appropriate for HTML since the CDN edge cache (`cf-cache-status: HIT`) still serves it without origin round-trips.

> **Verification tip for the user (not for the skill to run):** `curl -I https://{domain}/_astro/{any-file}` on a deployed URL should return the `max-age=31536000, immutable` header. Pingdom's legacy "Add Expires headers" complaint maps to this check — modern `Cache-Control` directives supersede the `Expires` header, and Cloudflare's Brotli (`content-encoding: br`) supersedes Pingdom's gzip check, so both legacy grades are false-positives against Hakuto's stack *once `_headers` is correctly populated*.

### N. Security Headers (`public/_headers`)

Security scanners (securityheaders.com, Mozilla Observatory, Sucuri SiteCheck, the Cloudflare audit) consistently flag missing `Content-Security-Policy` and `Permissions-Policy` as findings. Two are blocking, two are usually flagged in the same report — all four belong on a `/*` rule in `public/_headers` so they ship on every page, not just the root.

Hakuto sites are fully static-prerendered with many inline scripts (GTM, Cookiebot, Plausible loader, marketing-pixel wrappers). A **strict nonce-based CSP requires SSR** and isn't compatible with this stack — the realistic policy keeps `'unsafe-inline'` + `https:` for `script-src` / `style-src` and instead locks down the high-impact vectors. That's still a real improvement on "no CSP at all" and gets a passing grade on the common scanners.

- **Critical** — *`Content-Security-Policy` header missing entirely*. `public/_headers` has no `Content-Security-Policy:` line under any rule that matches every path (`/*`). Even a permissive CSP that blocks `frame-ancestors`, `base-uri`, `object-src`, and `form-action` provides meaningful clickjacking and base-tag-injection protection — having no CSP at all leaves these vectors wide open.
- **Critical** — *CSP present but missing high-impact directives*. A `Content-Security-Policy` line exists but doesn't include **all four** of: `frame-ancestors 'none'` (or `'self'`), `base-uri 'self'`, `object-src 'none'`, `form-action` (with at minimum `'self'`). These four are the directives that pay back even when `script-src`/`style-src` are permissive — skipping them defeats the point of having a CSP on a Hakuto site.
- **Critical** — *`Permissions-Policy` header missing*. No `Permissions-Policy:` line in `_headers`. The header should at minimum disable features the site doesn't use — `camera=()`, `microphone=()`, `geolocation=()`, `usb=()`, `magnetometer=()`, `accelerometer=()`, `payment=()` (or `=*` if Paddle/Stripe checkout is used), `publickey-credentials-get=()`. Embedded-video features (`autoplay`, `fullscreen`, `picture-in-picture`, `encrypted-media`) should be `*` on sites with Vimeo/YouTube embeds.
- **Warning** — *`X-Content-Type-Options: nosniff` missing*. Cheap header, eliminates MIME-sniffing-based XSS, flagged by every scanner.
- **Warning** — *`Referrer-Policy` missing or weaker than `strict-origin-when-cross-origin`*. `no-referrer-when-downgrade` (the browser default) leaks the full URL to cross-origin requests; `strict-origin-when-cross-origin` is the recommended floor.
- **Warning** — *Security headers placed on a path-specific rule instead of `/*`*. If CSP / Permissions-Policy live under a rule like `/` (root only) or `/blog/*` instead of `/*`, they only ship on pages matching that prefix. Cloudflare Pages's `_headers` merges across matching rules, so the fix is to put security headers in a `/*` block.
- **Warning** — *CSP omits a known third-party origin used by the site*. If the project's `MarketingPixels.astro` (or equivalent) loads from origins not covered by the CSP — e.g. CSP has `script-src 'self' 'unsafe-inline'` only, but the site loads `https://www.googletagmanager.com`, `https://connect.facebook.net`, `https://consent.cookiebot.com`, `https://beacon-v2.helpscout.net`, `https://cdn.paddle.com`, `https://challenges.cloudflare.com`, etc. — flag the gap. The pragmatic fix is `script-src 'self' 'unsafe-inline' 'unsafe-eval' https: blob:` (allow any HTTPS script) rather than enumerating every CDN.
- **Pass** — `_headers` has a `/*` rule containing all four headers: a `Content-Security-Policy` with `frame-ancestors`, `base-uri`, `object-src 'none'`, and `form-action` directives; a `Permissions-Policy` disabling unused features; `X-Content-Type-Options: nosniff`; and `Referrer-Policy: strict-origin-when-cross-origin` (or stricter).

> **Verification tip for the user (not for the skill to run):** `curl -I https://{domain}/` on a deployed URL should show all four headers. Re-running the security scan after deploy should clear the original findings. The scaffold ships sensible defaults — check `scaffold/public/_headers` in the hakuto repo for the canonical reference policy.

---

## Output Format

```markdown
Hakuto Review Results for [scope]
================================

📊 Summary:
✅ Passed: X | ❌ Critical: X | ⚠️ Warnings: X | Files: X

Scope: [Whole project | src/pages/index.astro | Changed files: 3]

---

## Critical Issues (❌)

1. Bare <img> for local image — must use <Picture> with AVIF/WebP
   File: src/pages/index.astro:124
   Rule: CLAUDE.md → Image Optimization

2. `class=` used on shadcn <Button> (must be `className=`)
   File: src/components/Hero.astro:42
   Rule: CLAUDE.md → React/shadcn Components

3. Cloudflare adapter imageService: "passthrough" — breaks <Picture>/<Image>
   File: astro.config.mjs:19
   Rule: CLAUDE.md → Cloudflare Adapter & Image Service

4. <Picture> has no `width` — emits the full-resolution asset into a ~350px card
   File: src/pages/blog/index.astro:147
   Rule: CLAUDE.md → Image Optimization → Right-Sizing

5. <Image width={472} sizes="..."> has no `widths` — getSrcSet returns [], so one
   candidate ships and `sizes` is inert. Add widths={[472, 944]}
   File: src/pages/cloud/monitoring.astro:67
   Rule: CLAUDE.md → Image Optimization → Right-Sizing

---

## Warnings (⚠️)

1. <Picture width={464}> has no `sizes` — browser assumes 100vw and picks the
   largest candidate at every viewport
   File: src/components/Hero.astro:88

2. Primary font family is "Inter" — flagged by Hakuto aesthetic guidelines
   File: src/index.css:14

3. astro-favicons still configured with template default name "Hakuto"
   File: astro.config.mjs:42

4. Internal link `/product` missing trailing slash — trailingSlash: "always" → 301 redirect
   File: src/components/Header.astro:24 (+5 more in this file)
   Rule: astro.config.mjs → trailingSlash

---

## Passed Checks (✅)

- @import 'tailwindcss' is first line in src/index.css
- No `class=` misuse on shadcn components in scope
- experimental.fonts configured for JetBrains Mono + Instrument Sans
- imageService: "custom" + prerenderEnvironment: "node" (sharp survives the adapter)
- No favicon sources in public/
- All internal links match the trailingSlash convention
- Every local <Picture>/<Image> declares an explicit display `width`
- bun run check: clean over in-scope files

---

To fix issues, ask Claude:
- "Fix all critical Hakuto review issues"
- "Convert hero <img> to <Picture> in src/pages/index.astro"
- "Right-size the images in src/pages/blog/ — measure each slot and add width + sizes"
- "Add aria-label to icon-only buttons in Header.astro"
```

---

## Severity Rules

**Critical (❌)** — blocks shipping or causes a runtime/build failure:
- `@import 'tailwindcss'` not first; `tailwind.config.*` still present
- `.tsx`/`.jsx` in `src/pages/` or `src/layouts/`
- `class=` on a React/shadcn component
- Bare `<img>` for an imported local image
- Local `<Picture>` / `<Image>` with no explicit `width` — emits the intrinsic-resolution file
- `sizes` present but no `widths` / `densities` — `getSrcSet` returns `[]`, so a single candidate ships and `sizes` does nothing
- `.webp` / `.avif` source with no `fallbackFormat="webp"` — the `<img>` fallback is transcoded to PNG
- Markdown content image referenced by an absolute `/…` public path — bypasses the pipeline entirely
- `@font-face` / `@import` for fonts in CSS; custom fonts without `experimental.fonts`
- Cloudflare `imageService: "passthrough"` or `"compile"` (both replace sharp), or missing `prerenderEnvironment: "node"`
- Editable favicon source under `public/`
- New `bun run check` error introduced by in-scope files
- Template placeholders (`SITE_NAME = "Hakuto"`, etc.) still present
- Third-party tracking script (GTM / FB Pixel / Cookiebot / FirstPromoter / Hotjar / Clarity / Amplitude / HubSpot) loaded outside a deferred init wrapped on `load` + interaction
- `public/_headers` missing `/_astro/*` rule with `max-age >= 31536000, immutable` on a Cloudflare Workers (`[assets]`) project
- `public/_headers` missing `Content-Security-Policy` entirely, or CSP present but missing one of `frame-ancestors` / `base-uri` / `object-src` / `form-action`
- `public/_headers` missing `Permissions-Policy`

**Warning (⚠️)** — should fix but non-blocking:
- Custom tokens outside `@theme`; CSS variables outside `@layer base`
- `style={{}}` on shadcn components; `<Picture>` missing `formats`
- Right-sized `width` but no `sizes`, or `sizes="100vw"` on a non-full-bleed slot
- `width` that looks like an intrinsic asset size (≥1600 inside a card/grid slot) — advisory, verify against the rendered slot
- Both `width` and `height` on an image whose box is CSS-controlled — sharp crops with `fit: cover`, then `object-cover` crops again
- `max-width: none !important` image utilities — a workaround for an image service the scaffold no longer uses; use `w-full` instead
- Blog/docs content collection with no rehype plugin right-sizing markdown `<img>`
- `loading` attribute missing or wrong for above/below-the-fold images
- Above-the-fold image with `loading="eager"` but no `fetchpriority="high"`
- Hero `<h1>` inherits a custom heading font with no `max-md:font-system`-style mobile override (mobile LCP risk)
- Generic font (Inter / Roboto / Arial) as primary
- `imageService` unset; `astro-favicons` still on template defaults
- Icon-only buttons without `aria-label`
- Internal link contradicting the `trailingSlash` convention (or 301-redirecting on Cloudflare static) — adds a redirect hop
- Unused imports; pre-existing `bun run check` errors
- Lorem-ipsum / TODO copy left in pages
- `_headers` missing cache rules for favicons / manifests / `/pagefind/*`
- `_headers` missing `X-Content-Type-Options: nosniff`
- `_headers` `Referrer-Policy` missing or weaker than `strict-origin-when-cross-origin`
- Security headers placed on a path-specific rule (e.g. `/`) instead of `/*`
- CSP omits a known third-party origin actually loaded by the site
- Google Ads (`AW-…`) tag present without `allow_google_signals: false` — informational

**Pass (✅)** — meets the requirement.

**Cross-cutting reminders** (apply to every check above):
- **Report-only** — never edit files; never run `bun install` or `bun run build`. The user runs follow-up prompts to fix.
- **Cite `file:line`** in every issue so the user can jump straight to it.
- **Don't false-positive on intentional patterns** — external `<img>` URLs (Unsplash etc.) are fine, only flag bare `<img>` for *imported local* images; HTML elements correctly use `class=`, only flag `class=` on capitalised React/shadcn tags; for trailing-slash, never flag external/`mailto:`/`tel:` links, the root `/`, fragments, or file paths (`.xml`, `.txt`, `/.well-known/*`), and read `trailingSlash` before judging direction.
- **Stay in sync with CLAUDE.md** — every check ties to a rule there; when rules change, update the corresponding category.
- **Complements `seo-audit`, no overlap** — that skill audits built HTML in `_dist/` and solely owns the rendered-DOM checks (image `alt`, `<h1>` count/hierarchy, anchor-target ids); this one audits source/config in `src/` and never re-reports those. Run both for full coverage without duplicate findings.

---

## Error Handling

- Path not found → report error, stop.
- File unreadable → log a critical for that file, continue with the rest.
- `bun run check` fails to launch (`bun` not on PATH) → single warning, continue with static checks.
- Git scope requested but project is not a git repo → tell the user, fall back to whole-project scope only if they confirm.

---

## Tool Usage

**Read-only:**
```bash
git diff --name-only HEAD                # Changed-files scope
git status --short                       # Untracked/unstaged additions
bun run check                            # Type-check (run AT MOST once per review)
```

**File inspection:** use Read, Glob, Grep — never Edit/Write.

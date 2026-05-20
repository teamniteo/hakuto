---
name: code-review
description: Hakuto-specific code review for Astro + Tailwind v4 + shadcn/ui sites. Audits source code against the project's CLAUDE.md rules — image optimization, className vs class, Tailwind v4 setup, Fonts API, Cloudflare adapter, anchor links, accessibility, LCP / critical-render-path performance, deferred marketing pixels, static-asset caching and security headers in `_headers`, code hygiene. Can review a single file, recently changed files, or the whole src/ tree. Report-only — no fixes applied. Use when user requests "review code", "code review", "audit code", "check code quality", or "lint the site".
---

# Code Review Skill

Audit Hakuto-built sites against the project's own CLAUDE.md rules.

This skill is the **source-side** counterpart to `seo-audit` (which audits the built `_dist/` HTML). Together they cover both: this one catches issues in `src/`, `astro.config.mjs`, and `src/index.css` before build; `seo-audit` catches what the build produces.

**Flexible Scope:** parses the user request to choose what to review:
- **Single file**: "Review src/pages/index.astro" or "Audit Header.astro"
- **Changed files**: "Review my changes" or "Review recent changes"
- **Whole project** (default): "Run code review", "Audit the site"

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

- **Critical**: a local image is `import`-ed (e.g. `import hero from '@/assets/…'`) and rendered with a bare `<img>` tag. CLAUDE.md mandates `<Picture>` from `astro:assets` with `formats={['avif','webp']}` and `widths={[800, 1200, 1920]}` for local images.
- **Warning**: `<Picture>` / `<Image>` missing `formats` or `widths`.
- **Warning**: an above-the-fold image (in the first section of a page) without `loading="eager"`, or a below-the-fold image without `loading="lazy"`.
- **Critical**: any `<img>` / `<Picture>` / `<Image>` missing the `alt` attribute (accessibility + SEO).
- **Pass (do NOT flag)**: bare `<img>` whose `src` is an external URL such as `https://images.unsplash.com/…` — CLAUDE.md explicitly allows this for placeholder/external imagery.

### E. Fonts

Generic system fonts (Inter, Roboto, Arial) are the visual fingerprint of "AI slop" — sites built with them blend into a sea of identical-looking output. CLAUDE.md's `<frontend_aesthetics>` rules push toward distinctive faces specifically because typography is the highest-leverage signal that a site was made with care.

- **Critical**: `@font-face` or `@import url('https://fonts.googleapis.com/…')` present in `src/index.css` (CLAUDE.md: "NEVER use @import or @font-face in CSS for custom fonts").
- **Critical**: custom fonts referenced in `index.css` (`--font-sans`, `--font-mono`, etc.) but `astro.config.mjs` has no `experimental.fonts` array configuring them.
- **Warning**: primary font family is a generic AI-default (Inter, Roboto, Arial, system-ui) — CLAUDE.md's `<frontend_aesthetics>` block explicitly rejects these.
- **Pass**: fonts declared via `experimental.fonts`, exposed as CSS variables in `@theme`, preloaded via `<Font />` in Layout.astro.

### F. Cloudflare Adapter (`astro.config.mjs`)

If the project uses `@astrojs/cloudflare`:

- **Critical**: `imageService: "passthrough"` — disables the image service entirely and breaks `<Picture>`/`<Image>` in dev and build.
- **Critical**: missing `prerenderEnvironment: "node"` — the default `"workerd"` fails prerendering with a 404 outside Cloudflare's infra.
- **Warning**: `imageService` not set at all (relying on adapter default).
- **Pass**: `imageService: "compile"` + `prerenderEnvironment: "node"`.

### G. Anchor Links

For every `href="#…"` in `.astro` files:

- **Critical**: no element in the same page (or in components imported by the page) carries the matching `id="…"`. CLAUDE.md: "When creating anchor links, ALWAYS create the corresponding id in the target element."
- **Pass**: matching `id` found.

### H. Accessibility & Semantic HTML

Per `.astro` page:

- **Critical**: 0 or >1 `<h1>` elements on the page (after composition — count includes `<h1>` inside imported components when statically obvious).
- **Critical**: heading hierarchy skips a level (e.g. `<h1>` → `<h3>`).
- **Critical**: any image element lacks `alt`.
- **Warning**: icon-only `<button>` / `<a>` (lucide-react `<Icon>` as the only child) without `aria-label`.
- **Warning**: `<button>` styled to look like a link when an `<a>` is semantically correct (or vice versa).
- **Pass**: heading order correct, all images labelled, interactive elements named.

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
Code Review Results for [scope]
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

3. Anchor href="#features" has no matching id in target page
   File: src/components/Header.astro:18
   Rule: CLAUDE.md → Quality Standards (anchor links)

---

## Warnings (⚠️)

1. <Picture> missing `widths` array (responsive sizes)
   File: src/components/Hero.astro:88

2. Primary font family is "Inter" — flagged by Hakuto aesthetic guidelines
   File: src/index.css:14

3. astro-favicons still configured with template default name "Hakuto"
   File: astro.config.mjs:42

---

## Passed Checks (✅)

- @import 'tailwindcss' is first line in src/index.css
- All .astro pages have exactly one <h1>
- No `class=` misuse on shadcn components in scope
- experimental.fonts configured for JetBrains Mono + Instrument Sans
- imageService: "compile" + prerenderEnvironment: "node"
- No favicon sources in public/
- bun run check: clean over in-scope files

---

To fix issues, ask Claude:
- "Fix all critical code review issues"
- "Convert hero <img> to <Picture> in src/pages/index.astro"
- "Add aria-label to icon-only buttons in Header.astro"
```

---

## Severity Rules

**Critical (❌)** — blocks shipping or causes a runtime/build failure:
- `@import 'tailwindcss'` not first; `tailwind.config.*` still present
- `.tsx`/`.jsx` in `src/pages/` or `src/layouts/`
- `class=` on a React/shadcn component
- Bare `<img>` for an imported local image; missing `alt`
- `@font-face` / `@import` for fonts in CSS; custom fonts without `experimental.fonts`
- Cloudflare `imageService: "passthrough"` or missing `prerenderEnvironment: "node"`
- Anchor `href="#x"` with no matching `id`
- 0 or >1 `<h1>` on a page; broken heading hierarchy
- Editable favicon source under `public/`
- New `bun run check` error introduced by in-scope files
- Template placeholders (`SITE_NAME = "Hakuto"`, etc.) still present
- Third-party tracking script (GTM / FB Pixel / Cookiebot / FirstPromoter / Hotjar / Clarity / Amplitude / HubSpot) loaded outside a deferred init wrapped on `load` + interaction
- `public/_headers` missing `/_astro/*` rule with `max-age >= 31536000, immutable` on a Cloudflare Workers (`[assets]`) project
- `public/_headers` missing `Content-Security-Policy` entirely, or CSP present but missing one of `frame-ancestors` / `base-uri` / `object-src` / `form-action`
- `public/_headers` missing `Permissions-Policy`

**Warning (⚠️)** — should fix but non-blocking:
- Custom tokens outside `@theme`; CSS variables outside `@layer base`
- `style={{}}` on shadcn components; `<Picture>` missing `formats`/`widths`
- `loading` attribute missing or wrong for above/below-the-fold images
- Above-the-fold image with `loading="eager"` but no `fetchpriority="high"`
- Hero `<h1>` inherits a custom heading font with no `max-md:font-system`-style mobile override (mobile LCP risk)
- Generic font (Inter / Roboto / Arial) as primary
- `imageService` unset; `astro-favicons` still on template defaults
- Icon-only buttons without `aria-label`
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
- **Don't false-positive on intentional patterns** — external `<img>` URLs (Unsplash etc.) are fine, only flag bare `<img>` for *imported local* images; HTML elements correctly use `class=`, only flag `class=` on capitalised React/shadcn tags.
- **Stay in sync with CLAUDE.md** — every check ties to a rule there; when rules change, update the corresponding category.
- **Complements `seo-audit`** — that skill audits built HTML in `_dist/`; this one audits source in `src/`. Run both for full coverage.

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

---
name: hakuto-review
description: Source-level review of a Hakuto site's `src/`, config and `public/_headers` — images and right-sizing, Tailwind v4 and shadcn correctness, fonts, Cloudflare adapter, internal links, accessibility, render-path and mobile paint performance, caching and security headers. Reviews one file, the recent diff, or the whole project; report-only. Use for "Hakuto review", "review my changes", "review my site source", "lint the site", "check accessibility", "check my security headers", "why is the page slow" (source side). Skip for built-HTML SEO (`seo-audit`), live Lighthouse scores (`pagespeed-audit`), or ship-readiness (`prelaunch-checklist`).
---

# Hakuto Review

Audit a Hakuto site's source against the stack's conventions. This is the **source-side**
counterpart to `seo-audit`, which audits the built `dist/client/` HTML: this skill catches
issues in `src/`, `astro.config.mjs`, `src/index.css` and `public/_headers` before they
ship; `seo-audit` catches what the build produces.

## Check Catalogue

The checks live in `references/`, each carrying its own severity. Read a file when its
trigger applies — don't work from memory, and grade from the file rather than re-deciding.

| File | Read when | Contents |
| --- | --- | --- |
| `references/checks-images.md` | Scope renders images, has `src/content/**` markdown, or touches `astro.config.mjs` | `<Picture>`/`<Image>` pipeline, `fallbackFormat`, right-sizing (`width`/`widths`/`sizes`, crops), markdown content images |
| `references/checks-code.md` | Scope has `.astro`/`.ts`/`.tsx`/`.css`, `astro.config.mjs` or `package.json` | Tailwind v4 setup, Astro file types, shadcn props and unused components, fonts, Cloudflare adapter, trailing-slash links, accessibility, favicon source, code hygiene |
| `references/checks-performance.md` | "Why is it slow", Layout/landing pages/always-included components, `src/index.css` | Critical render path and LCP (hero font, tracking scripts, `fetchpriority`), mobile paint cost (blur filters, animated paint) |
| `references/checks-headers.md` | Scope includes `public/_headers` or `wrangler.toml`, or the user asks about headers/caching | Static-asset caching, security headers (CSP, Permissions-Policy, HSTS, X-Frame-Options, nosniff, Referrer-Policy), `/` vs `/*` scoping |

A whole-project review reads all four.

---

## Execution Flow

### 0. Determine Scope

- **Single file** — an explicit path → review only that file plus its directly-imported
  configs. If the file doesn't exist, list nearby candidates and stop.
- **Changed files** — "my changes", "recent changes", "what I edited" → `git diff --name-only
  HEAD` plus unstaged/untracked files from `git status --short`. Restrict checks to those
  files.
- **Whole project (default)** — `src/**/*.{astro,ts,tsx,css}`, plus `astro.config.mjs`,
  `package.json`, `wrangler.toml`, `public/_headers` and any `tailwind.config.*`.

### 1. Read Project Context

Many checks depend on these, so read them first regardless of scope:

- `package.json` — Astro version (decides `fonts` vs `experimental.fonts`), dependency
  versions, `bun` scripts.
- `astro.config.mjs` — Cloudflare adapter options, Fonts API config, `trailingSlash`,
  integrations, markdown plugins.
- `src/index.css` — Tailwind v4 ordering, `@theme` / `@layer base` structure.
- `src/layouts/Layout.astro` (top ~80 lines) — `<Font />` preloads, head scripts.

### 2. Run Checks

Read the reference files that apply (see the table) and run every check in them against the
in-scope files. Record each finding as `{ severity, check, file, line, message }` so the report
can show `file:line`.

### 3. Type-Check

If the scope contains any `.astro`, `.ts` or `.tsx` file, run `bun run check` once at the end.
Surface only errors introduced by in-scope files; list pre-existing ones separately and don't
fix them. If `bun` is not on PATH, log one warning and continue with the static checks.

### 4. Report

Render the Output Format below.

---

## Severity

Each check in `references/` carries its severity inline — that is the only source. In brief:

- **❌ Critical** — breaks the build or a feature, ships a serious performance or security
  regression, or fails silently in production. Fix before the next deploy.
- **⚠️ Warning** — a real cost (performance, accessibility, maintainability) that doesn't
  block shipping.
- **ℹ️ Note** — informational; no fix required, but the user should know.
- **✅ Pass** — meets the requirement.

---

## Ground Rules

- **Report-only.** Never edit files, and never run `bun install` or `bun run build`. The user
  asks for fixes in a follow-up.
- **Cite `file:line`** on every finding.
- **Don't false-positive on intentional patterns.** External `<img>` URLs (Unsplash etc.) are
  fine — only bare `<img>` for *imported local* images is flagged. HTML elements correctly use
  `class=`; only capitalised React/shadcn tags need `className=`. For trailing slashes, never
  flag external/`mailto:`/`tel:` links, the root `/`, fragments, or file paths, and read
  `trailingSlash` before judging direction.
- **Group repeats.** One cause across many lines is one finding with a count.
- **No overlap with sibling skills.**
  - `seo-audit` audits built HTML in `dist/client/` and owns the rendered-DOM checks (image
    `alt`, `<h1>` count/hierarchy, text contrast, anchor-target ids, emitted image weight).
    This skill owns the source-side causes, including `sizes` without `widths` and
    `width`/`height` crops. Run both for full coverage.
  - `prelaunch-checklist` owns placeholder scrubbing — `SITE_NAME` / `SITE_DESCRIPTION`
    defaults in `src/lib/site.ts`, lorem ipsum, `TODO:` copy (its Checks 6 and 7). Don't
    report those here.
  - `pagespeed-audit` owns live Lighthouse scores and Core Web Vitals.

---

## Output Format

```markdown
Hakuto Review Results for [scope]
================================

📊 Summary:
✅ Passed: X | ❌ Critical: X | ⚠️ Warnings: X | ℹ️ Notes: X | Files: X

Scope: [Whole project | src/pages/index.astro | Changed files: 3]

---

## Critical Issues (❌)

1. Bare <img> for local image — use <Picture> so it gets webp and a srcset
   File: src/pages/index.astro:124
   Check: Images → Pipeline

2. `class=` used on shadcn <Button> (must be `className=`)
   File: src/components/Hero.astro:42
   Check: Code → shadcn / React Component Props

3. Cloudflare adapter imageService: "passthrough" — breaks <Picture>/<Image>
   File: astro.config.mjs:19
   Check: Code → Cloudflare Adapter

4. <Picture> has no `width` — emits the full-resolution asset into a ~350px card
   File: src/pages/blog/index.astro:147
   Check: Images → Right-Sizing

5. Security headers live under `/` — homepage only; every inner page ships without CSP
   File: public/_headers:1
   Check: Headers → Security Headers

---

## Warnings (⚠️)

1. <Image width={472} sizes="..."> has no `widths` — getSrcSet returns [], so one
   candidate ships and `sizes` is inert. Add widths={[472, 944]}
   File: src/pages/cloud/monitoring.astro:67
   Check: Images → Right-Sizing

2. <Picture width={464}> has no `sizes` — browser assumes 100vw and picks the
   largest candidate at every viewport
   File: src/components/Hero.astro:88
   Check: Images → Right-Sizing

3. Primary font family is "Inter" — generic AI-default face
   File: src/index.css:14
   Check: Code → Fonts

4. Internal link `/product` missing trailing slash — 301 redirect on every click
   File: src/components/Header.astro:24 (+5 more in this file)
   Check: Code → Internal Links

---

## Notes (ℹ️)

- Google Ads tag AW-123 without `allow_google_signals: false` — fires a localized
  google.{tld} pixel (src/components/Pixels.astro:12)

---

## Passed Checks (✅)

- @import 'tailwindcss' is first line in src/index.css
- No `class=` misuse on shadcn components in scope
- Top-level `fonts` configured for JetBrains Mono + Instrument Sans
- imageService: "custom" + prerenderEnvironment: "node" (sharp survives the adapter)
- All internal links match the trailingSlash convention
- bun run check: clean over in-scope files

---

To fix issues, ask Claude:
- "Fix all critical Hakuto review issues"
- "Right-size the images in src/pages/blog/ — measure each slot and add width, widths and sizes"
- "Add aria-label to icon-only buttons in Header.astro"
```

---

## Error Handling

- Path not found → report it, stop.
- File unreadable → log a Critical for that file, continue with the rest.
- `bun run check` fails to launch (`bun` not on PATH) → one Warning, continue with static
  checks.
- Changed-files scope requested but the project is not a git repo → tell the user; fall back
  to whole-project scope only if they confirm.

## Tool Usage

Read-only — Read, Glob and Grep for inspection, never Edit or Write. Bash only for:

```bash
git diff --name-only HEAD   # changed-files scope
git status --short          # untracked/unstaged additions
bun run check               # type-check, at most once per review
```

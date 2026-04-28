---
name: code-review
description: Hakuto-specific code review for Astro + Tailwind v4 + shadcn/ui sites. Audits source code against the project's CLAUDE.md rules — image optimization, className vs class, Tailwind v4 setup, Fonts API, Cloudflare adapter, anchor links, accessibility, code hygiene. Can review a single file, recently changed files, or the whole src/ tree. Report-only — no fixes applied. Use when user requests "review code", "code review", "audit code", "check code quality", or "lint the site".
---

# Code Review Skill

Audit Hakuto-built sites against the project's own CLAUDE.md rules. Report findings only — the user asks for fixes separately.

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

Scan `.astro` and `.tsx` files for shadcn/React component usages (capitalised tag names like `<Button>`, `<Card>`, `<Badge>`, `<Tabs>`, etc.):

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

**Warning (⚠️)** — should fix but non-blocking:
- Custom tokens outside `@theme`; CSS variables outside `@layer base`
- `style={{}}` on shadcn components; `<Picture>` missing `formats`/`widths`
- `loading` attribute missing or wrong for above/below-the-fold images
- Generic font (Inter / Roboto / Arial) as primary
- `imageService` unset; `astro-favicons` still on template defaults
- Icon-only buttons without `aria-label`
- Unused imports; pre-existing `bun run check` errors
- Lorem-ipsum / TODO copy left in pages

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

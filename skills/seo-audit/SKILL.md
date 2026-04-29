---
name: seo-audit
description: Static SEO audit for Astro `_dist/` HTML — meta tags, headings, canonicals, schema, sitemap, robots.txt, alt text, mixed content, internal links, image sizes, favicons. Can scope to a single page, group of pages, or whole site. Report-only — no fixes applied. Use when user requests "run SEO test", "SEO audit", "check meta tags", "validate canonicals", "audit indexability", or "check site for SEO issues".
---

# SEO Audit

Validate SEO on Astro-built sites.

**Flexible Scope:** This skill adapts to test based on user request:
- **Single page**: "Test SEO for homepage" or "Check SEO on about page"
- **Group of pages**: "Test SEO for pricing and contact pages" or "Check all blog posts"
- **Whole website**: "Run SEO test" or "Test all pages for SEO"

---

## Execution Flow

### 0. Determine Test Scope

Parse user request to identify which pages to test:

**Whole website** (default if not specified):
- "Run SEO test", "Test SEO", "Check all pages"
- Test ALL .html files in _dist

**Single page**:
- "Test SEO for homepage" → test _dist/index.html
- "Check about page SEO" → test _dist/about.html
- "Validate pricing page" → test _dist/pricing.html

**Group of pages**:
- "Test pricing and contact" → test _dist/pricing.html, _dist/contact.html
- "Check all blog posts" → test _dist/blog/*.html
- "Test feature pages" → identify and test matching pages

If page names are ambiguous, list available pages from _dist and confirm with user.

### 1. Ensure `_dist/` Exists

Check whether `_dist/` already contains built HTML (Hakuto's hooks keep it fresh during dev — usually it's already there). Use `Glob` for `_dist/**/*.html`.

- If `_dist/` already has built pages → proceed to Step 2
- If `_dist/` is missing or empty → run `bun run build` and re-check. If the build fails, report and stop.

This avoids redundant builds; Hakuto's external build hooks handle compilation automatically during normal work.

### 2. Read Page Metadata

Use the `Read` tool on `AGENTS.md` for Astro metadata about all pages in the site — page structure, routes, intended titles/descriptions. This is your context for what *should* be on each page.

### 3. List Built Files

Use `Glob` with `_dist/**/*.html` to enumerate built pages, then filter to the pages in scope (from Step 0). If the glob returns nothing or `_dist/` is missing, report the error and stop.

### 4. Initialize Trackers
```
critical_issues = []
warnings = []
passed = []
titles = {}           # title → files using it
descriptions = {}     # description → files using it
links = {}           # page → pages it links to
```

### 5. Test Each File

For each file, run these checks:

#### Meta Tags

**Title:** `<title>` in `<head>`
- Missing → critical
- <30 chars → critical: "Title too short: X chars (need 50-60)"
- 30-49 or 61+ chars → warning: "Title X chars (optimal: 50-60)"
- 50-60 chars → pass
- Track in titles{} for duplicates

**Meta Description:** `<meta name="description">` in `<head>`
- Missing → critical
- <100 chars → critical: "Description too short: X chars (need 150-160)"
- 100-149 or 161+ chars → warning: "Description X chars (optimal: 150-160)"
- 150-160 chars → pass
- Track in descriptions{} for duplicates

**Canonical:** `<link rel="canonical" href="...">` in `<head>`
- Missing → critical
- Relative URL (no http://) → warning: "Should be absolute URL"
- Absolute URL pointing to a different page than the current file's URL → critical: "Cross-canonical: page X canonicals to Y (silently de-indexes X)"
- Absolute, self-referencing → pass

To check self-reference: derive expected URL from file path (e.g. `_dist/about/index.html` → `/about/` or `/about`) and compare against canonical href path. Account for trailing-slash variants.

**Open Graph:** Check for og:title, og:description, og:image, og:url
- Missing any → warning for each missing tag
- All present → pass

#### HTML Document

**Lang Attribute:** `<html lang="...">` on the root element. Screen readers and translation tools rely on this to pronounce content correctly and offer the right translation.
- Missing `lang` attribute → warning: "Missing `<html lang>` attribute"
- Present but empty (`lang=""`) → warning: "Empty `<html lang>` attribute"
- Present with non-empty value → pass

#### Heading Hierarchy

**H1 Count:**
- 0 H1s → critical: "Missing H1"
- >1 H1s → critical: "Multiple H1s (found X)"
- Exactly 1 → pass

**Hierarchy:** Check H1→H2→H3→H4→H5→H6 sequence
- If any skip (e.g., H1→H3) → critical: "Broken hierarchy at line X: H1→H3 (skipped H2)"
- No skips → pass

#### Schema Markup

Find `<script type="application/ld+json">`. JSON-LD unlocks rich results in Google (knowledge panels, breadcrumbs, FAQ accordions, sitelinks) — pages without it forfeit those SERP enhancements.
- Not found → warning: "No schema markup"
- Found, invalid JSON → critical: "Invalid JSON-LD: [error]"
- Found, valid JSON:
  - Organization/LocalBusiness: check name, url → pass if present
  - Article: check headline, datePublished, author → pass if present
  - Other types → pass

#### Image Alt Text

Extract all `<img>` tags in `<body>`:
- Missing `alt` attribute → critical: "Image missing alt: [src]"
- Empty `alt=""` on a decorative image (no surrounding link/caption) → pass (intentional)
- Empty `alt=""` on a content image (inside `<a>`, `<figure>`, or with no other text in link) → warning: "Empty alt on content image: [src]"
- Non-empty descriptive alt → pass

Ignore `<img>` inside `<picture>` only when the `<picture>` itself has an `<img>` child with alt (don't double-count).

#### Image Asset Health

For each `<img src="...">` and `<source srcset="...">` referencing a **local** path (starts with `/` or relative, not `http://`/`https://`), `stat` the resolved file in `_dist/`:

- > 2 MB → critical: "Oversized image: [src] (X MB) — will tank LCP"
- 1–2 MB → warning: "Large image: [src] (X MB) — consider compressing"
- ≤ 1 MB → pass

Skip external images (Unsplash, CDN URLs) — they're outside our control. Skip SVG files (typically tiny). Astro's build fails on broken `<Picture>`/`<Image>` imports, so existence is already guaranteed at this stage.

#### URL Hygiene

Per page URL (from sitemap.xml or file path):
- Uppercase letters in path → warning: "URL not lowercase: [url]"
- Underscores in path segments → warning: "URL uses underscores instead of hyphens: [url]"
- Query parameters (`?foo=bar`) on indexable pages → warning: "Indexable URL has query params: [url]"

#### Mixed Content

Scan built HTML for `http://` (not `https://`) references:
- `<script src="http://...">`, `<link href="http://...">`, `<img src="http://...">`, `<iframe src="http://...">` → critical: "Mixed content: [tag] loads insecure [url]"
- `<a href="http://...">` → warning: "Insecure link: anchor points to http:// [url]" — following the link drops the user from HTTPS to HTTP
- Ignore `http://` inside JSON-LD `@context` (`http://schema.org` is canonical) and inside text content / comments.

#### Internal Links

Extract all `<a href="...">` tags:
- Record internal links (ignore external URLs that start with `http://` or `https://`)
- Track in links{}: current_page → [linked_pages]

**Target validation:** for each internal href, confirm the target resolves to a file in `_dist/`:
- `/about` → `_dist/about.html` or `_dist/about/index.html`
- `/blog/post-name/` → `_dist/blog/post-name/index.html`
- `#section-id` (in-page anchor) → confirm an element with `id="section-id"` exists on the current page
- `/page#section` → confirm both the file exists AND the id exists on that page

Strip query strings (`?utm_source=...`) before resolving. Ignore `mailto:`, `tel:`, `javascript:` schemes.

- Target file not found → critical: "Broken internal link: [href] on [page] (target missing in _dist)"
- In-page anchor with no matching id → critical: "Broken anchor: [href] on [page] (no element with id=[fragment])"
- Resolves correctly → pass

### 6. Check Technical Files

Use `Read` for each file's contents and `Glob` to confirm presence in `_dist/`.

**Sitemap:** read `_dist/sitemap.xml` (or `_dist/sitemap-index.xml` if present)
- Missing → critical
- Present, list all URLs → pass
- Check if all pages in sitemap → warning if any missing

**Robots.txt:** read `_dist/robots.txt`
- Missing → critical
- Present, has "Sitemap:" → pass
- Present, no "Sitemap:" → warning

**llms.txt:** read `_dist/llms.txt`. Hints to LLM crawlers (ChatGPT, Perplexity, Claude) which content is canonical and how to summarize the site — without it, these tools fall back to generic crawling.
- Missing → warning
- Present → pass

**Favicon:** Check both HTML head links AND generated files in `_dist`

*HTML head checks* (per page in scope):
- `<link rel="icon">` (any type) → required, missing = critical
- `<link rel="apple-touch-icon">` → recommended, missing = warning
- `<link rel="manifest">` (web app manifest) → recommended, missing = warning

*File checks* (in `_dist`, site-wide):
- `favicon.ico` → required, missing = critical
- `favicon.svg` OR `favicon-32x32.png` (or similar PNG fallback) → required, missing = critical
- `apple-touch-icon.png` (or `apple-touch-icon-180x180.png`) → recommended, missing = warning
- `manifest.webmanifest` (or `site.webmanifest`) → recommended, missing = warning

*Validation*:
- For each `<link rel="icon" href="...">`, confirm the referenced file exists in `_dist` → broken reference = critical
- All required present and resolving → pass

### 7. Analyze Structure

**Orphaned Pages:** BFS from index.html/index.astro
- Find homepage (index.*), start there
- Visit all linked pages recursively
- Pages not reached → warning: "Orphaned: [page]"

**Duplicate Content:**
- If titles{title} has >1 file → warning: "Duplicate title in: [files]"
- If descriptions{desc} has >1 file → warning: "Duplicate description in: [files]"

---

## Output Format

```markdown
SEO Test Results for [scope]
============================

📊 Summary:
✅ Passed: X | ❌ Critical: X | ⚠️ Warnings: X | Pages: X

Scope: [All pages | Single page: index.html | Pages: pricing.html, contact.html]

---

## Critical Issues (❌)

1. Missing meta title
   File: _dist/pricing.html

2. Title too short: "About" (5 chars, need 50-60)
   File: _dist/about.html

3. Multiple H1 tags (found 2)
   File: _dist/about.html

4. Broken heading hierarchy (line 45): H1→H3 (skipped H2)
   File: _dist/pricing.html

5. Broken internal link: /pricng (target missing in _dist)
   File: _dist/index.html

6. Oversized image: /assets/hero.png (3.4 MB) — will tank LCP
   File: _dist/index.html

---

## Warnings (⚠️)

1. Title length: 45 chars (optimal: 50-60)
   File: _dist/contact.html

2. Missing og:image
   Files: _dist/pricing.html, _dist/contact.html

3. Duplicate title "Features" in:
   Files: _dist/features.html, _dist/product-features.html

4. Orphaned page (unreachable from homepage)
   File: _dist/old-page.html

5. Missing `<html lang>` attribute
   File: _dist/index.html

6. Large image: /assets/team.jpg (1.4 MB) — consider compressing
   File: _dist/about.html

---

## Passed Checks (✅)

- All pages have canonical URLs
- Homepage has valid Organization schema
- Sitemap includes all pages
- No duplicate descriptions
- Heading hierarchy correct (3 pages)
- Robots.txt references sitemap

---

To fix issues, edit the source .astro files in src/pages/ directory:
"Add meta description to src/pages/pricing.astro"
"Fix heading hierarchy in src/pages/pricing.astro"
"Fix all critical SEO issues"
```

---

## Severity Rules

**Critical (❌):**
- Missing: title, meta description, H1, canonical, sitemap, robots.txt
- Title <30 chars, description <100 chars
- Multiple H1s or broken heading hierarchy
- Invalid JSON-LD
- Cross-canonical (canonical points to a different page)
- Missing `alt` attribute on `<img>` (different from intentional `alt=""`)
- Mixed content (https page loading http resources)
- Missing favicon: no `<link rel="icon">` in head, missing `favicon.ico`, or missing SVG/PNG fallback
- Broken favicon reference (link points to file not present in `_dist`)
- Broken internal link (anchor href targets a file or in-page id that doesn't exist)
- Local image > 2 MB

**Warning (⚠️):**
- Title/description outside optimal range (but >30/>100)
- Missing: Open Graph, schema, llms.txt
- Missing recommended favicon assets: `apple-touch-icon`, web manifest link, or manifest file
- Relative canonical URL
- Empty `alt=""` on content images (inside links/figures)
- URL hygiene: uppercase, underscores, or query params on indexable URLs
- Duplicates, orphaned pages
- Missing or empty `<html lang>` attribute
- Local image 1–2 MB
- Insecure anchor link (`<a href="http://...">`)

**Pass (✅):**
- Meets all requirements

---

## Error Handling

- Path not found → report error, stop
- No files → report error, stop
- File unreadable → add to critical, continue with others
- Malformed HTML → add to warnings, continue testing

---

## Tool Usage

- **Build:** `Bash` → `bun run build` (produces `_dist/`).
- **Enumerate built pages:** `Glob` with `_dist/**/*.html`.
- **Read a file:** `Read` (HTML pages, `AGENTS.md`, `sitemap.xml`, `robots.txt`, `llms.txt`).
- **Search across files:** `Grep` for things like `<link rel="canonical"`, `<h1`, `og:image`, `http://` (mixed-content scan).
- **Confirm asset presence:** `Glob` for `_dist/favicon.ico`, `_dist/apple-touch-icon*`, `_dist/site.webmanifest` etc.
- **Validate JSON-LD:** extract the script content with `Grep`/`Read` and parse with `JSON.parse` via a one-liner in `Bash` or by inspection.

Read-only throughout — never `Write` or `Edit` from this skill.

---

## Notes

- **Scope flexibility**: Parse user prompt to determine if testing single page, group, or all pages
- Read AGENTS.md for page metadata context
- Test built HTML files in `_dist/`, not source `.astro` files
- Focus on `<head>` and `<body>` sections in built HTML
- Track line numbers for hierarchy issues when possible
- User decides which issues to fix in source files (`src/pages/`)
- For single/group page tests, skip site-wide checks (orphaned pages, duplicate content) unless relevant

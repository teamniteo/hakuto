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
h1s = {}              # H1 text → files using it
links = {}           # page → pages it links to
noindex_pages = []    # page URLs carrying <meta name="robots" content="noindex">
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

**Robots Meta:** `<meta name="robots" content="...">` in `<head>`
- Contains `noindex` → record this page URL in `noindex_pages[]` (used in Step 6 to confirm it's excluded from the sitemap). Not itself an issue — intentional noindex is fine.
- Contains `nofollow` on an indexable content page → warning: "Page-level nofollow on [url] (blocks link equity flow)"

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

**H1 Text (cross-page):** record the H1's text content in `h1s{}`. Templated pages (per-check, per-doc, per-city listings) commonly render the *same* H1 across dozens of URLs — Google reads that as thin/duplicate content even when each page's body differs. Distinct-per-page-count H1s can still be site-wide duplicates. Evaluated in Step 7.
- Normalize whitespace before recording (collapse runs of spaces/newlines, trim).

**Hierarchy:** Check H1→H2→H3→H4→H5→H6 sequence
- If any skip (e.g., H1→H3) → critical: "Broken hierarchy at line X: H1→H3 (skipped H2)"
- No skips → pass

#### Schema Markup

Find `<script type="application/ld+json">`. JSON-LD unlocks rich results in Google (knowledge panels, breadcrumbs, FAQ accordions, sitelinks) — pages without it forfeit those SERP enhancements.
- Not found → warning: "No schema markup"
- Found, invalid JSON → critical: "Invalid JSON-LD: [error]"
- Found, valid JSON:
  - Organization/LocalBusiness: check name, url → pass if present. Also expect `logo` and `sameAs` (social profiles) → warning if either missing: "Organization schema missing [logo/sameAs]".
  - Article/BlogPosting: check headline, author, `datePublished` → present = pass. Additionally require:
    - `dateModified` → warning if missing: "Article schema missing dateModified (freshness signal)". Populate from git commit history, not hand-maintained.
    - `publisher` (Organization ref) and `image` → warning for each missing.
  - **Product / SoftwareApplication** pages (pricing, app-download, product landing): expect a `Product`/`SoftwareApplication` node, ideally with `offers` and `aggregateRating` → warning if the page is clearly a product page but carries no such schema.
  - Other types → pass

**Breadcrumbs:** if the page renders a visible breadcrumb trail (e.g. `<nav aria-label="Breadcrumb">`, or an ordered list of ancestor links near the top), expect a matching `BreadcrumbList` in JSON-LD.
- Visible breadcrumb present but no `BreadcrumbList` schema → warning: "Visible breadcrumb has no BreadcrumbList schema on [url]".

#### Image Alt Text

Extract all `<img>` tags in `<body>`:
- Missing `alt` attribute → critical: "Image missing alt: [src]"
- Empty `alt=""` on a decorative image (no surrounding link/caption) → pass (intentional)
- Empty `alt=""` on a content image (inside `<a>`, `<figure>`, or with no other text in link) → warning: "Empty alt on content image: [src]"
- **Low-quality alt** — non-empty but clearly not human-written: ends in an image extension (`.png`/`.jpg`/`.jpeg`/`.gif`/`.webp`/`.svg`), is a bare slug/filename (`screenshot-2024-11`, `image_01`, `IMG_2043`), or just repeats the file's basename → warning: "Filename-style alt on [src]: '[alt]' — rewrite as a description". These pass a naive presence check but carry no SEO value.
- Non-empty descriptive alt → pass

Ignore `<img>` inside `<picture>` only when the `<picture>` itself has an `<img>` child with alt (don't double-count).

**Image dimensions (CLS):** every rendered `<img>` in `<body>` should carry both `width` and `height` attributes (Astro's `<Picture>`/`<Image>` emit these automatically; raw `<img>` tags often don't). Missing dimensions force the browser to reflow once the image loads, hurting Cumulative Layout Shift.
- `<img>` missing `width` or `height` → warning: "Image missing width/height (causes layout shift): [src]"
- Both present → pass

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

**Sitemap:** read `_dist/sitemap.xml` (or `_dist/sitemap-index.xml` if present; follow the index to its child sitemaps)
- Missing → critical
- Present, list all URLs → pass
- Check if all pages in sitemap → warning if any missing
- **noindex leak** — any URL in `noindex_pages[]` (from Step 5) that also appears in the sitemap → critical: "Sitemap lists noindex page [url] (contradictory signal — remove from sitemap)".
- **`<lastmod>` freshness** — every `<url>` should carry a `<lastmod>`. Missing on some/all → warning: "Sitemap missing <lastmod> on N URLs (weakens freshness/crawl signals)". Derive lastmod from git commit history so it stays accurate without hand-maintenance.
- **Placeholder lastmod** — all URLs share one identical `<lastmod>` (e.g. the build date) → warning: "All sitemap <lastmod> values identical — likely build-time stamp, not real content dates".

**Robots.txt:** read `_dist/robots.txt`
- Missing → critical
- Present, no "Sitemap:" line → warning
- Present, has "Sitemap:" → confirm each `Sitemap:` URL actually resolves to a file in `_dist/` (e.g. `Sitemap: https://site/sitemap-index.xml` → `_dist/sitemap-index.xml` exists). A dead/misspelled sitemap reference wastes crawl budget and is invisible to a naive "has Sitemap:" check.
  - `Sitemap:` URL with no matching file in `_dist/` → critical: "robots.txt points to missing sitemap: [url]".
  - Multiple `Sitemap:` lines where the real sitemap is an index → warning: "Multiple/redundant Sitemap: lines — list only the sitemap index".
  - All `Sitemap:` lines resolve → pass.

**Duplicate index (`/index.html`):** static hosts serve a directory's `index.html` at *both* `/` and `/index.html`, creating a duplicate-content pair unless one 301-redirects.
- For each `_dist/**/index.html`, flag if the site has no `_redirects` (or host config) rule sending `/index.html → /` (and nested `/<dir>/index.html → /<dir>/`) → warning: "`/index.html` reachable as a duplicate of `/` — add a 301 in `public/_redirects`". Report-only; the fix lives in `public/_redirects`.

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
- If h1s{text} has >1 file → warning: "Duplicate H1 '[text]' across N pages: [files]". Templated routes (per-check, per-doc, per-listing) are the usual culprit — qualify each H1 with its distinguishing attribute (platform, category, location) in the source template.

---

## Output Format

Open with a scope header, then list issues in this order: Critical (❌) → Warnings (⚠️) → Passed (✅). Show `file:line` on every finding so the user can jump straight to it. End with a short "to fix" list naming source files in `src/pages/`.

See `references/example-report.md` for the full template — match its shape and headings verbatim.

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
- robots.txt `Sitemap:` line points to a sitemap file not present in `_dist/`
- Sitemap lists a `noindex` page (contradictory index signal)

**Warning (⚠️):**
- Title/description outside optimal range (but >30/>100)
- Missing: Open Graph, schema, llms.txt
- Missing recommended favicon assets: `apple-touch-icon`, web manifest link, or manifest file
- Relative canonical URL
- Empty `alt=""` on content images (inside links/figures)
- URL hygiene: uppercase, underscores, or query params on indexable URLs
- Duplicates (title, description, or cross-page H1 text), orphaned pages
- Missing or empty `<html lang>` attribute
- Local image 1–2 MB
- Insecure anchor link (`<a href="http://...">`)
- Filename-style/low-quality `alt` text; `<img>` missing `width`/`height` (CLS)
- Sitemap missing `<lastmod>`, or all `<lastmod>` values identical (build-time stamp)
- Article/BlogPosting schema missing `dateModified`/`publisher`/`image`; Organization missing `logo`/`sameAs`; visible breadcrumb with no `BreadcrumbList`; product page with no `Product`/`SoftwareApplication` schema
- `/index.html` reachable as a duplicate of `/` with no 301
- Page-level `nofollow` on an indexable content page

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

## Out of Static Scope (needs a live crawl)

This skill audits built HTML in `_dist/`. Some technical-SEO issues only exist at the network/host layer and **cannot** be found here — a live crawl (Screaming Frog / Ahrefs / an external audit) is still the right tool for them. Call these out to the user at the end of a whole-site run so a clean report isn't mistaken for "nothing left to check":

- Redirect **status codes** and chains (301 vs 302, 307→308 trailing-slash upgrades, redirect loops).
- `www`→apex (or apex→`www`) canonicalization and HTTPS-upgrade redirects — Cloudflare/host layer.
- HTTP response headers (`X-Robots-Tag`, `Link: rel=canonical`, caching, HSTS).
- Live 404s from **inbound** external links not present in the site's own `_dist/` graph (pull these from Google Search Console).
- Server response time / real Core Web Vitals under load (use the `pagespeed-audit` skill for field data).

Report these as an "Out of static scope — verify with a live crawl / GSC" footer, not as passes.

## Notes

- **Scope flexibility**: Parse user prompt to determine if testing single page, group, or all pages
- Read AGENTS.md for page metadata context
- Test built HTML files in `_dist/`, not source `.astro` files
- Focus on `<head>` and `<body>` sections in built HTML
- Track line numbers for hierarchy issues when possible
- User decides which issues to fix in source files (`src/pages/`)
- For single/group page tests, skip site-wide checks (orphaned pages, duplicate content) unless relevant

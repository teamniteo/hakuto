---
name: testing-seo
description: SEO validation for sites. Can test a single page, group of pages, or entire website based on user prompt. Reports issues and successes. Report-only - no fixes applied.
---

# Testing SEO Skill

Validate SEO on Astro-built sites. Report findings only - user requests fixes separately.

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

### 1. Build Site
```bash
bun run build
```
Build the Astro site. Output will be in `_dist` folder. If build fails, report error and stop.

### 2. Read Page Metadata
```bash
view AGENTS.md
```
Read AGENTS.md file which contains Astro metadata about all pages in the site. This provides context about page structure and routes.

### 3. List Built Files
```bash
view _dist
```
Record all .html files in `_dist` folder. Filter to only the pages in scope (from Step 0). If path invalid or no files found, report error and stop.

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
- Absolute URL → pass

**Open Graph:** Check for og:title, og:description, og:image, og:url
- Missing any → warning for each missing tag
- All present → pass

#### Heading Hierarchy

**H1 Count:**
- 0 H1s → critical: "Missing H1"
- >1 H1s → critical: "Multiple H1s (found X)"
- Exactly 1 → pass

**Hierarchy:** Check H1→H2→H3→H4→H5→H6 sequence
- If any skip (e.g., H1→H3) → critical: "Broken hierarchy at line X: H1→H3 (skipped H2)"
- No skips → pass

#### Schema Markup

Find `<script type="application/ld+json">`
- Not found → warning: "No schema markup"
- Found, invalid JSON → critical: "Invalid JSON-LD: [error]"
- Found, valid JSON:
  - Organization/LocalBusiness: check name, url → pass if present
  - Article: check headline, datePublished, author → pass if present
  - Other types → pass

#### Internal Links

Extract all `<a href="...">` tags:
- Record internal links (ignore external URLs with http://)
- Track in links{}: current_page → [linked_pages]

### 6. Check Technical Files

**Sitemap:** `view _dist/sitemap.xml`
- Missing → critical
- Present, list all URLs → pass
- Check if all pages in sitemap → warning if any missing

**Robots.txt:** `view _dist/robots.txt`
- Missing → critical
- Present, has "Sitemap:" → pass
- Present, no "Sitemap:" → warning

**llms.txt:** `view _dist/llms.txt`
- Missing → warning
- Present → pass

**Favicon:** Check for favicon.ico, .svg, .png or `<link rel="icon">`
- Missing → warning
- Present → pass

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

**Warning (⚠️):**
- Title/description outside optimal range (but >30/>100)
- Missing: Open Graph, schema, llms.txt, favicon
- Relative canonical URL
- Duplicates, orphaned pages

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

**Build site:**
```bash
bun run build                  # Build Astro site to _dist
```

**View files:**
```bash
view AGENTS.md                 # Page metadata
view _dist                     # Directory listing
view _dist/index.html          # File content
```

**Count elements:** After viewing, scan content for patterns
**Extract text:** Parse displayed content for tag values
**Validate JSON:** Attempt to parse extracted JSON-LD content

---

## Notes

- **Scope flexibility**: Parse user prompt to determine if testing single page, group, or all pages
- Always run `bun run build` first to generate _dist folder
- Read AGENTS.md for page metadata context
- Test built HTML files in _dist folder, not source .astro files
- Focus on `<head>` and `<body>` sections in built HTML
- Track line numbers for hierarchy issues when possible
- Report only - never modify files
- User decides which issues to fix in source files (src/pages/)
- For single/group page tests, skip site-wide checks (orphaned pages, duplicate content) unless relevant

# SEO Audit — Example Report

Render reports in this exact shape. Include the scope header so the user knows what was tested; list critical issues before warnings before passed checks; show `file:line` for every finding so the user can jump straight to it.

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

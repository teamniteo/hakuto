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

---

## Agent Readiness (only when Step 8 ran)

Append this section **after** the static results — never merge the two. The
static audit grades `_dist/`; this grades the live deploy at the moment of the
scan.

```markdown
---

## Agent Readiness — is-agentic

Target: example.com · Scanned: 2026-08-25T09:14:02Z · 41 eligible checks

Score: 78 / 100 — Solid, with gaps
  Essential     58.4 / 80    9 / 12 passed
  Recommended   14.6 / 20    18 / 25 passed
  Bonus               +5     31 positive signals

### Critical (❌) — failed Essential checks

1. Agent-friendly 404s
   Evidence: Nonexistent paths return HTTP 200 with the app shell.
   Fix: Return a real HTTP 404 or 410 for nonexistent paths.
   → src/pages/404.astro, worker/index.js

2. Machine-readable site summary
   Evidence: /llms.txt is served but still contains template placeholders.
   Fix: Describe the actual product and link the canonical pages.
   → public/llms.txt

### Warnings (⚠️) — partial Essential / failed Recommended

1. Structured data coverage (partial · essential)
   Evidence: Organization schema present; product pages carry none.
   Fix: Add Product or SoftwareApplication JSON-LD to /pricing.
   → src/pages/pricing.astro

### Opportunities — Recommended partials and Bonus signals

- Expose an OpenAPI description for the public API (bonus)
- Serve canonical Markdown via Accept negotiation (bonus)

Full report: https://is-agentic.com/report/example.com

Note: this reflects the deploy live at scan time, not the working tree. The
score only changes after a redeploy and a fresh scan.
```

If the user asked for fixes, list what will change and confirm the selection
before editing anything. Otherwise stop here — the skill is report-only.


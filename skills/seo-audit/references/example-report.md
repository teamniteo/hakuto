# SEO Audit — Example Report

Render reports in this exact shape. Include the scope header so the user knows what was tested; list critical issues before warnings before passed checks; show `file:line` for every finding so the user can jump straight to it.

```markdown
SEO Test Results for [scope]
============================

📊 Summary:
✅ Passed: X | ❌ Critical: X | ⚠️ Warnings: X | ℹ️ Notes: X | Pages: X

Scope: [All pages | Single page: /about/ | Pages: /pricing/, /contact/]

---

## Critical Issues (❌)

1. Missing meta title
   File: dist/client/pricing/index.html:4

2. Multiple H1 tags (found 2)
   File: dist/client/about/index.html:38, :112

3. Broken internal link: /pricng/ (target missing in dist/client)
   File: dist/client/index.html:57

4. Oversized image: /_astro/hero.Bx3k.png (3.4 MB) — will tank LCP
   File: dist/client/index.html:41

---

## Warnings (⚠️)

1. Title too short: "About" (5 chars, optimal: 50-60)
   File: dist/client/about/index.html:6

2. Broken heading hierarchy: H1→H3 (skipped H2)
   File: dist/client/pricing/index.html:45

3. Missing og:image
   Files: dist/client/pricing/index.html:9, dist/client/contact/index.html:9

4. Duplicate title "Features" in:
   Files: dist/client/features/index.html:6, dist/client/product-features/index.html:6

5. Orphaned page (unreachable from homepage)
   File: dist/client/old-page/index.html

6. Missing `<html lang>` attribute
   File: dist/client/index.html:2

7. Large image: /_astro/team.Dk2a.jpg (1.4 MB) — consider compressing
   File: dist/client/about/index.html:74

---

## Notes (ℹ️)

- No explicit AI-crawler policy recorded in robots.txt (src/pages/robots.txt.ts)

---

## Passed Checks (✅)

- All pages have canonical URLs
- Homepage has valid Organization schema
- Sitemap includes all pages
- No duplicate descriptions
- Heading hierarchy correct (3 pages)
- Robots.txt references sitemap

---

To fix issues, edit the source files in src/ (and src/pages/robots.txt.ts, public/llms.txt):
"Add meta description to src/pages/pricing.astro"
"Fix heading hierarchy in src/pages/pricing.astro"
"Fix all critical SEO issues"
```

---

## Agent Readiness (only when the scan ran)

Append this section **after** the static results — never merge the two. The
static audit grades `dist/client/`; this grades the live deploy at the moment of the
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

### Opportunities (ℹ️) — Recommended partials and Bonus signals

- Expose an OpenAPI description for the public API (bonus)
- Serve canonical Markdown via Accept negotiation (bonus)

Full report: https://is-agentic.com/report/example.com

Note: this reflects the deploy live at scan time, not the working tree. The
score only changes after a redeploy and a fresh scan.
```

If the user asked for fixes, list what will change and confirm the selection
before editing anything. Otherwise stop here — the skill is report-only.


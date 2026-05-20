# PageSpeed Audit — Example Report

Render reports in this exact shape. One block per URL; include both Mobile and Desktop sections; always include the public PageSpeed Insights deeplinks so the user can verify in the browser.

```markdown
PageSpeed Audit: https://example.com
=====================================

📊 Summary
Mobile  → Performance: 87 ⚠️ | A11y: 95 ✅ | Best Practices: 92 ✅ | SEO: 100 ✅
Desktop → Performance: 96 ✅ | A11y: 95 ✅ | Best Practices: 92 ✅ | SEO: 100 ✅

---

## Mobile

### Lab Core Web Vitals
- LCP: 2.8s ⚠️ (target ≤ 2.5s)
- CLS: 0.05 ✅
- TBT: 340ms ⚠️ (target ≤ 200ms)
- FCP: 1.6s ✅
- Speed Index: 3.1s ✅

### Field Data (real users, p75 — last 28 days)
- LCP: 3.1s ⚠️
- CLS: 0.04 ✅
- INP: 180ms ✅

### Top Opportunities
1. Eliminate render-blocking resources — save ~480ms
   `/_astro/index.abc.css`, `/_astro/main.def.js`
2. Properly size images — save ~210KB
   `/hero.jpg` is 1920×1080 served at 800×450
3. Defer offscreen images — save ~180KB
4. Reduce unused JavaScript — save ~92KB
5. Preconnect to required origins — save ~140ms

### Top Diagnostics
- Avoid enormous network payloads — total: 2.4MB
- Minimize main-thread work — 1.8s
- Reduce JavaScript execution time — 1.1s

---

## Desktop

### Lab Core Web Vitals
- LCP: 1.4s ✅
- CLS: 0.02 ✅
- TBT: 80ms ✅
- FCP: 0.8s ✅
- Speed Index: 1.6s ✅

### Field Data
Field data unavailable for this URL.

### Top Opportunities
1. Reduce unused JavaScript — save ~92KB
2. Properly size images — save ~120KB

---

## Suggested Fixes

Edit source files in `src/` to address findings:
- "Add `loading=\"lazy\"` to below-the-fold images in src/components/Features.astro"
- "Convert hero.jpg to <Picture> with widths={[800, 1200, 1920]}"
- "Move blocking <script> tags from Layout.astro head to the end of body"
- "Tree-shake unused imports flagged in main bundle"

## Expected (intentional)

Findings filtered out per "Known False Positives" — keep as-is:
- `robots-txt` "Unknown directive" on `Content-Signal: …` — shipped by Hakuto on purpose. See SKILL.md for context.

📎 Full reports:
- Mobile:  https://pagespeed.web.dev/report?url=https%3A%2F%2Fexample.com&form_factor=mobile
- Desktop: https://pagespeed.web.dev/report?url=https%3A%2F%2Fexample.com&form_factor=desktop
```

When auditing multiple URLs, repeat the per-URL block and add a top-level summary table.

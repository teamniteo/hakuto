---
name: seo-audit
description: Static SEO audit of a Hakuto site's built `dist/client/` HTML — indexability, meta tags, headings, canonicals, structured data, sitemap, robots.txt, llms.txt, built images and internal links — plus an optional AI-agent-readiness scan of the deployed domain. Report-only unless the user asks to apply agent-readiness fixes. Use for "run SEO test", "SEO audit", "check meta tags", "validate structured data", "check built images / internal links", "check agent readiness". Skip for source code or security/cache headers (`hakuto-review`), live Core Web Vitals (`pagespeed-audit`), or ship-readiness (`prelaunch-checklist`).
---

# SEO Audit

Validate SEO on the built output of an Astro site.

Steps 1–7 audit built HTML in `dist/client/` and never write. The optional agent-readiness
scan needs a **deployed** domain and — only if the user asks — applies that report's fixes to
source.

## Check Catalogue

The checks live in `references/`, each carrying its own severity. Read the relevant file when
you reach the step that uses it — don't work from memory.

| File | Used by | Contents |
| --- | --- | --- |
| `references/checks-onpage.md` | Step 5 | Meta tags, `<html lang>`, headings, alt text, image weight and emitted pixels (local **and** third-party), text contrast, URL hygiene, mixed content, internal links, external link liveness |
| `references/checks-schema.md` | Step 5 | JSON-LD: per-type expectations, conflicting `@id`, rating substantiation, entity-escaped values, author identity, and the do-not-recommend list |
| `references/checks-technical.md` | Step 6 | Sitemap, robots.txt, Content-Signal, crawler-signal `_headers` rules, duplicate `/index.html`, llms.txt coverage, favicon, feed autodiscovery, page weight, JS-dependent commercial content |
| `references/agent-readiness.md` | Step 8 | Read when the user asks for an agent-readiness scan or its fixes: `bunx is-agentic` flow, severity mapping, and where each fix lives in source |
| `references/example-report.md` | Output | Report template — match its shape and headings verbatim |

---

## Execution Flow

### 0. Determine Test Scope

Pages build with trailing slashes, so a route maps to a directory index: `/` →
`dist/client/index.html`, `/about/` → `dist/client/about/index.html`.

- **Whole website** (default) — "Run SEO test", "Check all pages" → every
  `dist/client/**/*.html`.
- **Single page** — "Check about page SEO" → `dist/client/about/index.html`; "Test SEO for
  homepage" → `dist/client/index.html`.
- **Group of pages** — "Test pricing and contact" → `dist/client/pricing/index.html`,
  `dist/client/contact/index.html`; "Check all blog posts" →
  `dist/client/blog/**/index.html`.

If page names are ambiguous, list the built pages and confirm with the user.

### 1. Ensure `dist/client/` Is Current

Glob `dist/client/**/*.html`. If `dist/client/` is missing, empty, or older than `src/`
(compare the newest mtime in each), run `bun run build` and re-check. If the build fails,
report and stop.

### 2. Read Page Metadata

Read the `page_summary` block at the end of `AGENTS.md` for the routes and intended
titles/descriptions of every page — your context
for what *should* be on each page.

**`page_summary` descriptions can be truncated — don't report the difference as a finding.**
`@nuasite/agent-summary` (≤ 0.0.36) extracts the meta description with
`content=["']([^"']*)["']`, whose character class stops at an apostrophe. A description of
"The page you're looking for doesn't exist." is recorded as "The page you". The built page is
correct; the summary is not. Treat the block as a routes-and-intent map, and read the actual
`<meta name="description">` out of `dist/client/` whenever you need the real string.

### 3. List Built Files

Filter the Step 1 glob to the pages in scope (from Step 0). If nothing matches, report the
error and stop.

### 4. Initialize Trackers

```
critical_issues = []
warnings = []
notes = []
passed = []
titles = {}           # title → files using it
descriptions = {}     # description → files using it
h1s = {}              # H1 text → files using it
links = {}            # page → pages it links to
noindex_pages = []    # page URLs carrying <meta name="robots" content="noindex">
schema_nodes = {}     # page → parsed JSON-LD nodes (for cross-page @id and rating checks)
ext_images = {}       # third-party image host → [(page, src, slot width)]
```

### 5. Test Each File

Run every check in `references/checks-onpage.md` and `references/checks-schema.md` against
each file in scope. Populate the trackers as you go — several checks (duplicate titles,
cross-page H1s, site-wide `aggregateRating` counts, third-party image hosts) are only
decidable once every page has been seen, and are evaluated in Step 7.

### 6. Check Site-Wide & Technical Files

Run every check in `references/checks-technical.md`. Read built files from `dist/client/`;
the `_headers` and `astro.config.mjs` checks read **source** — see the note at the top of
that file.

### 7. Analyze Structure

**Orphaned pages:** BFS from the homepage over `links{}`. Pages not reached → ⚠️ Warning:
"Orphaned: [page]".

**Duplicate content:**
- `titles{title}` has >1 file → ⚠️ Warning: "Duplicate title in: [files]"
- `descriptions{desc}` has >1 file → ⚠️ Warning: "Duplicate description in: [files]"
- `h1s{text}` has >1 file → ⚠️ Warning: "Duplicate H1 '[text]' across N pages: [files]".
  Templated routes (per-check, per-doc, per-listing) are the usual culprit — qualify each H1
  with its distinguishing attribute (platform, category, location) in the source template.

**Site-wide aggregations** (from the per-page trackers):
- `aggregateRating` asserted on N pages but displayed on M < N → ❌ Critical, reported once
  with the counts. See `references/checks-schema.md`.
- Third-party image hosts → group by host: "68 Gravatar avatars across 34 pages", not 68
  findings. See `references/checks-onpage.md`.
- Entity-escaped JSON-LD → group by cause with a page count, not one finding per string.

### 8. Agent-Readiness Scan (opt-in, deployed domains only)

Only when the user asks for it. Read `references/agent-readiness.md` and follow it — it
covers target resolution, the confirmation the public scan requires, severity mapping, and the
opt-in fix flow (the only part of this skill that writes). Otherwise, mention the scan is
available at the end of a whole-site report and stop.

---

## Output Format

Open with a scope header, then list issues in this order: ❌ Critical → ⚠️ Warnings →
ℹ️ Notes → ✅ Passed. Show `file:line` on every finding so the user can jump straight to it.
End with a short "to fix" list naming source files in `src/`, `public/` or config.

**Severity definitions** — each check in the references carries its own severity; grade from
there rather than re-deciding:

- **❌ Critical** — blocks indexing, publishes false information, or breaks a feature
  silently. Fix before the next deploy.
- **⚠️ Warning** — a real cost (crawl budget, LCP, rich-result eligibility, accessibility,
  click-through) that doesn't block indexing.
- **ℹ️ Note** — an opportunity or a decision worth recording, not a defect (e.g. no explicit
  AI-crawler policy; agent-readiness bonus signals).
- **✅ Pass** — meets all requirements.

Group repeated instances of one cause into a single finding with a count. "68 Gravatar avatars
across 34 pages" is a finding; 68 separate entries is noise that gets the whole report
skimmed.

When the agent-readiness scan ran, append its section after the static results — the two
audits inspect different artifacts (live site vs `dist/client/`).

See `references/example-report.md` for the full template — match its shape and headings
verbatim.

---

## Error Handling

- Path not found → report error, stop
- No files → report error, stop
- File unreadable → add to critical, continue with others
- Malformed HTML → add to warnings, continue testing

---

## Tool Usage

- **Build:** `Bash` → `bun run build` (produces `dist/client/`).
- **Enumerate built pages:** `Glob` with `dist/client/**/*.html`.
- **Read a file:** `Read` (HTML pages, `AGENTS.md`, `sitemap-index.xml`, `robots.txt`,
  `llms.txt`, `public/_headers`, `astro.config.mjs`).
- **Search across files:** `Grep` for `<link rel="canonical"`, `<h1`, `og:image`, `http://`
  (mixed-content scan), `&apos;` (JSON-LD corruption).
- **Confirm asset presence:** `Glob` for `dist/client/favicon.ico`,
  `dist/client/apple-touch-icon*`, `dist/client/manifest.webmanifest`,
  `dist/client/**/rss.xml` etc.
- **Validate JSON-LD:** extract the script content and parse it with `JSON.parse` via a
  one-liner in `Bash` — don't eyeball it. The `@id` and entity-escaping checks need a real
  parse.
- **Measure image pixels:** `sips -g pixelWidth -g pixelHeight` (macOS) or
  `sharp(file).metadata()`.
- **Measure inline CSS / document size:** `Bash` → byte counts on the `<style>` block and the
  file.
- **External link liveness (opt-in):** `Bash` →
  `curl -sS -o /dev/null -w '%{http_code}' -I -L --max-time 10`.

Read-only throughout — never `Write` or `Edit` — except the agent-readiness fix flow, which
the user has to opt into explicitly and which touches source files only, never
`dist/client/`.

---

## Out of Static Scope (needs a live crawl or real layout)

Some issues only exist at the network/host layer, or need real rendered geometry, and can't be
found in `dist/client/`. Call these out at the end of a whole-site run so a clean report isn't
mistaken for "nothing left to check":

- Redirect **status codes** and chains (301 vs 302, 307→308 trailing-slash upgrades, redirect
  loops).
- `www`→apex (or apex→`www`) canonicalization and HTTPS-upgrade redirects — Cloudflare/host
  layer. The `_headers` linting checks what *should* be sent; only a live request proves what
  *is*.
- HTTP response headers as actually served (`X-Robots-Tag`, `Link: rel=canonical`, caching,
  HSTS).
- Live 404s from **inbound** external links not present in the site's own `dist/client/` graph
  (pull these from Google Search Console).
- Server response time / real Core Web Vitals under load — use `pagespeed-audit` for field
  data.
- **Mobile tap-target sizing** (< 44px guidance) — needs laid-out geometry, not markup. Use
  `pagespeed-audit` or `agent-browser`.

Report these as an "Out of static scope — verify with a live crawl / GSC" footer, not as
passes.

## Notes

- Test built HTML in `dist/client/`, not source `.astro` files — except `_headers` and
  `astro.config.mjs`, which are read from source.
- Track line numbers for every finding.
- For single/group page tests, skip site-wide checks (orphaned pages, duplicate content,
  `_headers` lint, sitemap) unless relevant.
- Source-side image causes (`sizes` without `widths`, `width`/`height` crops) belong to
  `hakuto-review`; this skill reports what the build emitted.

---
name: seo-audit
description: Static SEO audit of built `_dist/` HTML for Astro sites — indexability, meta tags, headings, canonicals, structured-data integrity, sitemap, robots.txt, llms.txt, images, internal links. Scopes to one page, a group, or the whole site; report-only. Can also score the deployed domain for AI-agent readiness. Use for "run SEO test", "SEO audit", "check meta tags", "validate structured data", "audit indexability", "check agent readiness". Not for source code or security/cache headers (`hakuto-review`), live Lighthouse and Core Web Vitals (`pagespeed-audit`), or ship-readiness (`prelaunch-checklist`).
---

# SEO Audit

Validate SEO on Astro-built sites.

**Flexible Scope:** This skill adapts to test based on user request:
- **Single page**: "Test SEO for homepage" or "Check SEO on about page"
- **Group of pages**: "Test SEO for pricing and contact pages" or "Check all blog posts"
- **Whole website**: "Run SEO test" or "Test all pages for SEO"

Steps 1–7 audit built HTML in `_dist/` and never write. Steps 8–9 are opt-in
and need a **deployed** domain: an `is-agentic` agent-readiness scan, and —
only if the user asks for it — applying that report's fixes to source.

## Check Catalogue

The checks themselves live in `references/`, each carrying its own severity. Read the
relevant file when you reach the step that uses it — don't work from memory.

| File | Used by | Contents |
| --- | --- | --- |
| `references/checks-onpage.md` | Step 5 | Meta tags, `<html lang>`, headings, alt text, image asset health and right-sizing (local **and** third-party), text contrast, URL hygiene, mixed content, internal links, external link liveness |
| `references/checks-schema.md` | Step 5 | JSON-LD: per-type expectations, conflicting `@id`, rating substantiation, entity-escaped values, author identity, and the do-not-recommend list |
| `references/checks-technical.md` | Step 6 | Sitemap, robots.txt, Content-Signal, crawler-signal `_headers` rules, duplicate `/index.html`, llms.txt coverage, favicon, feed autodiscovery, page weight, JS-dependent commercial content |
| `references/example-report.md` | Output | Report template — match its shape and headings verbatim |

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

**`AGENTS.md` descriptions can be truncated — do not report the difference as a finding.**
`@nuasite/agent-summary` (≤ 0.0.36) extracts the meta description with
`content=["']([^"']*)["']`, whose character class stops at an apostrophe. A description of
"The page you're looking for doesn't exist." is recorded as "The page you". The built page
is correct; the summary is not. Treat `AGENTS.md` as a routes-and-intent map, and read the
actual `<meta name="description">` out of `_dist/` whenever you need the real string.

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

Run every check in `references/checks-technical.md`. Use `Read` for each file's contents and
`Glob` to confirm presence in `_dist/`.

Note that the `_headers`, `robots.txt` and `astro.config.mjs` checks read **source**, not
`_dist/` — see the note at the top of that file.

### 7. Analyze Structure

**Orphaned Pages:** BFS from index.html/index.astro
- Find homepage (index.*), start there
- Visit all linked pages recursively
- Pages not reached → ⚠️ warning: "Orphaned: [page]"

**Duplicate Content:**
- If `titles{title}` has >1 file → ⚠️ warning: "Duplicate title in: [files]"
- If `descriptions{desc}` has >1 file → ⚠️ warning: "Duplicate description in: [files]"
- If `h1s{text}` has >1 file → ⚠️ warning: "Duplicate H1 '[text]' across N pages: [files]".
  Templated routes (per-check, per-doc, per-listing) are the usual culprit — qualify each H1
  with its distinguishing attribute (platform, category, location) in the source template.

**Site-wide aggregations** (from the per-page trackers):
- `aggregateRating` asserted on N pages but displayed on M < N → ❌ critical, reported once
  with the counts. See `references/checks-schema.md`.
- Third-party image hosts → group by host: "68 Gravatar avatars across 34 pages", not 68
  findings. See `references/checks-onpage.md`.
- Entity-escaped JSON-LD → group by cause with a page count, not one finding per string.

### 8. Agent-Readiness Pass — `bunx is-agentic` (deployed domains only, opt-in)

Everything above grades local `_dist/` HTML. This step scores the **live,
deployed** site for how usable it is to AI agents — agent-friendly 404s,
crawler access, machine-readable surfaces, content that exists without JS.
It complements the static checks because it observes status codes, headers,
and redirects that `_dist/` cannot show.

**When to run:**

- The user asks: "run is-agentic", "check agent readiness", "score the site
  for AI agents", "run the SEO test and the agent audit".
- The site is deployed **and the deploy is current**. The scan grades what is
  live, not what is in the working tree — if there are unbuilt or undeployed
  changes, say so before scanning.
- Never run it unprompted at the end of a static audit. Mention it is
  available and let the user choose.

**Resolve the target** — first hit wins:

1. A domain or URL passed in this invocation.
2. `site` in `astro.config.mjs`, unless it is still the scaffold default
   `http://localhost:4321`.
3. A production URL documented in `AGENTS.md`.

If none resolve, ask. Do not reuse a domain from an earlier turn.

**Reject private targets** — the scan runs from Is Agentic's servers, so
`localhost`, `127.0.0.1`, `0.0.0.0`, RFC1918 ranges, `*.local` and
`*.internal` are unreachable. Stop and ask for the deployed URL.

**Confirm before running.** This calls a third-party service (Vercel's Is
Agentic) that fetches the public site, and when no completed report exists it
**starts a new scan whose result is published at a public `report_url`**. Get
an explicit go-ahead on the exact domain first.

**Run it:**

```bash
bunx is-agentic <domain-or-url> --json
```

- Always `--json` — parse the structured response, never scrape the
  ANSI-rendered terminal report.
- No API key and no config. Node 18+ (Bun's runtime satisfies this).
- A cached report returns immediately; a cold target triggers a fresh scan
  that can take several minutes. Use a long timeout (`timeout: 600000`) or run
  it in the background. **Do not** kill and retry a scan that is still
  streaming — a second invocation just waits on the same scan.
- Failures exit nonzero and print an RFC 9457 problem object on stdout with
  `code`, `detail`, `resolution`. Handle by `code`:
  - `invalid_url` → fix the target or ask the user.
  - `report_not_found` → the CLI already ran its own scan-and-wait; retry the
    command **once**, then stop.
  - `rate_limit_exceeded` → honor `Retry-After`, report, and stop. Never loop.
  - `report_temporarily_unavailable`, `api_unreachable` → report and stop.
- Do not fall back to hand-fetching `is-agentic.com` when the CLI fails.

**Response shape** (`PublicScanReport`):

| Field | Meaning |
| --- | --- |
| `score` / `score_label` | 0–100 and its plain-English band (`null` if unscored) |
| `score_breakdown.essential` | `{earned, available, passing, total}` — 80-point pool |
| `score_breakdown.recommended` | same shape — 20-point pool |
| `score_breakdown.bonus` | `{points, positive_signals}` — capped at +5 |
| `issues[]` | `{id, name, tier, result, details, recommendation}` |
| `report_url` | canonical public report — link it, never invent it |
| `scanned_at` / `eligible_checks` | scan timestamp; checks that applied to this site |

`issues[]` contains **only** failed and partial checks — `tier` is
`essential` / `recommended` / `bonus`, `result` is `failed` / `partial`.
Passing checks are implied by the `passing` / `total` counts. Not-applicable
checks are excluded from scoring, so a smaller `eligible_checks` is not a
penalty.

**Map findings onto this skill's severities:**

- `essential` + `failed` → ❌ critical
- `essential` + `partial`, or `recommended` + `failed` → ⚠️ warning
- `recommended` + `partial`, or anything `bonus` → list under
  "Agent-readiness opportunities", not as a warning
- Quote each finding's `details` as *evidence from the live scan* — never
  restate it as something verified locally. The two audits look at different
  artifacts and can legitimately disagree.

Reports are cached and the CLI will not force a rescan, so re-running it in
the same session to "confirm" a fix proves nothing. Rescan after the next
deploy.

### 9. Apply Fixes from the Agentic Report (opt-in — the only step that writes)

Steps 1–8 are report-only. This step is the single exception and runs **only**
when the user asked for fixes — "…and fix the issues", "fix what is-agentic
found", "apply the report". Absent that, stop after the report.

1. **Report first.** Show the Step 8 findings grouped critical → warning →
   opportunity, with the score and `report_url`.
2. **Ask what to apply** — one `AskUserQuestion`, defaulting to "all essential
   failures". Any fix that bakes in a product or content decision (writing the
   `llms.txt` description of the business, changing copy, exposing a new
   machine-readable endpoint) needs the user's answer — never guess it.
3. **Fix in source, never in `_dist/`** — that tree is a build artifact and the
   next build overwrites it. Each finding's `recommendation` is the spec;
   translate it to the file that owns that surface in a Hakuto site:

| What the finding is about | Where it lives |
| --- | --- |
| 404 / soft-404 status codes | `src/pages/404.astro`; confirm `worker/index.js` and `wrangler.toml` are not answering `200` for unknown paths |
| Crawler and agent access rules, AI-crawler policy, `Content-Signal` | `src/pages/robots.txt.ts` |
| Site summary for LLM crawlers | `public/llms.txt` — replace the scaffold placeholders with real content |
| Structured data / JSON-LD | the `schema` prop each page passes to `src/layouts/Layout.astro` (typed with `schema-dts`, serialized by `src/components/Schema.astro`) |
| Title, description, canonical, OG, feed autodiscovery | `src/layouts/Layout.astro` and the per-page props |
| Crawler-signal headers (`Link`, `Content-Signal`) | `public/_headers` — security and cache headers are `hakuto-review`'s |
| Content that only exists after JS runs | the `.astro` component — move it into server-rendered markup |
| Sitemap coverage or wrong host | `@astrojs/sitemap` config and `site` in `astro.config.mjs` |
| Page weight / inline CSS | `build.inlineStylesheets` in `astro.config.mjs` |
| Semantic structure, headings, landmarks | the page's `.astro` markup |

   A finding whose fix has no home in this table, or that you cannot verify
   locally, goes back to the user as a recommendation — do not improvise
   infrastructure to satisfy a check.

4. **Re-run Steps 1–7** after editing. An agent-readiness fix can break a
   static check — new JSON-LD that fails to parse, a robots.txt change that
   drops the `Sitemap:` line.
5. **Rebuild** with `bun run build`, then tell the user plainly: the score does
   not move until they redeploy and rescan.

---

## Output Format

Open with a scope header, then list issues in this order: Critical (❌) → Warnings (⚠️) →
Passed (✅). Show `file:line` on every finding so the user can jump straight to it. End with
a short "to fix" list naming source files in `src/`, `public/` or config.

**Severity definitions:**

- **❌ Critical** — blocks indexing, publishes false information, or breaks a feature
  silently. Fix before the next deploy.
- **⚠️ Warning** — a real cost (crawl budget, LCP, rich-result eligibility, accessibility)
  that is not blocking. Each check in the references carries its own severity; grade from
  there rather than re-deciding.
- **✅ Pass** — meets all requirements.

Group repeated instances of one cause into a single finding with a count. "68 Gravatar
avatars across 34 pages" is a finding; 68 separate entries is noise that gets the whole
report skimmed.

When Step 8 ran, append an **Agent Readiness** section after the static
results: the score and label, the Essential / Recommended / Bonus breakdown,
findings mapped to ❌/⚠️/opportunity with their `details` and `recommendation`,
and the `report_url`. Keep it separate from the static findings — the two
audits inspect different artifacts (live site vs `_dist/`).

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

- **Build:** `Bash` → `bun run build` (produces `_dist/`).
- **Enumerate built pages:** `Glob` with `_dist/**/*.html`.
- **Read a file:** `Read` (HTML pages, `AGENTS.md`, `sitemap.xml`, `robots.txt`, `llms.txt`, `public/_headers`, `astro.config.mjs`).
- **Search across files:** `Grep` for things like `<link rel="canonical"`, `<h1`, `og:image`, `http://` (mixed-content scan), `&apos;` (JSON-LD corruption).
- **Confirm asset presence:** `Glob` for `_dist/favicon.ico`, `_dist/apple-touch-icon*`, `_dist/site.webmanifest`, `_dist/**/rss.xml` etc.
- **Validate JSON-LD:** extract the script content and parse it with `JSON.parse` via a one-liner in `Bash` — do not eyeball it. The `@id` and entity-escaping checks need a real parse.
- **Measure image pixels:** `sips -g pixelWidth -g pixelHeight` (macOS) or `sharp(file).metadata()`.
- **Measure inline CSS / document size:** `Bash` → byte counts on the `<style>` block and the file.
- **External link liveness (opt-in):** `Bash` → `curl -sS -o /dev/null -w '%{http_code}' -I -L --max-time 10`.
- **Agent-readiness scan (Step 8):** `Bash` → `bunx is-agentic <domain> --json`, long timeout, after user confirmation.

Read-only throughout — never `Write` or `Edit` — **except** Step 9, which the
user has to opt into explicitly and which touches source files only, never
`_dist/`.

---

## Out of Static Scope (needs a live crawl or real layout)

This skill audits built HTML in `_dist/`. Some issues only exist at the network/host layer,
or need real rendered geometry, and **cannot** be found here. Call these out to the user at
the end of a whole-site run so a clean report isn't mistaken for "nothing left to check":

- Redirect **status codes** and chains (301 vs 302, 307→308 trailing-slash upgrades,
  redirect loops).
- `www`→apex (or apex→`www`) canonicalization and HTTPS-upgrade redirects — Cloudflare/host
  layer. Note that `_headers` linting above checks what *should* be sent; only a live
  request proves what *is*.
- HTTP response headers as actually served (`X-Robots-Tag`, `Link: rel=canonical`, caching,
  HSTS).
- Live 404s from **inbound** external links not present in the site's own `_dist/` graph
  (pull these from Google Search Console).
- Server response time / real Core Web Vitals under load — use the `pagespeed-audit` skill
  for field data.
- **Mobile tap-target sizing** (< 44px guidance) — needs laid-out geometry, not markup. Use
  `pagespeed-audit` or `agent-browser`.

Report these as an "Out of static scope — verify with a live crawl / GSC" footer, not as
passes.

Step 8's `is-agentic` scan reaches the live site and so covers *some* of this
(status codes for nonexistent paths, headers, JS-dependent content), but it
scores agent readiness — it is not a crawler and does not enumerate redirect
chains, inbound 404s, or field Core Web Vitals. Keep the footer even after a
scan, minus whatever the scan actually observed.

## Notes

- **Scope flexibility**: Parse user prompt to determine if testing single page, group, or all pages
- Read AGENTS.md for page metadata context
- Test built HTML files in `_dist/`, not source `.astro` files — **except** `_headers`,
  `robots.txt` and `astro.config.mjs`, which are read from source
- Track line numbers for hierarchy issues when possible
- User decides which issues to fix in source files
- For single/group page tests, skip site-wide checks (orphaned pages, duplicate content, `_headers` lint, sitemap) unless relevant
- **`is-agentic` needs a deployed, public domain** — it never applies to a local-only run, and it grades the last deploy, not the working tree
- **Never scan without confirming the domain** — a cold target publishes a new public report at `report_url`
- **Fixes (Step 9) are opt-in** and always land in `src/`, `public/`, or config — never in `_dist/`

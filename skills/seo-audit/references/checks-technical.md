# Technical & Site-Wide Checks

Run these once per audit, not per page.

Read `public/_headers`, `public/robots.txt` (or `src/pages/robots.txt.ts`) and
`astro.config.mjs` **from source**, not from `_dist/`. The built copies are byte-identical
and the fix always lands in source, so reporting the source path saves the user a hop.

---

## Sitemap

Read `_dist/sitemap.xml` (or `_dist/sitemap-index.xml` if present; follow the index to its
child sitemaps).

- Missing → ❌ critical
- Present, list all URLs → ✅ pass
- Check if all pages in sitemap → ⚠️ warning if any missing
- **noindex leak** — any URL in `noindex_pages[]` (from the per-page pass) that also appears
  in the sitemap → ❌ critical: "Sitemap lists noindex page [url] (contradictory signal —
  remove from sitemap)".
- **`<lastmod>` freshness** — every `<url>` should carry a `<lastmod>`. Missing on some/all →
  ⚠️ warning: "Sitemap missing <lastmod> on N URLs (weakens freshness/crawl signals)". Derive
  lastmod from git commit history so it stays accurate without hand-maintenance.
- **Placeholder lastmod** — all URLs share one identical `<lastmod>` (e.g. the build date) →
  ⚠️ warning: "All sitemap <lastmod> values identical — likely build-time stamp, not real
  content dates". The usual root cause is a shallow CI checkout: a `serialize()` hook that
  shells out to `git log -1 --format=%cs` returns nothing, and every URL falls back to the
  build date. Check for `fetch-depth: 0` in the Actions checkout before blaming the hook.

---

## robots.txt

Read `_dist/robots.txt`.

- Missing → ❌ critical
- Present, no `Sitemap:` line → ⚠️ warning
- Present, has `Sitemap:` → confirm each `Sitemap:` URL actually resolves to a file in
  `_dist/`. A dead or misspelled sitemap reference wastes crawl budget and is invisible to a
  naive "has Sitemap:" check.
  - `Sitemap:` URL with no matching file in `_dist/` → ❌ critical: "robots.txt points to
    missing sitemap: [url]".
  - Multiple `Sitemap:` lines where the real sitemap is an index → ⚠️ warning:
    "Multiple/redundant Sitemap: lines — list only the sitemap index".
  - All `Sitemap:` lines resolve → ✅ pass.
- `Sitemap:` URL whose host is not the site's production host (commonly `localhost:4321`
  left over from the scaffold default) → ❌ critical: "`site` in `astro.config.mjs` was never
  updated".

**AI crawler policy** — a blanket `Allow: /` with no crawler-specific rules is not a failure,
and blocking AI crawlers is not automatically right: being cited drives referral traffic.
But it should be a *decision*, not a default.

- No named rules for GPTBot, ChatGPT-User, ClaudeBot, PerplexityBot, Google-Extended,
  Bytespider or CCBot → ℹ️ note (not a warning): "No explicit AI-crawler policy recorded."
- If the site blocks `Google-Extended`, confirm the user knows it gates Gemini **training**
  only and has no effect on Google Search indexing or AI Overviews (those use Googlebot).

---

## Content Signals

`Content-Signal` declares AI-usage preferences
([IETF draft](https://datatracker.ietf.org/doc/draft-canel-robots-content-signal/)). The spec
puts it in `robots.txt`; Cloudflare also emits it as an HTTP header.

- Present in `_headers` but absent from `robots.txt` → ⚠️ warning: "`Content-Signal` is
  delivered only as an HTTP header, which is not where the spec defines it".
- Present in neither, on a site whose copy or positioning states an AI-training preference →
  ⚠️ warning: "The stated no-AI-training preference isn't enforced anywhere". A preference
  that exists only in prose is not a signal.
- Present in `robots.txt` → ✅ pass.

---

## `_headers` — crawler signals only

**`hakuto-review` owns `public/_headers`.** Its sections M (static-asset caching) and N
(security headers) already grade `Content-Security-Policy`, `Permissions-Policy`, HSTS,
`Referrer-Policy`, `X-Content-Type-Options`, the `/_astro/*` immutable cache and the
favicon/pagefind cache caps — including the "security headers on a path-specific rule
instead of `/*`" case. Do not re-grade any of that here; point the user at `hakuto-review`
instead. Two audits reporting the same missing CSP is how a report gets skimmed.

What belongs here is the narrow set of `_headers` rules that carry **crawler and agent
signals**, which `hakuto-review` does not look at:

Cloudflare's `_headers` format fails silently — a mis-scoped rule produces no error at build
or deploy time, the headers simply never ship, and every scanner reports them as absent.

- The `Link:` or `Content-Signal:` rule is scoped to the **literal `/`** → ❌ critical:
  "`/` matches the homepage only — N of M pages carry none of these. Use `/*`."

  Measured against `wrangler dev` on the Hakuto scaffold: with the stanza under `/`, the
  `Link` and `Content-Signal` headers were served on `/` and on **nothing else**. Verify the
  same way rather than reasoning about it — `curl -sI <origin>/some/inner/page/` and compare
  against `curl -sI <origin>/`, which passes either way.
- A **blank line between a path line and its indented header lines** → ⚠️ warning: "Blank
  line inside a rule block". It is not part of the documented format and reads as a rule
  terminator, but the current parser tolerates it — the headers below still attach to the
  path above. Report it as fragile, **not** as dropped headers; claiming they are dropped
  sends the user hunting for a second bug that isn't there.

**Per-URL headers applied site-wide** — a `Link:` header under `/*` whose target must vary
by URL (`rel="alternate"`, `rel="canonical"`) → ❌ critical: "Every page advertises [url] as
its [rel] — a crawler reading /pricing/ is told its alternate lives at /". This is the worst
kind of bug because the underlying feature usually works perfectly per-URL; only the pointer
is broken, so nothing looks wrong from the inside.

Site-wide-**constant** targets are correct under `/*` and must **not** be flagged:
`rel="sitemap"`, and `rel="describedby"` pointing at `/llms.txt`. There is one sitemap and
one `llms.txt`; advertising them from every page is the intent.

---

## Duplicate index (`/index.html`)

Static hosts serve a directory's `index.html` at *both* `/` and `/index.html`, creating a
duplicate-content pair unless one 301-redirects.

- For each `_dist/**/index.html`, flag if the site has no `_redirects` (or host config) rule
  sending `/index.html → /` (and nested `/<dir>/index.html → /<dir>/`) → ⚠️ warning:
  "`/index.html` reachable as a duplicate of `/` — add a 301 in `public/_redirects`".

---

## llms.txt

Read `_dist/llms.txt`. Hints to LLM crawlers which content is canonical and how to summarize
the site.

- Missing → ⚠️ warning
- Present but still the scaffold template (`# Site Name`, `Brief one-line description of your
  site`, `Describe what your site/product does`, `hello@example.com`, `https://example.com`)
  → ❌ critical: "llms.txt is the unedited scaffold template — it's live and tells crawlers
  the site is 'Site Name' at hello@example.com". Present-but-placeholder is worse than
  absent: it publishes wrong facts instead of none.
- Present, and a Key Pages link resolves to no file in `_dist/` → ❌ critical: "llms.txt links
  to [route] which isn't built (the scaffold's `/docs/` is the usual leftover)".

**Coverage** — a well-formed, accurate `llms.txt` that describes only the top-level marketing
pages omits exactly the body of content an agent would want.

1. Group every sitemap URL into route families by first path segment.
2. For each family with **≥ 5 URLs**, check whether `llms.txt` links to it or to any URL
   within it.
- A family with zero representation → ⚠️ warning: "llms.txt describes N of M pages — no entry
  covers /blog/ (37), /docs/ (30), /mac/checks/ (57)".
- Also flag any route in the site's main navigation with no `llms.txt` entry.

The fix is **category-level entries with counts**, not enumerating every URL. Weight this
honestly in the report: Google Search does not read this file and no major assistant has
confirmed production use of it, so the upside is modest — but it is close to free.

---

## Favicon

*HTML head checks* (per page in scope):
- `<link rel="icon">` (any type) → required, missing = ❌ critical
- `<link rel="apple-touch-icon">` → recommended, missing = ⚠️ warning
- `<link rel="manifest">` (web app manifest) → recommended, missing = ⚠️ warning

*File checks* (in `_dist`, site-wide):
- `favicon.ico` → required, missing = ❌ critical
- `favicon.svg` OR `favicon-32x32.png` (or similar PNG fallback) → required, missing =
  ❌ critical
- `apple-touch-icon.png` (or `apple-touch-icon-180x180.png`) → recommended, missing =
  ⚠️ warning
- `manifest.webmanifest` (or `site.webmanifest`) → recommended, missing = ⚠️ warning

*Validation*: for each `<link rel="icon" href="...">`, confirm the referenced file exists in
`_dist` → broken reference = ❌ critical.

---

## Feed Autodiscovery

A feed nobody can find is a feed nobody reads, and readers/aggregators only look at the
`<link>`.

- A feed file exists in `_dist` (`rss.xml`, `feed.xml`, `atom.xml`, or any
  `application/rss+xml` / `application/atom+xml` output) but **no**
  `<link rel="alternate" type="application/rss+xml">` appears in any page's `<head>` →
  ⚠️ warning: "[feed] is live but has no autodiscovery link".
- Autodiscovery link present but pointing at a file not in `_dist` → ❌ critical.
- Hakuto sites: the link is emitted by `Layout.astro`'s `feedUrl` prop.

---

## Page Weight

**Inline stylesheet.** Measure the total bytes inside `<style>` elements per document.

- Over **15 KB** → ⚠️ warning: "N KB of CSS inlined into every page instead of cached once".
  Quote the cost concretely: byte-identical CSS re-transferred on every navigation, where a
  hashed `/_astro/*.css` file would be served once and reused from cache for the rest of the
  session.
- Cross-check `build.inlineStylesheets` in `astro.config.mjs`. If it is `"always"`, name it
  as the cause — Astro's `"auto"` default only inlines stylesheets under ~4 KB, so a 122 KB
  inline block is always a deliberate setting, never an accident.
- Tie it to the performance picture where you have it: a large inline block shows up as
  render delay dominating the LCP subparts *even on pages whose LCP element is plain text*,
  because nothing can paint until the block is parsed. That signature is diagnostic.

**Document size.** Googlebot fetches only the first **2 MB** of an HTML document.

- Built HTML over 2 MB → ❌ critical: "[url] is N MB — content and JSON-LD past the first
  2 MB are never indexed". Usual causes: inline base64 images, an oversized inline style or
  script block, or a bloated nav rendered on every page.

---

## JS-Dependent Commercial Content

Google does not render JavaScript on non-200 responses, structured data injected by JS faces
delayed processing, and answer engines generally read the served HTML. Content that only
exists after hydration is content that, for these purposes, does not exist.

The highest-value instance of this is pricing, because it is the single most commercially
important question asked about most sites.

- A page whose route or `<title>` contains `pricing`, `plans`, `price` or `cost`, whose
  built HTML contains **no currency figure** (no `$`/`€`/`£`/`¥` followed by digits, no
  `\d+ (USD|EUR|GBP)`) → ❌ critical: "[url] ships zero prices in server-rendered HTML".
  Show the evidence:
  ```sh
  grep -oE '[$€£][0-9]+' _dist/pricing/index.html   # → (no matches)
  ```
  State the consequence plainly: any answer engine asked what the product costs will omit
  the price or invent one. The fix is to server-render a static "from $X per device / month"
  figure and let the payment widget overlay exact localised tiers on top — not to remove the
  widget.
- If the site exposes an agent-facing markdown representation (`Accept: text/markdown`, or
  `.md` routes), check it for the same hole → ❌ critical if the site's own machine-readable
  format can't answer the question either.
- More generally: a page whose `<main>` in `_dist` is near-empty while the route implies
  substantial content → ❌ critical: "[url] renders its main content client-side".

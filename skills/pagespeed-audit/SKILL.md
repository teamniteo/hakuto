---
name: pagespeed-audit
description: Live performance audit for deployed pages using Google PageSpeed Insights API. Runs Lighthouse against public URLs and reports Core Web Vitals, scores, and top opportunities. Report-only - no fixes applied.
---

# PageSpeed Audit

Run Google's PageSpeed Insights against deployed pages and report findings.
Report-only — user requests fixes separately.

**Scope:** Tests one or more public URLs. Audits both **mobile** and
**desktop** strategies by default.

**Critical constraint:** PSI fetches the URL from Google's servers, so it
**cannot reach `localhost`, `127.0.0.1`, or private network addresses**. If
the user provides such a URL, stop immediately and explain — point them at
their deployed staging or production URL instead.

---

## Execution Flow

### 0. Determine Test Scope

Parse **the current invocation** for URL(s) — never carry over a URL from
a previous turn or assume from prior conversation context. If the user
didn't pass a URL on this invocation, you must ask before fetching.

**URL provided in this invocation**:
- "Run PageSpeed on https://example.com" → test that URL
- "/pagespeed-audit https://example.com https://example.com/pricing" → test both

**No URL provided in this invocation**:
- Try `view AGENTS.md` to find a documented production URL or page list.
- If found, list the URLs and ask the user which to audit (use
  AskUserQuestion when 2–4 candidates exist).
- If not found, ask the user for at least one deployed URL via
  AskUserQuestion or a plain question.
- **Do not default to a previously-audited URL**, even one the user
  selected earlier in the same session. Ask every time.

**Localhost / private addresses → reject**:
- `http://localhost:*`, `http://127.0.0.1:*`, `http://0.0.0.0:*`
- RFC1918 ranges (`10.*`, `192.168.*`, `172.16-31.*`)
- `*.local`, `*.internal`
- Stop and tell the user: "PageSpeed Insights runs from Google's servers
  and can't reach private addresses. Run this against your deployed URL
  (staging or production) instead."

### 1. Check for API Key (REQUIRED)

Resolve the key from (in order): shell env, `.env.local`, `.env`. All
three are checked in one Bash call:

```bash
KEY="${PAGESPEED_API_KEY:-}"
for f in .env.local .env; do
  [ -n "$KEY" ] && break
  [ -f "$f" ] && KEY=$(grep -E '^PAGESPEED_API_KEY=' "$f" | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'")
done
# Don't echo the key value — print only presence to keep secrets out of chat logs.
[ -n "$KEY" ] && echo "FOUND" || echo "MISSING"
```

- If a key is returned → use it as `&key=<value>` on every request URL.
- **If `MISSING` → stop and tell the user how to get one.** Despite the
  v5 docs implying anonymous calls work, Google now sets the default
  per-day quota for unauthenticated requests to **0**. Every call returns
  HTTP 429 `RESOURCE_EXHAUSTED` with `quota_limit_value: "0"`.

  Show the user this exact message:

  > PageSpeed Insights requires an API key. Get a free one in ~1 minute
  > (no billing required):
  >
  > 1. Open https://developers.google.com/speed/docs/insights/v5/get-started
  > 2. Click **"Get a Key"** — it uses your Google account and returns a key.
  > 3. Save it to an environment file in the repo root:
  >
  >    ```bash
  >    cp .env.example .env.local   # if .env.local doesn't exist yet
  >    # then edit .env.local and paste your key after PAGESPEED_API_KEY=
  >    ```
  >
  > 4. Re-run this skill. (`.env.local` is gitignored — safe for secrets.)
  >
  > The key gives you 25,000 requests/day, free.

  Then stop. Do not attempt the call.

### 2. Set Expectations

Tell the user: "Running PSI for N URL(s) × 2 strategies. Each call takes
10–30s."

### 3. Fetch Results

**Use `curl`, NOT `WebFetch`.** WebFetch processes the response through a
small summarisation model that silently drops fields and can fabricate
numeric values for a 200KB+ JSON like PSI's. We need byte-exact JSON.

First verify `jq` is installed (used in Step 4):

```bash
command -v jq >/dev/null 2>&1 || echo "MISSING_JQ"
```

If `MISSING_JQ`, stop and tell the user: `jq` is required for parsing.
Install with `brew install jq` (macOS) or `apt install jq` (Linux), then
re-run.

For each URL × strategy (mobile, desktop), fetch raw JSON to a temp file.
Run both strategies in **parallel** (one Bash call each, not chained):

```bash
KEY="<resolved key from Step 1>"
URL_ENC="<URL-encoded target URL>"          # use bash printf '%s\n' "$URL" | jq -sRr @uri
curl -sS -o "/tmp/psi-${strategy}.json" \
  "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${URL_ENC}&strategy=${strategy}&category=performance&category=accessibility&category=best-practices&category=seo&key=${KEY}"
```

Each call takes 10–30s. If `curl` exits non-zero, or the response file
contains a top-level `.error` field, treat as failure (see Error
Handling) and continue with the other strategy/URL.

### 4. Parse Each Result

Run this jq script against each saved JSON. The output is the source of
truth — do NOT re-summarise via any model.

```bash
jq '{
  scores: {
    performance: (.lighthouseResult.categories.performance.score * 100 | round),
    accessibility: (.lighthouseResult.categories.accessibility.score * 100 | round),
    best_practices: (.lighthouseResult.categories["best-practices"].score * 100 | round),
    seo: (.lighthouseResult.categories.seo.score * 100 | round)
  },
  lab: {
    LCP: .lighthouseResult.audits["largest-contentful-paint"].displayValue,
    LCP_ms: .lighthouseResult.audits["largest-contentful-paint"].numericValue,
    CLS: .lighthouseResult.audits["cumulative-layout-shift"].displayValue,
    CLS_value: .lighthouseResult.audits["cumulative-layout-shift"].numericValue,
    TBT: .lighthouseResult.audits["total-blocking-time"].displayValue,
    TBT_ms: .lighthouseResult.audits["total-blocking-time"].numericValue,
    FCP: .lighthouseResult.audits["first-contentful-paint"].displayValue,
    FCP_ms: .lighthouseResult.audits["first-contentful-paint"].numericValue,
    SI:  .lighthouseResult.audits["speed-index"].displayValue,
    SI_ms: .lighthouseResult.audits["speed-index"].numericValue
  },
  field: (
    if (.loadingExperience.metrics // {}) | length > 0 then {
      LCP_ms: .loadingExperience.metrics.LARGEST_CONTENTFUL_PAINT_MS.percentile,
      CLS:    ((.loadingExperience.metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE.percentile // 0) / 100),
      INP_ms: .loadingExperience.metrics.INTERACTION_TO_NEXT_PAINT.percentile,
      origin_fallback: (.loadingExperience.origin_fallback // false)
    } else "unavailable" end
  ),
  opportunities: [
    .lighthouseResult.audits | to_entries[]
    | select(.value.details.type == "opportunity" and (.value.numericValue // 0) > 0)
    | { id: .key, title: .value.title, savings: .value.displayValue,
        numericValue: .value.numericValue,
        urls: [.value.details.items[]?.url // empty] | .[0:2] }
  ] | sort_by(-.numericValue) | .[0:5],
  diagnostics: [
    .lighthouseResult.audits | to_entries[]
    | select(.value.details.type == "diagnostic" and .value.displayValue and .value.displayValue != "")
    | { id: .key, title: .value.title, value: .value.displayValue, score: .value.score }
  ] | sort_by(.score // 1) | .[0:5],
  error: .error // null
}' "/tmp/psi-${strategy}.json"
```

The shape is stable; categorise the output via Severity Rules in Step 5.

**Hand-off note (Step 6):** quote the exact `displayValue` strings from
PSI in the user-facing report. Don't re-format them ("4.7 s" → "4.7s" is
fine, but don't recompute or paraphrase numbers).

### 5. Categorize Findings

Apply Severity Rules below. A page is critical if any Core Web Vital is
critical or the performance score is < 50. A page is warning if any metric
is in the warning band. Otherwise pass.

Before listing fixes, filter through **Known False Positives** (next
section). Flag those separately as "expected" rather than as actionable
fixes — recommending the user remove an intentional directive is worse
than the warning itself.

### 6. Render Report

Use the Output Format below. One report per URL. Include both Mobile and
Desktop sections. Always include the public PageSpeed Insights deeplink so
the user can verify in the browser.

---

## Known False Positives

Hakuto-shipped defaults that trigger Lighthouse warnings by design. When
you see one of these, surface it as **"Expected (intentional)"** in the
report — do **not** recommend removing it.

### `robots.txt` — `Content-Signal: …` (SEO category)

- **Lighthouse audit:** `robots-txt` ("robots.txt is not valid")
- **Message:** `Unknown directive` on a `Content-Signal: ai-train=…, search=…, ai-input=…` line.
- **Why it fires:** `Content-Signal` is from the [Cloudflare / IETF
  draft](https://datatracker.ietf.org/doc/draft-canel-robots-content-signal/)
  for declaring AI-training / search / AI-input preferences. Lighthouse's
  validator only knows the original 1994 robots.txt grammar and reports
  any unrecognised directive as an error.
- **Cost:** a single SEO sub-score deduction (~15 points), pulling SEO
  into the 80–89 warning band.
- **Hakuto default:** the scaffold ships `Content-Signal` as an **HTTP
  response header** (`public/_headers`), *not* as a `robots.txt`
  directive — so this audit should not fire on freshly-scaffolded sites.
  If you see it, the site has likely re-introduced the line into
  `public/robots.txt` (older scaffold versions did this). The fix is to
  move it back to `_headers`. If the user *wants* it in `robots.txt` for
  crawlers that read directives there, surface this audit as **expected
  / intentional** and don't recommend removal.

When future false positives are confirmed (e.g. another non-standard but
valid directive Hakuto ships), append them here with the same shape.

---

## Severity Rules

Using Google's official Core Web Vitals thresholds.

| Metric | Pass (✅) | Warning (⚠️) | Critical (❌) |
|---|---|---|---|
| Performance score | ≥ 90 | 50–89 | < 50 |
| LCP | ≤ 2.5s | 2.5–4s | > 4s |
| CLS | ≤ 0.1 | 0.1–0.25 | > 0.25 |
| INP (field) | ≤ 200ms | 200–500ms | > 500ms |
| TBT (lab) | ≤ 200ms | 200–600ms | > 600ms |
| FCP | ≤ 1.8s | 1.8–3s | > 3s |
| Speed Index | ≤ 3.4s | 3.4–5.8s | > 5.8s |
| Accessibility / Best Practices / SEO score | ≥ 90 | 80–89 | < 80 |

---

## Output Format

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

When auditing multiple URLs, repeat the per-URL block and add a top-level
summary table.

---

## Error Handling

- **Localhost / private URL** → stop, explain, do not call API.
- **HTTP 400 / `INVALID_ARGUMENT`** → URL is malformed or unreachable. Show
  the API error message verbatim and ask the user to verify the URL.
- **HTTP 429** → quota exceeded. If `PAGESPEED_API_KEY` was unset, Step 1
  should have caught this — the anonymous quota is 0/day. If the key was
  set, the user has hit their 25,000/day limit; suggest waiting until
  midnight Pacific or requesting a quota increase.
- **HTTP 5xx / timeout** → transient. Retry once after a short delay; if
  still failing, mark that strategy as "fetch failed" in the report and
  continue with the others.
- **`loadingExperience` missing** → Note "Field data unavailable" but
  still report lab metrics.
- **Whole-result parse failure** → report which URL/strategy failed and
  show the first ~200 chars of the response so the user can debug.

---

## Tool Usage

**Check API key:**
```bash
echo "${PAGESPEED_API_KEY:-}"
```

**Fetch results:** `curl` to a temp file (NOT WebFetch — see Step 3 for
why). **Parse:** `jq` against the saved file (see Step 4 for the script).

**Read page list (optional):**
```bash
view AGENTS.md
```

---

## Notes

- **Deployed URLs only.** PSI cannot reach `localhost` or private networks.
- **Two calls per URL** (mobile + desktop). Each takes 10–30s. For 5 URLs
  expect 1–3 minutes total — set user expectations before starting.
- **`jq` is a hard dependency.** Pre-flight check in Step 3. WebFetch is
  not safe for PSI responses — its summarisation layer fabricates
  category scores and drops Core Web Vital fields.
- **API key is REQUIRED.** Despite v5 docs implying otherwise, Google's
  anonymous tier is now 0 req/day — every unauthenticated call returns
  429. Skill reads `PAGESPEED_API_KEY` from env; if absent, it stops with
  a "how to get a free key" message.
- **Lab vs Field data.** Lab metrics are a single synthetic run from
  Google's lab; Field data is real-user p75 from the Chrome User
  Experience Report (only available for sites with sufficient traffic).
  Report both when present — they often disagree, and that disagreement is
  itself useful.
- **TBT is a lab proxy for INP.** PSI doesn't run INP in the lab; only
  field data carries it. If field data is absent, surface TBT and note
  "INP unavailable (no field data yet)".
- **Report only.** Never modify source files. Hand off to the user with
  concrete fix suggestions naming the relevant `src/` paths.
- **Pairs well with `prelaunch-checklist`** — run after deploy to catch
  regressions before announcing the launch.

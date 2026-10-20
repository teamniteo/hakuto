# Agent-Readiness Scan — `bunx is-agentic`

Read when the user asks for an agent-readiness scan ("run is-agentic", "check agent
readiness", "score the site for AI agents", "run the SEO test and the agent audit"), or asks
to apply that scan's fixes.

The static audit grades local `dist/client/` HTML. This scan scores the **live, deployed**
site for how usable it is to AI agents — agent-friendly 404s, crawler access,
machine-readable surfaces, content that exists without JS. It complements the static checks
because it observes status codes, headers, and redirects that `dist/client/` cannot show.

---

## A. Run the Scan (deployed domains only, opt-in)

**When to run:**

- The user asked for it. Never run it unprompted at the end of a static audit — mention it
  is available and let the user choose.
- The site is deployed **and the deploy is current**. The scan grades what is live, not what
  is in the working tree — if there are unbuilt or undeployed changes, say so before
  scanning.

**Resolve the target** — first hit wins:

1. A domain or URL passed in this invocation.
2. `site` in `astro.config.mjs`, unless it is still the scaffold default
   `http://localhost:4321`.
3. A production URL documented in `AGENTS.md`.

If none resolve, ask. Don't reuse a domain from an earlier turn.

**Reject private targets** — the scan runs from Is Agentic's servers, so `localhost`,
`127.0.0.1`, `0.0.0.0`, RFC1918 ranges, `*.local` and `*.internal` are unreachable. Stop and
ask for the deployed URL.

**Confirm before running.** This calls a third-party service (Vercel's Is Agentic) that
fetches the public site, and when no completed report exists it starts a new scan whose
result is published at a public `report_url`. Get an explicit go-ahead on the exact domain
first.

**Run it:**

```bash
bunx is-agentic <domain-or-url> --json
```

- Always `--json` — parse the structured response; the ANSI terminal report is not stable
  to scrape.
- No API key and no config. Node 18+ (Bun's runtime satisfies this).
- A cached report returns immediately; a cold target triggers a fresh scan that can take
  several minutes. Use a long timeout (`timeout: 600000`) or run it in the background. Don't
  kill and retry a scan that is still streaming — a second invocation just waits on the same
  scan.
- Failures exit nonzero and print an RFC 9457 problem object on stdout with `code`,
  `detail`, `resolution`. Handle by `code`:
  - `invalid_url` → fix the target or ask the user.
  - `report_not_found` → the CLI already ran its own scan-and-wait; retry the command
    **once**, then stop.
  - `rate_limit_exceeded` → honor `Retry-After`, report, and stop. Never loop.
  - `report_temporarily_unavailable`, `api_unreachable` → report and stop.
- Don't fall back to hand-fetching `is-agentic.com` when the CLI fails.

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

`issues[]` contains **only** failed and partial checks — `tier` is `essential` /
`recommended` / `bonus`, `result` is `failed` / `partial`. Passing checks are implied by the
`passing` / `total` counts. Not-applicable checks are excluded from scoring, so a smaller
`eligible_checks` is not a penalty.

**Map findings onto the audit's severities:**

- `essential` + `failed` → ❌ Critical
- `essential` + `partial`, or `recommended` + `failed` → ⚠️ Warning
- `recommended` + `partial`, or anything `bonus` → ℹ️ Note, listed under "Opportunities"
- Quote each finding's `details` as *evidence from the live scan* — never restate it as
  something verified locally. The two audits look at different artifacts and can
  legitimately disagree.

Reports are cached and the CLI will not force a rescan, so re-running it in the same session
to "confirm" a fix proves nothing. Rescan after the next deploy.

**Report** — append an **Agent Readiness** section after the static results (template in
`example-report.md`): score and label, the Essential / Recommended / Bonus breakdown,
findings mapped to ❌ / ⚠️ / ℹ️ with their `details` and `recommendation`, and the
`report_url`. Keep it separate from the static findings.

The scan covers *some* of the static audit's "out of static scope" footer (status codes for
nonexistent paths, headers, JS-dependent content), but it scores agent readiness — it is not
a crawler and does not enumerate redirect chains, inbound 404s, or field Core Web Vitals.
Keep the footer after a scan, minus whatever the scan actually observed.

---

## B. Apply Fixes (opt-in — the only part of `seo-audit` that writes)

Run **only** when the user asked for fixes — "…and fix the issues", "fix what is-agentic
found", "apply the report". Absent that, stop after the report.

1. **Report first.** Show the findings grouped ❌ → ⚠️ → ℹ️, with the score and
   `report_url`.
2. **Ask what to apply** — one `AskUserQuestion`, defaulting to "all essential failures".
   Any fix that bakes in a product or content decision (writing the `llms.txt` description of
   the business, changing copy, exposing a new machine-readable endpoint) needs the user's
   answer — don't guess it.
3. **Fix in source, never in `dist/client/`** — that tree is a build artifact and the next
   build overwrites it. Each finding's `recommendation` is the spec; translate it to the file
   that owns that surface in a Hakuto site:

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

   A finding whose fix has no home in this table, or that you cannot verify locally, goes
   back to the user as a recommendation — don't improvise infrastructure to satisfy a check.

4. **Re-run the static audit (Steps 1–7)** after editing. An agent-readiness fix can break a
   static check — new JSON-LD that fails to parse, a robots.txt change that drops the
   `Sitemap:` line.
5. **Rebuild** with `bun run build`, then tell the user plainly: the score does not move
   until they redeploy and rescan.

---

## C. The Scaffold's Agent-Readiness Surfaces

Read when a finding points at one of these files, or when bringing a site's agent surfaces up
to date. Every Hakuto site ships them (based on the [Is it Agent Ready?](https://isitagentready.com/)
checklist); a site customized from the scaffold should have each one filled in, not left at the
template default.

| File | What it does | What to update |
|---|---|---|
| `src/pages/robots.txt.ts` | Crawler permissions, `Content-Signal` AI preferences, and the `Sitemap:` line | Generated, not static — it reads `context.site`, so the `Sitemap:` URL always names the real host (`@astrojs/sitemap` does not write robots.txt). Default allows every crawler; a commented AI-crawler block is there to uncomment for blocking training-only bots. `Google-Extended` gates Gemini *training* only, not Google Search indexing. A `public/robots.txt` collides with this route — delete it. |
| `public/_headers` | Static-asset response headers: security headers, `/_astro/*` and favicon caching, the sitemap/llms.txt `Link`, and `Content-Signal` ([IETF draft](https://datatracker.ietf.org/doc/draft-canel-robots-content-signal/)) | Shipped `Content-Signal: ai-train=no, search=yes, ai-input=yes`, sent here and in `robots.txt` (where the spec defines it). Every site-wide rule belongs under `/*` — a rule scoped to the literal `/` reaches the homepage only and fails silently. Verify with `curl -sI <origin>/some/inner/page/`. Security and cache headers are `hakuto-review`'s. |
| `public/llms.txt` | Plain-text site summary for LLMs ([llmstxt.org](https://llmstxt.org)) | Must be customized: site name, description, key pages (route families with counts), contact, and the `## When to use this` section — naming the concrete jobs the site is right for is what scanners grade; generic marketing copy scores as absent. |
| `src/lib/site.ts` + `src/lib/schema.ts` | `Organization` and `WebSite` JSON-LD on the homepage | Fill `SITE_CONTACT` — `contactPoint` and `address` let agents verify the business. Unset fields are omitted, not emitted blank. |
| `src/pages/404.astro` | Agent-recoverable 404 | Keep "Where to look next" pointing at routes that resolve; add the site's main sections as they are built. |
| `worker/problem.js` | RFC 9457 `application/problem+json` errors for `/~*` routes | Every handler returns errors through `problem()`, so the site's only programmatic surface has one typed error shape. |
| `src/layouts/Layout.astro` — `ENABLE_WEBMCP` | [WebMCP](https://webmcp.org) tools (`search-site`, `get-page-content`, `navigate`) for in-page agents | Default `true`; set `false` only if the user does not want tools exposed. |

**Markdown for Agents is a Cloudflare setting, not code.** Scanners check whether
`Accept: text/markdown` returns markdown with `Vary: Accept`. That is Cloudflare's
[Markdown for Agents](https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/)
— enabled per zone under AI Crawl Control, Pro plan or higher. Never satisfy the check by
adding `Vary: Accept` to `public/_headers`: with no markdown variant behind it, the header
advertises something the site cannot serve. Hand it to the user as a manual step.

### WebMCP notes

- **No search UI needed.** `pagefind()` is in every site's `astro.config.mjs`, so
  `astro build` writes `dist/client/pagefind/` whether or not a visible search box exists, and
  `search-site` queries that index directly. Adding `section-docs` search changes what humans
  see, not what agents can do.
- **Tools only work on a built origin.** `astro dev` has no `/pagefind/`, so `search-site`
  returns "search index unavailable" and points at `/sitemap-index.xml` and `/llms.txt`.
  Expected — verify with `bun run preview` or on a deploy preview.
- **Results are MCP `CallToolResult` objects** (`{ content: [{ type: "text", text }] }`), and
  registration accepts `document.modelContext` (current spec) or `navigator.modelContext`
  (earlier drafts). Keep both branches when editing.
- **Adding a tool:** register it in the same block, write the description for a reader who
  cannot see the page, and return through the `reply()` helper so the shape stays uniform.
  `navigate` is deliberately same-origin only — do not relax that.

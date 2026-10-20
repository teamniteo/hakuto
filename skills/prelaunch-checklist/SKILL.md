---
name: prelaunch-checklist
description: Final pre-deploy gate for Hakuto sites — checks wrangler config, site identity, form wiring, legal and trust pages, placeholder copy and scaffold currency; confirms `seo-audit` and `hakuto-review` have run; lists the manual Cloudflare and Search Console steps. Report-only. Use for "run prelaunch checklist", "is the site ready to ship?", "ready to go live", "pre-launch check", "final check before deploy". Skip for mid-build quality checks (`hakuto-review`, `seo-audit`) and live performance after deploy (`pagespeed-audit`).
---

# Prelaunch Checklist Skill

Validate a Hakuto site is ready to go live. Report findings only — the user requests fixes separately.

Severity is set by each check below, and nowhere else:

- **Critical (❌)** — blocks launch. Something visibly wrong, broken or leaking scaffold defaults ships otherwise.
- **Warning (⚠️)** — review before launch; the user may have a reason.
- **Pass (✅)** — the check ran and found nothing.
- **Manual (🔔)** — can't be checked from the repo; surfaced as a reminder.

---

## Execution Flow

### 1. Read project files in parallel

Read these into context up front:
- `wrangler.toml`
- `package.json`
- `src/lib/site.ts` (sites scaffolded before 0.7.0 keep the constants in `src/layouts/Layout.astro` — read that instead if `site.ts` is missing)
- `src/components/Footer.astro` (if it exists; otherwise glob `src/components/*Footer*`)
- `astro.config.mjs`
- `worker/index.js` (route table for check 4)
- `.hakuto-sync.json` (if it exists — Gate 4)

Glob for:
- `src/pages/{privacy,terms,cookies,about,contact}.*` and `src/pages/{privacy,terms,cookies,about,contact}/index.*`
- `src/components/**/*Form*.astro`, `src/components/**/*Form*.tsx`
- `src/pages/**/*.astro` (for the form scan in check 4)

### 2. Initialize trackers

```
critical = []
warnings = []
passed = []
manual_reminders = []
```

### 3. Run automated checks

#### Check 1 — wrangler.toml customized

In `wrangler.toml`:
- `main` missing → critical: "wrangler.toml has no `main`; the worker won't deploy."
- `name = 'hakuto-site'` → warning: "wrangler.toml `name` is still the scaffold default. Change to your project's worker name."
- All `[[routes]]` blocks still commented out AND no other custom-domain config → warning: "No custom domain in wrangler.toml. If you plan to use a custom domain via routes, uncomment the `[[routes]]` block. (Skip this if you're configuring the domain in the Cloudflare dashboard instead.)"
- Otherwise → pass

#### Check 2 — compatibility_date freshness

Parse `compatibility_date` in `wrangler.toml`. Older than 12 months from today → warning: "compatibility_date is X months old; consider bumping for newer Workers runtime features."

#### Check 3 — package.json name

`"name": "hakuto-site"` in `package.json` → warning: "package.json `name` is still the scaffold default."

#### Check 4 — Forms wired

Grep `src/` for `<form` (case-insensitive) and for `fetch(` calls in form components. For each form, find its submission target (action attribute, fetch URL, or handler reference) and trace it into `worker/index.js`.

The worker only sees paths under `/~/` (`run_worker_first = ["/~*"]` in `wrangler.toml`), and dispatches them by prefix through the `ROUTES` map. Critical if any of:
- `action="#"`, `action=""`, or an obvious dummy value
- Submits to a `/~/…` path with no matching prefix in `worker/index.js` `ROUTES`, or to any non-`/~/` same-origin path (never reaches the worker) → "[form] posts to [path], which no worker route handles"
- The handler only `console.log`s the submission — no email, KV, D1, CRM or webhook destination → "[form] handler has no destination; submissions are lost"
- Recipient email/destination is a placeholder (`hello@example.com`, `your-email@`, `someone@example.com`)

Pass if a real endpoint and real destination are wired. Worker routes run only under `bun run preview` (or in production) — `bun run dev` serves Astro's 404 for every `/~/` path — so if the user wants to confirm a submission end to end, point them at `bun run preview`.

If no forms exist, skip silently (don't add a passed entry — irrelevant).

#### Check 5 — Legal & trust pages

People and AI agents check `/about`, `/contact` and `/privacy` to decide whether a business is real before recommending it. Evaluate each of `privacy`, `terms`, `cookies`, `about`, `contact` once (look for `src/pages/{name}.{astro,md,mdx}` or `src/pages/{name}/index.{astro,md,mdx}`), and report **one entry per page** combining everything wrong with it:

| Page | Missing | Stub (under ~500 chars of rendered text) | Exists but not linked from Footer |
|---|---|---|---|
| `privacy` | **critical** if the site collects data (a form from check 4, or analytics such as a `/~/pla` route); otherwise warning | same as missing | warning |
| `about`, `contact` | warning | warning | — |
| `terms`, `cookies` | not reported — many sites don't need them | — | warning |

Example entry: "/privacy is a stub (180 chars) and isn't linked from Footer. The contact form collects personal data, so a real privacy policy is needed before launch."

A stub counts as missing because agents treat a near-empty trust page much like an absent one. A personal landing page reasonably has no `/about` separate from its homepage — that's why those stay warnings. If all applicable pages are present, substantive and linked → one pass entry.

#### Check 6 — Placeholder text

Grep `src/`, `worker/` **and `public/*.txt`** (excluding `node_modules`, `.astro`, `dist`) for these patterns. `public/llms.txt` is served live at `/llms.txt`, so its placeholders ship to crawlers exactly like on-page copy does. **Critical** if any are found, with file + line:
- `Lorem ipsum`
- `\bTODO\b` (scaffold and skill placeholders all start with `TODO:` so they surface here)
- `\bFIXME\b`
- `Your Site Name`
- `your-email@`
- `hello@example.com`
- `someone@example.com`
- `\+1 \(555\)`
- `example\.com` (in user-facing strings — exclude config files and comments)
- `Astro \+ shadcn/ui website template for Hakuto` (the scaffold `SITE_DESCRIPTION` default)
- `^# Site Name` and `Brief one-line description of your site` (the scaffold `public/llms.txt` header)
- `Describe what your site/product does` (scaffold `public/llms.txt` overview)
- `Name the jobs this site`, `Use this when: \[`, `Not a fit for: \[` (unfilled `public/llms.txt` "When to use this" section)

Report each with `file:line` so the user can jump to it.

Additionally, resolve every link in `public/llms.txt` against the site's routes (`src/pages/`, or `dist/client/` if a build exists): an entry pointing at a route that doesn't exist → critical: "llms.txt links to [route], which isn't a page on this site".

#### Check 7 — Site identity placeholders

In `src/lib/site.ts` (or `src/layouts/Layout.astro` on sites that predate `site.ts`):
- `SITE_NAME = "Hakuto"` → critical: "SITE_NAME in [file] is still the scaffold default."
- `SITE_DESCRIPTION` matches `"Astro + shadcn/ui website template for Hakuto."` → critical: "SITE_DESCRIPTION in [file] is still the scaffold default."

These feed every page title, the meta description and the Organization/WebSite JSON-LD, so a default here ships on every page.

#### Check 8 — 404 page customized

Diff `src/pages/404.astro` against `${CLAUDE_PLUGIN_ROOT}/scaffold/src/pages/404.astro`:

```sh
diff -qw src/pages/404.astro "${CLAUDE_PLUGIN_ROOT}/scaffold/src/pages/404.astro"
```

Identical (ignoring whitespace) → warning: "404 page is the scaffold default. Customize it to match your site's voice and point at the site's real sections." If the plugin path is unavailable, skip this check rather than guessing.

#### Check 9 — `site` in `astro.config.mjs` is the production URL

Astro's [`site` option](https://docs.astro.build/en/reference/configuration-reference/#site) is what the sitemap, canonical links, and JSON-LD bake in. If it's still `http://localhost:4321` (the scaffold default) at deploy time, the live sitemap will reference localhost.

In `astro.config.mjs`:
- `site: "http://localhost:4321"` → critical: "`site` in astro.config.mjs is still the scaffold default. Set it to your production URL (e.g. `\"https://yoursite.com\"`) before deploying."
- `site` missing entirely → critical: "`site` is not set in astro.config.mjs. Sitemap and canonical links will be wrong. Add `site: \"https://yoursite.com\"`."
- Anything else (production-looking URL) → pass.

### 4. Gates

Gates 1–3 are confirmations — ask via `AskUserQuestion` and don't auto-invoke the skills, since they're long-running and the user may already have run them. Gate 4 is checked from files and only asks as a fallback.

**Gate 1 — SEO test:**
> Have you run the `seo-audit` skill on the current build?
> Options: Yes / No — run it after this / Not applicable

"No" → `manual_reminders`: "Run `seo-audit` skill before going live." "Yes" → `passed`.

**Gate 2 — Source review:**
> Has the source been reviewed (via the `hakuto-review` skill, an external reviewer, or PR review)?
> Options: Yes / No — do it after this / Not applicable

"No" → `manual_reminders`: "Run `hakuto-review` skill or get a second pair of eyes on the source." "Yes" → `passed`.

**Gate 3 — Lock file freshness:**
> Have you run `bun update` recently so `bun.lock` resolves to the latest stable package versions?
> Options: Yes / No — do it after this / Not applicable

"No" → `manual_reminders`: "Run `bun update` to refresh `bun.lock` to latest stable packages, then re-run `bun run check` and the build before shipping." "Yes" → `passed`.

**Gate 4 — Scaffold currency (automatic):**

```sh
jq -r '.last_synced_plugin_version // empty' .hakuto-sync.json
jq -r '.version' "${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json"
```

- Site version equals the plugin version → pass: "Scaffold synced to [version]."
- Site version is behind, or `.hakuto-sync.json` / the field is missing → warning: "Scaffold last synced at [version or 'never']; the installed plugin is [version]. Run `scaffold-sync` to pick up infra fixes shipped since."
- Only if the plugin version can't be read (no `CLAUDE_PLUGIN_ROOT`, no `jq`) → ask: "Have you run `scaffold-sync` recently?" and treat "No" as the warning above.

### 5. Add manual reminders

Read `references/manual-steps.md` and add every item under **Always include** to `manual_reminders`, plus each **Conditional** item whose condition holds (analytics installed; site publishes regularly). These live in the Cloudflare dashboard, Search Console or the deployed site, so the repo can't confirm them.

---

## Output Format

```markdown
Prelaunch Checklist Results
===========================

📊 Summary:
✅ Passed: X | ❌ Critical: X | ⚠️ Warnings: X | 🔔 Manual: X

---

## Critical Issues (❌) — fix before launch

1. SITE_NAME in src/lib/site.ts is still the scaffold default
   File: src/lib/site.ts:3

2. Placeholder text "Lorem ipsum" found
   Files: src/components/Hero.astro:23, src/pages/about.astro:45

3. Contact form posts to /~/contact, which no worker route handles
   File: src/components/ContactForm.tsx:12

4. /privacy is missing, and the contact form collects personal data

---

## Warnings (⚠️) — review before launch

1. wrangler.toml `name` is still 'hakuto-site'
   File: wrangler.toml:1

2. /about is a stub (210 chars)
   File: src/pages/about.astro

3. Scaffold last synced at 0.12.0; installed plugin is 0.15.0 — run `scaffold-sync`

---

## Passed Checks (✅)

- Forms wired correctly (1 form found)
- 404 page customized
- SEO test confirmed run
- Source review confirmed run
- `bun.lock` refreshed to latest stable packages

---

## Manual Steps (🔔) — can't be checked from the repo

- [ ] Enable Cloudflare Access on the workers.dev URL once the custom domain is live (leave it off on Preview URLs)
- [ ] Prefix the Cloudflare build command with `git fetch --unshallow || true &&` (skip if you build locally)
- [ ] Confirm the custom domain is configured and DNS has propagated
- [ ] Submit sitemap-index.xml to Google Search Console
- [ ] Enable Markdown for Agents (Cloudflare Pro plan or higher)
- [ ] After the first deploy, run `pagespeed-audit` on the live URL
- [ ] Verify analytics fires on the live domain (Plausible is installed)

---

To fix issues, edit the source files listed above. Once the critical
list is empty and the manual steps are done, you're ready to ship.
```

---

## Notes

- Report-only: never modify files.
- Run from the project root.
- Gates 1–3 use `AskUserQuestion`; Gate 4 reads files and asks only as a fallback. Don't auto-invoke `seo-audit`, `hakuto-review` or `scaffold-sync`.
- If a check is irrelevant to the project (e.g., no forms exist), skip it silently rather than padding the report with N/A entries.
- Show file:line for every finding so the user can jump straight to it.

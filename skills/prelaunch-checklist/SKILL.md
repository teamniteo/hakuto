---
name: prelaunch-checklist
description: Pre-launch validation for Hakuto sites. Verifies wrangler config, form wiring, legal pages, and placeholder content; confirms SEO test and code review have been run; reminds the user of manual Cloudflare dashboard steps. Report-only - no fixes applied.
---

# Prelaunch Checklist Skill

Validate a Hakuto site is ready to go live. Report findings only — user requests fixes separately.

Run when the user says any of:
- "Run prelaunch checklist"
- "Is the site ready to ship?"
- "Pre-launch check"
- "Check before launch"

---

## Execution Flow

### 1. Read project files in parallel

Read these into context up front:
- `wrangler.toml`
- `package.json`
- `src/layouts/Layout.astro`
- `src/components/Footer.astro` (if it exists; otherwise glob `src/components/*Footer*`)
- `astro.config.mjs`

Glob for:
- `src/pages/privacy.*`, `src/pages/terms.*`, `src/pages/cookies.*` (any extension)
- `src/components/**/*Form*.astro`, `src/components/**/*Form*.tsx`
- `src/pages/**/*.astro` (for the form scan in check #4)
- `worker/index.js` (for form handler in check #4)

### 2. Initialize trackers

```
critical = []
warnings = []
passed = []
manual_reminders = []
gates = []   # SEO + code-review confirmations
```

### 3. Run automated checks

#### Check 1 — wrangler.toml customized

In `wrangler.toml`:
- `name = 'hakuto-site'` → critical: "wrangler.toml `name` is still the scaffold default. Change to your project's worker name."
- `main` missing → critical
- All `[[routes]]` blocks still commented out AND no other custom-domain config → warning: "No custom domain in wrangler.toml. If you plan to use a custom domain via routes, uncomment the `[[routes]]` block. (Skip this if you're configuring the domain in the Cloudflare dashboard instead.)"
- Otherwise → pass

#### Check 2 — compatibility_date freshness

Parse `compatibility_date` in `wrangler.toml`. If older than 12 months from today → warning: "compatibility_date is X months old; consider bumping for newer Workers runtime features."

#### Check 3 — package.json name

In `package.json`, if `"name": "hakuto-site"` → warning: "package.json `name` is still the scaffold default."

#### Check 4 — Forms wired

Grep `src/` for `<form` (case-insensitive). For each match:
- Find the enclosing component file.
- Inspect the form's submission target (action attribute, fetch URL in script, or worker handler reference).
- Critical if any of:
  - `action="#"` or `action=""` or `action="/api/placeholder"` or similar dummy values
  - Submits via `fetch("/api/...")` to a path that has no corresponding handler in `worker/index.js`
  - Recipient email/destination is a placeholder (`hello@example.com`, `your-email@`, `someone@example.com`)
- Pass if a real endpoint and real recipient are wired.

If no forms exist, skip silently (don't add a passed entry — irrelevant).

#### Check 5 — Legal pages exist and are linked

- Critical-or-warning depending on context. Default treat as warning since not all sites need them.
- Check existence: `src/pages/privacy.{astro,md,mdx}`, `src/pages/terms.{astro,md,mdx}`, `src/pages/cookies.{astro,md,mdx}`. Missing all three → warning: "No legal pages found (privacy / terms / cookies). Add at least a privacy policy if you collect any user data via forms or analytics."
- For each that exists, grep `Footer` component(s) for a link to the corresponding path. Existing-but-not-linked → warning: "privacy.astro exists but isn't linked from Footer."

#### Check 6 — Placeholder text

Grep `src/` (excluding `node_modules`, `.astro`, `dist`) for these patterns. **Critical** if any are found, with file + line:
- `Lorem ipsum`
- `\bTODO\b`
- `\bFIXME\b`
- `Your Site Name`
- `your-email@`
- `hello@example.com`
- `someone@example.com`
- `\+1 \(555\)`
- `example\.com` (in user-facing strings — exclude config files and comments)
- `Astro \+ shadcn/ui website template for Hakuto` (the exact scaffold SITE_DESCRIPTION default)

Report each with `file:line` so the user can jump to it.

#### Check 7 — Layout placeholders

In `src/layouts/Layout.astro`:
- `SITE_NAME = "Hakuto"` → critical: "SITE_NAME in Layout.astro is still the scaffold default."
- `SITE_DESCRIPTION` matches `"Astro + shadcn/ui website template for Hakuto."` → critical: "SITE_DESCRIPTION in Layout.astro is still the scaffold default."

#### Check 8 — 404 page customized

Read `src/pages/404.astro`. If it matches the scaffold default verbatim (or is suspiciously short / generic — under ~30 lines and contains only the scaffold's "Page not found" boilerplate) → warning: "404 page appears to be the scaffold default. Customize it to match your site's voice."

#### Check 9 — `site` in `astro.config.mjs` is the production URL

Astro's [`site` option](https://docs.astro.build/en/reference/configuration-reference/#site) is what the sitemap, canonical links, and JSON-LD bake in. If it's still `http://localhost:4321` (the scaffold default) at deploy time, the live sitemap will reference localhost.

In `astro.config.mjs`:
- `site: "http://localhost:4321"` → critical: "`site` in astro.config.mjs is still the scaffold default. Set it to your production URL (e.g. `\"https://yoursite.com\"`) before deploying."
- `site` missing entirely → critical: "`site` is not set in astro.config.mjs. Sitemap and canonical links will be wrong. Add `site: \"https://yoursite.com\"`."
- Anything else (production-looking URL) → pass.

### 4. Ask user to confirm gates (do not auto-invoke)

Use `AskUserQuestion` for each. These are confirmation gates, not auto-runs.

**Gate 1 — SEO test:**
> Have you run the `seo-audit` skill on the current build?
> Options: Yes / No — run it after this / Not applicable

If "No — run it after this" → add to `manual_reminders`: "Run `seo-audit` skill before going live."
If "Yes" → add to `passed`.

**Gate 2 — Code review:**
> Has the source been reviewed (via the `code-review` skill, an external reviewer, or PR review)?
> Options: Yes / No — do it after this / Not applicable

If "No — do it after this" → add to `manual_reminders`: "Run `code-review` skill or get a second pair of eyes on the source."
If "Yes" → add to `passed`.

**Gate 3 — Lock file freshness:**
> Have you run `bun update` recently so `bun.lock` resolves to the latest stable package versions?
> Options: Yes / No — do it after this / Not applicable

If "No — do it after this" → add to `manual_reminders`: "Run `bun update` to refresh `bun.lock` to latest stable packages, then re-run `bun run check` and the build before shipping."
If "Yes" → add to `passed`.

### 5. Add manual Cloudflare reminders

Always include in the report (these can't be checked from the repo):

- **Toggle Cloudflare Access on for the `workers.dev` URL** in the Cloudflare dashboard once your custom domain is live, so Google doesn't index the site under two URLs. (Workers & Pages → your worker → Settings → Domains & Routes → click `…` on the `workers.dev` row → enable Cloudflare Access.) Leave Cloudflare Access **off** on the Preview URLs row so per-PR previews stay publicly shareable.
- **Confirm custom domain** is configured and DNS has propagated. See the [custom domain guide](/docs/setting-up/custom-domain).
- **Verify analytics** is firing on the live domain (if Plausible or another analytics tool is installed).
- **Submit sitemap** to Google Search Console at `yourdomain.com/sitemap-index.xml` after first deploy.

---

## Output Format

```markdown
Prelaunch Checklist Results
===========================

📊 Summary:
✅ Passed: X | ❌ Critical: X | ⚠️ Warnings: X | 🔔 Manual: X

---

## Critical Issues (❌) — fix before launch

1. SITE_NAME in Layout.astro is still the scaffold default
   File: src/layouts/Layout.astro:16

2. Placeholder text "Lorem ipsum" found
   Files: src/components/Hero.astro:23, src/pages/about.astro:45

3. Contact form submits to /api/placeholder (no worker handler)
   File: src/components/ContactForm.astro:12

---

## Warnings (⚠️) — review before launch

1. wrangler.toml `name` is still 'hakuto-site'
   File: wrangler.toml:1

2. No legal pages found (privacy / terms / cookies)
   Add at least a privacy policy if you collect user data.

3. compatibility_date is 14 months old
   File: wrangler.toml:3

---

## Passed Checks (✅)

- Forms wired correctly (1 form found)
- 404 page customized
- SEO test confirmed run
- Code review confirmed run
- `bun.lock` refreshed to latest stable packages

---

## Manual Steps (🔔) — do these in the Cloudflare dashboard

- [ ] Enable Cloudflare Access on the workers.dev URL (leave it off on Preview URLs) once custom domain is live
- [ ] Confirm custom domain DNS has propagated
- [ ] Verify analytics fires on the live domain
- [ ] Submit sitemap-index.xml to Google Search Console

---

To fix issues, edit the source files listed above. Once the critical
list is empty and the manual steps are done, you're ready to ship.
```

---

## Severity Rules

**Critical (❌)** — block launch:
- Scaffold defaults still in `Layout.astro` (SITE_NAME / SITE_DESCRIPTION)
- Forms submitting to placeholder/missing endpoints
- Placeholder text in user-facing content (Lorem ipsum, TODO, your-email@, etc.)
- Missing required wrangler fields (`main`)
- `site` in `astro.config.mjs` still `http://localhost:4321` or missing (production sitemap/canonicals will be wrong)

**Warning (⚠️)** — review but don't block:
- `wrangler.toml` / `package.json` `name` still scaffold default
- Stale `compatibility_date`
- Missing or unlinked legal pages
- 404 page looks like scaffold default
- No custom domain route configured (only a warning — user may be using dashboard config)

**Pass (✅)** — meets requirements

**Manual (🔔)** — can't auto-check, surface as reminder

---

## Notes

- Report-only: never modify files.
- Run from the project root.
- The two gates (SEO + code review) use `AskUserQuestion` — do not auto-invoke those skills.
- If a check is irrelevant to the project (e.g., no forms exist), skip it silently rather than padding the report with N/A entries.
- Show file:line for every finding so the user can jump straight to it.

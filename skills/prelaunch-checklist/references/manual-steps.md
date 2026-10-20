# Manual launch steps

Steps that can't be checked from the repo — they live in the Cloudflare dashboard, Google
Search Console, or the deployed site. `SKILL.md` Step 5 adds every "always include" item to
the report's Manual Steps list; conditional items go in only when their condition holds.

## Contents

- [Always include](#always-include)
- [Conditional](#conditional)
- [Unshallow clone / deploy setup](#unshallow-clone--deploy-setup)

---

## Always include

1. **Toggle Cloudflare Access on for the `workers.dev` URL** once the custom domain is live, so
   Google doesn't index the site under two URLs. Workers & Pages → your worker → Settings →
   Domains & Routes → `…` on the `workers.dev` row → enable Cloudflare Access. Leave Access
   **off** on the Preview URLs row so per-PR previews stay publicly shareable.
2. **Prefix the Cloudflare build command with `git fetch --unshallow`** if the site builds on
   Cloudflare Workers Builds / Pages CI rather than locally. See
   [Unshallow clone / deploy setup](#unshallow-clone--deploy-setup).
3. **Confirm the custom domain** is configured and DNS has propagated. Workers & Pages → your
   worker → Settings → Domains & Routes → Add Custom Domain.
4. **Submit the sitemap** to Google Search Console at `https://{domain}/sitemap-index.xml`
   after the first deploy.
5. **Enable Markdown for Agents** — Cloudflare dashboard → AI Crawl Control → Markdown for
   Agents (or `dash.cloudflare.com/?to=/:account/:zone/ai`). Cloudflare converts HTML to
   markdown on the fly for clients sending `Accept: text/markdown` and sets `Vary: Accept`
   itself. It needs a **Pro, Business or Enterprise plan** — not available on Free — and it
   can't be done in `_headers`: adding `Vary: Accept` to a site that only serves HTML
   advertises a variant that doesn't exist. Verify with
   `curl -sI -H "Accept: text/markdown" https://{domain}/ | grep -i '^content-type'`.
6. **Run `pagespeed-audit` after the first deploy** (optional but recommended) — it measures
   Lighthouse scores and Core Web Vitals on the live URL, which nothing in this checklist can
   do before the site is public.

## Conditional

- **Verify analytics fires on the live domain** — only when Plausible (a `/~/pla` route in
  `worker/index.js`) or another analytics script is installed. For Plausible, open the live
  site and watch the realtime dashboard.
- **Consider IndexNow** — only when the site publishes regularly (a blog, changelog or docs
  that change often). Drop a `<key>.txt` file in `public/` and ping
  `https://api.indexnow.org/indexnow?url=…&key=…` after each deploy. Bing, Yandex, Naver and
  Seznam pick changes up immediately instead of waiting on their crawl schedule; Google does
  not participate. Skip it for a static marketing site that rarely changes.

---

## Unshallow clone / deploy setup

Cloudflare Workers Builds (and Pages builds) check out the repository as a **shallow clone**,
so git sees only the tip commit. Every git-derived date — sitemap `lastmod`, a doc or blog
"Last updated" line, changelog ordering — becomes the deploy date on every page. It fails
silently: the build and the deploy both succeed.

- Set the build command in Workers & Pages → your worker → Settings → Build:
  ```sh
  git fetch --unshallow || true && bun run build
  ```
- `|| true` keeps the build green when the clone is already complete — `git fetch --unshallow`
  exits non-zero on a full clone (`fatal: --unshallow on a complete repository does not make sense`).
- It belongs in the dashboard build command, not `package.json` — local builds already have
  full history, and `bun run build` must stay usable offline.
- If a Cloudflare MCP server (`cloudflare-api`, `cloudflare-builds`) is connected, read and set
  the build command through it instead of walking the user through the dashboard.
- Skip this item if the site is built locally and deployed with `wrangler deploy`.
- Verify after the next deploy: git-derived dates (sitemap `lastmod` where the site sets it, a
  "Last updated" line) should differ between pages that changed at different times.

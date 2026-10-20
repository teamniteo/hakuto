# `public/_headers` Checks

Read when the scope includes `public/_headers` or `wrangler.toml`, when the user asks about
security headers or caching, and on every whole-project review. This skill owns both the
caching and the security-header policy; `seo-audit` grades only the crawler-signal rules
(`Link`, `Content-Signal`) and defers the rest here.

The scaffold ships the reference policy at `${CLAUDE_PLUGIN_ROOT}/scaffold/public/_headers` —
compare against it when a site's file has drifted.

> **Rule scoping applies to every check below.** In Cloudflare's `_headers`, `/` is an exact
> path, not a prefix: a rule scoped to `/` matches the homepage only and fails silently — no
> build error, no deploy error. Site-wide headers go under `/*`.

---

## Static Asset Caching

Cloudflare Workers' Static Assets binding (`[assets]` block in `wrangler.toml`) defaults
responses to `cache-control: public, max-age=0, must-revalidate` for every path — including
content-hashed `/_astro/*` files that are immutable by construction. Browsers re-validate
every CSS/JS/image asset on every visit unless `_headers` overrides this.

- **❌ Critical** — *`/_astro/*` not configured for long-immutable cache*. Project uses
  `@astrojs/cloudflare` and `wrangler.toml` has an `[assets]` block, and `public/_headers`
  has no `/_astro/*` rule whose `Cache-Control` includes both `max-age >= 31536000` and
  `immutable`. Hashed Astro outputs change filename whenever content changes, so caching them
  for a year is always safe.
- **⚠️ Warning** — *favicon / app-icon / manifest paths uncached or cached too
  aggressively*. No rule for the favicon family — `/favicon.ico`, `/favicon.svg`,
  `/favicon-*`, `/apple-touch-icon*`, `/android-chrome-*`, `/mstile-*`,
  `/manifest.webmanifest`, `/browserconfig.xml` — or an existing rule sets `max-age > 86400`.
  Favicons get swapped during rebrands; a 1-day cache lets new icons reach returning visitors
  within a day.
- **⚠️ Warning** — *Pagefind index uncached*. `astro-pagefind` is in the integrations and
  `_headers` has no `/pagefind/*` rule. Pagefind regenerates each build; `max-age=86400` is
  the conventional value.
- **✅ Pass** — explicit `Cache-Control` rules for `/_astro/*` (immutable + 1y) and a
  `max-age=86400` cap on favicons/manifests/`/pagefind/*`. HTML can keep Cloudflare's
  `max-age=0` default — the CDN edge cache still serves it without origin round-trips.

> **Verification tip for the user (not for the skill to run):**
> `curl -sI https://{domain}/_astro/{any-file}` should return
> `max-age=31536000, immutable`. Pingdom's legacy "Add Expires headers" complaint maps to this
> check — modern `Cache-Control` supersedes `Expires`, and Cloudflare's Brotli supersedes
> Pingdom's gzip check, so both legacy grades are false positives once `_headers` is
> populated.

---

## Security Headers

Security scanners (securityheaders.com, Mozilla Observatory, Sucuri SiteCheck, the Cloudflare
audit) consistently flag missing `Content-Security-Policy` and `Permissions-Policy`. All of
the headers below belong on the `/*` rule so they ship on every page.

Hakuto sites are static-prerendered with inline scripts (GTM, Cookiebot, Plausible loader,
marketing-pixel wrappers). A strict nonce-based CSP requires SSR and isn't compatible with
this stack — the realistic policy keeps `'unsafe-inline'` + `https:` for `script-src` /
`style-src` and locks down the high-impact vectors instead. That's still a real improvement
on no CSP at all and passes the common scanners.

- **❌ Critical** — *security headers scoped to `/` (or another path-specific rule) instead
  of `/*`*. A `/` rule matches the homepage only, so every inner page ships without them —
  and nothing errors. Same for `/blog/*`-style prefixes. Move them into the `/*` block.
- **❌ Critical** — *`Content-Security-Policy` missing entirely* from the `/*` rule. Even a
  permissive CSP that sets `frame-ancestors`, `base-uri`, `object-src`, and `form-action`
  provides meaningful clickjacking and base-tag-injection protection.
- **❌ Critical** — *CSP present but missing high-impact directives*. It must include all four
  of: `frame-ancestors 'none'` (or `'self'`), `base-uri 'self'`, `object-src 'none'`,
  `form-action` (at minimum `'self'`). These pay back even when `script-src`/`style-src` are
  permissive — skipping them defeats the point of a CSP here.
- **❌ Critical** — *`Permissions-Policy` missing*. It should at minimum disable features the
  site doesn't use — `camera=()`, `microphone=()`, `geolocation=()`, `usb=()`,
  `magnetometer=()`, `accelerometer=()`, `payment=()` (or `=*` if Paddle/Stripe checkout is
  used), `publickey-credentials-get=()`. Embedded-video features (`autoplay`, `fullscreen`,
  `picture-in-picture`, `encrypted-media`) should be `*` on sites with Vimeo/YouTube embeds.
- **⚠️ Warning** — *`Strict-Transport-Security` missing*, or `max-age` below `31536000`. The
  scaffold ships `max-age=31536000; includeSubDomains; preload`. Without HSTS the first
  request on a new device can be downgraded to HTTP. Before recommending `preload`, confirm
  every subdomain serves HTTPS — preload-list removal takes months.
- **⚠️ Warning** — *`X-Frame-Options` missing*. The scaffold ships `DENY`. CSP's
  `frame-ancestors` supersedes it in modern browsers, but scanners still grade it and older
  browsers only honour this header. If the CSP uses `frame-ancestors 'self'`, the matching
  value is `SAMEORIGIN`.
- **⚠️ Warning** — *`X-Content-Type-Options: nosniff` missing*. Cheap, eliminates
  MIME-sniffing XSS, flagged by every scanner.
- **⚠️ Warning** — *`Referrer-Policy` missing or weaker than
  `strict-origin-when-cross-origin`*. `no-referrer-when-downgrade` leaks the full URL to
  cross-origin requests; `strict-origin-when-cross-origin` is the recommended floor.
- **⚠️ Warning** — *CSP omits a known third-party origin used by the site*. If the site loads
  scripts from origins the CSP doesn't cover — e.g. `script-src 'self' 'unsafe-inline'` only,
  while the site loads `https://www.googletagmanager.com`, `https://connect.facebook.net`,
  `https://consent.cookiebot.com`, `https://beacon-v2.helpscout.net`,
  `https://cdn.paddle.com`, `https://challenges.cloudflare.com` — flag the gap. The pragmatic
  fix is `script-src 'self' 'unsafe-inline' 'unsafe-eval' https: blob:` rather than
  enumerating every CDN.
- **✅ Pass** — a `/*` rule carrying a `Content-Security-Policy` with `frame-ancestors`,
  `base-uri`, `object-src 'none'` and `form-action`; a `Permissions-Policy` disabling unused
  features; `Strict-Transport-Security`; `X-Frame-Options`; `X-Content-Type-Options: nosniff`;
  and `Referrer-Policy: strict-origin-when-cross-origin` (or stricter).

> **Verification tip for the user (not for the skill to run):**
> `curl -sI https://{domain}/some/inner/page/` on the deployed site should show every header
> above. Never verify with `curl -sI https://{domain}/` — the homepage passes even when the
> rule is mis-scoped to `/`.

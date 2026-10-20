---
name: plausible-analytics
description: Adds Plausible Analytics to a Hakuto site, proxied through a same-origin Cloudflare Worker route so the script survives ad blockers and stays first-party. Use for "add Plausible", "add analytics", "add tracking", "track page views", "visitor tracking", or privacy-friendly analytics. Skip for reading or reporting traffic numbers ('how many visitors', 'top pages') — that's a stats query, not an install. Skip if a `/~/pla` route is already registered in `worker/index.js`.
---

# Plausible Analytics

## Why a Worker proxy

Plausible's standard `<script>` tag works, but it's served from `plausible.io` — a domain in every ad blocker's default list. Routing the script and event endpoint through a same-origin Cloudflare Worker (`/~/pla/...`) makes the requests first-party:

- `/~/pla/js/script.js` — proxies Plausible's script and caches it at Cloudflare's edge, so latency stays low.
- `/~/pla/api/event` — forwards tracking events to Plausible's API with cookies stripped.
- Ad blockers don't recognise the path, and the browser sends no third-party cookies.

## Workflow

### 1. Get the Plausible script URL

Ask the user for their Plausible site ID (e.g. `pa-CU5TnHVZaYl2kUd7gcJAE`) or to paste their tracking script. If they don't have one yet:

1. Sign up at [plausible.io](https://plausible.io) and add the domain.
2. Go to Site Settings → Site Installation.
3. Copy the script URL: `https://plausible.io/js/pa-XXXXX.js`.

This is Plausible's modern per-site script (the URL itself encodes the site identity), not the legacy `script.js` + `data-domain` pattern.

### 2. Create the worker handler

Copy `assets/plausible.js` to `worker/plausible.js`, then replace the `ProxyScript` constant with the user's full script URL.

### 3. Register the route

In `worker/index.js`:

```js
import { handlePlausible } from './plausible.js';

const ROUTES = {
  '/~/pla': { handler: handlePlausible, description: 'Plausible Analytics Proxy' },
  // ... other routes
};
```

### 4. Add the tracking script to the layout

Add to `src/layouts/Layout.astro` at the bottom of `<body>`. The second tag needs `is:inline` — without it Astro bundles the snippet into a deferred module, so the async script can run before `plausible.init` has set the proxy endpoint and send events straight to `plausible.io`, where ad blockers drop them.

```astro
<!-- Privacy-friendly analytics by Plausible -->
<script async src="/~/pla/js/script.js"></script>
<script is:inline>
  window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
  plausible.init({
    endpoint: "/~/pla/api/event"
  })
</script>
```

### 5. Verify

Worker routes don't run under `bun run dev` (plain `astro dev`, no worker — `/~/*` returns Astro's 404 page there). Test with the preview server, which builds and runs `wrangler dev` on `127.0.0.1:8787`:

```sh
bun run preview
# in another shell:
curl -sI http://127.0.0.1:8787/~/pla/js/script.js
```

Expect `200` with a JavaScript `content-type`. A `404` with `application/problem+json` means the route isn't registered; a `404` from Plausible means the `ProxyScript` URL is wrong.

After the next deploy, open the live site and check Plausible's realtime dashboard for the visit.

### 6. Report

Tell the user:

- Files touched: `worker/plausible.js` (new), `worker/index.js`, `src/layouts/Layout.astro`.
- The Plausible site ID now in `ProxyScript`.
- The verification result from step 5, and that the realtime check happens after deploy.
- The privacy page should mention Plausible (cookieless, no personal data) — update it if one exists.

## Assets

- `assets/plausible.js` — worker handler; copy, then replace `ProxyScript`.

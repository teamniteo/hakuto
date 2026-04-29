---
name: plausible-analytics
description: Adds Plausible Analytics to Astro sites with a Cloudflare Workers proxy for privacy and ad-blocker bypass. Requires a project deploying to Cloudflare Workers (uses `worker/index.js` route registration). Use when user requests "add Plausible", "add analytics", "add tracking", "page views", "visitor tracking", or privacy-friendly analytics. Skip if the project deploys to Vercel/Netlify/static-only — paste Plausible's standard `<script>` tag into Layout directly, no skill needed.
---

# Plausible Analytics

## Why a Worker proxy

Plausible's standard `<script>` tag works, but it's served from `plausible.io` — a domain in every ad blocker's default list. Routing the script and event endpoint through a same-origin Cloudflare Worker (`/~/pla/...`) makes the requests first-party: ad blockers don't recognize the path, the browser doesn't send third-party cookies (we strip what's left), and Cloudflare's edge caches the script so latency stays low. You get the privacy benefits Plausible already provides plus measurable lift in tracked sessions.

## Workflow

1. **Ask user for their Plausible site ID** (e.g., `pa-CU5TnHVZaYl2kUd7gcJAE`) or have them paste their tracking script. The ID comes from Plausible's UI: Site Settings → Site Installation, where the script URL has the form `https://plausible.io/js/pa-XXXXX.js`. This is Plausible's modern per-site script (the URL itself encodes the site identity), not the legacy `script.js` + `data-domain` pattern.
2. Create `worker/plausible.js` from `assets/plausible.js` and replace the `ProxyScript` constant with the user's full script URL
3. Register the `/~/pla` route in `worker/index.js`
4. Add the tracking script to `Layout.astro`

## Worker Setup

See step 2 above. Route registration in `worker/index.js`:

```js
import { handlePlausible } from './plausible.js';

const ROUTES = {
  '/~/pla': { handler: handlePlausible, description: 'Plausible Analytics Proxy' },
  // ... other routes
};
```

## Layout Integration

Add to `src/layouts/Layout.astro` at the bottom of `<body>`:

```astro
<!-- Privacy-friendly analytics by Plausible -->
<script async src="/~/pla/js/script.js"></script>
<script>
  window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
  plausible.init({
    endpoint: "/~/pla/api/event"
  })
</script>
```

## How It Works

- `/~/pla/js/script.js` - Proxies and caches Plausible script
- `/~/pla/api/event` - Proxies tracking events to Plausible API
- Cookies stripped for privacy
- Bypasses ad blockers by using first-party domain
- Uses Cloudflare's edge caching

## Getting Plausible Script URL

1. Sign up at [plausible.io](https://plausible.io)
2. Add your domain
3. Go to Site Settings → Site Installation
4. Copy the script URL: `https://plausible.io/js/pa-XXXXX.js`

## Assets

- `assets/plausible.js` - Worker handler example

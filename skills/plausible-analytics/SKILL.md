---
name: plausible-analytics
description: Adds Plausible Analytics to Astro sites with Cloudflare Workers proxy for privacy and ad-blocker bypass. Use when user requests "add Plausible", "add analytics", "add tracking", "page views", "visitor tracking", or privacy-friendly analytics.
---

# Plausible Analytics

Adds Plausible Analytics with Cloudflare Workers proxy for privacy and ad-blocker bypass.

## Workflow

1. **Ask user for their Plausible site ID** (e.g., `pa-CU5TnHVZaYl2kUd7gcJAE`) or have them paste their tracking script
2. Create `worker/plausible.js` handler (see `assets/plausible.js`)
3. Update `ProxyScript` constant: `https://plausible.io/js/{SITE_ID}.js`
4. Register route in `worker/index.js`
5. Add tracking script to Layout

## Worker Setup

Create `worker/plausible.js` based on `assets/plausible.js`, updating `ProxyScript` with user's site ID.

Register in `worker/index.js`:

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

# Cloudflare Worker

This directory contains the Cloudflare Worker that runs before serving static assets from the Astro build.

## Architecture

```
worker/
├── index.js   # Entry point with route configuration (no active routes by default)
└── README.md  # This file
```

## How It Works

1. **Wrangler Configuration** (`wrangler.toml`):
   - `run_worker_first = ["/~*"]` — routes all paths starting with `/~` to the worker first.
   - `main = "worker/index.js"` — entry point for the worker.

2. **Main Entry Point** (`index.js`):
   - Only sees requests matching `run_worker_first` (`/~*`) — Cloudflare serves every other URL straight from `dist/` without entering the worker, so there's no need for an `env.ASSETS.fetch()` fallback here.
   - Routes to the appropriate handler based on path prefix.
   - Returns a plain 404 for `/~*` paths that don't match any route.
   - Wraps each handler in try/catch for safety.

3. **Route Handlers**:
   - Each route handler lives in its own file (e.g., `plausible.js`).
   - Handlers export an async function that receives `(request, ctx)`.
   - Handlers return a `Response` object.

By default no routes are active — `index.js` ships with an empty `ROUTES` map and commented examples. The site behaves as pure static assets until you wire something up.

## Adding a Route

1. **Create a handler file** (e.g., `worker/api.js`):

```javascript
export async function handleApi(request, ctx) {
  const url = new URL(request.url);

  if (url.pathname === '/~/api/hello') {
    return new Response(JSON.stringify({ message: 'Hello!' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response('Not Found', { status: 404 });
}
```

2. **Register it in `index.js`**:

```javascript
import { handleApi } from './api.js';

const ROUTES = {
  '/~/api': { handler: handleApi, description: 'Custom API endpoints' },
};
```

3. **Test locally**:

```bash
bun run dev          # Runs Astro and the worker together — 1:1 with production
```

`bun run dev` exercises the same Cloudflare adapter and worker entry point that ships in production, so `/~/*` routes hit your handlers in dev exactly as they will once deployed. Don't use `bunx wrangler dev` — it's not the workflow for this scaffold.

## Environment Variables

The worker has access to:

- `env.ASSETS` — static assets from the Astro build.
- Any bindings defined in `wrangler.toml`.

## Deployment

The worker is deployed alongside the site as part of the normal site deploy — no extra steps.

## Testing

`bun run dev` runs Astro and the worker together — a 1:1 copy of production — so `/~/*` routes can be tested locally without deploying.

`bun run build` produces the static output under `dist/` (HTML, JS, assets, sitemap, pagefind index, etc.) without the worker layer. Useful for sanity-checking what actually ships: which pages are emitted, whether an asset made it into the bundle, what filenames pagefind/sitemap end up with. Inspect with `ls -R dist/` or `grep -r foo dist/`. Anything served from `/~/*` is handled by the worker and won't appear here.

## Best Practices

1. **Modular Handlers**: Keep each route handler in its own file.
2. **Error Handling**: All handlers should include try/catch for safety.
3. **Performance**: Use caching where appropriate.
4. **Security**: Validate all inputs, sanitize outputs.
5. **Documentation**: Comment handler functions with JSDoc.

## Debugging

1. Check logs in the Cloudflare dashboard.
2. Use `console.log()` in handler code (visible in the `bun run dev` terminal).
3. Verify routes in the `ROUTES` map in `index.js`.

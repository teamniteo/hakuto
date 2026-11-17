# Cloudflare Worker

This directory contains the Cloudflare Worker that answers `/~/*` requests. Every other URL is
served straight from the Astro build by Cloudflare's asset layer.

## Architecture

```
worker/
├── index.js    # Entry point with route configuration (no active routes by default)
├── problem.js  # RFC 9457 application/problem+json error helper
└── README.md   # This file
```

## How It Works

1. **Wrangler configuration** (`wrangler.toml`):
   - `main = "worker/index.js"` — entry point for the worker.
   - `run_worker_first = ["/~*"]` — only paths starting with `/~` reach the worker. Cloudflare
     serves every other URL from `dist/client/` without entering it, so there is no
     `env.ASSETS.fetch()` fallback in `index.js`.
   - `not_found_handling = "404-page"` — unmatched non-worker paths get the prerendered `404.astro`.

2. **Entry point** (`index.js`):
   - Matches the request path against the `ROUTES` prefixes.
   - Calls the matching handler as `handler(request, env, ctx)`.
   - Wraps each handler in try/catch and returns a typed 500 through `problem()` if it throws.
   - Returns a typed 404 (`route_not_found`) for `/~*` paths no route matches.

3. **Route handlers**:
   - Each handler lives in its own file (e.g. `plausible.js`) and exports an async function
     with the signature `(request, env, ctx)`.
   - `env` holds `wrangler.toml` `[vars]`, secrets set with `wrangler secret put`, and any
     bindings. `ctx.waitUntil(promise)` keeps work running after the response is sent.
   - Handlers return a `Response`, and return errors through `problem()` so every `/~*`
     endpoint speaks the same error shape.

No routes are active by default — `index.js` ships with an empty `ROUTES` map and commented
examples, so the site behaves as pure static assets until you wire something up.

## Adding a Route

1. **Create a handler file** (e.g. `worker/api.js`):

```javascript
import { problem } from './problem.js';

export async function handleApi(request, env, ctx) {
  const url = new URL(request.url);

  if (url.pathname === '/~/api/hello/') {
    return Response.json({ message: 'Hello!', greeting: env.GREETING ?? null });
  }

  return problem({
    status: 404,
    code: 'not_found',
    title: 'Not Found',
    detail: `No API endpoint at ${url.pathname}.`,
    resolution: 'Check the path against the endpoints this API documents.',
  });
}
```

2. **Register it in `index.js`**:

```javascript
import { handleApi } from './api.js';

const ROUTES = {
  '/~/api': { handler: handleApi, description: 'Custom API endpoints' },
};
```

3. **Test locally with `bun run preview`**:

```bash
bun run preview   # astro build, then wrangler dev on http://127.0.0.1:8787
curl -i http://127.0.0.1:8787/~/api/hello/
```

`bun run dev` does **not** run the worker. It is plain `astro dev` with no Cloudflare adapter
(`astro.config.mjs` disables it in development), so `/~/*` paths return Astro's HTML 404 there.
`bun run preview` builds the site and serves it through `wrangler dev`, which applies
`wrangler.toml` the same way production does — use it for anything under `/~/`. It does not
hot-reload: re-run it after changing worker code.

## Environment Variables and Secrets

Runtime values exist only inside the worker, on the `env` argument:

- `[vars]` from `wrangler.toml` — non-secret config.
- Secrets — `wrangler secret put NAME` in production; for `bun run preview`, put them in a
  `.dev.vars` file next to `wrangler.toml` (keep it out of git).
- Any other bindings declared in `wrangler.toml` (KV, D1, R2, …).

Nothing under `src/` can read these — the pages are prerendered, so `import.meta.env.*` there
is `undefined` in production.

## Deployment

The worker deploys with the site as part of the normal site deploy — no extra steps.

## Inspecting the Build

`bun run build` writes the static output to `dist/client/` (HTML, assets, sitemap, pagefind
index). Inspect it with `ls -R dist/client/` or `grep -r foo dist/client/` to confirm what
ships. Responses from `/~/*` come from the worker and never appear there.

## Best Practices

1. **Modular handlers** — one route per file.
2. **Typed errors** — return failures through `problem()`.
3. **Validate input** — never trust the request body or query string.
4. **Secrets stay in the worker** — never copy a value from `env` into a response unless it is meant to be public.

## Debugging

1. `console.log()` in a handler prints to the `bun run preview` terminal.
2. In production, check the worker's logs in the Cloudflare dashboard (enable
   `[observability.logs]` in `wrangler.toml` first).
3. Verify the route prefix in the `ROUTES` map in `index.js` — prefixes match with `startsWith`.

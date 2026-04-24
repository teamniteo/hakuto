# Cloudflare Worker

This directory contains the Cloudflare Worker that runs before serving static assets from the Astro build.

## Architecture

The worker uses a modular route-based architecture:

```
worker/
├── index.js       # Main entry point with route configuration
├── plausible.js   # Plausible Analytics proxy handler
└── README.md      # This file
```

## How It Works

1. **Wrangler Configuration** (`wrangler.toml`):
   - `run_worker_first = ["/~*"]` - Routes all paths starting with `/~` to the worker first
   - `main = "worker/index.js"` - Entry point for the worker

2. **Main Entry Point** (`index.js`):
   - Processes requests starting with `/~`
   - Routes to appropriate handler based on path prefix
   - Falls back to static assets for unmatched paths
   - Includes error handling for all routes

3. **Route Handlers**:
   - Each route handler is in its own file (e.g., `plausible.js`)
   - Handlers export an async function that receives `(request, ctx)`
   - Handlers return a `Response` object

## Current Routes

### `/~/pla/*` - Plausible Analytics Proxy
- **Handler**: `plausible.js`
- **Endpoints**:
  - `/~/pla/script.js` - Proxied Plausible script (cached 24h)
  - `/~/pla/event` - Event tracking endpoint (cookies removed for privacy)
- **Benefits**:
  - Privacy-enhanced (no cookies sent to Plausible)
  - Bypasses ad blockers
  - Better performance (cached scripts)

## Adding New Routes

To add a new route handler:

1. **Create a handler file** (e.g., `worker/api.js`):

```javascript
/**
 * Example API Handler
 */

export async function handleApi(request, ctx) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (pathname === '/~/api/hello') {
    return new Response(JSON.stringify({ message: 'Hello!' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response('Not Found', { status: 404 });
}
```

2. **Register the route in `index.js`**:

```javascript
import { handlePlausible } from './plausible.js';
import { handleApi } from './api.js';  // Add import

const ROUTES = [
  {
    prefix: '/~/pla',
    handler: handlePlausible,
    description: 'Plausible Analytics Proxy'
  },
  {
    prefix: '/~/api',  // Add your route
    handler: handleApi,
    description: 'Custom API endpoints'
  }
];
```

3. **Test locally**:

```bash
bun run build
bunx wrangler pages dev dist
```

## Environment Variables

The worker has access to:
- `env.ASSETS` - Static assets from Astro build
- Any bindings defined in `wrangler.toml`

## Deployment

The worker is automatically deployed with the Cloudflare Pages site. No additional deployment steps needed.

## Testing

```bash
# Build the Astro site
bun run build

# Test worker locally with wrangler
bunx wrangler pages dev dist

# Visit http://localhost:8788/~/pla/script.js to test
```

## Best Practices

1. **Modular Handlers**: Keep each route handler in its own file
2. **Error Handling**: All handlers should include try/catch for safety
3. **Performance**: Use caching where appropriate
4. **Security**: Validate all inputs, sanitize outputs
5. **Documentation**: Comment handler functions with JSDoc

## Debugging

To debug worker issues:

1. Check logs in Cloudflare dashboard
2. Use `console.log()` in handler code
3. Test locally with `wrangler pages dev`
4. Verify routes in `index.js` ROUTES array

/**
 * Cloudflare Workers Entry Point
 *
 * run_worker_first = true in wrangler.toml sends every request here. Paths
 * under /~ are dispatched to ROUTES; everything else is served from the Astro
 * build by serveAsset() (see assets.js).
 */

import { serveAsset } from './assets.js';
import { problem } from './problem.js';

/**
 * Route handlers map
 * Key: route prefix, Value: { handler, description }
 * Each handler is called as handler(request, env, ctx) and returns a Response.
 * `env` carries wrangler.toml [vars], secrets and bindings; `ctx.waitUntil()`
 * schedules work that outlives the response.
 *
 * No routes are wired up by default. Add entries to enable them, e.g.:
 *
 *   import { handleHey } from './hey.js';  // export async function handleHey(request, env, ctx) { … }
 *   '/~/hey':   { handler: handleHey,       description: 'Hello World' },
 *   '/~/pla':   { handler: handlePlausible, description: 'Plausible Analytics Proxy' },
 *   '/~/form-': { handler: handleForm,      description: 'Form Handler' },
 */
const ROUTES = {};


/**
 * Main worker fetch handler
 */
export default {
  async fetch(request, env, ctx) {
    const pathname = new URL(request.url).pathname;

    if (!pathname.startsWith('/~')) {
      return serveAsset(request, env);
    }

    const route = Object.entries(ROUTES).find(([prefix]) => pathname.startsWith(prefix));

    if (route) {
      const [, { handler, description }] = route;
      try {
        return await handler(request, env, ctx);
      } catch (error) {
        console.error(`Error in ${description}:`, error);
        return problem({
          status: 500,
          code: 'internal_error',
          title: 'Internal Server Error',
          detail: `The ${description} handler threw while processing this request.`,
          resolution: 'Retry once; if it persists the endpoint is broken and retrying will not help.',
        });
      }
    }

    return problem({
      status: 404,
      code: 'route_not_found',
      title: 'Not Found',
      detail: `No worker route is registered for ${pathname}.`,
      resolution: 'Only paths under /~/ are worker routes. Site pages are served as static assets — see /sitemap-index.xml for what exists.',
    });
  },
};

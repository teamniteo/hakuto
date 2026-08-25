/**
 * Cloudflare Workers Entry Point
 *
 * Handles requests before serving static assets from Astro build.
 * Routes are defined with run_worker_first = ["/~*"] in wrangler.toml.
 */

import { problem } from './problem.js';

/**
 * Route handlers map
 * Key: route prefix, Value: { handler, description }
 *
 * No routes are wired up by default. Uncomment or add entries to enable them:
 *
 *   import { handleHey } from './hey.js';
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

    const route = Object.entries(ROUTES).find(([prefix]) => pathname.startsWith(prefix));

    if (route) {
      const [, { handler, description }] = route;
      try {
        return await handler(request, ctx);
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
      resolution: 'Only paths under /~/ reach this worker. Site pages are served as static assets — see /sitemap-index.xml for what exists.',
    });
  },
};

/**
 * Cloudflare Workers Entry Point
 *
 * Handles requests before serving static assets from Astro build.
 * Routes are defined with run_worker_first = ["/~*"] in wrangler.toml.
 */

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
        return new Response('Internal Server Error', { status: 500 });
      }
    }

    return new Response('Not Found', { status: 404 });
  }
};

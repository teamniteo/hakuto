/**
 * Cloudflare Workers Entry Point
 *
 * Handles requests before serving static assets from Astro build
 * Routes are defined with run_worker_first = ["/~*"] in wrangler.toml
 */

import { handleHey } from './hey.js';

/**
 * Route handlers map
 * Key: route prefix, Value: { handler, description }
 */
const ROUTES = {
  '/~/hey': { handler: handleHey, description: 'Hello World' },
  // '/~/pla': { handler: handlePlausible, description: 'Plausible Analytics Proxy' },
  // '/~/form-': { handler: handleForm, description: 'Form Handler' },
};

/**
 * Main worker fetch handler
 */
export default {
  async fetch(request, env, ctx) {
    const pathname = new URL(request.url).pathname;

    const route = Object.entries(ROUTES).find(([prefix]) => pathname.startsWith(prefix));

    if (route) {
      const [prefix, { handler, description }] = route;
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

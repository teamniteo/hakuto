/**
 * Plausible Analytics Proxy Handler
 * Routes: /~/pla/js/script.js and /~/pla/api/event
 * Based on: https://plausible.io/docs/proxy/guides/cloudflare
 *
 * Copy to worker/plausible.js, then replace ProxyScript with the site's
 * script URL from Plausible → Site Settings → Site Installation.
 */

import { problem } from './problem.js';

const ProxyScript = 'https://plausible.io/js/pa-XXXXX.js';

export async function handlePlausible(request, env, ctx) {
  const pathname = new URL(request.url).pathname;

  if (pathname.endsWith('/js/script.js')) {
    return getScript(request, ctx);
  } else if (pathname.endsWith('/api/event')) {
    return postData(request);
  }
  return problem({
    status: 404,
    code: 'route_not_found',
    title: 'Not Found',
    detail: `The Plausible proxy has no endpoint at ${pathname}.`,
    resolution: 'Use /~/pla/js/script.js for the script or /~/pla/api/event for events.',
  });
}

async function getScript(request, ctx) {
  let response = await caches.default.match(request);
  if (!response) {
    response = await fetch(ProxyScript);
    ctx.waitUntil(caches.default.put(request, response.clone()));
  }
  return response;
}

async function postData(request) {
  const newRequest = new Request(request);
  newRequest.headers.delete('cookie');
  return await fetch('https://plausible.io/api/event', newRequest);
}

/**
 * Static asset passthrough.
 *
 * Every path outside /~* is served from dist/client/ through the ASSETS binding.
 * html_handling = "force-trailing-slash" answers /pricing with a 307 to /pricing/,
 * and /pricing/index.html with a 307 to /pricing/. Search engines treat a 307 as
 * temporary and keep the old URL indexed, so these two redirects are returned as
 * a 301. Every other response, including _redirects rules and 404s, passes
 * through unchanged.
 */

/** The paths html_handling may redirect `pathname` to. */
function canonicalPaths(pathname) {
  const paths = [`${pathname}/`];
  if (pathname.endsWith('/index.html')) paths.push(pathname.slice(0, -'index.html'.length));
  return paths;
}

/** Returns a 301 copy of an html_handling 307, otherwise null. */
export function permanentSlashRedirect(response, url) {
  if (response.status !== 307) return null;
  const location = response.headers.get('location');
  if (!location) return null;
  const target = new URL(location, url);
  if (target.origin !== url.origin || !canonicalPaths(url.pathname).includes(target.pathname)) return null;
  return new Response(null, { status: 301, headers: new Headers(response.headers) });
}

/** Serves a request from the static build. */
export async function serveAsset(request, env) {
  const response = await env.ASSETS.fetch(request);
  return permanentSlashRedirect(response, new URL(request.url)) ?? response;
}

/**
 * Structured error responses (RFC 9457 `application/problem+json`).
 *
 * The `/~*` routes are the site's only programmatic surface, so they are what an
 * agent probing for an API will hit. A plain-text "Not Found" body tells it
 * nothing it can act on; a typed problem object gives it a stable `code` to
 * branch on and a `resolution` describing what to do differently.
 *
 * Every route handler should return errors through this helper. An agent that
 * learns the shape once should not have to re-learn it per endpoint — that
 * consistency is most of the value.
 */
export function problem({ status, code, title, detail, resolution, headers = {} }) {
  return new Response(
    JSON.stringify({
      type: `https://developer.mozilla.org/docs/Web/HTTP/Status/${status}`,
      title,
      status,
      code,
      detail,
      ...(resolution && { resolution }),
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/problem+json; charset=utf-8',
        'Cache-Control': 'no-store',
        ...headers,
      },
    },
  );
}

/**
 * Simple Hello World handler
 * Route: /~/hey
 */
export async function handleHey(request, ctx) {
  return new Response('Hello!', {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
  });
}

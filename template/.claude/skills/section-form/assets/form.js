/**
 * EXAMPLE - DO NOT COPY DIRECTLY
 * This is a reference implementation. Adapt to your needs.
 *
 * Form submission handler for Cloudflare Workers
 * Routes: /~/form-{form-name}
 */
export async function handleForm(request, ctx) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const url = new URL(request.url);
  const formName = url.pathname.replace('/~/form-', '');

  try {
    const data = await request.json();
    console.log(`Form submission [${formName}]:`, data);

    // TODO: Add your storage/email logic here
    // Examples:
    // - await env.FORMS_KV.put(`${formName}:${Date.now()}`, JSON.stringify(data));
    // - await sendEmail(data);
    // - await env.DB.prepare('INSERT INTO submissions ...').run();

    return new Response(JSON.stringify({ success: true, form: formName }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error(`Form error [${formName}]:`, error);
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

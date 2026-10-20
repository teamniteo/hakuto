/**
 * worker/form.js — form submission handler for /~/form-<name>.
 *
 * Validates the body with the same Zod schema the form island uses (imported
 * from src/lib; wrangler bundles zod), then hands the clean data to a
 * destination. Errors go through problem() like every other worker route.
 * No CORS header: the form posts from the same origin, and an open
 * `Access-Control-Allow-Origin: *` would only invite cross-site spam.
 */
import { problem } from './problem.js';
import { contactSchema } from '../src/lib/contact-schema';

/**
 * One schema per form. The key is what follows /~/form- in the URL, so
 * /~/form-contact validates against contactSchema.
 * @type {Record<string, import('zod').ZodType>}
 */
const SCHEMAS = {
  contact: contactSchema,
};

export async function handleForm(request, env, ctx) {
  const formName = new URL(request.url).pathname.replace(/^\/~\/form-/, '').replace(/\/$/, '');
  const schema = Object.hasOwn(SCHEMAS, formName) ? SCHEMAS[formName] : undefined;

  if (!schema) {
    return problem({
      status: 404,
      code: 'form_not_found',
      title: 'Not Found',
      detail: `No form named "${formName}" is registered.`,
      resolution: `POST to one of: ${Object.keys(SCHEMAS).map((n) => `/~/form-${n}`).join(', ')}.`,
    });
  }

  if (request.method !== 'POST') {
    return problem({
      status: 405,
      code: 'method_not_allowed',
      title: 'Method Not Allowed',
      detail: `${request.method} is not supported on this form endpoint.`,
      resolution: 'Send the submission as a POST with a JSON body.',
      headers: { Allow: 'POST' },
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return problem({
      status: 400,
      code: 'invalid_json',
      title: 'Bad Request',
      detail: 'The request body is not valid JSON.',
      resolution: 'Send Content-Type: application/json with a JSON object body.',
    });
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return problem({
      status: 422,
      code: 'validation_failed',
      title: 'Unprocessable Content',
      detail: result.error.issues
        .map((issue) => `${issue.path.join('.') || '(body)'}: ${issue.message}`)
        .join('; '),
      resolution: 'Correct the listed fields and submit again.',
    });
  }

  const submission = {
    form: formName,
    receivedAt: new Date().toISOString(),
    data: result.data,
  };

  // TODO: submissions are not stored or sent anywhere yet — this only logs them,
  // and logs are off in wrangler.toml. Pick a destination (SKILL.md "Where
  // submissions go"). KV example, needs the FORMS_KV binding:
  //
  // await env.FORMS_KV.put(
  //   `${formName}:${submission.receivedAt}:${crypto.randomUUID()}`,
  //   JSON.stringify(submission),
  // );
  console.log('Form submission', submission);

  return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
}

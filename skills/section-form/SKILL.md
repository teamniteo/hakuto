---
name: section-form
description: Adds a working form to a Hakuto site — a React island validated with Zod, posting to a Cloudflare Worker route that re-validates and delivers the submission. Use for "add a form", "contact form", "newsletter signup", "inquiry form", "booking form", "feedback form", "registration form", "waitlist". Skip for mailto: links, forms posting to Formspree or Netlify Forms, mock-up forms, testing an existing form (`agent-browser`), restyling one (`website-builder`), or rewriting its labels and button text (`professional-copywriter`).
---

# Form Section

Adds an accessible, validated form as a React island that submits JSON to
`/~/form-<name>`, where a worker handler validates it again and delivers it somewhere real.

Pages and layouts stay `.astro`; the form island is the sanctioned exception to the site's
"no `.tsx`" rule, because per-field validation state needs React. The rest of the page stays
static HTML.

## Why this stack

- **React island over a plain HTML form**: per-field errors, validate-on-blur and
  conditional fields need state; vanilla forms need hand-written DOM wiring for the same.
- **react-hook-form + shadcn `ui/form` over a hand-rolled field kit**: the scaffold already
  ships `react-hook-form`, `@hookform/resolvers` and `src/components/ui/form.tsx`. Its
  `<FormControl>` assigns each control an id, `aria-invalid` and `aria-describedby`, and
  `<FormLabel>` points `htmlFor` at it — so label and error wiring is correct for inputs,
  textareas and checkboxes without per-field bookkeeping. Don't add shadcn's separate `field`
  component as well; two field systems in one site is the inconsistency to avoid.
- **One Zod schema, used twice**: the schema lives in `src/lib/<name>-schema.ts`. The island
  validates with it for instant feedback; the worker imports the same file and validates
  again, because client checks can be bypassed with a single `curl`.
- **Worker route over `mailto:` or third-party form services**: server-side validation,
  room for anti-spam (rate limiting, Turnstile), structured delivery to email, storage or a
  CRM, and secrets that never reach the browser.

## Workflow

```
Form Integration:
- [ ] Step 1: Confirm dependencies
- [ ] Step 2: Decide where submissions go
- [ ] Step 3: Write the schema
- [ ] Step 4: Write the form island
- [ ] Step 5: Add the worker handler and route
- [ ] Step 6: Place the island on the page
- [ ] Step 7: Test on the preview server
- [ ] Step 8: Verify and report
```

### Step 1: Confirm dependencies

The scaffold already ships everything this skill uses: `zod` (v4), `sonner`,
`react-hook-form`, `@hookform/resolvers`, and the shadcn primitives `form`, `input`,
`textarea`, `label`, `button`, `select`, `checkbox` and `sonner` in `src/components/ui/`.
Check `package.json` and `src/components/ui/`; install only what is genuinely missing on an
older site (`bun add <pkg>`, `bunx --bun shadcn@latest add <component>`). Don't pass
`--overwrite` — it replaces primitives the site may have customised.

### Step 2: Decide where submissions go

Ask the user before writing the handler: "Where should submissions go — an email inbox, a
spreadsheet or CRM, or stored for you to read later?" Common destinations:

| Destination | How | Needs |
|---|---|---|
| Email | `fetch` to a transactional email API (Resend, Postmark, MailChannels) | API key as a secret: `wrangler secret put RESEND_API_KEY` |
| Cloudflare KV | `env.FORMS_KV.put(...)` — see below | KV namespace + binding |
| Cloudflare D1 | `env.DB.prepare('INSERT …').bind(…).run()` | D1 database + binding + table |
| CRM / Zapier / Slack | `fetch` to the webhook URL | Webhook URL as a secret |

If the user doesn't know yet, keep the logging stub, leave the `TODO:` comment at the top of
the form component in `src/` (`prelaunch-checklist` flags it), and tell the user plainly:
**submissions are not stored or sent anywhere yet** — worker logs are off in `wrangler.toml`,
so anything submitted before a destination is wired is lost.

**KV example.** Create the namespace with `bunx wrangler kv namespace create FORMS_KV`, then
add the binding it prints to `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "FORMS_KV"
id = "<id printed by the create command>"
```

In `worker/form.js`, replace the `console.log` with:

```js
await env.FORMS_KV.put(
  `${formName}:${submission.receivedAt}:${crypto.randomUUID()}`,
  JSON.stringify(submission),
);
```

List what arrived with `bunx wrangler kv key list --binding FORMS_KV --remote`.

### Step 3: Write the schema

Copy `assets/lib/contact-schema.ts` to `src/lib/<name>-schema.ts` and adapt the fields.
Zod 4 syntax:

- `z.email("…")`, not the deprecated `z.string().email()`
- Errors are on `result.error.issues`; `.errors` no longer exists
- Import from `"zod"` (not `astro/zod` — the worker bundle has no Astro)

### Step 4: Write the form island

Copy `assets/ContactForm.tsx` to `src/components/<Name>Form.tsx` and adapt fields, labels and
the endpoint (`/~/form-<name>`). Keep:

- `useForm({ resolver: zodResolver(schema), mode: "onTouched" })` — validates a field on blur,
  then live while the user corrects it
- One `<FormField>` per field with `<FormItem>`, `<FormLabel>`, `<FormControl>`,
  `<FormMessage>`; add `autoComplete` on name, email, phone and address inputs
- `noValidate` on `<form>`, so Zod's messages replace the browser's
- The `Toaster` from `@/components/ui/sonner` — the theme-aware wrapper, not sonner's raw
  export. One Toaster per page: if another island on the page already renders one, drop
  this one; `toast()` reaches whichever Toaster is mounted

**Checkbox:** wrap `<Checkbox>` in `<FormControl>` and put `<FormLabel>` beside it inside the
same `<FormItem>`, as the example does — that gives the label `htmlFor` and the checkbox a
matching `id`, so clicking the text toggles it and screen readers announce it. Map
`onCheckedChange={(v) => field.onChange(v === true)}`.

**Select:** Radix Select is a compound component, so it must live inside the island (never as
separate pieces in `.astro`). Put `<FormControl>` around `<SelectTrigger>`:

```tsx
<FormField control={form.control} name="topic" render={({ field }) => (
  <FormItem>
    <FormLabel>Topic</FormLabel>
    <Select onValueChange={field.onChange} value={field.value}>
      <FormControl>
        <SelectTrigger><SelectValue placeholder="Choose a topic" /></SelectTrigger>
      </FormControl>
      <SelectContent>
        <SelectItem value="sales">Sales</SelectItem>
        <SelectItem value="support">Support</SelectItem>
      </SelectContent>
    </Select>
    <FormMessage />
  </FormItem>
)} />
```

Labels, helper text and button text in the example are placeholders; hand real wording to
`professional-copywriter` if the user wants it polished.

### Step 5: Add the worker handler and route

Copy `assets/form.js` to `worker/form.js`. It:

- takes `(request, env, ctx)` like every route handler, so bindings and secrets are on `env`
- maps the URL suffix to a schema in `SCHEMAS` — add each new form's schema there, imported
  by relative path (`../src/lib/<name>-schema`; the `@/` alias does not exist in the worker
  bundle)
- answers through `problem()`: 404 unknown form, 405 non-POST (with `Allow: POST`), 400
  malformed JSON, 422 failed validation with the issue list in `detail`
- sends no `Access-Control-Allow-Origin` header — the form is same-origin, and an open CORS
  policy only invites cross-site spam

Register the route in `worker/index.js`:

```js
import { handleForm } from './form.js';

const ROUTES = {
  // ...existing routes
  '/~/form-': { handler: handleForm, description: 'Form Handler' },
};
```

### Step 6: Place the island on the page

```astro
---
import { ContactForm } from "@/components/ContactForm";
---
<section class="py-16 px-4">
  <div class="max-w-md mx-auto">
    <h2 class="text-3xl font-bold text-center mb-8">Get in touch</h2>
    <ContactForm client:visible />
  </div>
</section>
```

Use `client:visible` for forms below the fold (footer newsletter, contact form at the end of a
page) — hydration waits until the form scrolls into view. Use `client:load` only when the form
is in the first viewport.

### Step 7: Test on the preview server

Worker routes don't run under `bun run dev` — it is plain `astro dev` with no worker, so every
`/~/` path returns Astro's 404. Run `bun run preview` (builds, then serves the site and worker
on `http://127.0.0.1:8787`) and check:

```sh
curl -s -X POST http://127.0.0.1:8787/~/form-contact \
  -H 'content-type: application/json' \
  -d '{"name":"Ada","email":"ada@example.com","message":"Testing the form","consent":true}'
# → {"ok":true}
curl -s -X POST http://127.0.0.1:8787/~/form-contact \
  -H 'content-type: application/json' -d '{"email":"nope"}'
# → 422 problem+json listing each failing field
```

For an end-to-end pass in a real browser (fill, submit, toast, console errors, axe), use
`agent-browser`. Run `bun run check` before finishing.

### Step 8: Verify and report

Tell the user:

```
Form added: <Name>Form on <page> → POST /~/form-<name>
Submissions go to: <destination>   — or: not stored yet (logging stub only)
Schema: src/lib/<name>-schema.ts (shared by the island and worker/form.js)
Remaining TODOs: <list, e.g. destination, helper text>
Tested: bun run preview — valid → 200, invalid → 422
```

Mention that `prelaunch-checklist` Check 4 audits form wiring before launch and flags a
handler that only logs.

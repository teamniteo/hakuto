---
name: section-form
description: Adds forms to Astro pages using React with Zod validation. Use when user requests "add form", "contact form", "newsletter signup", "inquiry form", "booking form", "feedback form", "registration form", "waitlist", or any form functionality requiring client-side validation and server submission.
---

# Form Section

Adds accessible, validated forms using React state + Zod. Forms work as React islands with `client:load`. Submits to `/~/form-{name}` worker endpoint.

## Workflow

1. Install deps: `bun add zod sonner`
2. Install shadcn: `bunx --bun shadcn@latest add input textarea label button --overwrite`
3. Create `src/components/ui/field.tsx` (see `assets/field.tsx` - adapt styling)
4. Create `worker/form.js` handler (see `assets/form.js` - adapt logic)
5. Register route in `worker/index.js`
6. Create form component (see `assets/ContactForm.tsx` - adapt fields)
7. Add to page with `client:load`

## Worker Setup

Create `worker/form.js` based on `assets/form.js`, then register in `worker/index.js`:

```js
import { handleForm } from './form.js';

const ROUTES = {
  // ... existing routes
  '/~/form-': { handler: handleForm, description: 'Form Handler' },
};
```

## Usage in Astro

```astro
---
import { ContactForm } from "@/components/ContactForm"
---
<section class="py-16 px-4">
  <div class="max-w-md mx-auto">
    <h2 class="text-3xl font-bold text-center mb-8">Get in Touch</h2>
    <ContactForm client:load />
  </div>
</section>
```

## Field Pattern

For additional fields, use standard React controlled inputs with the Field UI components:

```tsx
const [values, setValues] = useState({ fieldName: "" })
const [errors, setErrors] = useState<Record<string, string>>({})

<Field data-invalid={!!errors.fieldName}>
  <FieldLabel htmlFor="fieldName">Label</FieldLabel>
  <Input
    id="fieldName"
    value={values.fieldName}
    onBlur={() => validateField("fieldName")}
    onChange={(e) => setValues(v => ({ ...v, fieldName: e.target.value }))}
    aria-invalid={!!errors.fieldName}
  />
  {errors.fieldName && <FieldError message={errors.fieldName} />}
</Field>
```

## Additional Field Types

**Select**: `bunx --bun shadcn@latest add select --overwrite`
```tsx
<Select value={values.option} onValueChange={(v) => setValues(s => ({ ...s, option: v }))}>
  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
  <SelectContent><SelectItem value="opt1">Option</SelectItem></SelectContent>
</Select>
```

**Checkbox**: `bunx --bun shadcn@latest add checkbox --overwrite`
```tsx
<Field orientation="horizontal">
  <Checkbox
    checked={values.agree}
    onCheckedChange={(v) => setValues(s => ({ ...s, agree: !!v }))}
  />
  <FieldLabel>I agree to terms</FieldLabel>
</Field>
```

## Validation

Zod schemas validate on submit and optionally on blur:

```tsx
const schema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Invalid email"),
})

// Validate single field (for onBlur)
function validateField(name: string) {
  const fieldSchema = schema.shape[name]
  const result = fieldSchema.safeParse(values[name])
  setErrors(e => ({
    ...e,
    [name]: result.success ? "" : result.error.errors[0].message,
  }))
}

// Validate all fields (for onSubmit)
function validateAll() {
  const result = schema.safeParse(values)
  if (!result.success) {
    const fieldErrors: Record<string, string> = {}
    result.error.errors.forEach(e => {
      if (e.path[0]) fieldErrors[String(e.path[0])] = e.message
    })
    setErrors(fieldErrors)
    return false
  }
  setErrors({})
  return true
}
```

## Accessibility

- `aria-invalid` on inputs
- `data-invalid` on Field wrapper
- `role="alert"` on errors
- `htmlFor`/`id` associations
- `autoComplete` attributes

## Assets

- `assets/field.tsx` - Field components (Field, FieldLabel, FieldError, etc.)
- `assets/form.js` - Worker handler example
- `assets/ContactForm.tsx` - Complete contact form example

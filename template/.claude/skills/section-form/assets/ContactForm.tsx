/**
 * EXAMPLE - DO NOT COPY DIRECTLY
 * This is a reference implementation for a contact form.
 * Adapt fields, validation, and styling to your needs.
 */
import { useState } from "react"
import { toast, Toaster } from "sonner"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(50),
  email: z.string().email("Please enter a valid email address."),
  message: z.string().min(10, "Message must be at least 10 characters.").max(500),
})

type FormValues = z.infer<typeof formSchema>
type FormErrors = Partial<Record<keyof FormValues, string>>

export function ContactForm() {
  const [values, setValues] = useState<FormValues>({ name: "", email: "", message: "" })
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({})
  const [submitting, setSubmitting] = useState(false)

  function set<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }))
    if (touched[key]) validateField(key, value)
  }

  function blur(key: keyof FormValues) {
    setTouched((t) => ({ ...t, [key]: true }))
    validateField(key, values[key])
  }

  function validateField(key: keyof FormValues, value: unknown) {
    const result = formSchema.shape[key].safeParse(value)
    setErrors((e) => ({
      ...e,
      [key]: result.success ? undefined : result.error.errors[0].message,
    }))
  }

  function validateAll(): boolean {
    const result = formSchema.safeParse(values)
    if (!result.success) {
      const fieldErrors: FormErrors = {}
      result.error.errors.forEach((e) => {
        const key = e.path[0] as keyof FormValues
        if (key && !fieldErrors[key]) fieldErrors[key] = e.message
      })
      setErrors(fieldErrors)
      setTouched({ name: true, email: true, message: true })
      return false
    }
    setErrors({})
    return true
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validateAll()) return

    setSubmitting(true)
    try {
      const res = await fetch("/~/form-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error("Failed")
      toast.success("Message sent!")
      setValues({ name: "", email: "", message: "" })
      setTouched({})
      setErrors({})
    } catch {
      toast.error("Failed to send. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Toaster position="top-center" richColors />
      <form onSubmit={handleSubmit} className="space-y-6">
        <FieldGroup>
          <Field data-invalid={touched.name && !!errors.name}>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input
              id="name"
              value={values.name}
              onBlur={() => blur("name")}
              onChange={(e) => set("name", e.target.value)}
              aria-invalid={touched.name && !!errors.name}
              placeholder="Your name"
              autoComplete="name"
            />
            {touched.name && errors.name && <FieldError message={errors.name} />}
          </Field>

          <Field data-invalid={touched.email && !!errors.email}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              value={values.email}
              onBlur={() => blur("email")}
              onChange={(e) => set("email", e.target.value)}
              aria-invalid={touched.email && !!errors.email}
              placeholder="you@example.com"
              autoComplete="email"
            />
            {touched.email && errors.email && <FieldError message={errors.email} />}
          </Field>

          <Field data-invalid={touched.message && !!errors.message}>
            <FieldLabel htmlFor="message">Message</FieldLabel>
            <Textarea
              id="message"
              value={values.message}
              onBlur={() => blur("message")}
              onChange={(e) => set("message", e.target.value)}
              aria-invalid={touched.message && !!errors.message}
              placeholder="How can we help?"
              className="min-h-[120px]"
            />
            <FieldDescription>We'll get back to you within 24 hours.</FieldDescription>
            {touched.message && errors.message && <FieldError message={errors.message} />}
          </Field>
        </FieldGroup>

        <Button type="submit" className="w-full cursor-pointer" disabled={submitting}>
          {submitting ? "Sending..." : "Send Message"}
        </Button>
      </form>
    </>
  )
}

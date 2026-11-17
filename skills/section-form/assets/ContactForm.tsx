// src/components/ContactForm.tsx — example contact form island.
// Adapt fields, labels and the endpoint name; keep the structure.
//
// Built on what the scaffold already ships: react-hook-form + zodResolver and
// shadcn's ui/form.tsx. <FormControl> gives each control its id, aria-invalid and
// aria-describedby, and <FormLabel> points htmlFor at it — so labels, errors and
// descriptions are wired for every field type, checkboxes included.
//
// TODO: submissions are not stored or sent anywhere yet — worker/form.js only
// logs them. Wire a destination (SKILL.md "Where submissions go") and delete
// this comment.
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/sonner";
import { contactSchema, type ContactValues } from "@/lib/contact-schema";

const EMPTY: ContactValues = { name: "", email: "", message: "", consent: false };

// Shown when the server fails, so the visitor still has a way to reach you.
const FALLBACK_CONTACT = "TODO: support@your-domain";

/**
 * Turn a failed response into a sentence the visitor can act on. The worker
 * answers every error as problem+json ({ status, code, detail, resolution },
 * see worker/problem.js); the status and code go into the message so a
 * visitor who reports the problem gives you something to look up.
 */
async function describeFailure(res: Response): Promise<string> {
  const problem = (await res.json().catch(() => null)) as { code?: string; detail?: string } | null;
  console.error("Form submission failed", res.status, problem);
  const ref = problem?.code ? `${res.status} ${problem.code}` : String(res.status);
  if (res.status === 422 && problem?.detail) {
    return `Please check your entries: ${problem.detail}`;
  }
  if (res.status === 429) {
    return "Too many submissions from your connection. Wait a minute and try again.";
  }
  if (res.status >= 500) {
    return `Our server couldn't process your message (error ${ref}). Try again in a few minutes, or email ${FALLBACK_CONTACT}.`;
  }
  return `Your message was rejected (error ${ref}). Reload the page and try again, or email ${FALLBACK_CONTACT}.`;
}

export function ContactForm() {
  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: EMPTY,
    // Validate a field when it loses focus, then live while the user fixes it.
    mode: "onTouched",
  });

  async function onSubmit(values: ContactValues) {
    let res: Response;
    try {
      res = await fetch("/~/form-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
    } catch (error) {
      // fetch only throws when no response arrived: offline, DNS, blocked request.
      console.error("Form submission failed", error);
      form.setError("root.server", {
        message: "Couldn't reach our server. Check your connection and try again.",
      });
      return;
    }
    if (!res.ok) {
      // An inline error, not a toast: it stays until the next submit, so the
      // visitor can read it, and role="alert" announces it to screen readers.
      form.setError("root.server", { message: await describeFailure(res) });
      return;
    }
    toast.success("Message sent. We'll reply by email.");
    form.reset(EMPTY);
  }

  const { isSubmitting, errors } = form.formState;

  return (
    <>
      {/* Theme-aware Toaster. Keep one per page: if another island on the page
          already renders one, delete this — toast() reaches any mounted Toaster. */}
      <Toaster position="top-center" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input autoComplete="name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea className="min-h-[120px]" {...field} />
                </FormControl>
                <FormDescription>TODO: when you reply, e.g. "We reply within one business day."</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="consent"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-start gap-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(v) => field.onChange(v === true)}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormLabel className="font-normal leading-snug">
                    I agree to be contacted about this message.
                  </FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {errors.root?.server && (
            <p role="alert" className="text-sm text-destructive">
              {errors.root.server.message}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Sending…" : "Send message"}
          </Button>
        </form>
      </Form>
    </>
  );
}

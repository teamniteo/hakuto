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

export function ContactForm() {
  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: EMPTY,
    // Validate a field when it loses focus, then live while the user fixes it.
    mode: "onTouched",
  });

  async function onSubmit(values: ContactValues) {
    try {
      const res = await fetch("/~/form-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success("Message sent. We'll reply by email.");
      form.reset(EMPTY);
    } catch {
      toast.error("Couldn't send your message. Please try again.");
    }
  }

  const { isSubmitting } = form.formState;

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

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Sending…" : "Send message"}
          </Button>
        </form>
      </Form>
    </>
  );
}

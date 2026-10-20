// src/lib/contact-schema.ts — the one definition of a valid submission.
// The form island validates with it before sending, and worker/form.js validates
// with it again on arrival (wrangler bundles zod into the worker), so client and
// server can never disagree about what is allowed.
// Name the file after the form: src/lib/<name>-schema.ts.
import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(100),
  email: z.email("Please enter a valid email address."),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters.")
    .max(5000, "Message must be 5000 characters or fewer."),
  consent: z.boolean().refine((v) => v, "Please agree so we can reply to you."),
});

export type ContactValues = z.infer<typeof contactSchema>;

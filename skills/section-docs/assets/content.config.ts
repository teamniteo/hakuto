// src/content.config.ts — merge the `docs` collection into the existing file;
// do not drop collections that are already there (e.g. `blog`). Create the file
// from this one only if it does not exist yet.
import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const docs = defineCollection({
  // The category is the folder: `getting-started/installation.md` is category
  // `getting-started` at /docs/getting-started/installation/. There is no
  // `category` field, so the URL and the sidebar group can never disagree.
  // Do not add `index.md` inside a category folder — the loader strips `/index`
  // from the id, so the page would lose its category.
  loader: glob({ pattern: "**/*.md", base: "./src/content/docs" }),
  schema: z.object({
    title: z.string(),
    // Meta description, docs-home card text and the line under the page title.
    description: z.string(),
    // Position inside its category (sidebar and previous/next). Lower comes
    // first; pages without `order` follow the numbered ones, sorted by title.
    // Category order lives in `CATEGORIES` in src/lib/docs.ts, not here.
    order: z.number().optional(),
    // Shorter sidebar text when the title is long.
    sidebarLabel: z.string().optional(),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = { /* ...existing collections, */ docs };

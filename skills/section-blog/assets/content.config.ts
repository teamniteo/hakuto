// src/content.config.ts — merge the `blog` collection into the existing file;
// do not drop collections that are already there (e.g. `docs`).
import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      // The glob loader uses `slug` as the entry id. Two posts with the same slug
      // do not fail the build — the later one silently replaces the earlier.
      slug: z
        .string()
        .regex(
          /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/,
          "slug must be lowercase alphanumeric segments joined by single hyphens or underscores",
        ),
      date: z.coerce.date(),
      author: z.string(),
      authorEmail: z.email(),
      authorBio: z.string().optional(),
      // Where the byline links to: an author page, an /about/ anchor, or a profile.
      authorUrl: z.string().optional(),
      category: z.string(),
      // SEO meta, OpenGraph, JSON-LD, RSS and card previews.
      description: z.string(),
      // Relative to the post file, e.g. "./_images/cover.jpg". `image()` puts it
      // through the asset pipeline; a plain string would ship the original.
      featuredImage: image().optional(),
      draft: z.boolean().optional().default(false),
    }),
});

export const collections = { /* ...existing collections, */ blog };

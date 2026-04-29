---
name: section-blog
description: Adds multi-page blog system to existing websites with listing page, post templates, author archives, and category pages. Supports flexible content layouts beyond single-column text. Use when user requests "add blog", "add articles section", "add news", or mentions blog functionality. Skip for headless CMS integrations (Contentful, Sanity, Strapi), single one-off articles embedded in existing pages, or sites already using a different content collection setup.
---

# Blog Section

Adds professional blog system to existing websites with listing pages, post templates, and author boxes. Requires existing site with `src/index.css` theme variables.

---

## Integration Workflow

Copy this checklist and track progress:

```
Blog Integration:
- [ ] Step 1: Read index.css and AGENTS.md
- [ ] Step 2: Assess content needs
- [ ] Step 3: Create blog pages
```

### Step 1: Read Site Design

Read `src/index.css` and `AGENTS.md` to extract:
- Brand colors and typography from `@theme {}` block
- Custom CSS variables from `@layer base {}`
- Existing navigation structure

### Step 2: Assess Content Needs

> **Why no `professional-copywriter` for blog posts?** Blog content is the user's own voice — case studies, release notes, opinion pieces. Generated marketing copy would flatten that voice and force the user to rewrite from scratch. A neutral placeholder is faster to replace than polished prose pointing in the wrong direction.

**No articles exist:**
- Create 1 placeholder post with generic text
- Do NOT invoke `professional-copywriter` (see note above)
- Tell user: "Created a sample post. Replace with your content."

**Existing articles provided:**
- Format according to design language

**User wants new post:**
- Ask for: Title, slug, date, author, authorEmail
- Optional: authorBio, category, featured image, description
- Use generic placeholder text if no content provided
- Do NOT invoke `professional-copywriter` (see note above)

### Step 3: Create Blog Pages

Generate pages matching site's design using Astro content collections:

**Required files:**
- `src/content.config.ts` - Add blog collection (preserve existing collections)
- `src/content/blog/*.md` - Blog post markdown files (NO `layout` frontmatter)
- `src/pages/blog/index.astro` - Blog listing (uses `getCollection()`)
- `src/pages/blog/[...slug].astro` - Dynamic post pages with layout, author box, and content styling

Update navigation with Blog link at appropriate position.

---

## Astro Content Layer API (gotchas)

A few Astro 5+ content-layer behaviors that bite if you assume the older `getEntryBySlug` API:

- **`layout` frontmatter is ignored** by the content-layer glob loader. Apply all layout + styling directly in `src/pages/blog/[...slug].astro` rather than creating per-post layout files.
- **`post.render()` no longer exists.** Import `render` from `astro:content` and call `render(post)`:

  ```astro
  ---
  import { getCollection, render } from "astro:content";

  const { post } = Astro.props;
  const { Content } = await render(post);
  ---
  <Content />
  ```

- **Stale collection cache** after adding/removing posts can leave routes 404ing. Clear it with `rm -f .astro/data-store.json` and restart the dev server.

---

## Typography: Use Site Theme Variables, NOT Tailwind Prose

**Do NOT use `@tailwindcss/typography` or `.prose` classes.** They produce poor contrast on dark themes and fight with the site's design system.

Instead, style blog content with custom CSS using the site's own CSS variables from `index.css`. This ensures blog posts match the rest of the site exactly.

**Style blog content using a `.blog-content` wrapper with `is:global` styles.** The full stylesheet lives in `assets/blog-content.css` — copy it verbatim into a `<style is:global>` block on `[...slug].astro`, or import it as a global stylesheet. Wrap the rendered `<Content />` in an element with `id="blog-content"` and `class="blog-content"`.

The stylesheet is plain CSS using the site's HSL theme variables (`--heading`, `--foreground`, `--primary`, `--muted-foreground`, `--secondary`, `--accent-foreground`, `--border`), so it adapts automatically to the site's light/dark theme without changes.

**Key theme variables used:**
- `--heading` for headings, bold, table headers
- `--foreground` for body text
- `--primary` for links, accents
- `--muted-foreground` for secondary text, blockquotes
- `--secondary` for code backgrounds
- `--border` for borders, dividers

---

## Content Collection Schema

Add blog collection to existing `src/content.config.ts` (preserve any existing collections like docs):

```typescript
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    date: z.coerce.date(),
    author: z.string(),
    authorEmail: z.string().email(),
    authorBio: z.string().optional(),
    category: z.string(),
    description: z.string(),
    image: z.string().optional(),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = { /* ...existing collections, */ blog };
```

## Blog Post Frontmatter

**Do NOT include `layout` in frontmatter.** It does not work with the content layer.

```markdown
---
title: "Article Title"
slug: "article-title"
date: "2025-01-20"
author: "Author Name"
authorEmail: "author@example.com"
authorBio: "Short author bio for the author box."
category: "Category"
description: "Meta description for SEO"
draft: false
---

Content here...
```

---

## Author Box with Gravatar

Every blog post includes an author box at the bottom with a Gravatar avatar. Use `node:crypto` to MD5 hash the email at build time.

> **Why a plain `<img>` instead of `<Picture>`?** Gravatar URLs are external CDN-served images outside Astro's asset pipeline. `<Picture>`/`<Image>` only optimize local imports (`@/assets/...`); for external URLs they pass through unchanged, so using `<img>` directly keeps the markup simpler without losing optimization.

```astro
---
import { createHash } from "node:crypto";

const emailHash = createHash("md5")
  .update(post.data.authorEmail.trim().toLowerCase())
  .digest("hex");
const gravatarUrl = `https://gravatar.com/avatar/${emailHash}?s=160`;
---

<!-- Author box -->
<div class="mt-16 pt-8 border-t border-border">
  <div class="flex items-start gap-4">
    <img
      src={gravatarUrl}
      alt={post.data.author}
      width="64"
      height="64"
      loading="lazy"
      class="rounded-full shrink-0"
    />
    <div>
      <p class="font-mono font-semibold text-heading text-sm">{post.data.author}</p>
      {post.data.authorBio && (
        <p class="text-sm text-muted-foreground mt-1 leading-relaxed">{post.data.authorBio}</p>
      )}
    </div>
  </div>
</div>
```

---

## External Links in New Tab

Markdown does not support `target="_blank"`. Two options:

**Preferred — `rehype-external-links` (build-time, no JS shipped):**

```js
// astro.config.mjs
import rehypeExternalLinks from "rehype-external-links";

export default defineConfig({
  markdown: {
    rehypePlugins: [
      [rehypeExternalLinks, { target: "_blank", rel: ["noopener", "noreferrer"] }],
    ],
  },
});
```

This rewrites links during MDX/Markdown compile, so no client JS runs and external behaviour is correct on first paint. Add the plugin to your dependencies.

**Fallback — runtime script (if you can't add a build dep):**

```html
<script>
  document.querySelectorAll("#blog-content a").forEach((a) => {
    if (a instanceof HTMLAnchorElement && a.hostname !== location.hostname) {
      a.target = "_blank";
      a.rel = "noreferrer";
    }
  });
</script>
```

Give the content wrapper an `id="blog-content"` for the selector. Note: this ships JS for one DOM operation and runs after hydration, so links briefly behave as same-tab links until the script executes.

---

## Quality Checklist

Before completing:

- Read `src/index.css` and `AGENTS.md` for site context
- Blog content styled with site theme variables (NOT Tailwind prose) — use `hsl(var(--heading))`, `hsl(var(--foreground))`, etc., never hardcode hex colors
- Brand colors and typography from `index.css` respected
- Navigation updated with blog link (placement: where user specifies, or after Docs if unspecified)
- Author box with Gravatar on post pages (every post has `authorEmail`, optional `authorBio`)
- External links open in new tab (preferred: `rehype-external-links`; fallback: runtime script)
- Used `render(post)` from `astro:content` (NOT `post.render()`)
- No `layout` frontmatter in markdown files (content layer glob loader ignores it — layout lives in `[...slug].astro`)
- User-provided content used verbatim; generic placeholders only when content missing; never invoke `professional-copywriter` for blog posts
- `AGENTS.md` updated with blog pages
- SEO meta tags included
- Mobile responsive

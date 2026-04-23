---
name: section-blog
description: Adds multi-page blog system to existing websites with listing page, post templates, author archives, and category pages. Supports flexible content layouts beyond single-column text. Use when user requests "add blog", "add articles section", "add news", or mentions blog functionality.
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

**No articles exist:**
- Create 1 placeholder post with generic text
- **DO NOT invoke professional-copywriter**
- Tell user: "Created a sample post. Replace with your content."

**Existing articles provided:**
- Format according to design language

**User wants new post:**
- Ask for: Title, slug, date, author, authorEmail
- Optional: authorBio, category, featured image, description
- Use generic placeholder text if no content provided
- **DO NOT invoke professional-copywriter**

### Step 3: Create Blog Pages

Generate pages matching site's design using Astro content collections:

**Required files:**
- `src/content.config.ts` - Add blog collection (preserve existing collections)
- `src/content/blog/*.md` - Blog post markdown files (NO `layout` frontmatter)
- `src/pages/blog/index.astro` - Blog listing (uses `getCollection()`)
- `src/pages/blog/[...slug].astro` - Dynamic post pages with layout, author box, and content styling

Update navigation with Blog link at appropriate position.

---

## Critical: Astro Content Layer API

**CRITICAL**: The `layout` frontmatter property does NOT work with Astro's content layer glob loader. Do NOT create separate layout files for blog posts. Instead, apply all layout and styling directly in `src/pages/blog/[...slug].astro`.

**CRITICAL**: In Astro 5+ with content layer, `post.render()` does not exist. Use `render(post)` imported from `astro:content`:

```astro
---
import { getCollection, render } from "astro:content";

const { post } = Astro.props;
const { Content } = await render(post);
---
<Content />
```

**CRITICAL**: After adding or removing blog posts, the content collection cache may be stale. Clear it with: `rm -f .astro/data-store.json`

---

## Typography: Use Site Theme Variables, NOT Tailwind Prose

**Do NOT use `@tailwindcss/typography` or `.prose` classes.** They produce poor contrast on dark themes and fight with the site's design system.

Instead, style blog content with custom CSS using the site's own CSS variables from `index.css`. This ensures blog posts match the rest of the site exactly.

**Style blog content using a `.blog-content` wrapper with `is:global` styles:**

```css
<style is:global>
  .blog-content h2 {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1.3;
    color: hsl(var(--heading));
    margin-top: 2.5rem;
    margin-bottom: 0.75rem;
  }

  .blog-content h3 {
    font-size: 1.2rem;
    font-weight: 600;
    line-height: 1.4;
    color: hsl(var(--heading));
    margin-top: 2rem;
    margin-bottom: 0.5rem;
  }

  .blog-content a {
    color: hsl(var(--primary));
    text-decoration: none;
  }

  .blog-content a:hover {
    text-decoration: underline;
  }

  .blog-content strong {
    color: hsl(var(--heading));
    font-weight: 600;
  }

  .blog-content ul, .blog-content ol {
    padding-left: 1.5rem;
  }

  .blog-content ul { list-style-type: disc; }
  .blog-content ol { list-style-type: decimal; }

  .blog-content li {
    margin-bottom: 0.4rem;
    line-height: 1.7;
  }

  .blog-content img {
    border-radius: 6px;
    border: 1px solid hsl(var(--border));
    margin: 1.5rem 0;
  }

  .blog-content code:not(pre code) {
    font-size: 0.875rem;
    background: hsl(var(--secondary));
    border: 1px solid hsl(var(--border));
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
    color: hsl(var(--accent-foreground));
  }

  .blog-content pre {
    font-size: 0.875rem;
    line-height: 1.6;
    background: hsl(var(--secondary));
    border: 1px solid hsl(var(--border));
    border-radius: 6px;
    padding: 1rem 1.25rem;
    overflow-x: auto;
    margin-bottom: 1.25rem;
    color: hsl(var(--heading));
  }

  .blog-content pre code {
    background: none;
    border: none;
    padding: 0;
    font-size: inherit;
    color: inherit;
  }

  .blog-content blockquote {
    border-left: 3px solid hsl(var(--primary) / 0.4);
    padding: 0.5rem 1rem;
    margin: 1.25rem 0;
    color: hsl(var(--muted-foreground));
  }

  .blog-content blockquote p { margin-bottom: 0; }

  .blog-content hr {
    border: none;
    border-top: 1px solid hsl(var(--border));
    margin: 2rem 0;
  }
</style>
```

**Key theme variables to use:**
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

Every blog post includes an author box at the bottom with a Gravatar avatar. Use `node:crypto` to MD5 hash the email at build time:

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

Markdown does not support `target="_blank"`. Add a script to the post page that opens external links in new tabs:

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

Give the content wrapper an `id="blog-content"` for the selector.

---

## Important Rules

**Content Strategy:**
- User content: Use as-is, preserve exactly
- No content: Generic placeholders only
- Never invoke professional-copywriter for blog posts

**Navigation Integration:**
- Place Blog link where user specifies, or after Docs if not specified

**Design Consistency:**
- Use site's CSS variables from `index.css` — never hardcode colors
- Match the homepage's text contrast and spacing
- Do NOT use Tailwind prose plugin

---

## Quality Checklist

Before completing:

✅ Read `src/index.css` and `AGENTS.md` for site context
✅ Blog content styled with site theme variables (NOT Tailwind prose)
✅ Brand colors and typography from index.css respected
✅ Navigation updated with blog link
✅ Author box with Gravatar on post pages
✅ External links open in new tab via script
✅ Used `render(post)` from `astro:content` (NOT `post.render()`)
✅ No `layout` frontmatter in markdown files
✅ `AGENTS.md` updated with blog pages
✅ SEO meta tags included
✅ Mobile responsive

---

## Key Principles

**No Tailwind Prose**: Style markdown content with custom CSS using site theme variables

**No Layout Frontmatter**: Content layer glob loader ignores it — layout lives in `[...slug].astro`

**Site Consistency**: Use `hsl(var(--heading))`, `hsl(var(--foreground))`, etc. — never hardcode hex colors

**Author Identity**: Every post has authorEmail for Gravatar, optional authorBio

---

*Adds complete blog system to existing websites using site theme variables for consistent design.*

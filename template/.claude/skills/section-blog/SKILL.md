---
name: section-blog
description: Adds multi-page blog system to existing websites with listing page, post templates, author archives, and category pages. Supports flexible content layouts beyond single-column text. Use when user requests "add blog", "add articles section", "add news", or mentions blog functionality.
---

# Blog Section

Adds professional blog system to existing websites with listing pages, post templates, and flexible layouts. Complex multi-page system requiring existing site with `site-specification.md`.

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
- Create 2 placeholder posts with generic text
- Post 1: Standard single-column layout
- Post 2: Flexible layout (full-width sections, columns)
- **DO NOT invoke professional-copywriter**
- Tell user: "Created 2 sample posts. Replace with your content."

**Existing articles provided:**
- Format according to design language
- Ask: "Standard or flexible layouts?"

**User wants new post:**
- Ask for: Title, slug, date, author
- Optional: Category, tags, featured image, description, layout
- Use generic placeholder text if no content provided
- **DO NOT invoke professional-copywriter**

### Step 3: Create Blog Pages

Generate pages matching site's design using Astro content collections:

**Required files:**
- `src/layouts/StandardBlogLayout.astro` - Standard single-column layout component
- `src/layouts/FlexibleBlogLayout.astro` - Flexible full-width layout component
- `src/content.config.ts` - Collection definitions with Zod schemas
- `src/content/blog/*.md` - Blog post markdown files (with `layout` frontmatter)
- `src/pages/blog/index.astro` - Blog listing (uses `getCollection()`)
- `src/pages/blog/[...slug].astro` - Dynamic post pages (uses `getStaticPaths()`)
- `src/pages/blog/author/[name].astro` - Author archives (optional)
- `src/pages/blog/category/[name].astro` - Category pages (optional)

Update navigation with Blog link at appropriate position.

---

## Layout Types

Blog posts use Astro's layout frontmatter property to specify which layout component renders the markdown content.

**Standard Layout** (default): Single column, images inline, 680-720px max-width. Traditional blog post format with centered content column, inline images/media, consistent reading width.

**Flexible Layout**: Mix of full-width and multi-column sections for visual content, tutorials, and feature showcases.

### Implementation

**Step 1: Create Layout Components**

Create two layout files in `src/layouts/`:

**StandardBlogLayout.astro** - Traditional single-column layout with Tailwind Prose:
```astro
---
const { frontmatter } = Astro.props;
---
<Layout title={frontmatter.title}>
  <article class="max-w-[720px] mx-auto px-6">
    <header class="mb-8">
      <h1 class="text-4xl font-bold mb-4">{frontmatter.title}</h1>
      <p class="text-gray-600">{frontmatter.date} • {frontmatter.author}</p>
    </header>
    <div class="prose prose-lg max-w-none">
      <slot />
    </div>
  </article>
</Layout>
```

**FlexibleBlogLayout.astro** - Full-width with Tailwind Prose for content sections:
```astro
---
const { frontmatter } = Astro.props;
---
<Layout title={frontmatter.title}>
  <article class="w-full">
    <header class="max-w-[720px] mx-auto px-6 mb-8">
      <h1 class="text-4xl font-bold mb-4">{frontmatter.title}</h1>
      <p class="text-gray-600">{frontmatter.date} • {frontmatter.author}</p>
    </header>
    <div class="prose prose-lg max-w-[720px] mx-auto px-6">
      <slot />
    </div>
  </article>
</Layout>
```

**Step 2: Use Layout in Markdown Frontmatter**

Specify layout in each blog post's frontmatter:

```markdown
---
layout: ../../layouts/StandardBlogLayout.astro
title: "Getting Started"
date: "2025-01-20"
author: "Dev Team"
---

# Content here

Regular content flows in single column...
```

or

```markdown
---
layout: ../../layouts/FlexibleBlogLayout.astro
title: "Product Launch"
date: "2025-01-20"
author: "Marketing Team"
---

# Content here

Content can use full-width images and flexible sections...
```

**Step 3: Style Content Width and Typography**

Use Tailwind utilities in layout components to control content width and typography:
- Standard: `.max-w-[720px]` on article wrapper, `.prose .prose-lg` for content typography
- Flexible: `.max-w-[720px]` on prose wrapper for text, support for full-width sections when needed

**Tailwind Typography Plugin:**
- **ALWAYS apply `.prose` class** to content containers that render markdown
- Use `.prose-lg` or `.prose-xl` for larger, more readable text
- Prose automatically styles: headings, paragraphs, lists, blockquotes, code blocks, links, images
- Combine with design language: `.prose-slate`, `.prose-gray`, `.prose-zinc`, etc.
- Customize via `index.css` if brand-specific styling needed

**Mobile Behavior:**
- Standard layout: Maintains consistent reading width with padding
- Flexible layout: Text maintains readable width, supports full-width images/sections
- Both layouts: Stack vertically, adjust padding for mobile screens
- Prose classes automatically responsive

---

## Technical Requirements

### Typography Configuration

**Install @tailwindcss/typography plugin** (if not already installed):

```bash
bun add @tailwindcss/typography
```

**Add plugin to `src/index.css`:**

```css
@import 'tailwindcss';
@plugin '@tailwindcss/typography';

@theme {
  /* Brand colors and theme settings */
}
```

**Customize prose styles in `index.css`** (optional):

```css
@layer base {
  .prose {
    --tw-prose-body: theme('colors.gray.700');
    --tw-prose-headings: theme('colors.gray.900');
    --tw-prose-links: theme('colors.blue.600');
    --tw-prose-bold: theme('colors.gray.900');
    --tw-prose-code: theme('colors.pink.600');
  }

  .dark .prose {
    --tw-prose-body: theme('colors.gray.300');
    --tw-prose-headings: theme('colors.white');
    --tw-prose-links: theme('colors.blue.400');
  }
}
```

### Astro Content Collections Setup

**CRITICAL**: Use Astro content collections for type-safe blog management.

**Step 1: Create collection configuration** (`src/content.config.ts`):

```typescript
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    date: z.coerce.date(),
    author: z.string(),
    category: z.string(),
    tags: z.array(z.string()).optional(),
    description: z.string(),
    image: z.string().optional(),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = { blog };
```

**Step 2: Create blog posts** (`src/content/blog/post-name.md`):

```markdown
---
layout: ../../layouts/StandardBlogLayout.astro
title: "Article Title"
slug: "article-title"
date: "2025-01-20"
author: "Author Name"
category: "Category"
tags: ["tag1", "tag2"]
description: "Meta description for SEO"
image: "/images/featured.jpg"
draft: false
---

Content here...

Regular markdown content with standard formatting.
```

For flexible layout posts, use `FlexibleBlogLayout.astro`:

```markdown
---
layout: ../../layouts/FlexibleBlogLayout.astro
title: "Product Launch Announcement"
slug: "product-launch"
date: "2025-01-20"
author: "Marketing Team"
category: "Product Updates"
description: "Announcing our new product features"
draft: false
---

Content with full-width images and flexible sections...
```

**Step 3: Query collections in pages**:

```astro
---
// src/pages/blog/index.astro
import { getCollection } from 'astro:content';

// Get all published posts
const posts = await getCollection('blog', ({ data }) => {
  return data.draft !== true;
});

// Sort by date (newest first)
posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
---
```

**Step 4: Generate dynamic routes** (`src/pages/blog/[...slug].astro`):

```astro
---
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map(post => ({
    params: { slug: post.data.slug },
    props: { post }
  }));
}

const { post } = Astro.props;
const { Content } = await post.render();
---

<Layout title={post.data.title}>
  <article>
    <h1>{post.data.title}</h1>
    <Content />
  </article>
</Layout>
```

---

## Important Rules

**Content Strategy:**
- User content: Use as-is, preserve exactly
- No content: Generic placeholders only
- Never invoke professional-copywriter for blog posts

**Navigation Integration:**
- SaaS: Home | Features | Pricing | **Blog** | Docs | Login
- General: Home | About | Services | **Blog** | Portfolio | Contact

**Layout Options:**
- Standard: Single column, traditional format (default)
- Flexible: Full-width sections, multi-column, galleries
- Always ask for preference when creating multiple posts

**Design Consistency:**
- Respect site's design language
- Maintain brand colors and typography
- Apply all user customizations documented in spec

---

## Quality Checklist

Before completing:

✅ Read `src/index.css` and `AGENTS.md` for site context
✅ Blog pages match existing design language
✅ Brand colors and typography from index.css respected
✅ All user customizations maintained
✅ Navigation updated with blog link
✅ 2 placeholder posts created (if no content exists)
✅ One standard layout post, one flexible layout post
✅ Generic placeholder text used (NOT copywriter)
✅ `AGENTS.md` updated with blog status
✅ User informed about layout options
✅ SEO meta tags included
✅ Mobile responsive layouts

---

## Key Principles

**Integration First**: Match existing site's design, colors, customizations

**Content Flexibility**: Support both standard and flexible layouts

**Speed Over Perfection**: Generic placeholders, user adds real content later

**No Copywriter**: Blog posts always use generic text

**Consistency**: Read index.css and AGENTS.md first, respect all customizations

---

*Adds complete blog system to existing websites with flexible layouts matching site's design language.*

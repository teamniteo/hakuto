---
name: section-docs
description: Adds technical documentation section with sidebar navigation to existing websites. Creates /docs home page with search, nested category pages, and minimal content-focused design. Use when user requests "add documentation", "add docs", "add API docs", or "add developer docs".
---

# Documentation Section

Adds technical documentation with sidebar navigation to existing websites. Uses minimal content-focused design regardless of main site aesthetic. Complex multi-page system requiring existing site with `site-specification.md`.

---

## Integration Workflow

Copy this checklist and track progress:

```
Documentation Integration:
- [ ] Step 1: Read site-specification.md
- [ ] Step 2: Determine documentation structure
- [ ] Step 3: Apply minimal design system
- [ ] Step 4: Create documentation pages
- [ ] Step 5: Use technical placeholders
- [ ] Step 6: Update site-specification.md
```

### Step 1: Read Site Specification

Read `site-specification.md` (project root) to extract:
- Site type (SaaS or General)
- Theme (light or dark - docs will match)
- Existing navigation structure
- User customizations

### Step 2: Determine Documentation Structure

**Ask user**: "What docs sections do you need? (Getting Started, API Reference, Guides, etc.)"

If no answer provided, create default structure:

**For SaaS sites:**
- Getting Started (Installation, Authentication, Quick Start)
- Guides (Basic Concepts, Best Practices)
- API Reference (Endpoints, Parameters, Examples)
- FAQ / Troubleshooting

**For General sites:**
- Getting Started (Account Setup, Walkthrough)
- How-To Guides (Task-focused)
- Features (Explanations, Use Cases)
- FAQ / Support

### Step 3: Apply Minimal Design System

Docs prioritize legibility for long-form technical reading, so all design languages (Minimalist, Technology, Dark, Corporate, Brutalist, Colorful, Elegant) converge to the same minimal system. Brand color and decoration belong on marketing pages, not in reference material.

**Design Principles:**
- NO brand colors: No gradients, accent colors, colorful badges, category colors
- Blue links as ONLY color accent
- Generous whitespace (2-3x more than main site)
- Flat design throughout

**Color Palette:**

Light Theme:
- Background: `#FFFFFF`
- Text: `#000000` / `#333333`
- Links: `#0066FF` (ONLY color accent)
- Borders: `#E5E5E5`
- Code blocks: `#F5F5F5` background

Dark Theme:
- Background: `#0A0A0A`
- Text: `#FFFFFF` / `#E0E0E0`
- Links: `#0066FF` (ONLY color accent)
- Borders: `#2A2A2A`
- Code blocks: `#1A1A1A` background

**Typography:**
- System fonts: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- Body: 16px, line-height 1.8
- Code: Menlo, Monaco, "Courier New", monospace (14-15px)
- Max content width: 800px

### Step 4: Create Documentation Pages

Use Astro content collections — they give a typed schema, dynamic routing, and automatic TOC generation, which a flat directory of pages cannot match.

**Step 4a: Create collection configuration** (`src/content.config.ts`):

```typescript
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const docs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/docs' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    order: z.number().optional(),
    sidebar: z.object({
      label: z.string().optional(),
      order: z.number().optional(),
    }).optional(),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = { docs };
```

**Step 4b: Organize content structure** (`src/content/docs/`):

```
src/content/docs/
├── getting-started/
│   ├── installation.md
│   ├── authentication.md
│   └── quick-start.md
├── guides/
│   ├── basic-concepts.md
│   └── best-practices.md
├── api/
│   ├── endpoints.md
│   └── parameters.md
└── faq.md
```

**Step 4c: Create documentation pages** (`src/content/docs/getting-started/installation.md`):

```markdown
---
title: "Installation"
description: "How to install the product"
category: "getting-started"
order: 1
sidebar:
  label: "Installation"
  order: 1
---

# Installation

Install via your package manager...
```

**Step 4d: Query collections in pages**:

```astro
---
// src/pages/docs/index.astro
import { getCollection } from 'astro:content';

const allDocs = await getCollection('docs', ({ data }) => !data.draft);

// Group by category
const docsByCategory = allDocs.reduce((acc, doc) => {
  const category = doc.data.category;
  if (!acc[category]) acc[category] = [];
  acc[category].push(doc);
  return acc;
}, {});
---
```

**Step 4e: Generate dynamic routes** (`src/pages/docs/[...slug].astro`):

In Astro 5+ with the content layer, `doc.render()` no longer exists — import `render` from `astro:content` and call `render(doc)` instead. Same change applies whenever you migrate older Astro 4 docs code.

```astro
---
import { getCollection, render } from 'astro:content';

export async function getStaticPaths() {
  const docs = await getCollection('docs');
  return docs.map(doc => ({
    params: { slug: doc.id },
    props: { doc }
  }));
}

const { doc } = Astro.props;
const { Content, headings } = await render(doc);
---

<Layout title={doc.data.title}>
  <aside>
    <!-- Auto-generated sidebar from collection -->
  </aside>
  <main>
    <h1>{doc.data.title}</h1>
    <!-- Auto-generated TOC from headings -->
    <Content />
  </main>
</Layout>
```

**Routes created:**
- `/docs` - Documentation home page
- `/docs/[...slug]` - Dynamic nested documentation pages
- `/docs/api` - API reference (if applicable for SaaS)

**Navigation integration:**
- SaaS: Home | Features | Pricing | **Docs** | Login
- General: Home | Product | **Help** | About (or footer link)

**Preserve existing pages** - docs use separate design system.

**Docs Home** (`/docs`):
- Hero: Title + search bar + quick links grid
- Category cards (simple, text-based, no colors)
- Getting started section with first steps
- Resources links (GitHub, Support, Status)

**Doc Page** (`/docs/[category]/[page]`):
- Sidebar (fixed left):
  - Logo / Docs home link
  - Search bar
  - Navigation tree (collapsible sections)
  - Secondary links (GitHub, Status, Support)
- Main content:
  - Breadcrumbs
  - Page title
  - Auto-generated table of contents (from H2/H3)
  - Content area (800px max width)
  - Footer navigation (Previous/Next)

**API Reference** (`/docs/api`) (for SaaS):
- API overview and authentication
- Endpoints organized by resource
- Parameters table with types
- Code examples (multiple languages)
- Response examples
- Language selector with copy buttons

### Step 5: Use Technical Placeholders

Do NOT invoke `professional-copywriter`. Marketing copy ("Transform your workflow…") is the wrong tone for reference docs — users want literal, accurate descriptions of how the product works, written by someone with the product in front of them. Generic technical placeholders give the user a clean canvas to fill in.

**Placeholder approach:**
- Generic but technically correct
- Example: "This section covers authentication methods. Add your content here."
- Keep brief - user will replace
- Mark as placeholder clearly

**Sidebar Navigation Structure:**
```
[Logo / Docs Home Link]
[Search Bar]

Getting Started
├─ Installation
├─ Quick Start
└─ Authentication

Guides
├─ Basic Concepts
└─ Best Practices

API Reference          (SaaS only)
├─ Users
└─ Webhooks
```

---

## Technical Features

**SEO:**
- Meta tags for each page
- TechArticle schema markup
- Canonical URLs
- Sitemap integration

**Search:**
- Add search bar in header.
- For searching use:
  ```
  ---
  import Search from "astro-pagefind/components/Search";
  ---
  <Search id="search" className="pagefind-ui" uiOptions={{ showImages: false }} />
  ```

**Components:**
- Code blocks: Syntax highlighting, copy button, language tabs
- Callouts:
  - Note (blue border)
  - Tip (green border)
  - Warning (yellow border)
  - Danger (red border)
- Tables: Responsive, monospace for code values
- Links: Always blue, no underline until hover

---

## Handling Existing Documentation

If user has existing documentation:
1. Import content structure
2. Reformat with minimal design system
3. Maintain technical accuracy
4. Update navigation to match new structure
5. Preserve all technical details

---

## Quality Checklist

Before completing:

✅ Read `site-specification.md` and matched its theme (light/dark)
✅ Asked user for doc structure or used the defaults above
✅ Created `/docs` home + nested category pages with sidebar + search
✅ Used minimal design system (white/black + blue links only) regardless of main site aesthetic
✅ Used technical placeholders — did NOT invoke `professional-copywriter`
✅ Added "Docs" (SaaS) or "Help" (General) to main nav, preserving existing pages
✅ Included SEO meta tags, mobile responsive layouts
✅ Updated `site-specification.md` and told the user to add their technical content

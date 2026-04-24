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

Read `/home/claude/site-specification.md` to extract:
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

**Critical**: Documentation uses extreme simplicity regardless of main site design. ALL design languages (Minimalist, Technology, Dark, Corporate, Brutalist, Colorful, Elegant) converge to this minimal system.

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

**CRITICAL**: Use Astro content collections for type-safe documentation.

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

```astro
---
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const docs = await getCollection('docs');
  return docs.map(doc => ({
    params: { slug: doc.id },
    props: { doc }
  }));
}

const { doc } = Astro.props;
const { Content, headings } = await doc.render();
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

**CRITICAL**: Do NOT invoke professional-copywriter skill.

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

## Important Rules

**Design System:**
- Always use minimal design (white/black + blue links only)
- Ignore main site's design language and brand colors
- Use generous whitespace and flat design
- No decorative elements or colorful badges

**Content Strategy:**
- Use technical placeholders only
- Never invoke professional-copywriter
- Keep placeholders brief and generic
- User adds their technical content

**Navigation:**
- SaaS sites: Add "Docs" to main navigation
- General sites: Add "Help" to main navigation or footer
- Preserve all existing pages and structure

**Consistency:**
- Read site-specification.md first
- Match theme (light/dark) to main site
- Update specification after completion

---

## Quality Checklist

Before completing:

✅ Read `site-specification.md` for site context
✅ Asked user for doc structure or used defaults
✅ Created /docs home page
✅ Created nested category pages
✅ Applied minimal design (white/black + blue only)
✅ Used technical placeholders (not copywriter)
✅ Added sidebar navigation
✅ Included search functionality
✅ Theme matches main site (light/dark)
✅ Updated site-specification.md
✅ Told user to add their technical content
✅ SEO meta tags included
✅ Mobile responsive layouts

---

## Key Principles

**Minimal Design**: Documentation always uses content-focused design with only blue links for color

**Technical Placeholders**: Generic, brief placeholders - never invoke copywriter

**Separate System**: Docs ignore main site aesthetic, use own design system

**User Content**: User adds technical content after structure is created

**Consistency**: Read spec first, update spec after completion

---

*Documentation sections use minimal content-focused design with only blue links for color, regardless of main site aesthetic.*

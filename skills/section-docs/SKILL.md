---
name: section-docs
description: Adds a multi-page documentation section to an existing Hakuto site — /docs/ home with search, sidebar navigation generated from a content collection, per-page table of contents and previous/next links, in a minimal reading-first design. Use for "add documentation", "add docs", "add API docs", "add developer docs", "add a help center", "add a knowledge base". Skip for blog, news or changelog content (`section-blog`), a FAQ block on an existing page (`website-builder`), single help articles, or docs hosted on Mintlify/GitBook/ReadMe/Docusaurus.
---

# Documentation Section

Adds a docs section with sidebar navigation to an existing Hakuto site. The docs use one
minimal design whatever the main site looks like, because long technical reading wants
plain text and a single accent colour. Requires an existing site with `site-specification.md`.

The working templates are in `assets/` — copy them and adapt; do not rewrite them from
scratch. For what each page type should contain, the API-reference layout and optional
components (copy buttons, callouts), read `references/page-anatomy.md` when the user asks
for more than the templates render.

## Workflow

```
Documentation Integration:
- [ ] Step 1: Read site-specification.md and the site's Layout
- [ ] Step 2: Agree the docs structure
- [ ] Step 3: Give Layout a `wide` prop
- [ ] Step 4: Copy the templates
- [ ] Step 5: Write placeholder pages
- [ ] Step 6: Wire navigation and llms.txt
- [ ] Step 7: Build and verify
- [ ] Step 8: Record and report
```

### Step 1: Read the site

Read `site-specification.md` (site type: SaaS or general; theme; navigation) and
`src/layouts/Layout.astro` (header nav, current `<main>` markup). Check whether
`src/content.config.ts` already exists and which collections it defines.

### Step 2: Agree the docs structure

Ask: "What docs sections do you need? (Getting Started, API Reference, Guides, …)"
If the user has no preference, use:

| SaaS | General |
|---|---|
| Getting Started (Installation, Authentication, Quick Start) | Getting Started (Account Setup, Walkthrough) |
| Guides (Basic Concepts, Best Practices) | How-To Guides (task-focused) |
| API Reference (one page per resource) | Features (explanations, use cases) |
| FAQ / Troubleshooting | FAQ / Support |

Each section becomes a folder under `src/content/docs/` and an entry in `CATEGORIES` in
`src/lib/docs.ts`, which sets the sidebar order and display name.

### Step 3: Give Layout a `wide` prop

`Layout.astro` already wraps every page in `<main class="flex-1 mx-auto max-w-6xl px-4 py-8">`.
The docs templates must not add a second `<main>` (one main landmark per page), and three
columns — sidebar, 800px article, table of contents — need more than `max-w-6xl`. So add an
opt-in prop to the site's own `src/layouts/Layout.astro` instead of duplicating its `<head>`
in a separate docs layout (a copy would drift from the canonical, schema and WebMCP setup):

```astro
interface Props {
	// ...existing props
	/** Full-width <main> for docs-style pages (sidebar + content + table of contents). */
	wide?: boolean;
}

const {
	// ...existing props
	wide = false,
} = Astro.props;
```

```astro
<main class:list={["flex-1 mx-auto px-4 py-8", wide ? "w-full max-w-[88rem]" : "max-w-6xl"]}>
```

Every other page renders exactly as before. The docs templates pass `wide`.

### Step 4: Copy the templates

| From `assets/` | To |
|---|---|
| `content.config.ts` | `src/content.config.ts` — add the `docs` collection; if the file exists, merge it in and keep every existing collection (e.g. `blog`); create the file only if absent |
| `lib/docs.ts` | `src/lib/docs.ts` — set `CATEGORIES` to the structure from Step 2 |
| `components/docs/*.astro` | `src/components/docs/` (Sidebar, Toc, PrevNext) |
| `pages/docs/index.astro` | `src/pages/docs/index.astro` |
| `pages/docs/[...slug].astro` | `src/pages/docs/[...slug].astro` |
| `docs.css` | `src/styles/docs.css` (imported by both pages) |
| `content/docs/getting-started/introduction.md` | starting point for each page in Step 5 |

How the pieces fit:

- **One route.** `[...slug].astro` serves every page at `/docs/<category>/<page>/`. There is
  no separate `/docs/api` route; API reference pages are the `api/` folder.
- **Category = folder.** `getting-started/installation.md` is in category `getting-started`.
  There is no `category` frontmatter field, so the URL and sidebar group cannot disagree.
- **One ordering field.** `order` sorts pages inside a category; `CATEGORIES` sorts the
  categories. Pages without `order` follow the numbered ones, by title.
- **Drafts.** `getDocs()` filters `draft: true` and every route goes through it, so a draft
  gets no URL, no sidebar entry and no previous/next link.
- **Search.** `pagefind()` is already in `astro.config.mjs` (astro-pagefind is installed), so
  every build writes the index; the docs home renders the search box. Don't touch the
  adapter. The index only exists after `bun run build` — search finds nothing in
  `bun run dev` and that is expected (see the site's AGENTS.md). Do not add
  `data-pagefind-body` anywhere: it would drop every other page from the index, including
  what the site's WebMCP `search-site` tool relies on. The templates use
  `data-pagefind-ignore` on navigation instead.
- **Schema.** The page template passes a `TechArticle` object to `Layout`'s `schema` prop,
  which renders it through `src/components/Schema.astro`.
- **Zod.** Import `z` from `astro/zod`; `import { z } from 'astro:content'` is deprecated and
  goes away in Astro 7.

### Step 5: Write placeholder pages

Create one Markdown file per page from Step 2. Frontmatter: `title`, `description`, `order`,
optional `sidebarLabel` and `draft`. The template renders `title` as the page's `<h1>`, so
start body sections at `##`.

Write placeholders, not copy, and don't invoke `professional-copywriter`: marketing tone
("Transform your workflow…") is wrong for reference docs, and accurate technical content has
to come from someone with the product in front of them. Every placeholder line starts with
`TODO:` so `prelaunch-checklist` flags anything left unfilled:

```markdown
TODO: Explain the authentication methods the API accepts and when to use each.
```

The docs home's description and lede are placeholders too.

**Existing documentation:** if the user has docs already, import them instead of writing
placeholders — keep every technical detail, map their sections onto category folders and
`order`, and restyle only through the docs CSS.

### Step 6: Wire navigation and llms.txt

- Add a link to `/docs/` in the site header nav in `Layout.astro`: "Docs" next to Pricing on
  SaaS sites, "Help" (or a footer link) on general sites. Keep every existing link.
- Add the docs to `public/llms.txt` under `## Key Pages`, so agents know where reference
  material lives:

  ```markdown
  - [Documentation](/docs/): TODO: what the docs cover, in one line
  ```

  If its "How to get an answer" line is still a placeholder, point it at `/docs/`.

### Step 7: Build and verify

From the site root run `bun run check`, then `bun run build`. Then check `dist/client/`:

- `dist/client/docs/index.html` and one `index.html` per page under
  `dist/client/docs/<category>/<page>/`; no page for any draft
- Each page has exactly one `<main>` and one `<h1>`
- Titles and meta descriptions are the real strings you wrote — read them from
  `dist/client/`, because the build regenerates the `page_summary` block of `AGENTS.md` and its description extraction
  truncates at the first apostrophe
- `dist/client/pagefind/` exists
- Contrast and underlines: body links are underlined in both themes; if you changed any
  `--docs-*` colour, re-check it against the contrast notes at the top of `docs.css`

Only the `page_summary` block of `AGENTS.md` is regenerated on every build — don't edit inside it.

### Step 8: Record and report

Append a "Documentation" section to `site-specification.md`: categories, page list, and any
user customisations.

Then report to the user:

```
Docs added at /docs/ — <N> categories, <M> pages.
Files: src/content.config.ts (docs collection), src/lib/docs.ts, src/components/docs/,
       src/pages/docs/, src/styles/docs.css, src/content/docs/…, Layout.astro (`wide` prop, nav link),
       public/llms.txt
Placeholders: <count> TODO: lines across <files> — fill in the technical content under src/content/docs/.
Search: works on `bun run preview` and deployed builds; finds nothing in `bun run dev`.
Checks: bun run check ✓, bun run build ✓
```

## Design rules

The full stylesheet is `assets/docs.css`; these are the decisions behind it.

- **One accent.** Links are the only colour; no brand colours, gradients, coloured badges or
  category colours. Brand colour belongs on marketing pages.
- **Theme via custom properties.** `--docs-fg`, `--docs-fg-muted`, `--docs-accent`,
  `--docs-border`, `--docs-code-bg` are set on `:root` and overridden on `.dark` — the class
  the site's `@custom-variant dark (&:is(.dark *))` uses. Don't hardcode hex values in
  templates; that locks the docs to one theme.
- **Contrast.** Light links `#0066ff` on white (4.8:1); dark links `#4d94ff` on near-black
  (6.6:1). `#0066ff` on dark backgrounds is only ~4.1:1 and fails AA.
- **Not colour alone.** Body links are underlined; the current sidebar page uses weight and a
  left rule.
- **Fonts.** Reuse the site's `--font-sans` and `--font-mono` so the docs still look like the
  same site; a generic system stack breaks the "avoid generic fonts" rule.
- **Type.** 16px body at line-height 1.8, 14px code, 800px max reading width, generous
  whitespace, flat surfaces.
- **No `.prose`.** `@tailwindcss/typography` gives poor dark-theme contrast and fights the
  docs palette; `docs.css` styles the Markdown output directly.

## Quality checklist

- Structure agreed (or defaults used); `CATEGORIES` matches the folders
- `Layout.astro` has the `wide` prop; docs pages have one `<main>` and one `<h1>`
- `src/content.config.ts` keeps every pre-existing collection
- Every placeholder starts with `TODO:`; no `professional-copywriter` copy in the docs
- Nav link added without removing existing pages; `/docs/` listed in `public/llms.txt`
- `bun run check` and `bun run build` pass; Step 7 checks done on `dist/client/`
- `site-specification.md` updated and the Step 8 report given

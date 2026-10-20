---
name: section-blog
description: Adds a multi-page blog to an existing Hakuto site — listing, post pages, category archives and RSS feed. Use for "add a blog", "add articles", "add a news section", "add a changelog". Skip for documentation or help centres (`section-docs`), writing post or marketing copy (`professional-copywriter`), building a whole new site (`website-builder`), headless CMS blogs (Contentful, Sanity, Strapi), or one article inside an existing page.
---

# Blog Section

Adds a blog built on an Astro content collection. Every file it needs is a working template
in `assets/`, generalised from a production blog — copy them and adapt, do not rewrite from
memory. Requires an existing site with `src/index.css` theme variables and the scaffold's
`Layout.astro` (`feedUrl`, `socialImageUrl` and `schema` props).

---

## Integration Workflow

Copy this checklist and track progress:

```
Blog Integration:
- [ ] Step 1: Read site design
- [ ] Step 2: Assess content needs
- [ ] Step 3: Install dependencies
- [ ] Step 4: Copy and adapt the templates
- [ ] Step 5: Wire astro.config.mjs
- [ ] Step 6: Scope the search index in Layout.astro
- [ ] Step 7: Navigation link and llms.txt entry
- [ ] Step 8: Verify
```

### Step 1: Read Site Design

Read `src/index.css`, `src/layouts/Layout.astro` and `AGENTS.md` (site rules, plus the page index in its
`page_summary` block) for:
- Brand colours, typography, and the gradient/shadow utilities (`bg-gradient-hero`,
  `shadow-medium`) the templates use
- The width of `<main>`'s content box. The templates' image `width`/`sizes` assume the
  scaffold's `max-w-6xl px-4` (1120px content); re-measure if the site differs
- Existing navigation structure

### Step 2: Assess Content Needs

> **Don't invoke `professional-copywriter` for blog posts.** Blog content is the user's own
> voice — case studies, release notes, opinion pieces. Generated marketing copy would flatten
> that voice and force the user to rewrite from scratch. A neutral placeholder is faster to
> replace than polished prose pointing in the wrong direction.

Placeholders in the templates start with `TODO:` (sample post author, bio and description;
`BLOG_DESCRIPTION`; the feed description) so `prelaunch-checklist` Check 6 flags any that
survive to launch. Write new placeholders the same way.

**No articles exist:** copy `assets/content/blog/welcome.md` as-is and tell the user:
"Created a sample post. Replace with your content."

**Existing articles provided:** use the text verbatim; only convert it to Markdown with the
frontmatter below.

**User wants a new post:** ask for title, slug, date, author, category, description.
Optional: authorEmail (Gravatar avatar and RSS author), authorBio, authorUrl, featured image.
`TODO:` placeholder text if no content.

### Step 3: Install Dependencies

```sh
bun add @astrojs/rss rehype-external-links
```

`astro-pagefind` and `schema-dts` are already in the scaffold. The plugins import types from
`mdast`/`hast`, which arrive with Astro; if `astro check` cannot resolve them, add
`@types/mdast @types/hast` as dev dependencies.

### Step 4: Copy and Adapt the Templates

| Asset | Destination |
|---|---|
| `assets/content.config.ts` | `src/content.config.ts` — **merge**, keep existing collections |
| `assets/content/blog/welcome.md` | `src/content/blog/welcome.md` (sample post only) |
| `assets/lib/blog.ts` | `src/lib/blog.ts` |
| `assets/lib/image-fallback.ts` | `src/lib/image-fallback.ts` — skip if present |
| `assets/lib/remark-blog-headings.ts` | `src/lib/remark-blog-headings.ts` |
| `assets/lib/rehype-content-images.ts` | `src/lib/rehype-content-images.ts` |
| `assets/blog-content.css` | `src/styles/blog-content.css` |
| `assets/components/blog/*.astro` | `src/components/blog/` |
| `assets/pages/blog/**` | `src/pages/blog/` — keep the structure (`page/`, `category/`) |

Then adapt to the site:
- **Visual design.** The templates use the shadcn tokens and scaffold utilities only. Restyle
  headings, cards and spacing to match the site's existing pages — the structure, data flow
  and image attributes are what must stay.
- **Intro copy.** `BLOG_DESCRIPTION` in `pages/blog/index.astro` and the feed description in
  `rss.xml.ts` are `TODO:` placeholders; ask the user for one sentence and use it in both.
- **Optional parts.** Search: pass `search={false}` to `BlogToolbar` (and skip Step 6's
  dialog note) if the user does not want it. Older/newer links and related posts are
  self-contained blocks at the end of `[...slug].astro`; delete either if unwanted.
- **Headings colour.** `blog-content.css` uses `--heading` with a `--foreground` fallback.
  Define `--heading` in `index.css` if headings should carry a brand colour.

### Step 5: Wire `astro.config.mjs`

```js
import rehypeExternalLinks from "rehype-external-links";
import { remarkBlogHeadings } from "./src/lib/remark-blog-headings";
import { rehypeContentImages } from "./src/lib/rehype-content-images";

export default defineConfig({
  markdown: {
    remarkPlugins: [remarkBlogHeadings],
    rehypePlugins: [
      [rehypeExternalLinks, { target: "_blank", rel: ["noopener", "noreferrer"] }],
      rehypeContentImages,
    ],
  },
});
```

`rehypeContentImages` must be a **user** rehype plugin — see its file header for why the
ordering matters.

`markdown.*Plugins` apply to **every** Markdown file in the site, including a `section-docs`
collection and Markdown pages:
- `remarkBlogHeadings` and `rehypeContentImages` check the file path and only touch files
  under `src/content/blog/`. If posts live elsewhere, change `BLOG_DIR` in both files. Docs
  and other Markdown do not get the 768px image sizing; a docs column needs its own measured
  numbers.
- `rehypeExternalLinks` is unscoped on purpose: every external Markdown link on the site
  opens in a new tab with `rel="noopener noreferrer"`. Tell the user if the site already has
  Markdown content, since its links change behaviour too.

### Step 6: Scope the Search Index in `Layout.astro`

The scaffold's `pagefind()` integration indexes every built page, and the WebMCP
`search-site` tool reads that index. Listing, category and pagination pages would surface as
noise next to the posts, so they pass `pagefindIgnore`. Add the prop to `Layout.astro`:

```astro
interface Props {
  // ...existing props
  /** Exclude this page from the Pagefind search index (blog listings and archives). */
  pagefindIgnore?: boolean;
}
const { /* ...existing */ pagefindIgnore = false } = Astro.props;
---
<main class="…existing classes…" data-pagefind-body={pagefindIgnore ? undefined : true}>
```

> **Put `data-pagefind-body` on `<main>` in Layout, never on `<article>` in the post
> template.** Once any page carries the attribute, Pagefind drops every page that does not —
> tagging only posts silently removes the rest of the site from search. Pages that do not
> use `Layout.astro` will drop out the same way; check for them.

### Step 7: Navigation and llms.txt

Add a Blog link (`href="/blog/"`, trailing slash) where the user specifies, or after Docs.

Add the blog under `## Key Pages` in `public/llms.txt`, so agents reading the file know it
exists — one line saying what it covers:

```markdown
- [Blog](/blog/) — release notes and lessons from building the product
```

### Step 8: Verify

From the site root: `bun run check`, then `bun run build`. Then confirm in `dist/client/`:
- `blog/<slug>/index.html` has one `<h1>`, a `BlogPosting` JSON-LD block, `og:image` when the
  post has a cover, and `<link rel="alternate" type="application/rss+xml">`
- `blog/rss.xml` lists every non-draft post, and no draft appears on any route
- In-article `<img>` tags carry a `srcset` (proves `rehypeContentImages` ran)
- `blog/index.html` has no `data-pagefind-body`; a post page has it on `<main>`

---

## Gotchas

- **Never pass collection entries through `getStaticPaths` props.** Props strip the
  `image()` asset binding: the cover and every body image break, on the post *and* on
  category/pagination grids. Pass the slug (or page number / category) and re-fetch with
  `getPosts()` in the page body — every template does this; keep it when editing.
- **Always go through `getPosts()`** (`src/lib/blog.ts`). It is the only place drafts are
  filtered and posts sorted, so routes, archives and RSS cannot disagree.
- **`slug` is the entry id.** The glob loader keys entries by the `slug` frontmatter field. A
  duplicate slug does not fail the build — the later post silently replaces the earlier one.
  Check for an existing file with the same slug before creating a post.
- **Category names must stay distinct after slugging.** `categorySlug()` lowercases and
  strips punctuation, so `News`/`news` or `C++`/`C` share one URL. The build passes with
  only a "conflicts with higher priority route" warning, and one category's posts lose their
  archive. Reuse existing category names exactly.
- **`featuredImage` needs an `ImageMetadata` cast.** `image().optional()` types `format` as
  optional, so passing it straight to `<Picture>` fails `astro check` with ts(2322).
- **Post images live next to the posts** (`src/content/blog/_images/`) and are referenced
  relatively (`./_images/x.jpg`), in frontmatter and body alike. Never use `/src/...` paths.
- **`layout` frontmatter is ignored** by the content-layer glob loader. All layout lives in
  `[...slug].astro`.
- **`post.render()` no longer exists.** `import { render } from "astro:content"` and call
  `render(post)`.
- **Stale collection cache** after adding/removing posts can leave routes 404ing:
  `rm -f .astro/data-store.json` and restart the dev server.
- **Search finds nothing in `bun run dev`.** The Pagefind index is written by `astro build`;
  test search against `bun run preview` or a deploy.

---

## Typography: Site Theme Variables, Not Tailwind Prose

Post bodies are styled by `src/styles/blog-content.css` (from `assets/blog-content.css`),
not `@tailwindcss/typography` or `.prose` classes — those produce poor contrast on dark
themes and fight the site's design system. The stylesheet uses only the site's HSL theme
variables, so it follows light/dark themes without changes; keep hex colours out of it for
the same reason.

---

## Frontmatter

Schema and field notes live in `assets/content.config.ts`. A post:

```markdown
---
title: "Article Title"
slug: "article-title"
date: "2026-01-20"
author: "Author Name"
authorEmail: "author@example.com"     # optional — Gravatar avatar and RSS author
authorBio: "Short author bio for the author box."
authorUrl: "/about/#author-name"
category: "Category"
description: "One or two sentences — meta description, card preview, RSS and JSON-LD."
featuredImage: "./_images/article-title.jpg"
draft: false
---
```

No `layout` field. Use `##` and below in the body; `remarkBlogHeadings` demotes a stray `#`
so the title stays the page's only `<h1>`.

---

## Images and Performance

- **Covers** go through `<Picture>` with `formats={["webp"]}`, `fallbackFormat(img)` (a webp or
  avif source otherwise ships a PNG fallback several times its size) and a measured `width`.
- **The LCP image is the only eager one.** The featured post's cover on `/blog/` and the
  cover on a post page are `loading="eager" fetchpriority="high"`; every card and avatar is
  lazy.
- **Body images** are right-sized centrally by `rehypeContentImages`, following the content
  image rule in the scaffold's image right-sizing guidance (`hakuto-review` checks it). The
  plugin's numbers (`width` 768, `widths` 384/768/1536) match the `max-w-3xl` article column
  in `[...slug].astro`; if that column changes, change them together. Don't annotate
  individual posts.

### Gravatar

Avatars appear only when the post sets `authorEmail`. They are `<img>`, not `<Picture>` —
Astro cannot resize an external image, so `s=` is the only sizing control. Request **2× the rendered size and no more** (32px byline → `s=64`,
64px author box → `s=128`); the template's `gravatar(px)` helper does this. Never mark an
avatar `loading="eager"`.

Gravatar is a third-party request on every post, which exposes each reader's IP to an
external host. On a site whose positioning is privacy, self-host the few author avatars under
`src/assets/authors/` with `<Picture>` and drop the dependency.

---

## SEO, Feed and Author Identity

- **JSON-LD.** Each post emits `BlogPosting` (headline, description, datePublished, image,
  articleSection, publisher) via Layout's `schema` prop. `publisher` carries the same `@id`
  as the homepage `Organization` node from `src/lib/schema.ts` (`<site>#organization`), so
  the two merge into one entity. `author` is a `Person`, not a bare
  string, with a `url` whenever `authorUrl` is set.
- **Author identity.** Give each author a resolvable `authorUrl` — an author page, an
  `/about/` anchor, or a profile. The byline and author box link to it with `rel="author"`,
  which connects the name to whatever credentials exist elsewhere on the site.
- **RSS.** `/blog/rss.xml` plus a visible RSS link in the toolbar. Item `<author>` is
  `email (Name)` when `authorEmail` is set and omitted otherwise — RSS 2.0 requires an email
  there, so a bare name is invalid. Every blog route passes
  `feedUrl="/blog/rss.xml"` so Layout emits the autodiscovery `<link>` — aggregators only
  look at the `<head>`, so a feed without it is a feed no reader finds. Leave `feedUrl` off
  the rest of the site.
- **Unique titles.** Pagination and category pages each have their own title and
  description; keep them distinct when restyling.
- **`og:type` stays `website`.** The scaffold Layout hardcodes it; `article` would need a new
  Layout prop, which this skill does not add.

---

## Quality Checklist

Before completing:

- Templates copied from `assets/`, not rewritten; structure and image attributes intact
- Visual design matches the site; theme variables only, no `.prose`, no hardcoded hex
- All routes read posts through `getPosts()`; no entries passed through `getStaticPaths` props
- `astro.config.mjs` registers `remarkBlogHeadings`, `rehypeExternalLinks`, `rehypeContentImages`
- `Layout.astro` has `pagefindIgnore` and `data-pagefind-body` on `<main>`; listings opt out
- Every blog route passes `feedUrl`; `/blog/rss.xml` builds
- Navigation has a Blog link with a trailing slash
- `public/llms.txt` lists `- [Blog](/blog/) — …` under Key Pages
- User-provided content used verbatim; `TODO:` placeholders only where content is missing;
  `professional-copywriter` not invoked for posts
- `bun run check` and `bun run build` pass; Step 8 checks done on `dist/client/`
- Mobile responsive

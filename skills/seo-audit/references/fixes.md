# Fix Playbook

Read when the user asks to apply fixes after an audit — "fix them", "fix the 🔧 issues", "fix all critical SEO issues", "run the SEO audit and fix what you can". This file is the **only** list of static-audit findings this skill may fix. A finding not listed here is report-only: name the file and the change in the report and stop.

## Fix Classes

Every finding in the report carries one marker, taken from the tables below — never decided on the spot:

| Marker | Meaning | What the agent does |
| --- | --- | --- |
| 🔧 | **Mechanical.** One correct fix, derivable from the code and the build. No product, copy or policy decision. | Applies it without further questions once the user has asked for fixes. |
| ✍️ | **Needs one answer.** The change is mechanical but a value is the user's: a real business name, a crawler policy, a rewrite of visible copy. | Proposes a concrete value for each, gets approval, then applies — see step 2 below. |
| (none) | **Report only.** Needs judgment the audit can't supply, or lives outside the repo (DNS, Cloudflare, Search Console). | Never edited. |

The rows below were sorted by one test: two competent people fixing it independently would produce the same diff → 🔧; they'd argue about wording or a value → ✍️. The tables are the classification — a finding with no row is report-only, even if it looks mechanical. Match findings to rows by cause, not by exact wording.

## Flow

1. **Report first**, with markers. Fixing is never a side effect of auditing.
2. **Confirm scope and collect ✍️ answers.** If the request was ambiguous ("fix it" after a mixed report), ask: "All 🔧 fixes (N)" (recommended) / "🔧 and ✍️ (N + M)" / "Critical only". For ✍️, group by cause — one question per cause, never per page — and remember `AskUserQuestion` takes at most four questions. Single values (business name, crawler policy) go in as questions with your proposal as the first option. Bulk copy (rewritten titles or descriptions for 30 pages) goes in chat as a table of current → proposed, followed by one question: apply all / let me edit / skip. Never apply a ✍️ value the user hasn't seen.
3. **Fix in source, never in `dist/client/`** — the build overwrites it. Use the surface table below to find the owning file. When one cause produces many findings (the same missing tag on 30 pages), fix the shared layout or template once — never 30 page files.
4. **Rebuild** with `bun run build`. A build failure means the fix was wrong: revert that fix, report it, continue with the rest.
5. **Re-run the checks you fixed** against the new `dist/client/`, plus Step 7 if any fix touched links, titles or headings. A fix that clears its own finding but raises another (new JSON-LD that fails to parse, a robots change that drops `Sitemap:`) is reverted and reported.
6. **Report the delta**: fixed (with `file:line` of the source edit), skipped and why, and what remains report-only. Never claim a fix is live — it ships on the next deploy.

---

## Where Each Surface Lives

| Surface | Owning file in a Hakuto site |
| --- | --- |
| `<title>`, description, canonical, OG/Twitter, viewport, `lang`, feed autodiscovery | `src/layouts/Layout.astro`, and the `title` / `description` / `socialImageUrl` / `feedUrl` / `noindex` props each page passes |
| Site name and default description | `src/lib/site.ts` (`SITE_NAME`, `SITE_DESCRIPTION`) |
| JSON-LD | the `schema` prop each page passes to `Layout.astro` (typed with `schema-dts`, serialized by `src/components/Schema.astro`) |
| Production host — sitemap, canonical, robots `Sitemap:` | `site` in `astro.config.mjs` |
| Sitemap contents | `sitemap()` options in `astro.config.mjs` (`filter`, `serialize`) |
| robots.txt, AI-crawler policy, `Content-Signal` | `src/pages/robots.txt.ts` |
| Site summary for LLM crawlers | `public/llms.txt` |
| Crawler-signal headers (`Link`, `Content-Signal`) | `public/_headers` — security and cache headers are `hakuto-review`'s |
| 404 status | `src/pages/404.astro`; confirm `worker/index.js` and `wrangler.toml` don't answer `200` for unknown paths |
| Inline CSS weight | `build.inlineStylesheets` in `astro.config.mjs` |
| Headings, links, alt text, content that only exists after JS | the page's or component's `.astro` markup |

---

## 🔧 Mechanical Fixes

| Finding | Fix |
| --- | --- |
| Missing or relative canonical | Restore `<link rel="canonical" href={url.href} />` in `Layout.astro`. A page with its own `<head>` (rare) gets the same line. |
| Canonical / sitemap / `Sitemap:` on the wrong protocol or host (`http://`, `www` vs apex, `localhost`) | Set `site` in `astro.config.mjs` to the production origin. If the production origin is not known from `AGENTS.md`, `wrangler.toml` routes or the user's request, this becomes ✍️. |
| Cross-canonical pointing at another page | Canonical back to `url.href`. If the page is a deliberate duplicate, ask instead — that's ✍️. |
| Missing viewport, `<html lang>` empty or missing | Restore the line in `Layout.astro`. `lang` comes from the language the copy is written in. |
| Missing OG or Twitter tag while `Layout.astro` emits it | The page bypasses `Layout.astro` or overrides `<head>`; route it through the layout. If `Layout.astro` itself lacks the tag, add it there, mirroring the existing OG lines. |
| Missing `og:image` | Pass `socialImageUrl` from the page's hero or an existing brand image. Never generate one. |
| Multiple H1s | Demote every H1 but the page's main heading to H2. |
| Skipped heading level | Change the tag to the next level down; keep the classes so it looks the same. |
| Bold paragraph used as a heading | Replace `<p class="font-bold…">` lead-ins with the heading level the outline needs, same classes. |
| Missing image `width`/`height` | Move the image to `src/assets/` and render it with `<Image>`/`<Picture>` from `astro:assets`, which emits intrinsic dimensions. For a remote image, add the dimensions read from the file. |
| Oversized or over-heavy local image | Same: `src/assets/` + `<Image>`/`<Picture>` with `widths` matching the slot. Then run `hakuto-review` on that file for `sizes`/`formats`. |
| Filename-style or missing alt on a content image | Read the image (the `Read` tool shows it) and write a one-sentence description of what it shows, in the page's language. Decorative images get `alt=""`. |
| Broken internal link | Repoint to the built page the slug clearly meant (`/pricng/` → `/pricing/`). If no built page is an unambiguous match, ✍️. |
| Broken in-page anchor | Add the missing `id` to the section the link names, or repoint the link to the existing `id`. |
| Mixed content (`http://` asset or link) | Switch to `https://` after confirming the HTTPS URL answers (`curl -sI`). If it doesn't, report-only. |
| Missing `<lastmod>`, or all identical | Add a `serialize()` to `sitemap()` that reads `git log -1 --format=%cI -- <source file>`; if the identical stamps come from CI, set `fetch-depth: 0` on the checkout. |
| `<priority>` / `<changefreq>` in the sitemap | Remove them from `serialize()` — Google ignores both. |
| Sitemap lists a `noindex` page, a cross-canonicalized page, or a non-HTML route | Exclude it with `sitemap({ filter })`. |
| Sitemap URLs without a trailing slash on a `force-trailing-slash` site | Set `trailingSlash: "always"` in `astro.config.mjs`; every listed URL is otherwise a redirect. |
| `robots.txt` missing `Sitemap:`, or a dead/redundant `Sitemap:` line | Restore the single `sitemap-index.xml` line in `src/pages/robots.txt.ts`. |
| `_headers` crawler-signal rule scoped to `/` | Change the path line to `/*`; remove blank lines inside the rule block. |
| JSON-LD block missing `@context` or `@type` | Add `"@context": "https://schema.org"` and the type the surrounding props already imply. |
| JSON-LD invalid JSON or entity-escaped values | Restore `src/components/Schema.astro` from the scaffold — it must `JSON.stringify` and escape `<` only. |
| JSON-LD relative URL (`url`, `logo`, `image`, `@id`, `item`) | Wrap in `new URL(path, Astro.site).href`. |
| JSON-LD date not ISO 8601 | Emit `date.toISOString()` (or `YYYY-MM-DD`) from the content collection's date field. |
| Article missing `dateModified`, `publisher` or `image` | Derive from git history, the site-wide Organization `@id`, and the post's hero image. |
| Conflicting `@id` | Merge the page-specific properties into the shared node; delete the duplicate. |
| `aggregateRating` on pages that don't display it | Move the property to the schema of the pages that render the rating. |
| Visible breadcrumb with no `BreadcrumbList` | Build the `BreadcrumbList` from the same array the visible breadcrumb renders. |
| Author is a bare string | Replace with a `Person` node whose `url` is the author page or `/about/`. If no such page exists, ✍️. |
| Feed exists with no autodiscovery link | Pass `feedUrl` to `Layout.astro` from the blog's pages. |
| `llms.txt` links to an unbuilt route | Remove the line. If the page plainly moved (same slug under another section), repoint it instead. |
| `llms.txt` links without the trailing slash | Add the slash to every internal link. |
| Blog post or docs page with no schema, or Article missing `dateModified` / `image` | Build `BlogPosting` / `Article` in the post or docs layout from the collection's frontmatter (`title`, `description`, `pubDate`, `updatedDate`, `heroImage`), with `publisher` pointing at the site Organization `@id`. Fall back to the git commit date for `dateModified` and the site's OG image for `image`. |
| `build.inlineStylesheets: "always"` with > 15 KB inline | Set it back to `"auto"`. |
| Favicon file or `<link>` missing | Restore the `favicons()` integration and its `src/assets/favicon.png` input from the scaffold. |

## ✍️ Needs One Answer

Propose a concrete value for each — the user should only have to approve or edit.

| Finding | Ask for |
| --- | --- |
| Title or description missing, outside 50–60 / 150–160 chars, or duplicated | The new string. Draft it from the page's H1 and opening copy; hand longer rewrites to `professional-copywriter`. |
| Description restates the title, or ends on a stock CTA ("Try it free!") | A rewritten description that adds what the title doesn't. |
| Duplicate H1 across templated pages | Which attribute (platform, category, city) qualifies the H1 in the template. |
| Flat heading structure (long page, no H2s) | Approval of drafted section headings, inserted where the prose already changes topic — the body text itself is not rewritten. |
| Placeholder values — `Site Name`, `example.com`, `hello@example.com`, "Lorem ipsum" — in `llms.txt`, JSON-LD, `site.ts` or the `favicons()` names | The real values. Never invent a business name, email or address. |
| `llms.txt` missing or not covering a route family | Approval of a drafted file: category-level entries with counts, from the sitemap. |
| No explicit AI-crawler policy, or a search-citation crawler blocked | Which crawlers to block. Show what each one gates (see `checks-technical.md`). |
| Generic link text ("click here", "read more", "learn more") | The rewritten link text, drafted from the target page's title. |
| Organization schema missing `logo` / `sameAs` | The social profile URLs; the logo is usually already in `src/assets/`. |
| No schema on a product or pricing page | Approval of a drafted `Product`/`SoftwareApplication` node using the prices already on the page. |
| Pricing page ships no price in HTML | The "from $X" figure to server-render. |
| Page-level `nofollow` on a content page | Whether it was intentional. |

## Report-Only

Orphaned pages (they need a navigation decision), contrast failures (palette — `brand-designer`), third-party image hosts (a privacy and product decision), dead outbound links, the "Out of static scope" list, and any agent-readiness finding whose fix has no home in the surface table.

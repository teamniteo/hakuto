# Docs page anatomy

Read this when deciding what goes on the docs home or a docs page beyond what the
`assets/` templates already render, when the user asks for an API reference, or when
adding code-block extras or callouts. The templates cover the baseline; this file lists
what each page type should contain and which parts are optional add-ons.

## Docs home — `/docs/`

Rendered by `assets/pages/docs/index.astro`.

- Title, one-line description, and the Pagefind search box
- "Start with …" link to the first page in reading order
- One text-only card per category, listing its pages with their descriptions (no colours,
  icons or badges)
- Optional Resources block (GitHub, Support, Status) — commented out in the template; fill in
  real URLs or delete it

## Docs page — `/docs/<category>/<page>/`

Rendered by `assets/pages/docs/[...slug].astro`. `<category>` is the folder under
`src/content/docs/`, `<page>` the file name.

- **Sidebar** (sticky left column from 1024px; a collapsed "Documentation menu" `<details>`
  below that):
  - "Docs home and search" link — search lives on the docs home, because Pagefind's result
    list does not fit a 15rem column
  - Navigation tree: one group per category in `CATEGORIES` order, pages by `order`, current
    page marked with `aria-current="page"` (weight + left rule, not colour alone)
- **Main column** (max 800px):
  - Breadcrumb: Docs / Category
  - Title (the page's only `<h1>`) and description
  - Body from Markdown — start sections at `##`
  - Previous / Next in sidebar order, crossing category boundaries
- **On this page** (right column from 1280px): H2/H3 links, hidden when the page has fewer
  than two headings
- **Schema**: `TechArticle` passed to `Layout`'s `schema` prop, which renders it through
  `src/components/Schema.astro` — do not hand-write a `<script type="application/ld+json">`

## API reference (SaaS)

There is no separate route. An API reference is the `api/` category folder like any other,
so its pages live at `/docs/api/<page>/` and appear under "API Reference" in the sidebar.
Per page:

- Overview and authentication first (`api/authentication.md`, `order: 1`)
- One page per resource (`api/users.md`, `api/webhooks.md`)
- Parameters as a Markdown table: name, type, required, description; code values in
  backticks (the docs CSS keeps them on one line)
- Request and response examples as fenced code blocks with a language tag
- Multiple languages: one fenced block per language under an `###` heading per language.
  Tabs with a language selector need a client script or island — add only if the user asks

## Optional components

Each needs work beyond the templates; offer them, do not add them unasked.

- **Copy button on code blocks**: a small inline `<script>` in the docs page that appends a
  button to each `.docs-content pre` and uses `navigator.clipboard.writeText`. Give the
  button a visible label or `aria-label`.
- **Callouts** (Note, Tip, Warning, Danger): plain Markdown has no callout syntax. Either use
  a blockquote that starts with a bold label (`> **Warning:** …` — styled by the template), or
  add a remark plugin for `:::note` directives in `astro.config.mjs`. Callouts may use a
  coloured left border; keep body text on the docs palette.
- **Responsive tables**: already handled — `.docs-content table` scrolls horizontally.

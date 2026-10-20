# Code & Config Checks

Read when the scope contains `.astro` / `.ts` / `.tsx` / `.css` files, `astro.config.mjs` or
`package.json`. Sections: Tailwind v4 setup · Astro file types · shadcn/React props · Fonts ·
Cloudflare adapter · Internal links · Accessibility · Favicon source · Code hygiene.

---

## Tailwind v4 Setup (`src/index.css`, project root)

- **❌ Critical** — `@import 'tailwindcss'` is not the first non-comment line of
  `src/index.css`.
- **❌ Critical** — `tailwind.config.mjs` / `.js` / `.ts` exists at the project root. v4
  ignores it, so edits there silently do nothing — delete it.
- **⚠️ Warning** — custom design tokens (colors, fonts, radius, spacing) defined outside an
  `@theme { … }` block.
- **⚠️ Warning** — CSS custom properties (`--foo: …`) defined outside `@layer base { … }`.
- **✅ Pass** — `@import 'tailwindcss'` → `@plugin 'tailwindcss-animate'` → `@theme` →
  `@layer base` (the canonical order).

---

## Astro File Types (`src/pages/`, `src/layouts/`)

- **❌ Critical** — any `.tsx` or `.jsx` file under `src/pages/` or `src/layouts/`. Pages and
  layouts are `.astro` only.
- **⚠️ Warning** — a `.tsx` component imported into a page without a clear interactivity
  reason. Native JS in an `.astro` `<script>` is preferred for simple toggles and animations;
  React ships a runtime for nothing.

---

## shadcn / React Component Props

Scan `.astro` and `.tsx` files for shadcn/React component usages (capitalised tag names like
`<Button>`, `<Card>`, `<Badge>`, `<Tabs>`). React components only recognise `className`;
`class` produces a TypeScript error and silently drops the styling at runtime.

- **❌ Critical** — `class=` used on a React/shadcn component (must be `className=`).
- **⚠️ Warning** — `style={{ … }}` on a shadcn component. Use Tailwind utilities; for
  animation delays use `delay-*` or `@theme` tokens.
- **⚠️ Warning** — an installed shadcn component that nothing imports. Tailwind v4 scans every
  source file, so its classes still land in the CSS bundle. Detect: for each
  `src/components/ui/<name>.tsx`, grep `src/` for `components/ui/<name>`; zero hits outside
  the file itself (and other `ui/` files that only re-export it) → report it as removable.
- **✅ Pass** — HTML elements (lowercase tags) using `class=` — that is correct.

---

## Fonts

Generic system fonts (Inter, Roboto, Arial) are the visual fingerprint of "AI slop" — sites
built with them blend into a sea of identical-looking output. Typography is the
highest-leverage signal that a site was made with care.

Read the Astro version from `package.json` first: the Fonts API is top-level `fonts` in
`astro.config.mjs` on Astro 6+, and `experimental.fonts` on 5.x. Accept whichever matches the
installed version.

- **❌ Critical** — `@font-face` or `@import url('https://fonts.googleapis.com/…')` in
  `src/index.css`. Custom fonts go through the Fonts API, which self-hosts and preloads them.
- **❌ Critical** — custom fonts referenced in `index.css` (`--font-sans`, `--font-heading`,
  etc.) but `astro.config.mjs` configures no matching family under `fonts` (Astro 6+) or
  `experimental.fonts` (5.x).
- **⚠️ Warning** — `experimental.fonts` on an Astro 6+ project. The API is stable there;
  move the array to top-level `fonts`.
- **⚠️ Warning** — primary font family is a generic AI default (Inter, Roboto, Arial,
  `system-ui`). **Exempt:** a `--font-system` token used only through a mobile override such
  as `max-md:font-system` on the hero `<h1>` — that is the recommended LCP fix (see
  `checks-performance.md`), not the primary face.
- **✅ Pass** — fonts declared via the Fonts API, exposed as CSS variables in `@theme`,
  preloaded via `<Font />` in Layout.astro.

---

## Cloudflare Adapter (`astro.config.mjs`)

Run if the project uses `@astrojs/cloudflare`. The scaffold relies on Astro's built-in
**sharp** service, so the only job here is checking the adapter doesn't replace it. Ground
truth is `node_modules/@astrojs/cloudflare/dist/utils/image-config.js` → `setImageConfig()`.

- **❌ Critical** — `imageService: "passthrough"`. Swaps in a noop service and breaks
  `<Picture>`/`<Image>` in dev and build.
- **❌ Critical** — `imageService: "compile"`. Despite the name, this does not keep sharp. On
  adapter v13 `case "compile"` returns `WORKERD_IMAGE_SERVICE` unconditionally; on v14 it
  returns `hasUserImageService(config) ? config.service : WORKERD_IMAGE_SERVICE`, and
  `hasUserImageService()` explicitly excludes the sharp entrypoint. Either way sharp is
  replaced and builds outside Cloudflare's runtime break.
- **❌ Critical** — missing `prerenderEnvironment: "node"`. The default `"workerd"` fails
  prerendering with a 404 outside Cloudflare's infra, and sharp needs to run in Node.
- **⚠️ Warning** — `imageService` not set at all. The adapter defaults to
  `"cloudflare-binding"`, which needs an Images binding.
- **⚠️ Warning** — an `image: { service: … }` key pointing at a third-party service. The
  scaffold expects the key to be absent so Astro's sharp default applies.
- **⚠️ Warning** — adapter not gated to production. An unconditional adapter in dev routes
  `/_image` through a workerd endpoint needing runtime bindings, 404-ing every image on
  `bun run dev`.
- **✅ Pass** — no `image.service` key + `imageService: "custom"` +
  `prerenderEnvironment: "node"`, adapter gated to production.

---

## Internal Links — trailing-slash convention

Read `trailingSlash` from `astro.config.mjs` (absent ⇒ Astro default `"ignore"`). Extract
every internal *path* link — `href="/…"` and `href={` `` `/…` `` `}` template literals — from
`.astro` / `.ts` / `.tsx` files. Before judging, strip any `#fragment` / `?query`, and
**ignore**: external links (`http://`, `https://`, protocol-relative `//`, `mailto:`, `tel:`),
the bare root `/`, pure fragments (`#…`), and **file** targets whose last path segment
contains a dot (`/rss.xml`, `/sitemap-index.xml`, `/.well-known/security.txt`).

A link is *mismatched* when its slash form contradicts the resolved convention:

- `trailingSlash: "always"` → internal link with **no** trailing slash (`href="/product"`).
- `trailingSlash: "never"` → internal link **with** a trailing slash (`href="/product/"`).
- `trailingSlash: "ignore"` **and** the project serves from Cloudflare static assets (the
  scaffold's `wrangler.toml` sets `html_handling = "force-trailing-slash"`) → bare links
  `301` to the slash form at the edge, so treat as the `"always"` case.

- **⚠️ Warning** — *internal link contradicts the convention*. Each mismatch sends the
  browser through a `301` — an extra round-trip on every navigation, and on crawlers wasted
  crawl budget. Fix the link; don't rely on the redirect. Report each `file:line`; for many
  repeats in one file you may append "(+N more in this file)".
- **✅ Pass** — every internal link matches the configured convention.

> Detect with Grep: for the `"always"` / Cloudflare case, `href="/[^"#?]*[^/"#?]"`, then drop
> matches whose path contains a dot. For `"never"`, search `href="/[^"#?]*/"`. Confirm
> `trailingSlash` and the adapter first — the same bare link is a finding on an `"always"`
> site and a non-issue on a true `"never"` site.

---

## Accessibility & Semantic HTML

Per `.astro` page. Rendered-DOM checks (image `alt`, `<h1>` count and hierarchy, text
contrast) belong to `seo-audit`, which reads the built HTML; don't re-report them here.

- **⚠️ Warning** — icon-only `<button>` / `<a>` (a lucide-react `<Icon>` as the only child)
  without `aria-label`.
- **⚠️ Warning** — `<button>` styled to look like a link when an `<a>` is semantically
  correct (or vice versa).
- **✅ Pass** — interactive elements named, correct element chosen for the semantics.

---

## Favicon Source Location

`public/` holds files generated by the `astro-favicons` plugin from a single source in
`src/assets/`. An editable favicon in `public/` confuses source-of-truth: regenerations
overwrite it, and the next person to look for "the favicon" edits the wrong file.

- **❌ Critical** — an editable favicon source (`.svg`, `.png`) in `public/` rather than
  `src/assets/`.
- **⚠️ Warning** — `astro-favicons` block in `astro.config.mjs` missing, or still on the
  template default name (`Hakuto`, `Site Name`).
- **✅ Pass** — source under `src/assets/`, plugin configured with project-specific `name` and
  `short_name`.

---

## Code Hygiene

Run only if the scope includes `.astro` / `.ts` / `.tsx`.

- **❌ Critical** — `bun run check` reports a new error caused by an in-scope file (unused
  imports, type errors, implicit `any` in middleware/Vite plugin callbacks).
- **⚠️ Warning** — `bun run check` reports pre-existing errors (list separately so the user
  can decide).
- **⚠️ Warning** — a file imports something it never references (`import * as fs from
  "node:fs"` with no `fs.` usage) — detect with a grep where possible.
- **✅ Pass** — `bun run check` clean over the in-scope files.

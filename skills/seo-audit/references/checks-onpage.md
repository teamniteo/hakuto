# On-Page Checks

Per-page checks against built HTML in `_dist/`. Run these for every file in scope.
Cross-page aggregation (duplicate titles/descriptions/H1s, orphans) happens in
Step 7 of `SKILL.md`.

---

## Meta Tags

**Title:** `<title>` in `<head>`
- Missing → ❌ critical
- <30 chars → ❌ critical: "Title too short: X chars (need 50-60)"
- 30-49 or 61+ chars → ⚠️ warning: "Title X chars (optimal: 50-60)"
- 50-60 chars → ✅ pass
- Track in `titles{}` for duplicates

**Meta Description:** `<meta name="description">` in `<head>`
- Missing → ❌ critical
- <100 chars → ❌ critical: "Description too short: X chars (need 150-160)"
- 100-149 or 161+ chars → ⚠️ warning: "Description X chars (optimal: 150-160)"
- 150-160 chars → ✅ pass
- Track in `descriptions{}` for duplicates

**Canonical:** `<link rel="canonical" href="...">` in `<head>`
- Missing → ❌ critical
- Relative URL (no http://) → ⚠️ warning: "Should be absolute URL"
- Absolute URL pointing to a different page than the current file's URL → ❌ critical:
  "Cross-canonical: page X canonicals to Y (silently de-indexes X)"
- Absolute, self-referencing → ✅ pass

To check self-reference: derive expected URL from file path (e.g. `_dist/about/index.html`
→ `/about/` or `/about`) and compare against canonical href path. Account for
trailing-slash variants.

**Open Graph:** check for og:title, og:description, og:image, og:url
- Missing any → ⚠️ warning for each missing tag
- All present → ✅ pass

**Robots Meta:** `<meta name="robots" content="...">` in `<head>`
- Contains `noindex` → record this page URL in `noindex_pages[]` (used in Step 6 to confirm
  it's excluded from the sitemap). Not itself an issue — intentional noindex is fine.
- Contains `nofollow` on an indexable content page → ⚠️ warning: "Page-level nofollow on
  [url] (blocks link equity flow)"

---

## HTML Document

**Lang Attribute:** `<html lang="...">` on the root element. Screen readers and translation
tools rely on this to pronounce content correctly and offer the right translation.
- Missing `lang` attribute → ⚠️ warning: "Missing `<html lang>` attribute"
- Present but empty (`lang=""`) → ⚠️ warning: "Empty `<html lang>` attribute"
- Present with non-empty value → ✅ pass

---

## Heading Hierarchy

**H1 Count:**
- 0 H1s → ❌ critical: "Missing H1"
- >1 H1s → ❌ critical: "Multiple H1s (found X)"
- Exactly 1 → ✅ pass

**H1 Text (cross-page):** record the H1's text content in `h1s{}`. Templated pages
(per-check, per-doc, per-city listings) commonly render the *same* H1 across dozens of URLs
— Google reads that as thin/duplicate content even when each page's body differs.
Distinct-per-page-count H1s can still be site-wide duplicates. Evaluated in Step 7.
- Normalize whitespace before recording (collapse runs of spaces/newlines, trim).

**Hierarchy:** check H1→H2→H3→H4→H5→H6 sequence
- If any skip (e.g., H1→H3) → ❌ critical: "Broken hierarchy at line X: H1→H3 (skipped H2)"
- No skips → ✅ pass

**Flat structure:** a page can have a valid H1 and plenty of prose and still be
unreadable to an agent, because nothing below the H1 marks where one idea ends and the next
begins. A skipped level is a broken outline; *no* outline is worse, and the skip check above
passes it silently.

- Page has an H1 and ≥ 500 characters of body text but **zero H2s** → ⚠️ warning: "Flat
  heading structure on [url]: N chars under a single H1, no H2s". Agent-readiness scanners
  grade this directly — it is the difference between a partial and a full pass on
  "content without JavaScript".
- Long pages (≥ 2000 chars) with only one or two H2s and no deeper structure → ⚠️ warning:
  the sections are too coarse to navigate.

The fix is real section headings in the `.astro` markup, not decorative `<p class="font-bold">`
lead-ins. Check for that pattern specifically: a bolded paragraph immediately followed by
body copy is a heading that lost its element.

---

## Image Alt Text

Extract all `<img>` tags in `<body>`:
- Missing `alt` attribute → ❌ critical: "Image missing alt: [src]"
- Empty `alt=""` on a decorative image (no surrounding link/caption) → ✅ pass (intentional)
- Empty `alt=""` on a content image (inside `<a>`, `<figure>`, or with no other text in
  link) → ⚠️ warning: "Empty alt on content image: [src]"
- **Low-quality alt** — non-empty but clearly not human-written: ends in an image extension
  (`.png`/`.jpg`/`.jpeg`/`.gif`/`.webp`/`.svg`), is a bare slug/filename
  (`screenshot-2024-11`, `image_01`, `IMG_2043`), or just repeats the file's basename →
  ⚠️ warning: "Filename-style alt on [src]: '[alt]' — rewrite as a description". These pass
  a naive presence check but carry no SEO value.
- Non-empty descriptive alt → ✅ pass

Ignore `<img>` inside `<picture>` only when the `<picture>` itself has an `<img>` child with
alt (don't double-count).

**Image dimensions (CLS):** every rendered `<img>` in `<body>` should carry both `width` and
`height` attributes (Astro's `<Picture>`/`<Image>` emit these automatically; raw `<img>`
tags often don't). Missing dimensions force the browser to reflow once the image loads,
hurting Cumulative Layout Shift.
- `<img>` missing `width` or `height` → ⚠️ warning: "Image missing width/height (causes
  layout shift): [src]"
- Both present → ✅ pass

---

## Image Asset Health (local files)

For each `<img src="...">` and `<source srcset="...">` referencing a **local** path (starts
with `/` or relative, not `http://`/`https://`), `stat` the resolved file in `_dist/`:

- > 2 MB → ❌ critical: "Oversized image: [src] (X MB) — will tank LCP"
- 1–2 MB → ⚠️ warning: "Large image: [src] (X MB) — consider compressing"
- ≤ 1 MB → ✅ pass

Skip SVG files (typically tiny). Astro's build fails on broken `<Picture>`/`<Image>`
imports, so existence is already guaranteed at this stage.

---

## Image Right-Sizing — emitted pixels vs declared slot

File size in MB is only a proxy — a well-compressed 5000px logo in a 200px card passes the
size check above and is still a 25× waste. Measure the pixels instead.

For each `<img>` / `<source>` with a local `src`/`srcset`:

1. Parse `srcset` into (file, descriptor) pairs; include the plain `src` as a candidate.
2. Read each candidate's **real pixel width** (`sharp(file).metadata()`, or
   `sips -g pixelWidth -g pixelHeight` on macOS).
3. Derive the largest slot width the tag advertises from `sizes` — take the largest `px`
   value, resolving `Nvw` and `calc(100vw - Npx)` against a 1920px viewport. Fall back to
   the `width` attribute when there's no `sizes`.

Report:

- Largest candidate **> 2× the largest declared slot** → ❌ critical: "Oversized: [file] is
  Npx for an Mpx slot (N/M×)".
- Tag has a `sizes` attribute but **only one candidate** → ⚠️ warning: "`sizes` is inert on
  [src] — no `srcset` emitted". Astro's `getSrcSet` returns `[]` unless `widths`/`densities`
  is set, so the markup looks right-sized but ships a single file.
- A candidate's **aspect ratio differs from the fallback's by > 1%** → ⚠️ warning: "Aspect
  drift on [file]: WxH (AR a) vs fallback AR b". Usually a `width`+`height` pair that
  disagrees with the source ratio, making sharp crop with `fit: cover`. Allow rounding noise
  — a 1px difference on a short image is not a finding.
- A literal `style="[object Object]"` on any `<img>` → ❌ critical. Something in the image
  pipeline is stringifying an object into an attribute; the tag's styling is silently dead.

Skip SVG here — it's vector, so pixel width says nothing about delivery weight and every
logo would false-positive.

---

## External Images

**Do not skip these.** External images used to be exempt as "outside our control", and that
exemption is exactly what hides the most expensive image mistakes: a Gravatar avatar
requested at `s=160` and rendered at 32px is 25× the necessary pixel area, repeated on every
byline on the site.

For each `<img>`/`<source>` whose `src` is an absolute `http(s)://` URL on a host other than
the site's own:

- URL carries a size parameter (`s=`, `w=`, `width=`, `h=`, `height=`) more than **2× the
  rendered slot** (from `sizes`, or the `width` attribute) → ⚠️ warning: "External image
  requests Npx for an Mpx slot: [src]". Same arithmetic as the local right-sizing check
  above — the parameter *is* the emitted width.
- Carries `loading="eager"` (or no `loading` attribute while below the fold) → ⚠️ warning:
  "External image is eager-loaded and competes with LCP: [src]".
- Present at all on content pages → ⚠️ warning: "Third-party image host [host] on N pages —
  every visitor's IP is exposed to it". State this bluntly on sites whose positioning is
  privacy; self-hosting through the Astro image pipeline removes the request entirely.

Group these by host in the report rather than emitting one finding per `<img>` — 68
identical Gravatar findings is noise, "68 Gravatar avatars across 34 pages" is a finding.

---

## Text Contrast

Colour choices that fail WCAG AA usually originate in the palette, not in page authoring, so
they repeat across the whole site once made.

1. Collect every `text-*` utility class used in the built HTML, along with the element's
   effective font size and weight (from the sibling `text-xs`/`text-sm`/… and `font-*`
   classes).
2. Resolve each class to its colour value from the `@theme {}` block in `src/index.css`,
   falling back to Tailwind's default palette for stock classes (`slate-400`, `sky-600`, …).
3. Resolve the effective background the same way (nearest ancestor `bg-*`, else the `body`
   background token).
4. Compute the WCAG contrast ratio and grade by size: **4.5:1** for normal text, **3:1** for
   large text (≥ 18.66px, or ≥ 14px bold).

- Failing pair → ⚠️ warning: "`text-slate-400` on white is 2.56:1 at 12px — fails AA".
  Always name the one-token swap that fixes it (`slate-500`, `sky-700`) rather than saying
  "increase contrast".
- A token that fails at small sizes but passes as large text is fine where it is genuinely
  large — report it only at the sizes where it fails.
- Icons and purely decorative text are out of scope.

---

## URL Hygiene

Per page URL (from sitemap.xml or file path):
- Uppercase letters in path → ⚠️ warning: "URL not lowercase: [url]"
- Underscores in path segments → ⚠️ warning: "URL uses underscores instead of hyphens: [url]"
- Query parameters (`?foo=bar`) on indexable pages → ⚠️ warning: "Indexable URL has query
  params: [url]"

---

## Mixed Content

Scan built HTML for `http://` (not `https://`) references:
- `<script src="http://...">`, `<link href="http://...">`, `<img src="http://...">`,
  `<iframe src="http://...">` → ❌ critical: "Mixed content: [tag] loads insecure [url]"
- `<a href="http://...">` → ⚠️ warning: "Insecure link: anchor points to http:// [url]" —
  following the link drops the user from HTTPS to HTTP
- Ignore `http://` inside JSON-LD `@context` (`http://schema.org` is canonical) and inside
  text content / comments.

---

## Internal Links

Extract all `<a href="...">` tags:
- Record internal links (ignore external URLs that start with `http://` or `https://`)
- Track in `links{}`: current_page → [linked_pages]

**Target validation:** for each internal href, confirm the target resolves to a file in
`_dist/`:
- `/about` → `_dist/about.html` or `_dist/about/index.html`
- `/blog/post-name/` → `_dist/blog/post-name/index.html`
- `#section-id` (in-page anchor) → confirm an element with `id="section-id"` exists on the
  current page
- `/page#section` → confirm both the file exists AND the id exists on that page

Strip query strings (`?utm_source=...`) before resolving. Ignore `mailto:`, `tel:`,
`javascript:` schemes.

- Target file not found → ❌ critical: "Broken internal link: [href] on [page] (target
  missing in _dist)"
- In-page anchor with no matching id → ❌ critical: "Broken anchor: [href] on [page] (no
  element with id=[fragment])"
- Resolves correctly → ✅ pass

---

## External Link Liveness — opt-in, needs network

Everything else in this file is offline. This check makes real requests, so run it **only**
when the user asks ("check outbound links", "find dead links") and say so in the report.

- Collect unique external hrefs across the pages in scope.
- `curl -sS -o /dev/null -w '%{http_code}' -I -L --max-time 10` each one, sequentially or at
  low concurrency. Never hammer a host.
- 4xx / 5xx → ⚠️ warning: "Dead outbound link: [url] (N) linked from [pages]".
- 403 / 429 / connection reset → **not** a finding: report as "blocked the crawler — needs a
  manual check". Many publishers block automated HEAD requests, and reporting those as dead
  links produces false positives that get the whole check ignored.
- A press/citation page is the highest-value target for this check: an outlet that still has
  the article live but dropped the link is a reclaimable backlink, not just a broken URL.

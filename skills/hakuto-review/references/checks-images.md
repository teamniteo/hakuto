# Image Checks

Read when the scope contains any `.astro` file that renders images, `src/content/**`
markdown, or `astro.config.mjs`.

This file is the canonical home of Hakuto's source-side image rules. `seo-audit` measures
what the build emitted (file weight, pixel width vs slot) and defers to this file for the
markup causes — `sizes` without `widths`, `width`/`height` crops — so report those here and
nowhere else.

---

## Pipeline — `<Picture>` / `<Image>`

For each `.astro` file:

- **❌ Critical** — a local raster image is `import`-ed (e.g. `import hero from '@/assets/…'`)
  and rendered with a bare `<img>` tag. Local raster images go through `<Picture>` /
  `<Image>` from `astro:assets` so they get webp, a srcset and intrinsic dimensions.
  **Exception:** local `.svg` imports rendered as `<img src={logo.src}>` are correct — SVGs
  stay out of the raster pipeline.
- **⚠️ Warning** — `<Picture>` missing `formats={['webp']}`.
- **⚠️ Warning** — an above-the-fold image (in the first section of a page) without
  `loading="eager"`, or a below-the-fold image without `loading="lazy"`.
- **✅ Pass (don't flag)** — bare `<img>` whose `src` is an external URL such as
  `https://images.unsplash.com/…`; external placeholder imagery is allowed.

### `fallbackFormat` — resolve the source extension first

Never flag `fallbackFormat` blanket. Astro's `specialFormatsFallback` is
`['gif','svg','jpg','jpeg']`; every other format defaults to a **PNG** `<img>` fallback.
Follow the `import` to its real extension before judging, and skip the tag entirely if you
cannot (a content-collection `featuredImage`, a `.map()` over a mixed array).

- **❌ Critical** — a `.webp` or `.avif` source with **no** `fallbackFormat="webp"`. The
  fallback is silently transcoded to PNG — for photos routinely megabytes, often larger than
  the source. This is the only genuinely wrong combination.
- **⚠️ Warning (advisory)** — a `<Picture>` whose `src` is a content-collection image or
  otherwise dynamic, in a project whose collection contains any `.webp`/`.avif` asset, with a
  hardcoded or absent `fallbackFormat`. Recommend the computed form:
  `fallbackFormat={img.format === "webp" ? "webp" : undefined}`.
- **✅ Pass** — `.jpg`/`.jpeg`/`.gif`/`.svg` with no `fallbackFormat` (they fall back to
  themselves), and `.png` either way — omitted it falls back to PNG, set to `"webp"` it
  reuses the webp files and emits half as many.
- Don't flag `.png` + `fallbackFormat="webp"` as build-breaking. That was true on Astro < 6.4
  and is now guarded by `referencedImages` in `dist/assets/build/generate.js`; it builds
  clean on 6.4.8 and 7.1.3.

---

## Right-Sizing — `width`, `widths` and `sizes`

A prop-presence review misses most of what goes wrong here, because the failure modes look
like correct markup. Two rules from Astro's sharp service
(`node_modules/astro/dist/assets/services/service.js`) drive everything below:

- `getSrcSet` returns `[]` unless `widths` **or** `densities` is present. So `width` + `sizes`
  with no `widths` emits a **single candidate** and an inert `sizes`.
- `getTargetDimensions` derives the missing dimension from the intrinsic aspect ratio. When
  both `width` and `height` are given and they disagree with that ratio, sharp resizes with
  `fit: cover` — a silent crop.

The expected form for a local image is `width={W} widths={[W, W * 2]} sizes="…"`, where `W`
is the rendered slot width, not the asset's intrinsic width.

- **❌ Critical** — *local `<Picture>` / `<Image>` with no explicit `width` prop*. Ships the
  full-resolution asset to every visitor and tanks LCP. Report the file:line and, where you
  can read it off the surrounding markup, the container width the image should have been
  sized to.
  - Detect: `<Picture` / `<Image` tags whose props include `src={<imported local asset>}` but
    no `width=`. A `widths` array does not substitute — with no `width`,
    `getTargetDimensions` falls back to the intrinsic size, so the `<img>` fallback still
    ships full-resolution.
- **⚠️ Warning** — *`sizes` present but no `widths` / `densities`*. The tag ships one
  candidate and the `sizes` does nothing, so the right-sizing is only apparent. Add
  `widths={[W, W * 2]}`.
- **⚠️ Warning** — *`width` present but no `sizes`, or an explicit `sizes="100vw"` on a slot
  that isn't full-bleed*. Without a measured `sizes`, the browser assumes the image spans the
  viewport and downloads the largest srcset candidate regardless of the slot. Expected form:
  `sizes="(min-width: 1024px) 350px, (min-width: 640px) 50vw, 100vw"`.
  - Full-bleed images (`w-screen`, a hero whose wrapper has no `max-w-*`) legitimately use
    `100vw` — pass those.
- **⚠️ Warning** — *both `width` and `height` on an image whose box is CSS-controlled*
  (`w-full`, `h-*`, `aspect-*`, `object-cover`). If the pair's ratio differs from the
  source's, sharp crops the file and CSS then crops it again. Phrase as "drop `height` unless
  the crop is intended" — this skill can't read the asset's intrinsic size, so don't assert
  the ratio is wrong.
  - Pass: square `width`/`height` on a round avatar (`rounded-full`, `size-*`) — the crop is
    the point.
- **⚠️ Warning (advisory)** — *`width` looks like an intrinsic asset size, not a display
  size*. Heuristic: `width` ≥ 1600 on an image inside a card/tile/grid container (`grid`,
  `md:grid-cols-*`, `max-w-sm|md|lg|xl`, `w-*` on the wrapper), or a value that matches a
  common capture dimension (1920, 2560, 3024, 5120). This skill cannot compute layout —
  phrase the finding as "verify `width={N}` against the rendered slot".
- **⚠️ Warning** — *`max-width: none !important` utilities on images*. Sharp emits no inline
  cap to override, and the `!important` defeats Tailwind preflight's `img { max-width: 100% }`
  plus any `max-w-*` on the element. A slot that should fill its container wants `w-full`.
- **✅ Pass** — every local `<Picture>`/`<Image>` declares `width` and `widths`, plus `sizes`
  unless full-bleed.

> `width` controls the *file*; it does not make the element fill its container. Don't
> recommend removing `w-full` from a right-sized image — without it the element renders at
> the `width` prop, which is usually a visible shrink.

---

## Markdown Content Images

Run when the project has a blog or docs content collection (`src/content/**` with
`.md`/`.mdx`).

- **⚠️ Warning** — *markdown-content images not centrally right-sized*. `astro.config.mjs`
  registers no rehype plugin that sets `width`/`widths`/`sizes` on content `<img>` elements.
  Article columns are ~710–766px while pipeline images render at intrinsic resolution
  (1024–2220px). The fix is one rehype plugin (`width = 768`, `widths = [384, 768, 1536]`,
  `sizes = "(min-width: 768px) 768px, 100vw"`), not per-post annotation.
  - Check both config shapes. Astro 6 takes `markdown.rehypePlugins: [...]`; Astro 7 takes
    `markdown.processor: unified({ rehypePlugins: [...] })` and *rejects* the legacy key with
    `unified is not a function`. Looking only for `markdown.rehypePlugins` false-positives on
    every Astro 7 project.
  - If such a plugin exists but sets `width` without `widths`, flag it: every in-article
    image loses its srcset entirely.
- **❌ Critical** — *content images referenced by an absolute `/…` public path*. A markdown
  body containing `![alt](/images/foo.png)` resolves to `public/`, which never enters the
  asset pipeline — no webp, no srcset, full resolution on every viewport, regardless of any
  rehype cap. A rehype plugin cannot fix these: public-dir images are absent from
  `file.data.astro.localImagePaths`, which is what such plugins key off. The fix is to move
  the asset into `src/assets/` and reference it *relatively* from the markdown.
  - Detect: `!\[[^\]]*\]\(/` in any `src/content/**` markdown file.

---

## Asset Paths — no raw `/src/assets/…`

Run on every `.astro` / `.tsx` file in scope.

- **❌ Critical** — a `src` (or `href`, `srcset`, CSS `url()`) that names `/src/assets/…` as a
  string. Vite serves those paths in dev, but they do not exist in the production build, so
  the image works locally and 404s on the live site. Fix: `import` the asset and render it
  through `<Picture>` / `<Image>` (raster) or `<img src={asset.src} width={asset.width}
  height={asset.height}>` (SVG). Files that need a stable public URL (`/favicon.ico`) belong
  in `public/` and are referenced as `/name.ext`.
  - Detect: `grep -rnE "[\"'(]/src/assets" src/`. Expect zero matches.

---

## Reference — how the pipeline behaves

Background for writing findings and fixes. These are the Astro internals the checks above
rest on, so a fix you recommend doesn't trade one silent failure for another.

- **`fallbackFormat` resolution** (`node_modules/astro/components/Picture.astro`):
  ```js
  let resultFallbackFormat = fallbackFormat ?? defaultFallbackFormat; // 'png'
  if (!fallbackFormat && isESMImportedImage(clonedSrc) &&
      specialFormatsFallback.includes(clonedSrc.format)) {            // ['gif','svg','jpg','jpeg']
    resultFallbackFormat = clonedSrc.format;
  }
  ```
  Measured on a 2400px PNG at `widths={[300, 600]}`: **4 files / 109 kB** with
  `fallbackFormat` omitted vs **2 files / 27 kB** with `"webp"`. When the source format isn't
  known statically, keep the computed expression in a small helper (e.g. create
  `src/lib/image-fallback.ts`) rather than repeating it per component.
- **Nothing is upscaled — neither `widths` nor `width`.** `getSrcSet` drops `widths` above the
  source's intrinsic width and substitutes the intrinsic width; every `resize()` branch in
  `astro/dist/assets/services/sharp.js` passes `withoutEnlargement: true`, so an oversized
  `width` caps at the source too. A 2x candidate exists only if the source asset is big enough
  — a silently clamped ladder looks right in code and ships a soft image. The fix is a bigger
  source (an `@2x` master), never a bigger number.
- **`widths` and `densities` are mutually exclusive** — passing both throws
  `IncompatibleDescriptorOptions`.
- **Measuring the slot** — read the width from the container's Tailwind classes at the
  largest breakpoint: `w-80` → 320, a 3-column `max-w-7xl` grid → ~350, a `max-w-4xl`
  article → ~768.
- **Markdown images** — the rehype cap works because `@astrojs/markdown-remark` runs user
  rehype plugins **before** its own `rehypeImages`, which folds `node.properties` into the
  `__ASTRO_IMAGE_` payload that `getImage()` consumes. `width`/`widths`/`sizes` set there are
  real transform options, not HTML attributes — and the same ordering is why a plugin that
  omits `widths` strips the srcset from every in-article image.
- **External placeholders** — Unsplash URLs render as plain `<img>`:
  `https://images.unsplash.com/photo-{ID}?w={W}&h={H}&fit=crop`.

### Symptom → cause

| Symptom | Cause and fix |
|---|---|
| Images 404 in production but work in dev | Raw `/src/assets/…` path — see Asset Paths |
| Images not loading at all, dev or build | Adapter `imageService: "passthrough"` (noop service) — use `"custom"`; see `checks-code.md` → Cloudflare Adapter |
| Images 404 on `bun run dev` only | Adapter loaded unconditionally in dev — gate it off in development |
| Big PNGs in `dist/client/_astro/` beside the webp variants | `.webp`/`.avif` source without `fallbackFormat="webp"` |
| Image served far larger than displayed, poor LCP | No explicit `width` — set the measured display width plus `widths` and `sizes` |
| One file emitted; `sizes` seems ignored | `sizes` without `widths`/`densities` — add `widths={[W, W * 2]}` |
| Image cropped at the edges | `width` + `height` disagree with the source ratio (`fit: cover`) — drop `height` |
| 2x candidate soft, ladder tops out low | Source smaller than requested `widths` — supply a larger master |
| Image visually shrank after adding `width` | `width` sizes the file, not the element — add `w-full` (or `w-full h-full object-cover`) |
| Build fails with `ENOENT … dist/_astro/<name>.png` | Astro older than 6.4 — upgrade; don't change `fallbackFormat` |

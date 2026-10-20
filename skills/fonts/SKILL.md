---
name: fonts
description: Configures web fonts through Astro's Fonts API and picks type pairings — provider, weights, preloading, and the Tailwind wiring. Use for "add Google Fonts", "use custom fonts", "change the typography", "pick a font pairing", "what font should I use", "optimize font loading", or a local brand font. Skip for size, weight or tracking on an already-configured family (Tailwind utilities in `src/index.css`), colors (`brand-designer`), and whole-site restyles or new-site direction (`website-builder`, which calls this skill when a web font is chosen).
---

# Fonts (Astro Fonts API)

Configure performant web fonts with automatic optimization, preloading, and privacy-focused delivery from the site's own origin. The Fonts API replaces `@import` and `@font-face` in CSS — don't use either for custom fonts.

## The naming rule

Two layers of CSS variables are in play, and they must not share names:

- **Astro `cssVariable`** — the family itself. Namespace it by family: `--font-crimson-pro`, `--font-dm-sans`, `--font-jetbrains-mono`.
- **Tailwind theme key** — the role a utility uses: `--font-display`, `--font-sans`, `--font-serif`, `--font-mono`. Mapped to the family in `@theme inline`.

**Never name an Astro variable the same as a Tailwind theme key.** Both end up on `:root`, so `cssVariable: "--font-display"` plus `@theme { --font-display: … }` collide and whichever is emitted last wins; `--font-mono: var(--font-mono)` is a cycle and resolves to nothing. Either way the page silently falls back to system fonts. Family-named variables also mean swapping a font is one line in `@theme inline`.

## Workflow

### Step 1: Configure astro.config.mjs

Add fonts to the top-level `fonts` array (Astro 6+; on Astro 5.x it is `experimental: { fonts: [...] }`):

```javascript
import { defineConfig, fontProviders } from "astro/config";

export default defineConfig({
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Crimson Pro",
      cssVariable: "--font-crimson-pro",
      weights: ["200 900"],          // variable font: one file covers the range
      styles: ["normal", "italic"],
      subsets: ["latin"],
      fallbacks: ["Georgia", "serif"]
    },
    {
      provider: fontProviders.google(),
      name: "DM Sans",
      cssVariable: "--font-dm-sans",
      weights: [400, 500],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["sans-serif"]
    }
  ]
});
```

Request only the weights and subsets the design uses — every extra static weight is another download. For a variable font, a range string (`"200 900"`) fetches one file.

**Providers** (all built in, from `fontProviders`): `google()` for the widest selection; `fontsource()`, `bunny()` (GDPR-friendly), `fontshare()` (distinctive free display faces); `local()` for brand files in `src/assets/fonts/`; `adobe({ id })` with a subscription; `npm()` for a font package already in `node_modules`. Read **`references/font-providers.md`** when you need anything beyond the Google example above: Adobe, local files, icon fonts, Fontsource/Bunny/Fontshare specifics, or advanced options (feature settings, unicode ranges, granular downloads).

### Step 2: Let the config reload

Astro restarts the dev server itself when `astro.config.mjs` changes. If `import { Font } from 'astro:assets'` errors or the preview still shows fallback fonts afterwards, ask the user to restart `bun run dev`. When invoked from website-builder's style-preview loop, encourage locking fonts early — font swaps touch the config, palette and layout tweaks don't.

### Step 3: Add `<Font />` to the layout

Import CSS through the frontmatter (Astro emits a hashed stylesheet link; a literal `/src/index.css` link 404s in production) and declare each family in `<head>`:

```astro
---
import { Font } from 'astro:assets';
import '../index.css';
---

<head>
  <Font cssVariable="--font-crimson-pro" preload={[{ weight: '700', style: 'normal', subset: 'latin' }]} />
  <Font cssVariable="--font-dm-sans" preload={[{ weight: '400', style: 'normal', subset: 'latin' }]} />
</head>
```

Preload only what renders above the fold — usually the display weight of the H1 and the body regular. A bare `preload` preloads every file of that family.

### Step 4: Map families to Tailwind roles

In `src/index.css`:

```css
@theme inline {
  --font-display: var(--font-crimson-pro), Georgia, serif;
  --font-sans: var(--font-dm-sans), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-jetbrains-mono), ui-monospace, monospace;
}
```

`inline` makes the utility reference the family variable directly, so it resolves where `<Font />` defines it. `--font-sans` is Tailwind's default body family; `--font-display` creates a `font-display` utility:

```astro
<h1 class="font-display text-6xl font-bold">Beautiful Heading</h1>
<p class="text-base">Body text inherits font-sans</p>
```

## Pairing

Pairings work because of **contrast**, not similarity:

1. **Don't pair two similar sans-serifs.** `Sora + Inter`, `Archivo + Nunito`, `DM Sans + Work Sans` — all flat; the reader can't tell where the heading ends and the body begins. Pair a serif with a sans, a display with a monospace, or a humanist sans with a geometric sans.
2. **Push weight and size contrast** — light or regular body against heavy display, and ≥3× size jumps between H1 and body — unless the base language file specifies otherwise (elegant runs light; corporate keeps it firm but not theatrical).

A single distinctive family used decisively often beats a weak pair, and some languages (brutalist) call for the system stack — then no web font is needed at all. Avoid generic defaults like Inter and Roboto.

| Display | Body | Why this works |
|---------|------|----------------|
| Crimson Pro (serif, variable) | DM Sans (geometric sans, variable) | Editorial weight against modern minimal — clear hierarchy |
| Spectral (serif, static weights) | Source Sans 3 (humanist sans, variable) | Refined editorial paired with workhorse legibility |
| Instrument Serif | Instrument Sans | Designed as a pair; contrast built in |
| Bitter (slab serif) | Open Sans (humanist sans) | Friendly slab against neutral body — warm but readable |
| Fraunces (display serif) | Inter Tight (geometric sans) | Expressive display over a tight, distraction-free body |
| Sora (geometric sans, 800) | Crimson Pro (serif, 400) | Inverts the usual sans-display / serif-body convention |

Variable families (Crimson Pro, Sora, Inter Tight, Recursive, Fraunces, Source Sans 3) ship one file for the whole weight range — prefer them when the design uses three or more weights. Spectral is static: request only the weights you use.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Page renders in system fonts, no error | Name collision or cycle — check the naming rule above |
| `Font` import fails or variable undefined | Config not reloaded yet — see Step 2. Also check `cssVariable` matches between config, `<Font />` and `@theme inline` |
| Fonts not loading | `<Font />` missing from the layout `<head>` |
| Build fails on a local font | Path must point into `src/assets/fonts/` (not `public/`) |
| FOUT (flash of unstyled text) | Preload the above-the-fold weights; set `fallbacks` so the metric-matched fallback is close |
| Large font payload | Fewer weights/subsets; prefer a variable font |

For OpenGraph images or other programmatic use, `import { fontData } from "astro:assets"` and read `fontData["--font-crimson-pro"]`.

## Report

When done, tell the caller (website-builder) or the user:

- **Families:** name, provider, role (display/body/mono)
- **Weights / styles** requested per family
- **Variables:** Astro `cssVariable` → Tailwind key (e.g. `--font-crimson-pro` → `--font-display`)
- **Restart needed?** Usually no (Astro reloads on config change); say so explicitly if the preview still showed fallbacks

If `site-specification.md` exists, update its **Fonts** line.

## See Also

- `references/font-providers.md` — every provider's options, local and icon fonts, advanced settings
- `website-builder` — overall site workflow and design direction
- `brand-designer` — color palettes (typography lives here, not there)

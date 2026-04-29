---
name: fonts
description: Configure web fonts via Astro's Fonts API (top-level `fonts` in Astro 6+, `experimental.fonts` in 5.x). Use whenever custom fonts come up — user mentions Google Fonts, Fontsource, local fonts, typography changes, font loading or performance, or asks to "add fonts", "change typography", "use custom fonts", "improve font loading", "optimize fonts". The Fonts API replaces `@import` and `@font-face` in CSS.
---

# Fonts (Astro Fonts API)

Configure performant web fonts with automatic optimization, preloading, and privacy-focused delivery from your own site.

## Critical Workflow Order

Font setup MUST follow this exact sequence. The `<Font />` component and CSS variables are only available after the dev server processes the config.

### Step 1: Configure astro.config.mjs (FIRST)

Add fonts to the top-level `fonts` array (Astro 6+ promoted from `experimental.fonts`):

```javascript
import { defineConfig, fontProviders } from "astro/config";

export default defineConfig({
  fonts: [{
    provider: fontProviders.google(),
    name: "Crimson Pro",
    cssVariable: "--font-display",
    weights: [400, 600, 700],
    styles: ["normal"]
  }]
});
```

> **Note**: Astro ≤ 5.x required `experimental: { fonts: [...] }`. Astro 6.x graduated the API; wrap in `experimental` only if you're on an older Astro.

### Step 2: Restart the dev/preview server

The dev server reads `astro.config.mjs` once at startup. Without a restart, `import { Font } from 'astro:assets'` will fail and the CSS variables won't exist yet.

How to restart depends on how the server was started — pick the one that matches your setup:

- **Hakuto preview hook (this repo):** the preview server is managed externally; ask the user to restart it, or wait for the next file-save hook trigger.
- **Manual `bun run dev` / `bun run preview`:** stop the process (Ctrl-C) and re-run the same command.
- **PM2-managed (`pm2 list` shows it):** `pm2 restart <process-name>` — typical names are `preview` or the package name.

Don't proceed to Step 3 until the server has restarted — the next step depends on the new config being live.

### Step 3: Add Font declarations to .astro files (ONLY AFTER RESTART)

Now you can use the `<Font />` component and CSS variables:

**Layout.astro** - Add `<Font />` to head:
```astro
---
import { Font } from 'astro:assets';
---

<head>
  <Font cssVariable="--font-display" preload />
  <!-- other head elements -->
</head>
```

**index.css** - Wire into Tailwind:
```css
@import 'tailwindcss';

@theme {
  --font-sans: var(--font-display), ui-sans-serif, system-ui, sans-serif;
}
```

## Provider Selection

| Provider | Use When | Import |
|----------|----------|--------|
| `fontProviders.google()` | Quick setup, vast selection | Built-in |
| `fontProviders.fontsource()` | Open-source, granular control | Built-in |
| `fontProviders.bunny()` | Privacy-focused, GDPR compliant | Built-in |
| `fontProviders.fontshare()` | Free distinctive fonts | Built-in |
| `fontProviders.local()` | Custom brand fonts, offline support | Built-in |

## Configuration Examples

### Google Fonts

```javascript
import { defineConfig, fontProviders } from "astro/config";

export default defineConfig({
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Crimson Pro",
      cssVariable: "--font-display",
      weights: [400, 600, 700],
      styles: ["normal", "italic"],
      subsets: ["latin"]
    },
    {
      provider: fontProviders.google(),
      name: "DM Sans",
      cssVariable: "--font-body",
      weights: [400, 500, 600],
      styles: ["normal"]
    }
  ]
});
```

### Fontsource (Open-Source)

```javascript
import { defineConfig, fontProviders } from "astro/config";

export default defineConfig({
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "JetBrains Mono",
      cssVariable: "--font-mono",
      weights: [400, 700],
      subsets: ["latin"],
      fallbacks: ["monospace"]
    }
  ]
});
```

### Local Fonts

```javascript
import { defineConfig, fontProviders } from "astro/config";

export default defineConfig({
  fonts: [{
    provider: fontProviders.local(),
    name: "Brand Font",
    cssVariable: "--font-brand",
    options: {
      variants: [
        {
          weight: 400,
          style: "normal",
          src: ["./src/assets/fonts/BrandFont-Regular.woff2"]
        },
        {
          weight: 700,
          style: "normal",
          src: ["./src/assets/fonts/BrandFont-Bold.woff2"]
        }
      ]
    }
  }]
});
```

**Important:** Store local fonts in `src/assets/fonts/`, NOT in `public/` (avoids duplicate files in build).

### Variable Fonts

```javascript
{
  provider: fontProviders.google(),
  name: "Recursive",
  cssVariable: "--font-recursive",
  weights: ["300 1000"],  // Variable weight range
  styles: ["normal"]
}
```

`Recursive` (and `Sora`, `Inter Tight`, `Crimson Pro`, `Spectral`) ships as a single variable font file covering the full weight range — one network request instead of 5–9 separate weight files. Pick a distinctive variable font; avoid `Inter` and `Roboto` defaults.

## Integration with Tailwind v4

Define font families in `src/index.css`:

```css
@import 'tailwindcss';

@theme {
  /* Override default font families */
  --font-sans: var(--font-body), ui-sans-serif, system-ui, sans-serif;
  --font-serif: var(--font-display), ui-serif, Georgia, serif;
  --font-mono: var(--font-mono), ui-monospace, monospace;

  /* Or create custom font utilities */
  --font-display: var(--font-crimson);
  --font-heading: var(--font-sora);
}
```

Usage in components:

```astro
<h1 class="font-display text-4xl">Beautiful Heading</h1>
<p class="font-sans text-base">Body text content</p>
<code class="font-mono">Code snippet</code>
```

## Layout Integration

### Basic Setup (Layout.astro)

Import CSS via the frontmatter — Astro processes the import and emits a hashed stylesheet link automatically. Don't use `<link rel="stylesheet" href="/src/index.css" />`; `/src/` paths don't resolve in production builds.

```astro
---
import { Font } from 'astro:assets';
import '../index.css';
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />

    <!-- Font declarations and preloads -->
    <Font cssVariable="--font-display" preload />
    <Font cssVariable="--font-body" preload />
  </head>
  <body class="font-sans">
    <slot />
  </body>
</html>
```

### Granular Preloading (Performance)

Only preload fonts actually used above-the-fold:

```astro
<Font
  cssVariable="--font-display"
  preload={[
    { weight: '700', style: 'normal', subset: 'latin' }
  ]}
/>

<Font
  cssVariable="--font-body"
  preload={[
    { weight: '400', style: 'normal', subset: 'latin' },
    { weight: '600', style: 'normal', subset: 'latin' }
  ]}
/>
```

## Performance Tips

### Limit Weights and Styles

```javascript
// Bad - downloads all weights
weights: [100, 200, 300, 400, 500, 600, 700, 800, 900]

// Good - only what you use
weights: [400, 600, 700]
```

### Subset Optimization

```javascript
// Only Latin characters (most Western sites)
subsets: ["latin"]

// Add if needed
subsets: ["latin", "latin-ext", "cyrillic"]
```

### Use Fallbacks

```javascript
{
  name: "Crimson Pro",
  cssVariable: "--font-display",
  fallbacks: ["Georgia", "serif"]  // Shown while loading
}
```

## Type Contrast (Read This Before Pairing)

Pairings work because of **contrast**, not similarity. The two cardinal rules:

1. **Don't pair two fonts from the same family of sans-serifs.** `Sora + Inter`, `Archivo + Nunito`, `DM Sans + Work Sans` — all flat. The reader can't tell where the heading ends and the body begins. Pair a serif with a sans, a display with a monospace, or a humanist sans with a geometric sans.
2. **Push weight contrast hard — 300 body vs 800–900 display.** Timid scales (400 body / 600 heading) read as generic. The same goes for size: aim for ≥3× jumps between H1 and body.

A single distinctive font used decisively across the whole site often beats a weak pair.

## Recommended Font Pairings

Avoid "AI slop" aesthetics with distinctive combinations. Each row pairs across-family deliberately:

| Display | Body | Why this works |
|---------|------|----------------|
| Crimson Pro (serif) | DM Sans (geometric sans) | Editorial weight against modern minimal — clear hierarchy |
| Spectral (serif) | Source Sans Pro (humanist sans) | Refined editorial paired with workhorse legibility |
| Instrument Serif | Instrument Sans | Designed-as-a-pair; complementary contrast built-in |
| Bitter (slab serif) | Open Sans (humanist sans) | Friendly slab against neutral body — warm but readable |
| Fraunces (display serif) | Inter Tight (geometric sans) | Expressive display paired with tight, distraction-free body |
| Sora (geometric sans, 800) | Crimson Pro (serif, 400) | Single-distinctive-font feel by inverting the usual sans-display / serif-body convention |

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `Font` import fails or CSS variable undefined | Server hasn't picked up the new config — see Step 2. Also verify `cssVariable` name matches between `astro.config.mjs` and your CSS/component usage. |
| Fonts not loading | Check `<Font />` is in Layout head |
| Build fails | Ensure local font paths are correct |
| FOUT (flash of unstyled text) | Add `preload` to critical fonts |
| Large bundle | Reduce weights/subsets, prefer a variable font |

## Advanced: Programmatic Access

Get font data for OpenGraph images or other uses:

```typescript
import { fontData } from "astro:assets";

const data = fontData["--font-display"];
// Returns array of font face data with src, weight, style
```

## See Also

- `references/font-providers.md` - Detailed provider configurations
- `website-builder/SKILL.md` - Overall site workflow
- `brand-designer/SKILL.md` - Color and typography decisions

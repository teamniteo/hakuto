---
name: fonts
description: REQUIRED for any custom font usage. Configure web fonts using Astro's experimental Fonts API. MUST invoke this skill anytime custom fonts are needed, user requests font changes, typography updates, Google Fonts, Fontsource, local fonts, or asks to "add fonts", "change typography", "use custom fonts", "improve font loading", "optimize fonts". Never use @import for fonts in CSS.
---

# Fonts (Astro Fonts API)

Configure performant web fonts with automatic optimization, preloading, and privacy-focused delivery from your own site.

## Critical Workflow Order

Font setup MUST follow this exact sequence. The `<Font />` component and CSS variables are only available after the dev server processes the config.

### Step 1: Configure astro.config.mjs (FIRST)

Add fonts to the `experimental.fonts` array:

```javascript
import { defineConfig, fontProviders } from "astro/config";

export default defineConfig({
  experimental: {
    fonts: [{
      provider: fontProviders.google(),
      name: "Crimson Pro",
      cssVariable: "--font-display",
      weights: [400, 600, 700],
      styles: ["normal"]
    }]
  }
});
```

### Step 2: Restart preview server (REQUIRED)

The dev server must restart to register the new font configuration. Without this, `import { Font } from 'astro:assets'` will fail and the CSS variables won't exist.

```bash
pm2 restart preview
```

**Do NOT proceed to Step 3 until the server has restarted.**

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
  experimental: {
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
  }
});
```

### Fontsource (Open-Source)

```javascript
import { defineConfig, fontProviders } from "astro/config";

export default defineConfig({
  experimental: {
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
  }
});
```

### Local Fonts

```javascript
import { defineConfig, fontProviders } from "astro/config";

export default defineConfig({
  experimental: {
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
  }
});
```

**Important:** Store local fonts in `src/assets/fonts/`, NOT in `public/` (avoids duplicate files in build).

### Variable Fonts

```javascript
{
  provider: fontProviders.google(),
  name: "Inter",
  cssVariable: "--font-inter",
  weights: ["100 900"],  // Variable weight range
  styles: ["normal"]
}
```

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

```astro
---
import { Font } from 'astro:assets';
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />

    <!-- Font declarations and preloads -->
    <Font cssVariable="--font-display" preload />
    <Font cssVariable="--font-body" preload />

    <link rel="stylesheet" href="/src/index.css" />
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

## Recommended Font Pairings

Avoid "AI slop" aesthetics with distinctive combinations:

| Display | Body | Vibe |
|---------|------|------|
| Crimson Pro | DM Sans | Elegant editorial |
| Sora | Inter | Modern tech |
| Spectral | Source Sans Pro | Professional |
| Instrument Serif | Instrument Sans | Contemporary |
| Bitter | Open Sans | Warm & approachable |
| Archivo | Nunito | Bold & friendly |

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `Font` import fails | Restart preview server after config change |
| CSS variable undefined | Restart preview server, verify `cssVariable` matches config |
| Fonts not loading | Check `<Font />` is in Layout head |
| Build fails | Ensure local font paths are correct |
| FOUT (flash of unstyled text) | Add `preload` to critical fonts |
| Large bundle | Reduce weights/subsets |

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

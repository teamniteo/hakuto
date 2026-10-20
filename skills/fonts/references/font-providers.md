# Font Provider Reference

Read when the Google example in `SKILL.md` isn't enough: another provider (Fontsource, Bunny, Adobe, Fontshare, npm), local brand files, icon fonts, or advanced options. Jump to the provider you need — they are independent of each other.

Every example follows the SKILL.md naming rule: the Astro `cssVariable` is named after the family (`--font-inter`), never after a Tailwind theme key (`--font-sans`, `--font-display`, `--font-mono`). Map family → role in `@theme inline`.

## Contents

- [Google Fonts](#google-fonts)
- [Fontsource](#fontsource)
- [Bunny Fonts](#bunny-fonts)
- [Adobe Fonts](#adobe-fonts)
- [Fontshare](#fontshare)
- [Local Fonts](#local-fonts)
- [npm Packages](#npm-packages)
- [Google Icons](#google-icons)
- [Advanced Configuration](#advanced-configuration)
- [Custom Provider](#custom-provider)

## Google Fonts

The most comprehensive font library with 1500+ font families.

### Basic Usage

```javascript
import { defineConfig, fontProviders } from "astro/config";

export default defineConfig({
  fonts: [{
    provider: fontProviders.google(),
    name: "Roboto",
    cssVariable: "--font-roboto"
  }]
});
```

### Full Configuration

```javascript
{
  provider: fontProviders.google(),
  name: "Inter",
  cssVariable: "--font-inter",
  weights: [400, 500, 600, 700],
  styles: ["normal", "italic"],
  subsets: ["latin", "latin-ext"],
  display: "swap",
  fallbacks: ["system-ui", "sans-serif"]
}
```

### Variable Fonts

```javascript
{
  provider: fontProviders.google(),
  name: "Inter",
  cssVariable: "--font-inter",
  weights: ["100 900"],  // Full variable range
  styles: ["normal"]
}
```

### Experimental Options

```javascript
{
  provider: fontProviders.google(),
  name: "Roboto",
  cssVariable: "--font-roboto",
  options: {
    experimental: {
      glyphs: ["a"],  // Reduce font file size
      variableAxis: {
        slnt: [["-15", "0"]],
        CASL: [["0", "1"]]
      }
    }
  }
}
```

## Fontsource

Open-source fonts with granular control. Self-hosted from npm packages.

### Basic Usage

```javascript
{
  provider: fontProviders.fontsource(),
  name: "JetBrains Mono",
  cssVariable: "--font-jetbrains-mono"
}
```

### Full Configuration

```javascript
{
  provider: fontProviders.fontsource(),
  name: "Source Sans 3",
  cssVariable: "--font-source-sans-3",
  weights: [400, 600, 700],
  styles: ["normal", "italic"],
  subsets: ["latin", "cyrillic"],
  fallbacks: ["sans-serif"]
}
```

### Benefits

- Self-hosted (no third-party requests)
- Better privacy compliance
- Consistent availability

## Bunny Fonts

Privacy-focused alternative to Google Fonts. GDPR compliant.

### Basic Usage

```javascript
{
  provider: fontProviders.bunny(),
  name: "Nunito",
  cssVariable: "--font-nunito"
}
```

### When to Use

- GDPR-sensitive projects
- Privacy-first applications
- Users concerned about Google tracking

## Adobe Fonts

Requires Adobe subscription and project ID.

### Configuration

`astro.config.mjs` runs before Vite's env handling, so `import.meta.env` is not available there and `.env` is not loaded into `process.env` automatically. Load it with Vite's `loadEnv`:

```javascript
import { defineConfig, fontProviders } from "astro/config";
import { loadEnv } from "vite";

const { ADOBE_FONTS_ID } = loadEnv(process.env.NODE_ENV ?? "development", process.cwd(), "");

export default defineConfig({
  fonts: [{
    provider: fontProviders.adobe({ id: ADOBE_FONTS_ID }),
    name: "proxima-nova",
    cssVariable: "--font-proxima-nova"
  }]
});
```

### Setup

1. Create a web project at fonts.adobe.com and copy its project ID
2. Store it in `.env` (`ADOBE_FONTS_ID=abc123`) and in the CI/Cloudflare build environment
3. Read it in the config via `loadEnv` as above (or plain `process.env.ADOBE_FONTS_ID` when the variable is set in the shell)

## Fontshare

Free fonts from Indian Type Foundry.

### Basic Usage

```javascript
{
  provider: fontProviders.fontshare(),
  name: "Satoshi",
  cssVariable: "--font-satoshi"
}
```

### Popular Choices

- Satoshi (modern geometric)
- Cabinet Grotesk (display sans)
- Clash Display (bold headlines)
- General Sans (versatile body)

## Local Fonts

For custom brand fonts or fonts without CDN availability. Uses `fontProviders.local()` with variants nested under `options`.

### Basic Configuration

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

### Multiple Formats (Fallback)

```javascript
{
  provider: fontProviders.local(),
  name: "Custom Font",
  cssVariable: "--font-custom",
  options: {
    variants: [
      {
        weight: 400,
        style: "normal",
        src: [
          "./src/assets/fonts/Custom-Regular.woff2",
          "./src/assets/fonts/Custom-Regular.woff"
        ]
      }
    ]
  }
}
```

### Variable Font

```javascript
{
  provider: fontProviders.local(),
  name: "Custom Variable",
  cssVariable: "--font-variable",
  options: {
    variants: [
      {
        weight: "100 900",
        style: "normal",
        src: ["./src/assets/fonts/CustomVariable.woff2"]
      }
    ]
  }
}
```

### Variant-level Options

Each variant can also specify `display`, `unicodeRange`, `stretch`, `featureSettings`, and `variationSettings`:

```javascript
{
  provider: fontProviders.local(),
  name: "Custom",
  cssVariable: "--font-custom",
  options: {
    variants: [
      {
        weight: 400,
        style: "normal",
        src: ["./src/assets/fonts/custom-400.woff2"],
        display: "block"
      }
    ]
  }
}
```

### Font Source Types

Sources can be relative paths, URLs, or package imports:

```javascript
// Relative path
src: ["./src/assets/fonts/MyFont.woff2"]

// With tech specification
src: [{ url: "./src/assets/fonts/MyFont.woff2", tech: "color-COLRv1" }]
```

### Directory Structure

```
src/
└── assets/
    └── fonts/
        ├── BrandFont-Regular.woff2
        ├── BrandFont-Bold.woff2
        └── BrandFont-Italic.woff2
```

**Keep fonts out of `public/`** — Astro already processes and serves files referenced from `src/assets/fonts/`, so a copy in `public/` ships twice.

## npm Packages

`fontProviders.npm()` resolves a font from a package already installed in `node_modules` (by default it looks for `@fontsource/<family>`), falling back to the jsDelivr CDN. Useful when the font is a dependency you already pin.

```javascript
{
  provider: fontProviders.npm(),
  name: "Inter Tight",
  cssVariable: "--font-inter-tight",
  options: { package: "@fontsource-variable/inter-tight" }  // optional; also `file`, `version`
}
```

Pass `fontProviders.npm({ remote: false })` to resolve only from local packages.

## Google Icons

For Material Symbols icons as fonts.

### Basic Usage

```javascript
{
  provider: fontProviders.googleicons(),
  name: "Material Symbols Outlined",
  cssVariable: "--font-icons"
}
```

### Subset by Glyphs

```javascript
{
  provider: fontProviders.googleicons(),
  name: "Material Symbols Outlined",
  cssVariable: "--font-icons",
  options: {
    experimental: {
      glyphs: ["search", "home", "settings"]
    }
  }
}
```

## Advanced Configuration

### Font Feature Settings

```javascript
{
  name: "Fira Code",
  cssVariable: "--font-fira",
  featureSettings: "'liga' 1, 'calt' 1"  // Enable ligatures
}
```

### Font Display Options

```javascript
{
  name: "Fraunces",
  cssVariable: "--font-fraunces",
  display: "swap"  // swap | block | fallback | optional | auto
}
```

| Value | Behavior |
|-------|----------|
| `swap` | Show fallback immediately, swap when loaded |
| `block` | Brief invisible text, then font |
| `fallback` | Short swap period, may not swap |
| `optional` | Browser decides based on connection |

### Unicode Range (Subsetting)

```javascript
{
  name: "Icon Font",
  cssVariable: "--font-icons",
  unicodeRange: ["U+E000-E100"]  // Only load specific glyphs
}
```

### Granular Font Downloads

Download only specific weight/style combinations by specifying the same font multiple times:

```javascript
fonts: [
  {
    name: "Roboto",
    cssVariable: "--font-roboto",
    provider: fontProviders.google(),
    weights: [400, 500, 600],
    styles: ["normal"]
  },
  {
    name: "Roboto",
    cssVariable: "--font-roboto",
    provider: fontProviders.google(),
    weights: [400],
    styles: ["italic"]
  }
]
```

## Custom Provider

For a private registry or CDN, implement Astro's `FontProvider` interface (`name`, `init`, `resolveFont`, optional `listFonts`) — or wrap an existing unifont provider — and pass it as `provider`. This is rare for a marketing site; see the Astro font provider reference (docs.astro.build/en/reference/font-provider-reference/) before writing one.

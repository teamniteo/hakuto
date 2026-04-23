# Font Provider Reference

Detailed configuration options for each font provider.

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
  cssVariable: "--font-mono"
}
```

### Full Configuration

```javascript
{
  provider: fontProviders.fontsource(),
  name: "Source Sans Pro",
  cssVariable: "--font-source",
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

```javascript
{
  provider: fontProviders.adobe({ id: process.env.ADOBE_FONTS_ID }),
  name: "proxima-nova",
  cssVariable: "--font-proxima"
}
```

### Setup

1. Create project at fonts.adobe.com
2. Get project ID
3. Store in `.env`: `ADOBE_FONTS_ID=abc123`
4. Import in config: `import.meta.env.ADOBE_FONTS_ID`

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

**Important:** Never put fonts in `public/` - Astro copies them there automatically, causing duplicates.

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
  name: "Display Font",
  cssVariable: "--font-display",
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
    cssVariable: "--roboto",
    provider: fontProviders.google(),
    weights: [400, 500, 600],
    styles: ["normal"]
  },
  {
    name: "Roboto",
    cssVariable: "--roboto",
    provider: fontProviders.google(),
    weights: [400],
    styles: ["italic"]
  }
]
```

## Custom Provider

Build your own provider for private registries or custom CDNs.

### Implementation

```typescript
import type { FontProvider } from "astro";

export function myProvider(): FontProvider {
  return {
    name: "my-provider",
    async init(context) {
      // context.storage for caching
      // context.root for resolving local paths
    },
    async resolveFont({ familyName, ...rest }) {
      // Fetch font data from your API/CDN
      // Return { fonts: FontFaceData[] } or undefined
    },
    async listFonts() {
      // Return available font names
      return ["Font A", "Font B"];
    }
  };
}
```

### Usage

```javascript
import { myProvider } from "./font-provider";

export default defineConfig({
  fonts: [{
    provider: myProvider(),
    name: "Private Font",
    cssVariable: "--font-private"
  }]
});
```

### Using a unifont Provider

```typescript
import type { FontProvider } from "astro";
import type { InitializedProvider } from "unifont";
import { acmeProvider } from "@acme/unifont-provider";

export function acmeFontProvider(): FontProvider {
  const provider = acmeProvider();
  let initializedProvider: InitializedProvider | undefined;
  return {
    name: provider._name,
    async init(context) {
      initializedProvider = await provider(context);
    },
    async resolveFont({ familyName, ...rest }) {
      return await initializedProvider?.resolveFont(familyName, rest);
    },
    async listFonts() {
      return await initializedProvider?.listFonts?.();
    },
  };
}
```

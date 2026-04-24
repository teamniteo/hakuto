---
name: brand-designer
description: Generate custom brand color palettes using color theory. Use when user provides hex codes, requests "customize colors", "generate color palette", "create color palette", or uploads logo for color extraction.
---

# Designing Brand Colors

Generate custom brand color palettes using color theory (complementary, triadic, analogous schemes).

## Workflow

### 1. Check Prerequisites
- Read `site-specification.md` for design language and existing colors

### 2. Get Colors
Accept: hex codes, color names, descriptions, or logo analysis (identify 1-3 dominant colors)

### 3. Generate Palette

**Use Tailwind v4 color utilities** for most conversions (hex to RGB, opacity variants, shade generation).

For advanced color theory (hue rotation for complementary/triadic/analogous schemes), use Bun to calculate HSL transformations. Write a temporary JavaScript file with color functions, run with `bun`, then delete.

**Design language scheme selection:**
- Minimalist/Corporate/Elegant → Complementary (180°)
- Technology/Dark/Brutalist → Triadic (120°)
- Colorful → Analogous (40°)

### 4. Check Compatibility

| Design | Best With | Adaptation |
|--------|-----------|------------|
| Minimalist | Any | Bright → use sparingly |
| Technology | Saturated | Pastels → boost saturation |
| Dark | Bright | Dark → increase brightness |
| Corporate | Muted | Vibrant → use conservatively |
| Brutalist | Bold | Subtle → increase contrast |
| Colorful | Vibrant | Muted → boost saturation |
| Elegant | Sophisticated | Saturated → mute |

If incompatible, offer user: adjust color, use strategically, or keep as-is.

### 5. Apply to Site

If approved:
1. Update `site-specification.md`:
   ```
   Base color: [hex] (user provided / logo extracted)
   ```
2. Update color definitions in `src/index.css` within the `@theme {}` block

## Logo Scenarios

**Initial build:** Add to header, use default palette, DON'T invoke skill
**Color extraction:** User says "extract colors from logo" → analyze, confirm, generate palette

## Common Examples

```
"Use #3B82F6" → generate_palette("#3B82F6", design_language)
"Primary #3B82F6, secondary #F59E0B" → generate_palette("#3B82F6", design_language, "#F59E0B")
"Warm earthy colors" → suggest hex, confirm, generate
"Extract from logo" → analyze, get hex, confirm, generate
"Use brand colors" + colors exist → DON'T invoke, read from CSS
```

## Decision Matrix

| Request | Colors Exist? | Action |
|---------|---------------|--------|
| Provides hex | No | ✅ Generate |
| Provides hex | Yes | ⚠️ Confirm replace |
| "Extract from logo" | No | ✅ Generate |
| "Use brand colors" | Yes | ❌ Read CSS |

## Color Application by Design

- **Minimalist**: Sparingly (80% white space)
- **Technology**: Bold, high contrast
- **Dark**: Bright colors for visibility
- **Corporate**: Conservative, strategic
- **Brutalist**: Stark, high-impact
- **Colorful**: Liberal throughout
- **Elegant**: Refined, restrained

## Success Criteria

✅ Colors applied, design maintained, 4.5:1 contrast, user approved, site-specification.md updated

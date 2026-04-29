---
name: brand-designer
description: Generate custom brand color palettes using color theory (complementary, triadic, analogous) — built around a 60/30/10 dominant/accent/highlight ratio with TheColorAPI for hue rotation. Use when user provides hex codes, requests "customize colors", "generate color palette", "create color palette", "pick brand colors", "design a palette", "what colors should I use", or asks to extract colors from a logo. A bare logo upload alone does NOT trigger this skill — wait for an explicit color-extraction or palette request.
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

For hue rotation (complementary/triadic/analogous), prefer **[TheColorAPI](https://www.thecolorapi.com/)** — fetch via WebFetch with `https://www.thecolorapi.com/scheme?hex={HEX}&mode={complement|triad|analogic}&count=5` and use the returned hexes directly. This gives consistent, perceptually-tuned results without writing math. Fall back to a temporary Bun HSL script only if the API is unreachable.

**Compose with a 60/30/10 ratio** — one dominant color (~60% of UI, usually the neutral or background tone), one accent (~30%, the brand's primary hue), one highlight (~10%, used for CTAs and key emphasis). Timid, evenly-distributed palettes read as generic; commit to a hierarchy.

**Design language scheme selection:**
- Minimalist/Corporate/Elegant → Complementary (180°) — high contrast with only two hues keeps the page calm and disciplined
- Technology/Dark/Brutalist → Triadic (120°) — three vibrant hues in tension, energetic without monochromatic flatness
- Colorful → Analogous (40°) — adjacent hues blend smoothly, supporting saturation without visual chaos

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

If the chosen color clashes with the design language (e.g. neon colors on Elegant, pastels on Brutalist), tell the user *what* clashes and *why*, then offer three concrete options:
1. **Adjust the hue/saturation** — show a tweaked hex that fits (e.g. "shift to a deeper #3A6BC8 to keep the corporate restraint")
2. **Apply strategically** — keep the color but limit to accents/CTAs only, leaving body palette neutral
3. **Keep as-is** — apply verbatim, accepting the aesthetic shift, and update `site-specification.md` with the new direction

### 5. Apply to Site

If approved:
1. Update `site-specification.md`:
   ```
   Base color: [hex] (user provided / logo extracted)
   ```
2. Update color definitions in `src/index.css` within the `@theme {}` block

## Logo Scenarios

**Initial build:** Add to header, use the design language's default palette, do NOT invoke this skill. Reason: a logo upload alone isn't a request to redesign the palette — many users keep stock site colors and place the logo in the header. Wait for an explicit color-extraction ask before regenerating.

**Color extraction:** User says "extract colors from logo" → analyze, confirm, generate palette.

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
| Provides hex | Yes | ⚠️ Confirm before replacing — existing palette may be intentional |
| "Extract from logo" | No | ✅ Generate |
| "Use brand colors" | Yes | ❌ Read existing CSS — the user is referring to colors already in `index.css`, not asking for a regen |

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

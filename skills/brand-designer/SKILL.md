---
name: brand-designer
description: Generate custom brand color palettes using color theory (complementary, triadic, analogous) — built around a 60/30/10 dominant/accent/highlight ratio with hue rotation computed directly in OKLCH. Use when user provides hex codes, requests "customize colors", "generate color palette", "create color palette", "pick brand colors", "design a palette", "what colors should I use", or asks to extract colors from a logo. A bare logo upload alone does NOT trigger this skill — wait for an explicit color-extraction or palette request.
---

# Designing Brand Colors

Generate custom brand color palettes using color theory (complementary, triadic, analogous schemes).

## Workflow

### 1. Check Prerequisites
- Read `site-specification.md` for the design direction (base language, dials) and existing colors. During a new-site build (website-builder Workflow A style preview), the spec may not exist yet — take the base language from the chosen direction instead.

### 2. Get Colors
Accept: hex codes, color names, descriptions, or logo analysis (identify 1-3 dominant colors). When invoked from website-builder's style preview with no user colors, take the seed from the direction's palette strategy instead — pick a concrete base hue matching its stated hue family and temperature, and vary that pick per project.

### 3. Generate Palette

**Compute hue rotation directly in OKLCH** — no external API. OKLCH is Tailwind v4's native color space, and rotating hue there preserves perceived lightness, so schemes come out balanced (HSL rotation makes yellows glare and blues muddy).

1. Convert the base hex to OKLCH (`oklch(L C H)`).
2. Rotate H by the scheme angle, keeping L and C:
   - **Complementary**: +180°
   - **Triadic**: ±120°
   - **Analogous**: ±30° (spread to ±60° for a wider family)
   - **Split-complementary**: 180° ± 30°
3. Derive the neutral ramp from the dominant hue at very low chroma (C ≈ 0.005–0.02) so neutrals harmonize instead of reading as generic gray.
4. Adjust L per role — backgrounds near the extremes (L ≥ 0.97 light / L ≤ 0.22 dark), text at the opposite end, accents in the vivid middle (L 0.55–0.75, C 0.15–0.25).
5. **Verify WCAG contrast** (4.5:1 body text, 3:1 large text) for every text/background pair; nudge L until it passes.

Do the math inline or via a short Bun script (`bun -e` with culori, or manual conversion) — either is fine; what matters is the OKLCH space and the checked output. Emit final values as hex or `oklch()` strings for the `@theme` block.

**Compose with a 60/30/10 ratio** — one dominant color (~60% of UI, usually the neutral or background tone), one accent (~30%, the brand's primary hue), one highlight (~10%, used for CTAs and key emphasis). Timid, evenly-distributed palettes read as generic; commit to a hierarchy.

**Design language scheme selection:**
- Minimalist/Corporate/Elegant → Complementary (180°) — high contrast with only two hues keeps the page calm and disciplined
- Technology/Dark → Triadic (±120°) — three vibrant hues in tension, energetic without monochromatic flatness
- Brutalist → Monochrome + one complementary accent — the language allows exactly one violent accent against a black/white base
- Colorful → Analogous (±30°, spread to ±60° for a wider family) — adjacent hues blend smoothly, supporting saturation without visual chaos

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
1. Update `site-specification.md` — the **Palette** line in the Design Direction section (dominant/secondary/accent hexes + scheme), and note the source ("user provided" / "logo extracted") in Design Evolution
2. Update color definitions in `src/index.css` within the `@theme {}` block

## Logo Scenarios

**Initial build, bare logo upload:** Add to header, keep the project's generated palette, do NOT invoke this skill. Reason: a logo upload alone isn't a request to redesign the palette. Wait for an explicit color-extraction ask.

**Initial build, user supplied colors or asked for extraction:** website-builder DOES invoke this skill during its style-preview step (Workflow A) — generate the palette from the user's colors so the preview is built on the real brand.

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

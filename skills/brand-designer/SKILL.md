---
name: brand-designer
description: Generates brand color palettes from color-wheel theory with a 60/30/10 dominant/secondary/accent split and WCAG contrast checks, then applies them to the site's theme. Use for "use my brand colors #3B82F6", "generate a color palette", "pick brand colors", "design a palette", "what colors should I use", "extract colors from my logo". Skip for typography (`fonts`), vibe restyles or a new site's direction (`website-builder`, which calls this skill itself), one-off color fixes on a single element, and a bare logo upload with no color request.
---

# Designing Brand Colors

Generate a custom palette from color-wheel theory, check every text pair for contrast, and write it into the shadcn theme tokens the scaffold already uses.

**Role names used everywhere** (matching website-builder's spec template):
- **dominant** (~60%) — backgrounds and large surfaces, usually a tinted neutral
- **secondary** (~30%) — supporting surfaces, panels, muted areas
- **accent** (~10%) — the brand hue: CTAs, links, key emphasis

Timid, evenly-distributed palettes read as generic; commit to the hierarchy.

## Workflow

### 1. Check prerequisites

Read `site-specification.md` for the design direction (base language, dials) and existing colors. During a new-site build (website-builder Workflow A style preview) the spec does not exist yet — take the base language from the chosen direction, and return results to website-builder instead of writing the spec (step 5).

If the user says "use my brand colors" and colors already exist in `src/index.css`, they mean those — read them, don't regenerate. If they provide new hex codes and a palette already exists, confirm before replacing, since the existing palette may be intentional.

### 2. Get the seed

Accept hex codes, color names, descriptions ("warm earthy" → suggest a hex and confirm), or a logo (identify 1–3 dominant colors, confirm them). When invoked from website-builder's style preview with no user colors, take the seed from the direction's palette strategy — pick a concrete base hue matching its hue family and temperature, and vary that pick per project.

A bare logo upload is not a palette request: it goes in the header and the project palette stays as generated. Extract only when asked.

### 3. Generate the palette

Compute in **OKLCH** — rotating hue there preserves perceived lightness, so schemes come out balanced (HSL rotation makes yellows glare and blues muddy). No external API.

1. Convert the seed to OKLCH (`oklch(L C H)`).
2. Pick the scheme from the design language and rotate H, keeping L and C:

| Language | Scheme | Why | Applying the accent | If the seed clashes |
|---|---|---|---|---|
| Minimalist | Complementary (+180°) | Two hues keep the page calm | Sparingly; ~80% whitespace | Bright seed → limit to accents |
| Corporate | Complementary (+180°) | Disciplined, high contrast | Conservative, strategic | Vibrant seed → mute, use conservatively |
| Elegant | Complementary (+180°) | Restraint | Refined, rare | Saturated seed → mute |
| Technology | Triadic (±120°) | Energetic tension without flatness | Bold, high contrast | Pastel seed → boost chroma |
| Dark | Triadic (±120°) | Bright elements carry hierarchy | Bright for visibility | Dark seed → raise L |
| Brutalist | Monochrome + one complementary accent | Exactly one violent accent on black/white | Stark, high-impact | Subtle seed → push contrast |
| Colorful | Analogous (±30°, up to ±60°) | Adjacent hues stay coherent at high chroma | Liberal throughout | Muted seed → boost chroma |

   Split-complementary (180° ± 30°) is a valid alternative where two accents are wanted.
3. Derive the neutral ramp from the dominant hue at very low chroma (C ≈ 0.005–0.02) so neutrals harmonize instead of reading as generic gray.
4. Set L per role — dominant backgrounds near the extremes (L ≥ 0.97 light / L ≤ 0.22 dark), text at the opposite end, accent in the vivid middle (L 0.55–0.75, C 0.15–0.25).
5. Produce a `.dark` variant: swap the L extremes, keep the hues, and re-check contrast.

If the user's color clashes with the design language (neon on Elegant, pastels on Brutalist), say *what* clashes and *why*, then offer: (1) a tweaked value that fits, (2) keep it for accents/CTAs only, or (3) keep it as-is and record the aesthetic shift in the spec.

Do the math inline or via a short Bun script (`bun -e` with culori, or manual conversion) — what matters is the OKLCH space and checked output.

### 4. Check contrast

WCAG AA: **4.5:1** for body text, **3:1** for large text — **≥24px regular or ≥18.66px bold**. Check every foreground/background token pair, in both `:root` and `.dark`, and nudge L until it passes.

**Also check the stock utilities the site will actually use for text, not only the generated tokens.** Contrast failures overwhelmingly come from off-palette utilities reached for during page authoring, and from `text-muted-foreground` — check that one against `background` and `muted` explicitly. Reference ratios on white (hex values are Tailwind v3 approximations; v4 ships OKLCH equivalents that land within a few hundredths):

```
contrast vs #ffffff
  text-slate-400  #94a3b8   2.56:1   fail — decorative/icons only
  text-slate-500  #64748b   4.76:1   pass, marginally
  text-slate-600  #475569   7.58:1   pass
  text-sky-600    #0284c7   4.10:1   large-only (≥24px, or ≥18.66px bold)
```

Any token that clears only the large-text bar is labelled **large-only**, so a later "small eyebrow label" doesn't quietly reuse it at 12px.

### 5. Present, then apply

Present this table for approval (it is also what website-builder copies into the spec):

| Role | Hex | OKLCH | HSL triplet | Token | Contrast vs background |
|---|---|---|---|---|---|
| dominant | #f7f8fa | oklch(0.979 0.003 265) | 220 23% 97% | `--background` | — |
| text | #11151a | oklch(0.194 0.012 254) | 213 21% 8% | `--foreground` | 17.2:1 pass |
| secondary | … | … | … | `--secondary`, `--muted` | … |
| accent | … | … | … | `--primary` | … |
| muted text | … | … | … | `--muted-foreground` | … |

Verdicts are **pass**, **large-only**, or **fail**. Add a row per `-foreground` and per extra text utility from step 4, and a second block for `.dark`.

On approval:

1. **Write the HSL triplets into the shadcn base variables** in `src/index.css` — `@layer base` `:root` and `.dark`. The scaffold stores them as bare channel triplets (`--primary: 222.2 47.4% 11.2%`) and `@theme` wraps them (`--color-primary: hsl(var(--primary))`), so an `oklch()` or hex value there breaks every utility. Update `background`, `foreground`, `primary`, `secondary`, `accent`, `muted`, each `-foreground`, plus `card`/`popover` (usually = background), `border`/`input`/`ring`, and the scaffold's `brand-primary` / `brand-accent` pair. Leave the `@theme` wrappers alone.
2. Map roles onto tokens: **dominant** → `background`, `card`, `popover`; **secondary** → `secondary`, `muted`; **accent** → `primary` (the default Button fill), `ring`, `brand-accent`. Note shadcn's own `--accent` is a subtle hover surface, not the brand accent — keep it near the secondary tone.
3. **Spec:** if `site-specification.md` exists, update the Design Direction **Palette** line (dominant/secondary/accent hexes + scheme), write the contrast table under `### Contrast`, and note the source ("user provided" / "logo extracted" / "generated") in Design Evolution. If it does not exist yet, return the table to website-builder — it creates the spec at preview approval.

## Done when

Palette applied in `:root` and `.dark` as HSL triplets, every text pair (including `text-muted-foreground` and stock utilities used for text) at 4.5:1 or labelled large-only, the user approved, and the spec updated — or the table handed back to website-builder.

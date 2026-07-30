# Design Dials

Three dials, each 1–10, set during Workflow A from the Design Read + interview and recorded in `site-specification.md`. They convert vibe into mechanical layout/motion/spacing decisions so two projects with different briefs cannot converge on the same site by default.

**Load this file when:** proposing design directions (Workflow A), or whenever a customization request changes a dial (Workflow D).

**Hierarchy:** dials sit at the *direction* tier of the customization hierarchy. An explicit user request ("center the hero", "no animations") always overrides a dial rule — apply it, then adjust the recorded dial to match reality.

---

## DESIGN_VARIANCE — layout adventurousness

*1 = perfect symmetry, 10 = artful chaos*

| Band | Rules |
|------|-------|
| **1–3 Conventional** | Centered heroes allowed. Uniform symmetric grids, consistent alignment throughout. For trust-first, regulated, conservative-corporate briefs. |
| **4–6 Confident** | Left-aligned default. **Centered hero banned above 4** (exception: manifesto/announcement pages). At least one asymmetric moment per page. Mixed column ratios (7/5, 8/4) instead of equal splits. |
| **7–8 Expressive** | Asymmetric or split-stage hero required. Bento grids with unequal cells. ≥4 distinct layout families per 8 sections. Overlapping elements and deliberate negative-space plays. |
| **9–10 Editorial/agency** | Broken-grid compositions, oversized display type bleeding off-canvas, rotated/offset elements. Portfolio and agency territory. |

## MOTION_INTENSITY — animation sophistication

*1 = static, 10 = cinematic*

| Band | Rules |
|------|-------|
| **1–2 Static** | Hover color/underline transitions only. |
| **3–4 Composed** | CSS transitions + **one** orchestrated page-load stagger (`animation-delay` utilities on hero elements). |
| **5–6 Alive** | Scroll-reveals via IntersectionObserver in a native `<script>` tag. Micro-interactions on CTAs (`active:scale-[0.98]`, magnetic hover). |
| **7–8 Choreographed** | CSS scroll-driven animations (`animation-timeline: view()`) with IO fallback. Sticky-stack sections via `position: sticky`. Max one marquee per page. |
| **9–10 Cinematic** | React island with the Motion library is justified — the only band where React-for-animation is allowed. |

**Hard rules at every level:**
- `prefers-reduced-motion` respected on everything beyond hover transitions.
- **Motion claimed = motion shown.** If MOTION > 4 and the built page doesn't visibly move, lower the recorded dial instead of pretending.

## VISUAL_DENSITY — spacing and information packing

*1 = art gallery, 10 = cockpit*

| Band | Rules |
|------|-------|
| **1–3 Airy** | `py-32`+ sections, one idea per viewport, `max-w-3xl` text columns, 2-column grids max. |
| **4–6 Standard** | `py-20`/`py-24` sections, standard marketing rhythm, 3-column grids. |
| **7–10 Dense** | `py-12`/`py-16` sections, multi-column layouts, more items per section, tables and dense grids acceptable. |

Density maps to `@theme` tokens set once in `src/index.css` (`--spacing-section`, container max-widths) so every component inherits it mechanically — never hand-tune section padding against the dial.

---

## Setting Dials from the Brief

Derive baselines from vibe words and audience, then adjust per design-language presets (each language file carries its own dial ranges).

| Brief signal | VARIANCE / MOTION / DENSITY |
|---|---|
| "minimalist", "calm", "clean" | 5 / 3 / 2 |
| "trust-first", regulated, finance/health/legal | 3 / 2 / 5 |
| "premium", "luxury", consumer brand | 7 / 6 / 3 |
| "playful", "bold", agency/creative | 9 / 8 / 3 |
| "technical", devtools, API product | 6 / 4 / 5 |
| SaaS default (no strong signal) | 7 / 6 / 4 |
| Content/editorial site | 6 / 3 / 3 |

Never interview the user about dials directly — they answer vibe questions; you derive the numbers and show them inside direction proposals where they're cheap to correct.

## Changing Dials Later

Vibe-level customization requests translate to dial moves — echo the change and record it in the spec's Design Evolution:

- "Make it calmer / more professional" → MOTION −2 and/or VARIANCE −2
- "Make it livelier / more fun" → MOTION +2
- "It feels cramped / give it air" → DENSITY −2
- "Too empty / show more at once" → DENSITY +2
- "Too safe / too boring" → VARIANCE +2

After a dial change, regenerate the affected mechanics (spacing tokens, motion recipes, layout choices) — don't patch one section and leave the rest contradicting the recorded value.

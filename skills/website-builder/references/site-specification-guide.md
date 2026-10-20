# Site Specification Management

*Reference for managing site-specification.md*

---

## Purpose

Maintains consistency across sessions. Documents the chosen design direction (dials, palette, fonts, patterns) + customizations = the site's current aesthetic. The spec is the consistency contract: every later page and session builds to it, not to defaults.

**Structure:** exactly three sections — Configuration, Design Direction, Design Evolution.

---

## Timing

**Create:** at style-preview approval (Workflow A step 6), before the full build
**Read:** before every subsequent page or design change
**Update:** after design changes, dial changes, or customizations

**Missing spec on an existing site:** infer from built pages (palette from `index.css`, fonts from `astro.config.mjs`, dials from the layouts actually used), then write it.

**Pre-dial specs** (sites built before the direction/dial system): the old format lacks the Design Direction section. Infer dial values from the built pages, migrate the spec to the current template, and continue.

---

## Structure

### 1. Configuration
Site Type (SaaS/General) · Target Audience · Primary Goal

### 2. Design Direction
The approved direction from the style preview:
- **Direction**: name + one-line concept
- **Base Language**: which principles file it draws from
- **Dials**: VARIANCE / MOTION / DENSITY values
- **Palette** (60/30/10): the generated hexes with roles + the wheel scheme used
- **Fonts**: display + body with weights, wired via Astro Fonts API
- **Signature patterns** and **motion recipes** in use (names from `design-craft.md`)

### 3. Design Evolution
- **User customizations**: dated list of deviations and dial changes (or "None yet")
- **Current style**: concise prose description of the actual aesthetic in use

---

## Example

```markdown
# Site Specification

## Configuration
- **Site Type**: SaaS
- **Target Audience**: Small pharma and biotech companies
- **Primary Goal**: Trial signups and demo bookings

## Design Direction
- **Direction**: "Ledger" — precision-instrument feel for a data-heavy product
- **Base Language**: Technology
- **Dials**: VARIANCE 6 · MOTION 4 · DENSITY 5
- **Palette** (60/30/10): dominant #101418 · secondary #2A3440 · accent #FF6B35 — triadic
- **Fonts**: Sora 700–800 (display) / Instrument Sans 400 (body) — via Astro Fonts API
- **Signature patterns**: Asymmetric Split hero, Bento feature grid
- **Motion recipes**: Orchestrated Entrance, Scroll Reveal

## Design Evolution
- **User customizations**: 2026-07-30: accent #FF6B35 → #C792EA; MOTION 4 → 3 ("calmer")
- **Current style**: Dark, precise, near-black surfaces with purple accent, sharp
  4px radii, monospace labels, restrained motion (single hero stagger only).
```

Aim for 25–40 lines total.

---

## Rules

1. **Three sections only** — Configuration, Design Direction, Design Evolution
2. **Always build to Current**, not the original direction
3. **Every dial, palette, or font change gets recorded** — these are what later sessions rely on
4. **Update after design changes**, not after every page
5. Dial changes regenerate affected mechanics site-wide (spacing tokens, motion recipes) — never leave pages contradicting the recorded values

---

## Common Workflows

**New site:** preview approved → create spec → full build → inform user
**Additional page:** read spec → build to Current with the recorded dials → update if patterns changed
**Customization:** read spec → apply (literal directly; vibe-level as dial change) → update Evolution + Current → regenerate affected pages
**User returns later:** read spec, especially Current Style and Dials → match the actual site

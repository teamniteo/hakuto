# Site Specification

*Read when creating or migrating `site-specification.md`. This file holds the one template.*

The spec is the consistency contract: every later page and session builds to it, not to defaults.
It records the approved direction (dials, palette, fonts, patterns), the user's customizations,
and the build plan. It lives at the project root, not in CLAUDE.md, so CLAUDE.md stays clean for
`scaffold-sync`.

---

## Timing

- **Create** when the user approves the style preview (end of Workflow A step 5), before the
  full build. From then on `brand-designer` and `fonts` can write their results into it.
  Before that point the palette and fonts live only in `index.css` / `astro.config.mjs` and the
  chat; `brand-designer` hands its palette and contrast table back to website-builder, which
  copies them in at approval.
- **Read** before every page, design change, or returning session.
- **Update** after every design change: palette, fonts, dials, a new signature pattern or motion
  recipe, a user customization. A page that only reuses existing patterns needs no Design edit,
  but tick its line in the Project Plan.

**Missing spec on an existing site:** infer it from the built pages (palette from `index.css`,
fonts from `astro.config.mjs`, dials from the layouts actually used), then write it.

**Older specs** (built before the direction/dial system, or with the plan still in CLAUDE.md):
infer dial values from the built pages, migrate to the template below, and move any
`## Project Plan` from CLAUDE.md into the spec.

---

## Template

```markdown
# Site Specification

## Configuration
- **Site Type**: [SaaS or General]
- **Target Audience**: [who]
- **Primary Goal**: [conversion/credibility/leads/signups]
- **Tone**: [from interview dimension 6, e.g. "warm, plain-spoken" or "technical, no fluff"]

## Design Direction
- **Direction**: "[Name]" — [one-line concept]
- **Base Language**: [language] (see `references/design-languages/`)
- **Dials**: VARIANCE n · MOTION n · DENSITY n
- **Palette** (60/30/10): dominant #… · secondary #… · accent #… — [scheme, e.g. triadic]
- **Fonts**: [Display + weights] / [Body + weights] — via Astro Fonts API
  (or one family, or "system stack" where the language calls for it)
- **Signature patterns**: [named patterns from design-craft.md]
- **Motion recipes**: [named recipes from design-craft.md]

### Contrast
[Optional — written by brand-designer: role pair, ratio, pass / large-only / fail]

## Design Evolution
- **User customizations**: [dated list of deviations and dial changes, or "None yet"]
- **Current style**: [concise prose description of the actual aesthetic in use]

## Project Plan
- [ ] index.css (theme tokens)
- [ ] Layout.astro (cleaned base layout, site.ts constants)
- [ ] index.astro (Homepage: Hero, Features, CTA)
- [ ] …one line per page and shared component
```

Aim for 30–50 lines in total.

---

## Example (Design Direction + Evolution)

```markdown
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

---

## Rules

1. **Always build to Current**, not the original direction — Current is what the user approved
   most recently.
2. **Record every dial, palette, or font change** — these are what later sessions rely on.
3. **Dial changes regenerate affected mechanics site-wide** (spacing tokens, motion recipes) —
   never leave pages contradicting the recorded values.
4. **Keep the Project Plan honest** — tick items as they are built, add lines when pages are
   added later.

## Common Workflows

- **New site:** preview approved → create spec (with Project Plan) → full build → tick plan → report
- **Additional page:** read spec → build to Current with the recorded dials → add/tick the plan
  line → update Design only if a new pattern was introduced
- **Customization:** read spec → apply (literal directly; vibe-level as dial change) → update
  Evolution + Current → regenerate affected pages
- **User returns later:** read spec, especially Current style and Dials → match the actual site

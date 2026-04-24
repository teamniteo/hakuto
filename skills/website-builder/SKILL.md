---
name: website-builder
description: Generates production-ready websites through conversational design. Use when user requests website creation, landing pages, site modifications, or adding pages. Handles site architecture, design systems, and coordinates with copywriting and brand customization skills.
---

# Website Builder

Generate production-ready websites by starting with site types and design languages as intelligent defaults, then customizing to user's exact vision. Coordinates with copywriting and brand customization skills.

---

## Philosophy: Intelligent Defaults, Infinite Flexibility

Design languages provide starting aesthetics with proven patterns. All elements (colors, fonts, layouts, components) are fully customizable.

**Customization hierarchy:**
1. User specifies explicitly → Use exactly what user wants
2. User provides direction → Adapt design language to match
3. User provides no input → Use design language as intelligent default

Design languages prevent blank canvas paralysis while remaining fully flexible to user vision.

---

## Core Workflows

### A) New Site
User says: "Build me a SaaS site", "Create a website", "I need a landing page"

**Steps:**
1. Determine site type (SaaS or General)
2. Determine design language (ask user or infer from description)
3. Check logo upload (add to header if provided, use default colors)
4. Load references: `site-types/[type].md` + `design-languages/[language].md`
5. **Assess content:**
   - Missing/partial → INVOKE professional-copywriter
   - Complete → Use verbatim
6. Generate site using design language as starting aesthetic
7. Create `site-specification.md` documenting starting point and any customizations
8. Inform user of starting aesthetic and customization flexibility

### B) Add Standard Page
User says: "Build the features page", "Add pricing", "Create about page", "Make contact page"

**What are standard pages:**
- Core site pages from site-type architecture
- Examples: features, pricing, about, contact, team, services
- Use standard layouts and site-type structure

**Steps:**
1. Read `site-specification.md` (critical for consistency and customizations)
2. Load references: site-type + design-language
3. **Assess content:**
   - Missing/partial → INVOKE professional-copywriter
   - Complete → Use verbatim
4. Build page matching existing style and any user customizations
5. Update `site-specification.md`

### C) Brand Colors
User says: "Use my brand colors #3B82F6", "Match my logo", "Extract colors"

**Steps:**
1. Verify site exists (minimum homepage)
2. **INVOKE brand-designer** (handles entire workflow)
3. Brand-designer: reads spec → generates palette → presents → applies if approved
4. Result: Pages regenerated with new colors only
5. Update `site-specification.md` documenting color customization

### D) User Customization Requests
User says: "Make it warmer", "Use rounder buttons", "Try purple instead", "Use Helvetica"

**Steps:**
1. Read `site-specification.md` for current state
2. Apply requested changes regardless of original design language
3. Regenerate affected pages with customizations
4. Update `site-specification.md` documenting the evolution
5. If significant deviation from design language: document the new aesthetic direction

**Examples:**
- "Make Minimalist warmer" → Adjust to warmer tones while keeping minimal aesthetic
- "I want pink instead of blue" → Change to pink, regardless of what design language suggested
- "Use Helvetica" → Change to Helvetica, even if design language suggested Inter
- "Make buttons rounded" → Round the buttons, even if design language suggested sharp edges

### E) Logo Upload
**During initial build:** Add to header, use default palette, DON'T invoke brand-designer
**With color extraction request:** INVOKE brand-designer per Workflow D

---

## Site Types

**Path:** `references/site-types/[type].md`

- **SaaS** (saas.md) - Product-led sites (software, apps, APIs)
- **General** (general.md) - Company/organization sites (agencies, services)

See reference files for detailed structure, goals, and page requirements.

---

## Design Languages

**Path:** `references/design-languages/[language].md`

Available starting aesthetics (all fully customizable): Minimalist, Technology, Dark, Corporate, Brutalist, Colorful, Elegant

**Selection:** Ask user for aesthetic direction or infer from description. Frame as foundation that can be fully customized.

See reference files for color palettes, typography, component styling, and layout approaches.

---

## Content Strategy

**Before generating any page:**

1. Content complete (full sentences)? → Use verbatim (preserve user content)
2. Content partial (bullets/headlines)? → INVOKE professional-copywriter to expand
3. Content missing? → INVOKE professional-copywriter to generate
4. Edit requested? → INVOKE professional-copywriter

**Critical rule:** User-provided content is sacred. Generate only when missing/partial or explicitly requested.

---

## State Management

### Create site-specification.md After Every Build

```markdown
# Site Specification

## Configuration
- **Site Type**: [SaaS/General/E-commerce/Portfolio/etc.]
- **Design Language (Starting Point)**: [Technology/Modern/Minimalist/etc.]
- **Target Audience**: [Describe target audience]
- **Primary Goal**: [Conversion/credibility/leads/signups/etc.]

## Design Evolution
- **Starting aesthetic**: [Design language description from starting point]
- **User customizations**: [List any user-requested deviations from starting design language, or "None yet - using default {language} design"]
- **Current style**: [Concise description of actual aesthetic currently in use, including specific colors, typography, visual patterns]
```

**Always read before subsequent pages.** Ensures consistency and respects all customizations across sessions.

---

## Skill Coordination

### Professional-Copywriter

**Invoke when:**
- Content missing for page/section
- User provides partial content (bullets/headlines only)
- User requests: "write copy", "improve this", "make it professional"

**DON'T invoke when:**
- User provides complete copy
- No edit requested
- User says "use my copy as-is"

**How it works:**
- Generates benefit-driven, conversion-optimized copy
- Follows site-type structure (SaaS vs General)
- Matches design language tone
- Preserves user's core message when expanding partial content

### Brand-Designer

**Invoke when:**
- User requests: "use my brand colors", "match my logo", "use #3B82F6"
- User asks to extract colors from uploaded logo

**DON'T invoke:**
- During initial site builds (unless user explicitly requests)
- Logo uploads without color extraction request

**How it works:**
- Reads site-specification.md
- Gets colors (user input or logo extraction)
- Generates palette via TheColorAPI
- Checks compatibility with design language
- Presents for approval → applies → updates spec

---

## Design Language Application

Inform user of starting aesthetic and that everything is customizable.

Apply initial direction:
- Choose palette from design-language options
- Select typography system
- Apply component styling
- Use layout approaches

Adapt based on feedback:
- User requests changes → Apply them (colors, fonts, buttons, layouts)
- Document all customizations in spec file
- Significant evolution → Note new aesthetic direction in spec

**Result:** Sites using same design language look distinct due to palette/typography choices, industry adaptations, and user customizations.

---

## Quality Checklist

✅ User content preserved (not overwritten)
✅ Copywriter invoked only when needed
✅ Structure follows site-type patterns
✅ Initial styling uses design-language intelligently
✅ All user customizations applied and respected
✅ Navigation integrated correctly
✅ site-specification.md created/updated documenting starting point AND customizations
✅ Logo handled correctly (visual vs color extraction)
✅ Brand colors only via brand-designer (unless user specifies directly)
✅ Told user about spec file and customization flexibility

---

## Skill Invocation Quick Reference

| Situation | Copywriter? | Brand-Designer? |
|-----------|-------------|-----------------|
| No content | ✅ YES | ❌ NO |
| Partial content | ✅ YES | ❌ NO |
| Complete content | ❌ NO | ❌ NO |
| "Improve copy" | ✅ YES | ❌ NO |
| "Use my colors" | ❌ NO | ✅ YES |
| "Extract logo colors" | ❌ NO | ✅ YES |
| Logo (initial build) | ❌ NO | ❌ NO |
| "Make it warmer/darker/etc" | ❌ NO | ❌ NO (you handle) |
| "Use this font" | ❌ NO | ❌ NO (you handle) |
| "Round the buttons" | ❌ NO | ❌ NO (you handle) |

---

## Key Principles

**Flexibility First:** Design languages provide intelligent starting points. User customization overrides everything. No constraints.

**Content:** User's words are sacred. Generate only when missing/partial or requested.

**Brand:** Design language defaults first. Custom colors when user explicitly requests via brand-designer OR directly specifies.

**Skills:** Website-builder orchestrates. Each skill owns its domain. You handle design customizations directly.

**State:** Document everything in site-specification.md - starting point AND evolution through customizations.

**Consistency:** Always read spec before building subsequent pages to respect all customizations.

**Communication:** Frame design languages as starting points, not limits. "We can customize anything" should be clear from the start.

---

*Builds websites by starting with site types and design languages as intelligent defaults, then adapting freely based on user feedback. Invokes professional-copywriter for content needs and brand-designer for color customization. Maintains consistency and tracks evolution via site-specification.md.*

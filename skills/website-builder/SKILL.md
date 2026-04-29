---
name: website-builder
description: Core orchestrator for generating production-ready Astro websites through conversational design. Use when user requests "build a SaaS site", "make me a landing page", "create a website", "I need a portfolio site", "create a company website", "build a marketing site", or wants to add or modify pages ("add a features page", "build the pricing page", "create about page", "add contact"). Handles site architecture and design systems, and coordinates with `professional-copywriter`, `brand-designer`, `fonts`, `section-form`, `section-blog`, `section-docs`, `plausible-analytics`, and the audit skills.
---

# Website Builder

Generate production-ready websites by starting with site types and design languages as intelligent defaults, then customizing to user's exact vision. Coordinates with copywriting, brand, fonts, section, and audit skills.

---

## Working Alongside CLAUDE.md

This skill is the orchestrator referenced by Hakuto's CLAUDE.md. **Follow CLAUDE.md's "Mandatory Workflow" (the 7-step `index.css` → `Layout.astro` → Project Plan → Components flow) alongside this skill's design workflows.** CLAUDE.md is always loaded; this skill adds the conversational, design-aware layer on top of that mechanical sequence.

When the two overlap, CLAUDE.md owns the *how* (which files to touch, what conventions to follow) and this skill owns the *what* (which site type, which design language, which content strategy, when to invoke siblings).

---

## Technical Constraints

These rules are enforced by CLAUDE.md and apply to every page this skill produces. See CLAUDE.md for full details.

- **Tailwind CSS v4** — config lives in `src/index.css` via `@theme {}`, not `tailwind.config.mjs` (delete that file if present).
- **`className` (not `class`) on React/shadcn components** — `<Button className="...">` is correct; `<Button class="...">` is a TypeScript error. Native HTML in `.astro` keeps `class`.
- **Astro Fonts API for custom fonts** — `experimental.fonts` (5.x) or top-level `fonts` (6+) in `astro.config.mjs`. Never use `@import` or `@font-face` for custom fonts. ALWAYS invoke the `fonts` skill when custom fonts are involved.
- **Cloudflare adapter `imageService: "compile"`** (NOT `"passthrough"`). Passthrough installs a noop image service that breaks `<Picture>`/`<Image>` in dev and build.
- **`<Picture>` for local images, `<img>` for external URLs** — local assets go through `astro:assets` for AVIF/WebP/responsive widths. Unsplash and other external URLs use plain `<img>`.

---

## Philosophy: Intelligent Defaults, Infinite Flexibility

Design languages provide starting aesthetics with proven patterns. All elements (colors, fonts, layouts, components) are fully customizable.

**Customization hierarchy:**
1. User specifies explicitly → Use exactly what user wants
2. User provides direction → Adapt design language to match
3. User provides no input → Use design language as intelligent default

**Why this order:** explicit user intent always wins because the user knows their context (existing brand, audience, taste) better than any default can model. Direction comes second because it's a real signal of preference, just less precise than a literal answer. Defaults sit last so the model never blocks on a blank canvas — but they're scaffolding, not constraints. Treat each tier as a *starting point* for the next: explicit choices override direction, direction overrides defaults.

Design languages prevent blank canvas paralysis while remaining fully flexible to user vision — they exist to give the model a concrete creative starting point so the first draft has *character*, not generic AI-slop neutrality. Users always have the final word.

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
7. **Set `site` in `astro.config.mjs`** to the production URL (e.g. `"https://yoursite.com"`) — if the user has provided a domain. If they haven't, leave the scaffold default (`http://localhost:4321`) and add a reminder to update it before deploy. This is Astro's [`site` option](https://docs.astro.build/en/reference/configuration-reference/#site) and drives the sitemap, canonical links, and JSON-LD.
8. Create `site-specification.md` documenting starting point and any customizations
9. Inform user of starting aesthetic and customization flexibility

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

**Note on Customization Hierarchy:** Workflow B does not re-consult the explicit/direction/default hierarchy because `site-specification.md` is already the authoritative source of truth — every prior customization is recorded there as the *Current* style. Apply Current; don't re-derive from defaults.

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

**Why:** Users provide copy because they know their product, audience, voice, and factual claims better than a generative model can. Rewriting verbatim copy silently — even to "polish" it — risks introducing inaccuracies (numbers, feature claims, names), eroding the user's voice, and breaking the trust contract: "I gave you my words, you used them." When you're unsure whether to rewrite, default to verbatim; users can always ask for an edit explicitly.

---

## State Management

### Create site-specification.md After Every Build

Minimum template:

```markdown
# Site Specification

## Configuration
- **Site Type**: [SaaS or General — see `references/site-types/`]
- **Design Language (Starting Point)**: [Minimalist/Technology/Dark/Corporate/Brutalist/Colorful/Elegant — see `references/design-languages/`]
- **Target Audience**: [Describe target audience]
- **Primary Goal**: [Conversion/credibility/leads/signups/etc.]

## Design Evolution
- **Starting aesthetic**: [Design language description from starting point]
- **User customizations**: [List any user-requested deviations, or "None yet - using default {language} design"]
- **Current style**: [Concise description of the actual aesthetic in use, including specific colors, typography, visual patterns]
```

**See `site-specification-guide.md`** (in this skill folder) for the full guide — when to create, read, and update the spec; example evolution flows; the rule "always build to *Current*, not *Starting*"; and complete worked examples.

**Always read before subsequent pages.** Ensures consistency and respects all customizations across sessions.

---

## Skill Coordination

The website-builder is the orchestrator. Other skills own their domains; invoke them when the user's intent crosses into one. Below are the canonical handoffs.

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

### Fonts

**Always invoke** whenever any custom font is used (CLAUDE.md mandate). The Astro Fonts API is the only correct way to wire custom fonts on Hakuto sites — never `@import` or `@font-face` in CSS.

**Invoke when:**
- Choosing typography during initial build
- User requests "change fonts", "use Crimson Pro", "add Google Fonts", "use a custom font"
- Updating type pairings or weights

### Section-Form / Section-Blog / Section-Docs

**Section-Form — invoke when:** user wants any interactive form ("contact form", "newsletter", "waitlist", "booking", "feedback"). Skip for pure mailto:, third-party-hosted forms, or visual-only mockups.

**Section-Blog — invoke when:** user wants a blog/articles/news/changelog section requiring listing pages, post templates, and category/author archives.

**Section-Docs — invoke when:** user wants a `/docs` area with sidebar navigation, search, and nested category pages.

These are content-area builders — the website-builder lays the foundation; section skills bolt on the specialized area.

### Plausible-Analytics

**Invoke when:** user requests "add analytics", "add Plausible", "add tracking", "page views", or privacy-friendly visitor tracking — *and* the project deploys to Cloudflare Workers. Skip for Vercel/Netlify/static-only deploys (the standard Plausible `<script>` tag is the right path there).

### Audit Skills (post-build handoffs)

After a build is in a shippable state, hand off to the audit skills as part of the launch pass:

- **seo-audit** — meta tags, headings, canonicals, schema, sitemap, robots.txt, alt text, mixed content, internal links, image sizes, favicons. Run before every launch.
- **pagespeed-audit** — live Lighthouse run via Google PageSpeed Insights (Core Web Vitals + scores) for deployed pages.
- **code-review** — Hakuto-specific source audit against CLAUDE.md rules (className, Tailwind v4, Fonts API, Cloudflare adapter, image optimization, accessibility).
- **prelaunch-checklist** — final pre-launch verification (wrangler config, form wiring, legal pages, placeholder content, SEO/code-review pass confirmation, manual Cloudflare dashboard reminders).

Suggest these proactively when the user says "I'm ready to ship", "going live", "launch check", or once a site has all its pages built.

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

| Situation | Skill to invoke |
|-----------|-----------------|
| No / partial content | `professional-copywriter` |
| "Improve copy", "rewrite this" | `professional-copywriter` |
| Complete content provided | (none — use verbatim) |
| "Use my brand colors", "use #3B82F6" | `brand-designer` |
| "Extract colors from my logo" | `brand-designer` |
| Logo upload, initial build, no color request | (none — add to header, default palette) |
| Any custom font / "use Crimson Pro" / "add Google Fonts" | `fonts` (always — CLAUDE.md mandate) |
| "Add a contact / newsletter / inquiry form" | `section-form` |
| "Add a blog / articles / news section" | `section-blog` |
| "Add docs / API docs / developer docs" | `section-docs` |
| "Add analytics / Plausible / tracking" (Cloudflare deploy) | `plausible-analytics` |
| "Make it warmer/darker", "round the buttons", color/spacing tweaks | (none — handle directly) |
| "Run SEO test", "check meta tags" | `seo-audit` |
| "Test page speed", "run Lighthouse" | `pagespeed-audit` |
| "Code review", "lint the site" | `code-review` |
| "Ready to ship", "launch check", "go live" | `prelaunch-checklist` |

---

## Key Principles

**Flexibility First:** Design languages provide intelligent starting points. User customization overrides everything. No constraints.

**Content:** User's words are sacred. Generate only when missing/partial or requested.

**Brand:** Design language defaults first. Custom colors when user explicitly requests via brand-designer OR directly specifies.

**Skills:** Website-builder orchestrates. Each skill owns its domain. You handle design customizations directly.

**State:** Document everything in site-specification.md - starting point AND evolution through customizations.

**Consistency:** Always read spec before building subsequent pages to respect all customizations.

**Communication:** Frame design languages as starting points, not limits. "We can customize anything" should be clear from the start.

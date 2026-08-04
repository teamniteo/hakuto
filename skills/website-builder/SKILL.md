---
name: website-builder
description: Core orchestrator for generating production-ready Astro websites through conversational design. Use when user requests "build a SaaS site", "make me a landing page", "create a website", "I need a portfolio site", "create a company website", "build a marketing site", or wants to add or modify pages ("add a features page", "build the pricing page", "create about page", "add contact"). Runs the design interview, proposes design directions, builds a style preview for approval, then the full site. Coordinates with `professional-copywriter`, `brand-designer`, `fonts`, `section-form`, `section-blog`, `section-docs`, `plausible-analytics`, and the audit skills.
---

# Website Builder

Generate production-ready websites through a design interview: read the brief, ask only about genuine gaps, propose distinct design directions, prove the chosen one with a style preview, then build. Coordinates with copywriting, brand, fonts, section, and audit skills.

---

## Working Alongside CLAUDE.md

This skill is the orchestrator referenced by Hakuto's CLAUDE.md. **Follow CLAUDE.md's "Mandatory Workflow" (the 7-step `index.css` → `Layout.astro` → Project Plan → Components flow) alongside this skill's design workflows.** CLAUDE.md is always loaded; this skill adds the conversational, design-aware layer on top of that mechanical sequence.

When the two overlap, CLAUDE.md owns the *how* (which files to touch, what conventions to follow) and this skill owns the *what* (which direction, which content strategy, when to invoke siblings).

---

## Technical Constraints

These rules are enforced by CLAUDE.md and apply to every page this skill produces. See CLAUDE.md for full details.

- **Tailwind CSS v4** — config lives in `src/index.css` via `@theme {}`, not `tailwind.config.mjs` (delete that file if present).
- **`className` (not `class`) on React/shadcn components** — `<Button className="...">` is correct; `<Button class="...">` is a TypeScript error. Native HTML in `.astro` keeps `class`.
- **Astro Fonts API for custom fonts** — `experimental.fonts` (5.x) or top-level `fonts` (6+) in `astro.config.mjs`. Never use `@import` or `@font-face` for custom fonts. ALWAYS invoke the `fonts` skill when custom fonts are involved.
- **Cloudflare adapter `imageService: "custom"`** with no `image.service` key, so Astro's sharp default survives. Both `"compile"` and `"passthrough"` replace sharp — `"compile"` does so despite the name.
- **`<Picture>` for local images, `<img>` for external URLs** — local assets go through `astro:assets` for WebP/responsive widths. Unsplash and other external URLs use plain `<img>`.
- **Right-size every local image** — `width={W} widths={[W, W * 2]} sizes="…"`, all three: without `widths` Astro emits no `srcset` and the `sizes` is inert. Omit `height` unless a crop is intended — a pair that disagrees with the source ratio makes sharp crop.

---

## Existing Site Check

Before workflows B/C/D/E (any site that already exists), check `.hakuto-sync.json` at the project root. If `last_synced_at` is older than ~3 months — or the file is missing — suggest the user run the `scaffold-sync` skill first so the redesign starts from the current scaffold infra (Cloudflare adapter, image service, trailing-slash, etc.). One-line nudge, not a hard gate — proceed with the user's request regardless of their answer.

---

## Philosophy: Interview, Direct, Prove, Build

Design languages are **principles, not menus** — each project generates its own palette, typography, and structure from those principles plus the design dials. Two projects sharing a language must not share a look.

**Customization hierarchy:**
1. User specifies explicitly → Use exactly what user wants
2. User provides direction → Adapt the chosen design direction (dials live here)
3. User provides no input → Derive from the Design Read and design-language principles

**Why this order:** explicit user intent always wins because the user knows their context better than any default can model. Direction comes second because it's a real signal of preference. Principles sit last so the model never blocks on a blank canvas — they're scaffolding, not constraints. Users always have the final word.

---

## Design Dials (summary)

Three dials, 1–10, set from the Design Read + interview and recorded in `site-specification.md`:

- **DESIGN_VARIANCE** — layout adventurousness (≥5 bans the centered-hero default; ≥7 requires asymmetric/bento structures)
- **MOTION_INTENSITY** — animation sophistication (hover-only → orchestrated stagger → scroll choreography)
- **VISUAL_DENSITY** — spacing scale (maps to `@theme` spacing tokens)

Full band mechanics, the vibe-word inference table, and dial-change rules: **`references/design-dials.md`** — load it when proposing directions or changing dials. Never interview the user about dial numbers; derive them and surface them inside direction proposals.

---

## Core Workflows

### A) New Site

User says: "Build me a SaaS site", "Create a website", "I need a landing page"

**Step 1 — Design Read.** Before anything else, state a one-line inference: *"Reading this as: [site kind] for [audience], with a [vibe] feel, leaning [aesthetic family]."* It doubles as a cheap correct-me checkpoint. Determine site type (SaaS or General) here.

**Step 2 — Adaptive interview.** Check the brief against these 8 dimensions, marking each `answered` / `confidently inferable` / `gap`:

1. What the product/company is + one-line value prop
2. Audience + what they need to believe
3. Primary goal / #1 CTA (signup? demo? inquiry?)
4. Existing brand assets (logo, colors, fonts, screenshots)
5. Aesthetic direction / vibe / admired sites — the most common gap
6. Tone & personality (serious ↔ playful, warm ↔ technical)
7. Content availability (assess from what was pasted — rarely ask)
8. Pages needed beyond homepage + production domain

Use AskUserQuestion **only for gaps** — max 4 questions per call, a second round only if more than 4 genuine gaps exist. A rich brief gets zero questions. **Confidently inferable ≠ gap: do not ask, surface the inference in the Design Read and direction proposals where correcting it is cheap.** Never ask about layout, motion, or density — the dials decide those.

**Step 3 — Propose 2–3 design directions.** Load `references/design-dials.md`, `references/design-craft.md` (source of the pattern and recipe names below), and the 2–3 candidate `references/design-languages/[language].md` files (never all 7). Directions must be genuinely distinct — differing on at least two of: base language, light/dark, dial band, hue temperature, type-contrast strategy. Each direction brief contains:

- **Name** (evocative, ≤2 words) + one-line concept — why it fits this brand
- **Base language** (may blend two)
- **Dials**: VARIANCE / MOTION / DENSITY with a one-clause reason
- **Palette strategy**: hue family + temperature + light/dark + 60/30/10 roles (no hexes yet)
- **Type pairing**: two named fonts + contrast rationale
- **Signature move**: one named layout pattern; **motion recipe**: one named recipe

Print the full briefs in the chat message, then a single-select AskUserQuestion ("Which direction?") with one option per direction. A "mix A's palette with B's layout" answer is legitimate — synthesize a merged direction and confirm it.

**Step 4 — Style preview.** Build the smallest thing that proves the chosen direction, with real tokens (the approved preview IS the shipped foundation):

1. Generate the palette fresh: INVOKE **brand-designer** — with the user's colors/logo if provided, otherwise seeded from the direction's palette strategy (hue family + temperature + wheel scheme). Brand-designer owns the OKLCH wheel math and contrast checks in both cases.
2. Invoke the **fonts** skill for the pairing. Then tell the user — mandatory, every time fonts change: *"Restart your dev server so the new fonts load, then open the preview."*
3. Write `src/index.css` `@theme {}`: palette tokens, font variables, radius scale, section-spacing tokens derived from DENSITY.
4. Build `src/pages/branding.astro`: palette swatches with role labels, type specimen (H1–H3, body, weights), button/card/input samples — **plus one full sample hero** using the direction's signature move and motion recipe.
5. Point the user to `http://localhost:4321/branding/`. Never run `bun run dev` yourself; validate with `bun run check`.

**Step 5 — Iterate.** Apply feedback to `index.css` + `branding.astro` only — the cheap loop. Map vibe-level feedback to dial changes and echo them ("Dropping MOTION to 3"). Font swaps re-invoke the fonts skill + another restart notice, so lock fonts early. Loop until approved.

**Step 6 — Lock spec, build the site.**
1. Write `site-specification.md` (template below) recording direction, dials, palette, fonts.
2. Load `references/design-craft.md` + `references/site-types/[type].md`, then follow CLAUDE.md's Mandatory Workflow steps 3–7. Site-type files define content *jobs*; section composition and order come from the direction, dials, and craft patterns.
3. Content per Content Strategy below — pass the copywriter the direction name and tone.
4. Set `site` in `astro.config.mjs` to the production URL if the user provided a domain (drives sitemap/canonicals/JSON-LD); otherwise leave the scaffold default and note it must be updated before deploy.
5. Keep `branding.astro` as the living style guide — exclude it from nav.
6. Run the **pre-flight check** (end of `design-craft.md`) before declaring done, and tell the user about the spec file and customization flexibility.

### B) Add Standard Page

User says: "Build the features page", "Add pricing", "Create about page"

**Steps:**
1. Read `site-specification.md` — extract direction, dials, palette, fonts, and which layout patterns existing pages use. **If the spec predates the dial system, infer dials from the built pages and backfill them into the spec.**
2. Load `references/design-craft.md` + site-type file.
3. Assess content: missing/partial → INVOKE professional-copywriter; complete → use verbatim.
4. Build the page to the spec's *Current* style and dial mechanics — prefer layout families the site hasn't led with yet, while keeping the established visual system.
5. Run the pre-flight check; update `site-specification.md`.

**Note:** Workflow B does not re-run the interview or re-consult defaults — the spec is the authoritative source. Apply Current; don't re-derive.

### C) Brand Colors

User says: "Use my brand colors #3B82F6", "Match my logo", "Extract colors"

**Steps:**
1. Verify site exists (minimum homepage)
2. **INVOKE brand-designer** (handles the entire workflow: reads spec → generates palette via color-wheel rules → presents → applies if approved)
3. Result: pages regenerated with new colors only
4. Update the spec's **Design Direction palette line** and note the change in Design Evolution

### D) User Customization Requests

User says: "Make it warmer", "Use rounder buttons", "Try purple instead", "Make it livelier"

**Steps:**
1. Read `site-specification.md` for current state
2. **Literal requests** (specific colors, fonts, radius, spacing) → apply directly, regardless of the original direction
3. **Vibe-level requests** → translate to dial changes per `references/design-dials.md` ("livelier" → MOTION +2), echo the change, and regenerate the affected mechanics consistently — not just one section
4. Update `site-specification.md`; significant deviations update the Design Direction itself, not just Evolution

### E) Logo Upload

**During initial build:** add to header; the project palette is still generated from the direction (Workflow A step 4) — a bare logo upload is NOT a request to extract colors from it
**With color extraction request:** INVOKE brand-designer with the logo as the color source (Workflow C)

---

## Reference Loading Map

| When | Load |
|------|------|
| Skill invoked | (this file only) |
| Workflow A step 3 — directions | `design-dials.md` + `design-craft.md` + 2–3 candidate `design-languages/*.md` |
| Workflow A step 6 / Workflow B — build | `design-craft.md` (already loaded in A) + `site-types/[type].md` |
| Workflow C/D | spec; `design-dials.md` only if dials change |

Never load all 7 design languages.

---

## Content Strategy

**Before generating any page:**

1. Content complete (full sentences)? → Use verbatim (preserve user content)
2. Content partial (bullets/headlines)? → INVOKE professional-copywriter to expand
3. Content missing? → INVOKE professional-copywriter to generate
4. Edit requested? → INVOKE professional-copywriter

**Critical rule:** User-provided content is sacred. Generate only when missing/partial or explicitly requested.

**Why:** Users provide copy because they know their product, audience, voice, and factual claims better than a generative model can. Rewriting verbatim copy silently — even to "polish" it — risks introducing inaccuracies, eroding the user's voice, and breaking the trust contract. When unsure whether to rewrite, default to verbatim.

---

## State Management

### site-specification.md

Create at style-preview approval (Workflow A step 6); read before every subsequent page; update after every change.

```markdown
# Site Specification

## Configuration
- **Site Type**: [SaaS or General]
- **Target Audience**: [who]
- **Primary Goal**: [conversion/credibility/leads/signups]

## Design Direction
- **Direction**: "[Name]" — [one-line concept]
- **Base Language**: [language] (see `references/design-languages/`)
- **Dials**: VARIANCE n · MOTION n · DENSITY n
- **Palette** (60/30/10): dominant #… · secondary #… · accent #… — [scheme, e.g. triadic]
- **Fonts**: [Display font + weights] / [Body font + weights] — via Astro Fonts API
- **Signature patterns**: [named patterns in use]
- **Motion recipes**: [named recipes in use]

## Design Evolution
- **User customizations**: [dated list of deviations and dial changes, or "None yet"]
- **Current style**: [concise prose description of the actual aesthetic in use]
```

**See `site-specification-guide.md`** (in this skill folder) for the full lifecycle — when to create, read, and update; the rule "always build to *Current*, not the original direction"; and the backfill rule for pre-dial specs.

---

## Skill Coordination

The website-builder is the orchestrator. Other skills own their domains; invoke them when the user's intent crosses into one.

### Professional-Copywriter

**Invoke when:** content missing/partial for a page or section; user requests "write copy", "improve this".
**DON'T invoke when:** user provides complete copy; no edit requested.
**How it works:** benefit-driven, conversion-optimized copy; follows site-type content jobs; matches the direction's tone (pass direction name + tone from the spec); preserves the user's core message when expanding.

### Brand-Designer

**Invoke when:** generating any project palette — Workflow A's style preview (with user colors/logo if provided, otherwise seeded from the direction's palette strategy) and any later color request ("use my brand colors", "use #3B82F6", logo extraction).
**DON'T invoke:** the user asks to reuse colors that already exist in `index.css`.
**How it works:** reads spec → generates palette via OKLCH color-wheel rules (complementary/triadic/analogous per design language) → checks direction compatibility → presents for approval → applies → updates the spec's Design Direction palette.

### Fonts

**Always invoke** whenever any custom font is used (CLAUDE.md mandate) — including Workflow A step 4. The Astro Fonts API is the only correct wiring; never `@import` or `@font-face`. **Every font change requires telling the user to restart their dev server.**

### Section-Form / Section-Blog / Section-Docs

**Section-Form:** any interactive form ("contact form", "newsletter", "waitlist"). Skip for mailto:, third-party-hosted, or visual-only forms.
**Section-Blog:** blog/articles/news/changelog with listing pages and archives.
**Section-Docs:** `/docs` area with sidebar navigation and search.

These bolt specialized areas onto the foundation this skill lays.

### Plausible-Analytics

**Invoke when:** user requests analytics/tracking *and* the project deploys to Cloudflare Workers. Skip for Vercel/Netlify/static-only (standard Plausible `<script>` tag there).

### Audit Skills (post-build handoffs)

- **seo-audit** — meta tags, headings, canonicals, schema, sitemap, alt text. Run before every launch.
- **pagespeed-audit** — live Lighthouse via PageSpeed Insights for deployed pages.
- **code-review** — Hakuto-specific source audit against CLAUDE.md rules.
- **prelaunch-checklist** — final pre-launch verification.

Suggest these proactively when the user says "ready to ship", "going live", or once all pages are built.

---

## Quality Checklist

✅ Design Read stated before any questions or code
✅ Interview asked only about genuine gaps (≤4 questions per round)
✅ 2–3 genuinely distinct directions proposed; user picked or merged one
✅ Style preview built with real tokens and approved before the full build
✅ Dials + direction + palette + fonts recorded in site-specification.md
✅ User content preserved (not overwritten); copywriter invoked only when needed
✅ Site-type content jobs all covered; structure driven by dials + craft patterns
✅ Pre-flight check (design-craft.md) run on every built page
✅ Logo handled correctly (visual vs color extraction)
✅ Told user about the spec file and customization flexibility

---

## Skill Invocation Quick Reference

| Situation | Skill to invoke |
|-----------|-----------------|
| No / partial content | `professional-copywriter` |
| "Improve copy", "rewrite this" | `professional-copywriter` |
| Complete content provided | (none — use verbatim) |
| "Use my brand colors", "use #3B82F6" | `brand-designer` |
| "Extract colors from my logo" | `brand-designer` |
| Logo upload, no color request | (none — header + project palette) |
| Any custom font | `fonts` (always — CLAUDE.md mandate) |
| "Add a contact / newsletter / inquiry form" | `section-form` |
| "Add a blog / articles / news section" | `section-blog` |
| "Add docs / API docs" | `section-docs` |
| "Add analytics" (Cloudflare deploy) | `plausible-analytics` |
| "Make it warmer/livelier/calmer" | (none — dial change, handle directly) |
| "Run SEO test" | `seo-audit` |
| "Test page speed" | `pagespeed-audit` |
| "Code review" | `code-review` |
| "Ready to ship", "launch check" | `prelaunch-checklist` |

---

## Key Principles

**Interview, don't assume:** the Design Read + gap questions replace guessing. But never re-ask what the brief already answers.

**Prove before building:** the style preview is the cheapest point to change direction. The approved preview is the shipped foundation — no drift.

**Principles, not menus:** design languages give attitude and constraints; every project generates its own palette, type, and structure. Two sites, same language, different look.

**Content:** user's words are sacred. Generate only when missing/partial or requested.

**State:** everything lives in site-specification.md — direction, dials, palette, fonts, evolution. Always read it before building; always build to *Current*.

**Skills:** website-builder orchestrates; each sibling owns its domain; dial-level customizations are handled directly.

---
name: website-builder
description: Core orchestrator for building Astro websites through conversational design — runs the design interview, proposes directions, builds a style preview for approval, then the full site. Use for "build a SaaS site", "make me a landing page", "create a website", "add a pricing page", and for restyling by feel ("make it warmer", "more premium", "redesign the homepage"). Skip for copy-only edits (`professional-copywriter`), palette-only changes (`brand-designer`), font swaps (`fonts`), and blog, docs or form sections (`section-blog`, `section-docs`, `section-form`).
---

# Website Builder

Generate production-ready websites through a design interview: read the brief, ask only about genuine gaps, propose distinct design directions, prove the chosen one with a style preview, then build. Coordinates with copywriting, brand, fonts, section, and audit skills.

---

## Working Alongside CLAUDE.md

This skill is the orchestrator referenced by Hakuto's CLAUDE.md. Follow CLAUDE.md's "Mandatory Workflow" (`index.css` → `Layout.astro` → Project Plan → Components) alongside this skill's design workflows. CLAUDE.md owns the *how* (which files to touch, what conventions to follow); this skill owns the *what* (which direction, which content strategy, when to invoke siblings).

Two deliberate differences from older CLAUDE.md copies: the Project Plan lives in `site-specification.md` under `## Project Plan`, not in CLAUDE.md (so CLAUDE.md stays clean for `scaffold-sync`), and the spec is created at style-preview approval rather than while writing `index.css`.

CLAUDE.md's Technical Requirements (Tailwind v4 in `src/index.css`, `className` on React components, Fonts API, Cloudflare `imageService: "custom"`, `<Picture>` with `width`/`widths`/`sizes`) apply to every page this skill produces.

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

**Why this order:** explicit user intent always wins because the user knows their context better than any default can model. Direction comes second because it's a real signal of preference. Principles sit last so the model never blocks on a blank canvas — they're scaffolding, not constraints.

**Prove before building:** the style preview is the cheapest point to change direction, and the approved preview is the shipped foundation — no drift.

---

## Design Dials (summary)

Three dials, 1–10, set from the Design Read + interview and recorded in `site-specification.md`:

- **DESIGN_VARIANCE** — layout adventurousness (≥5 bans the centered-hero default; ≥7 requires asymmetric/bento structures)
- **MOTION_INTENSITY** — animation sophistication (hover-only → orchestrated stagger → scroll choreography)
- **VISUAL_DENSITY** — spacing scale (maps to `@theme` spacing tokens)

Full band mechanics, the vibe-word inference table, and dial-change rules: **`references/design-dials.md`** — load it when proposing directions or changing dials. Don't interview the user about dial numbers; derive them and surface them inside direction proposals.

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

Use AskUserQuestion **only for gaps** — max 4 questions per call, a second round only if more than 4 genuine gaps exist. A rich brief gets zero questions. Confidently inferable is not a gap: surface the inference in the Design Read and direction proposals, where correcting it is cheap. Don't ask about layout, motion, or density — the dials decide those.

**Step 3 — Propose 2–3 design directions.** Load `references/design-dials.md`, `references/design-craft.md` (source of the pattern and recipe names below), and the 2–3 candidate `references/design-languages/[language].md` files (never all 7). Directions must be genuinely distinct — differing on at least two of: base language, light/dark, dial band, hue temperature, type-contrast strategy. Each direction brief contains:

- **Name** (evocative, ≤2 words) + one-line concept — why it fits this brand
- **Base language** (may blend two)
- **Dials**: VARIANCE / MOTION / DENSITY with a one-clause reason
- **Palette strategy**: hue family + temperature + light/dark + 60/30/10 roles (dominant / secondary / accent; no hexes yet)
- **Type**: one decisive family or a contrast pairing, or the system stack where the language calls for it (brutalist often does) — with a one-clause rationale
- **Signature move**: one named layout pattern; **motion recipe**: one named recipe

Print the full briefs in the chat message, then a single-select AskUserQuestion ("Which direction?") with one option per direction. A "mix A's palette with B's layout" answer is legitimate — synthesize a merged direction and confirm it.

**Step 4 — Style preview.** Build the smallest thing that proves the chosen direction, with real tokens (the approved preview IS the shipped foundation):

1. Generate the palette fresh: invoke **brand-designer** — with the user's colors/logo if provided, otherwise seeded from the direction's palette strategy (hue family + temperature + wheel scheme). Brand-designer owns the wheel math and contrast checks; since no spec exists yet, it returns the palette and contrast table to you.
2. If the direction uses a web font, invoke the **fonts** skill to wire it. A system stack needs no skill — write it straight into the `--font-*` tokens.
3. Write `src/index.css`: palette tokens, font variables, radius scale, section-spacing tokens derived from DENSITY.
4. Build `src/pages/branding.astro`: palette swatches with role labels, type specimen (H1–H3, body, weights), button/card/input samples — **plus one full sample hero** using the direction's signature move and motion recipe.
5. Validate with `bun run check`, then point the user to `http://localhost:4321/branding/`. If no dev server is running and port 4321 is free, start `bun run dev`; if 4321 is taken, the user already has one running — don't start a second. Astro restarts itself when `astro.config.mjs` changes; if the preview still shows fallback fonts, ask the user to restart `bun run dev`.

**Step 5 — Iterate, then lock the spec.** Apply feedback to `index.css` + `branding.astro` only — the cheap loop. Map vibe-level feedback to dial changes and echo them ("Dropping MOTION to 3"). Font swaps re-run the fonts skill and can need a dev-server restart, so lock fonts early. On approval, create `site-specification.md` from **`references/site-specification-guide.md`** — direction, dials, palette, contrast table, fonts, tone, and the `## Project Plan` listing every page and shared component.

**Step 6 — Build the site.**
1. **Rewrite `public/llms.txt` from the spec, in the same breath.** The scaffold ships a raw template that is served **live** at `/llms.txt`: left untouched it publishes "Site Name", `hello@example.com`, and bracketed placeholders. As soon as the spec exists, the real values exist — write site name, one-line description, overview, and contact. Key Pages must list only routes that actually build.
   **Cover route *families*, not just the marketing pages.** An `llms.txt` that lists five top-level pages on a site with a blog, docs and a templated hub omits exactly the body of content an agent wants. For every route family the site builds, add a category-level entry with a count — `- [Blog](/blog/) — 37 posts on …`, `- [Docs](/docs/) — 30 pages covering …` — rather than enumerating URLs. Every route in the main nav needs an entry too.
   **Write the `## When to use this` section** — the scaffold ships it as a prompt, and it is the single thing agent-readiness scanners look for to decide whether a site tells agents when to reach for it. Name the concrete jobs this site is the right answer for, and at least one adjacent job it is *not*. Generic marketing copy does not read as guidance and scores as absent.
2. Load `references/design-craft.md` + `references/site-types/[type].md`, then follow CLAUDE.md's Mandatory Workflow steps 3–7, ticking items off the spec's Project Plan. Site-type files define content *jobs*; section composition and order come from the direction, dials, and craft patterns.
3. Content per Content Strategy below.
4. Set `site` in `astro.config.mjs` to the production URL if the user provided a domain (drives sitemap/canonicals/JSON-LD); otherwise leave the scaffold default and list it as an open TODO in the final report.
5. Keep `branding.astro` as the living style guide — exclude it from nav.
6. Re-check `public/llms.txt` against the pages that actually got built — routes and contact only. Confirm every route family with 5+ pages has a category entry, and that no listed route 404s.
7. Run the **pre-flight check** (end of `design-craft.md`) and the Before Declaring Done list below, then send the final report.

### B) Add Standard Page

User says: "Build the features page", "Add pricing", "Create about page"

**Steps:**
1. Read `site-specification.md` — extract direction, dials, palette, fonts, and which layout patterns existing pages use. If the spec predates the dial system or is missing, migrate or create it per `references/site-specification-guide.md`.
2. Load `references/design-craft.md` + site-type file.
3. Content per Content Strategy below.
4. Build the page to the spec's *Current* style and dial mechanics — prefer layout families the site hasn't led with yet, while keeping the established visual system.
5. Add the new route to `public/llms.txt` Key Pages if it's a page agents should find (skip utility pages). If the route joins an existing family, update that family's count instead of adding a URL.
6. Run the pre-flight check; add/tick the page in the Project Plan, and update the Design sections only if a new pattern was introduced.

Workflow B does not re-run the interview or re-consult defaults — the spec is the authoritative source. Apply Current; don't re-derive.

### C) Brand Colors

User says: "Use my brand colors #3B82F6", "Match my logo", "Extract colors"

**Steps:**
1. Verify site exists (minimum homepage)
2. Invoke **brand-designer** — it handles the whole flow: reads spec → generates palette via color-wheel rules → presents → applies if approved
3. Result: pages regenerated with new colors only
4. Confirm the spec's Design Direction palette line and Design Evolution reflect the change

### D) Restyle by Feel

User says: "Make it warmer", "Make it more premium", "Make it livelier", "Redesign the homepage"

**Steps:**
1. Read `site-specification.md` for current state
2. Translate vibe-level requests to dial changes per `references/design-dials.md` ("livelier" → MOTION +2), echo the change, and regenerate the affected mechanics consistently — not just one section
3. Literal values that come bundled with the restyle (a radius, a spacing step) → apply directly, regardless of the original direction. A new palette goes through `brand-designer`; a font swap through `fonts`.
4. Update `site-specification.md`; significant deviations update the Design Direction itself, not just Evolution

### E) Logo Upload

**During initial build:** add to header; the project palette is still generated from the direction (Workflow A step 4) — a bare logo upload is not a request to extract colors from it.
**With color extraction request:** invoke brand-designer with the logo as the color source (Workflow C).

---

## Reference Loading Map

| When | Load |
|------|------|
| Skill invoked | (this file only) |
| Workflow A step 3 — directions | `design-dials.md` + `design-craft.md` + 2–3 candidate `design-languages/*.md` |
| Creating or migrating a spec (A step 5, B/C/D on an old or missing spec) | `site-specification-guide.md` |
| Workflow A step 6 / Workflow B — build | `design-craft.md` (already loaded in A) + `site-types/[type].md` |
| Workflow C/D | spec; `design-dials.md` only if dials change |

All paths are under `references/`. Never load all 7 design languages.

---

## Content Strategy

Before generating any page:

1. Content complete (full sentences)? → Use verbatim
2. Content partial (bullets/headlines) or missing? → invoke **professional-copywriter** to expand or generate
3. User asks for copy edits ("improve this", "rewrite the hero")? → invoke **professional-copywriter**

Pass the copywriter the direction name and the spec's Tone so the copy matches the design. Placeholder copy you write yourself starts with `TODO:` so the prelaunch checklist catches it.

**User-provided content is sacred.** Users provide copy because they know their product, audience, voice, and factual claims better than a generative model can. Rewriting verbatim copy silently — even to "polish" it — risks introducing inaccuracies, eroding the user's voice, and breaking the trust contract. When unsure whether to rewrite, default to verbatim.

---

## Skill Coordination

The website-builder is the orchestrator. Other skills own their domains; invoke them when the user's intent crosses into one.

- **brand-designer** — any project palette: Workflow A's style preview and any later color request. Not needed when reusing colors already in `index.css`. Returns hex/OKLCH/HSL values plus a contrast table; writes them into the spec when one exists.
- **fonts** — whenever a web font is chosen or changed. The Astro Fonts API is the only correct wiring; never `@import` or `@font-face`.
- **section-form / section-blog / section-docs** — interactive forms; blog/articles/news/changelog with listings and archives; `/docs` with sidebar and search. They bolt specialized areas onto the foundation this skill lays.
- **plausible-analytics** — analytics on a Cloudflare Workers deploy. For Vercel/Netlify/static-only, paste Plausible's standard `<script>` tag instead.
- **Audits (post-build)** — `seo-audit` (built HTML), `hakuto-review` (source), `pagespeed-audit` (deployed URL), `prelaunch-checklist` (final gate). Suggest them once all pages are built or when the user says "ready to ship".

### Quick Reference

| Situation | Skill to invoke |
|-----------|-----------------|
| No / partial content | `professional-copywriter` |
| "Improve copy", "rewrite this" | `professional-copywriter` |
| Complete content provided | (none — use verbatim) |
| "Use my brand colors", "use #3B82F6" | `brand-designer` |
| "Extract colors from my logo" | `brand-designer` |
| Logo upload, no color request | (none — header + project palette) |
| Web font chosen or changed | `fonts` |
| System font stack | (none — write `--font-*` tokens directly) |
| "Add a contact / newsletter / inquiry form" | `section-form` |
| "Add a blog / articles / news section" | `section-blog` |
| "Add docs / API docs" | `section-docs` |
| "Add analytics" (Cloudflare deploy) | `plausible-analytics` |
| "Make it warmer/livelier/calmer" | (none — dial change, handle directly) |
| "Run SEO test" | `seo-audit` |
| "Test page speed" | `pagespeed-audit` |
| "Hakuto review", "review my site source" | `hakuto-review` |
| "Ready to ship", "launch check" | `prelaunch-checklist` |

---

## Before Declaring Done

- Design Read stated before any questions or code; interview asked only about genuine gaps (≤4 per round)
- 2–3 genuinely distinct directions proposed; user picked or merged one
- Style preview built with real tokens and approved before the full build
- `site-specification.md` holds direction, dials, palette, fonts, tone, and a Project Plan with every built item ticked
- `public/llms.txt` written from the spec — no `Site Name`, no `hello@example.com`, no bracketed placeholders, no links to routes that don't exist
- User content preserved; copywriter invoked only when needed; any self-written placeholder starts with `TODO:`
- Site-type content jobs all covered; structure driven by dials + craft patterns
- Pre-flight check (design-craft.md) run on every built page; `bun run check` and `bun run build` pass
- Logo handled correctly (visual vs color extraction)

## Final Report

End a build (Workflow A, or a multi-page B) with a short report:

```markdown
**Built:** [pages, e.g. / · /pricing/ · /about/] + branding.astro style guide (not in nav)
**Direction:** "[Name]" — VARIANCE n · MOTION n · DENSITY n
**Spec:** site-specification.md — read before every change; edit it to steer future work
**Open TODOs:**
- [ ] Production domain → `site` in astro.config.mjs (if not provided)
- [ ] Placeholders to replace: [list `TODO:` copy, stock images, SITE_CONTACT nulls]
- [ ] Run `seo-audit` and `hakuto-review` now; `pagespeed-audit` after deploy; `prelaunch-checklist` before launch
```

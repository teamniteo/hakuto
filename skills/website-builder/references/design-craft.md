# Design Craft

Layout vocabulary, composition rules, motion recipes, and the pre-flight check. Load at full-build time (Workflow A step 6, Workflow B) — dial bands referenced here are defined in `design-dials.md`.

---

## Layout Vocabulary

Named patterns to compose pages from. Pick per section based on content and dials — never default to the first one that comes to mind.

**Hero paradigms**
- **Asymmetric Split** — content on a 7/5 or 8/4 split, product visual or oversized type on the heavy side. VARIANCE ≥ 5.
- **Editorial Manifesto** — oversized display type (≥ 3× body scale jump) as the visual itself; little or no imagery. Works at any VARIANCE; the type does the asymmetry at ≥ 7.
- **Media Mask** — full-bleed image/video with type knocked out or overlaid on a scrim. Needs a real asset.
- **Scroll-Pinned** — hero pins while a product visual transforms on scroll. MOTION ≥ 7.
- **Centered Classic** — symmetric, headline + sub + CTA. Only at VARIANCE ≤ 4.

**Section/grid families**
- **Bento** — mixed-size cells in one grid; cell sizes reflect content importance. Cell count = item count (never pad with filler cells). VARIANCE ≥ 6.
- **Split alternator** — image/text sides alternating. **Max 2 consecutive** — then break with a different family.
- **Masonry / column offset** — staggered columns (`md:mt-12` offsets). Good for testimonials, galleries.
- **Sticky-Stack** — cards pin via `position: sticky` and stack as you scroll. MOTION ≥ 7.
- **Full-bleed band** — edge-to-edge color/image band breaking the container rhythm; use once or twice as punctuation.
- **Rail/marquee** — horizontally scrolling logo or item rail. Max one per page.
- **Column list** — plain stacked or 2-col list with strong typography. The quiet workhorse; don't dress it up as fake cards.

**Composition rules**
- A layout family appears **once per page** (a second use must vary meaningfully); pages at VARIANCE ≥ 7 need **≥ 4 distinct families per 8 sections**.
- Hero discipline: fits the initial viewport (`min-h-[100dvh]` if full-height — never `h-screen`), ≤ 4 text elements, CTAs visible without scrolling. Logo walls, pricing teasers, and stats live below the hero, never inside it.
- Across pages of one site: reuse the site's established families for coherence, but vary which family leads each page.

## Type Craft

Pairing/scale rules live with the `fonts` skill — don't duplicate its pairing table. At composition time enforce:

- Weight contrast hard (300–400 body vs 700–900 display); size jumps ≥ 3× between H1 and body.
- One display voice per page. A second typeface is an accent (labels, code, quotes), not a second lead.
- **Eyebrow restraint:** small caps/label-above-heading at most once per 3 sections.

## Motion Recipes

CSS-first, native JS when needed. Every recipe respects `prefers-reduced-motion` — wrap keyframe/scroll effects in `@media (prefers-reduced-motion: no-preference)`. Each recipe lists its minimum MOTION dial.

**Orchestrated Entrance** (MOTION ≥ 3) — one staggered page-load reveal on the hero, nothing else auto-animates:
```css
@media (prefers-reduced-motion: no-preference) {
  .entrance { animation: rise 0.6s ease-out both; }
  @keyframes rise { from { opacity: 0; transform: translateY(16px); } }
}
```
Stagger with `delay-*` utilities (or `--animate-delay` tokens) on successive elements.

**Scroll Reveal** (MOTION ≥ 5) — IntersectionObserver toggles a class; CSS does the rest:
```html
<script>
  const io = new IntersectionObserver((es) => es.forEach(e =>
    e.isIntersecting && e.target.classList.add('in')), { threshold: 0.15 });
  document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
</script>
```

**Sticky Stack** (MOTION ≥ 7) — sections `position: sticky; top: 0` inside a tall parent; later cards slide over earlier ones. No JS needed.

**Scroll-Driven** (MOTION ≥ 7) — `animation-timeline: view()` for parallax/progress effects; treat as progressive enhancement (no-op where unsupported).

**Magnetic CTA** (MOTION ≥ 5) — `transition-transform` + slight `hover:-translate-y-0.5 active:scale-[0.98]` on primary buttons.

**Marquee** (MOTION ≥ 6) — infinite `translateX` keyframe on a duplicated track. One per page, pause on hover.

Every animation must answer "what does this communicate?" (hierarchy, feedback, storytelling). Decoration-only motion gets cut.

## Avoid the Defaults

The generic-AI tells. Not a style guide — a list of reflexes to catch:

- Centered hero + three equal feature cards as the reflex layout (the #1 tell).
- Purple-gradient-on-white color scheme unless the brand genuinely calls for it.
- One accent color per page, locked — no stray teal badge on a rose site.
- One corner-radius system and one theme per page (no mid-scroll light/dark flips).
- Fake product UIs built from divs — use real screenshots, or a labeled placeholder the user will replace.
- Fake-precise stats ("99.97% uptime", "10,482 teams") invented as filler.
- Eyebrow labels above every heading; decorative status dots on list items.
- Text-only pages when imagery is expected — use real images, seeded placeholders, or explicit TODO slots.

## Pre-Flight Check

Run before declaring a page done (Workflow A step 6 and every Workflow B page):

- [ ] Design Read stated; direction + dials recorded in `site-specification.md`
- [ ] Hero fits viewport, ≤ 4 text elements, CTA above the fold
- [ ] Centered-hero rule respected for the recorded VARIANCE
- [ ] Layout families: no family repeated unvaried; ≥ 4 families if VARIANCE ≥ 7
- [ ] Max 2 consecutive split-alternator sections
- [ ] One accent color, one radius system, one theme page-wide
- [ ] CTAs: WCAG AA contrast, no text wrap, no two adjacent CTAs with the same intent
- [ ] Eyebrows ≤ 1 per 3 sections
- [ ] Motion matches the recorded MOTION dial and honors `prefers-reduced-motion`
- [ ] Images are real, seeded placeholders, or labeled TODO slots — no div-fakes
- [ ] Internal links use the site's trailing-slash convention; anchor targets exist
- [ ] `bun run check` passes

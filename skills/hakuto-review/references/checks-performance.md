# Performance Checks

Read when the user asks why a page is slow or janky, when the scope includes
`src/layouts/Layout.astro`, a landing page, an always-included component, or
`src/index.css`, and on every whole-project review. Two sections: critical render path & LCP,
and mobile paint cost.

---

## Critical Render Path & LCP

PageSpeed's mobile LCP target is ≤ 2.5s, and on Hakuto sites the LCP element is **usually the
hero `<h1>` text**, not an image — the hero image typically renders below the fold on
phone-width viewports. These source patterns cause LCP regressions that can be caught
statically:

- **⚠️ Warning** — *hero H1 LCP blocked by a custom heading font (mobile)*. The first `<h1>`
  in `src/pages/index.astro` (or any landing page) inherits a custom-font CSS variable (e.g.
  `var(--font-heading)` resolving to a non-system family like Eina01, Crimson Pro, Sora)
  without a mobile-only system-font override. On 4G-throttled mobile, the H1 waits for the
  woff2 and adds 1–3s of "element render delay" (visible in PSI's LCP breakdown). Fix: a
  `max-md:font-system` class on the hero H1 plus a `--font-system: system-ui, -apple-system, …`
  token in `@theme`, so phones paint the H1 in a system font and tablets/desktops keep the
  brand face.
  - Detect: an `<h1>` whose font resolves through `--font-heading` (or another `--font-*`
    token mapped to a custom family in the `fonts` / `experimental.fonts` array), with no
    `max-md:font-*` override on the same element.
- **❌ Critical** — *third-party tracking scripts on the critical render path*. Any
  `<script>` whose `src` (static or constructed inside an inline script) resolves to a known
  tracking domain — `googletagmanager.com`, `googleadservices.com`, `connect.facebook.net`,
  `consent.cookiebot.com`, `firstpromoter.com` / `fpr.*`, `clarity.ms`, `static.hotjar.com`,
  `cdn.amplitude.com`, `js.hs-scripts.com` — that isn't gated on first user interaction or
  `window.load` + a short timeout. Bare `async`/`defer` is not enough: marketing pixels
  loaded before LCP burn the main thread during the critical render and inflate LCP/TBT.
  - Detect: a static `<script src="https://{tracking-domain}/…">` in `Layout.astro` or any
    always-included component, or an inline script that calls
    `document.createElement('script')` with one of those URLs outside an
    `addEventListener("load", …)` / interaction-listener / `requestIdleCallback(…)` wrapper.
    A bare `setTimeout(load, N)` on one pixel while others load inline is still flagged
    (inconsistent deferral).
  - Recommended pattern — one `fire()` closure that initializes every pixel, triggered by the
    first user interaction or shortly after `load`:

    ```html
    <script is:inline>
      (() => {
        let done = false;
        const events = ["click", "keydown", "touchstart", "scroll"];
        const fire = () => {
          if (done) return;
          done = true;
          events.forEach((e) => removeEventListener(e, fire));
          // inject every tracking <script> here (GTM, Meta Pixel, Cookiebot, …)
        };
        events.forEach((e) => addEventListener(e, fire, { once: true, passive: true }));
        addEventListener("load", () => setTimeout(fire, 500));
      })();
    </script>
    ```
- **⚠️ Warning** — *above-the-fold image missing `fetchpriority="high"`*. A `<Picture>` or
  `<Image>` in the first section of a page with `loading="eager"` but no
  `fetchpriority="high"`. The LCP element should be both eager and high-priority so the
  browser fetches it before lower-priority subresources.
- **ℹ️ Note** — *localized Google TLD ping*. If the project includes a Google Ads conversion
  tag (`AW-…`) without `allow_google_signals: false`, gtag fires a country-localized
  `google.{tld}` pixel in addition to `google.com`. Not a source defect — surface it as a note
  pointing to the Google Ads → Conversion settings opt-out.

---

## Mobile Paint Cost — Blur Filters & Animated Paint

iOS Safari has a small GPU tile-memory budget. Large blur filters, `backdrop-filter`, and
animations that repaint every frame can exhaust it: the page renders part of a section, then
**black, unpainted areas while scrolling** that fill in seconds later. Desktop browsers,
including Safari on a Mac, have enough headroom to hide this, so it never shows up during
development. Three Hakuto sites shipped it (site-hakuto#40, site-vendorvigilance#49,
site-trialtrack#44). Static source checks are the only reliable way to catch it before a user
does.

- **❌ Critical** — *animated large blur*. An element with a CSS blur ≥ 40px (`blur-2xl`,
  `blur-3xl`, `blur-[Npx]` with N ≥ 40, or `filter: blur(…)`) that also has a running
  animation (`animate-*`, or a class whose keyframes run `infinite`), e.g. the "drifting
  glow" `animate-drift rounded-full bg-brand/30 blur-[120px]`.
- **❌ Critical** — *infinite paint-property animation over `backdrop-filter`*. Infinite
  `@keyframes` that animate `box-shadow`, `filter`, `backdrop-filter`, `background-position`,
  or a size property, applied to an element that has, or sits inside or under, a
  `backdrop-blur*` element. Every frame re-blurs the backdrop.
- **⚠️ Warning** — *large static blur blob*. A blur ≥ 40px on a decorative glow
  (`rounded-full bg-* blur-*`, typically `pointer-events-none absolute`), even without
  animation. Report one finding per file with a count.
- **⚠️ Warning** — *infinite paint-property animation*. Infinite `@keyframes` that animate
  `box-shadow` / `filter` / `background-position` without a backdrop involved. Animate
  `opacity` / `transform` on a pseudo-element instead.
- **⚠️ Warning** — *decorative `backdrop-blur`*. `backdrop-blur*` on pills, badges, cards,
  toasts, or diagram nodes. Most sit on an almost-opaque background, where the blur is
  invisible but still repaints. **Exempt:** the sticky site header, other sticky nav bars,
  and modal or drawer overlays that blur only while open.
- **✅ Pass** — no blur ≥ 40px on decorative elements, and infinite animations touch only
  `opacity` / `transform` (plus SVG `stroke-dashoffset` on small paths).

Detect — run both greps; neither covers the other:

1. Blur and backdrop:
   `grep -rnE 'blur-(2xl|3xl|\[[0-9]{2,}px\])|filter: ?blur\(|backdrop-blur|backdrop-filter' src`,
   then read each hit's class list and the keyframes it references in `src/index.css`. Skip
   `blur-sm` / `blur-[1–8px]` on small elements; they're cheap.
2. Paint-property keyframes:
   `grep -rnE -A12 '@keyframes' src | grep -E 'box-shadow|filter|background-position|[^-](width|height):'`.
   This is the only route to the *infinite paint-property animation* Warning when no blur is
   nearby — a `box-shadow` pulse on a plain button never matches grep 1. For each hit, read
   the enclosing `@keyframes` block (the `-A12` window can spill into the next one), then
   trace its name to the `--animate-*` token or `animate-[name_…]` class that uses it and
   check the iteration count is `infinite`. If the animated element has, or sits inside or
   under, a `backdrop-blur*` element, it's the Critical above instead.

Recommended fixes — cite these in the finding so the fix prompt carries them:

```css
/* Soft radial light; color from text-* (`glow text-brand/30`). Replaces rounded-full bg-* blur-[120px]. */
@utility glow {
  background-image: radial-gradient(closest-side, currentColor,
    color-mix(in oklab, currentColor 45%, transparent) 55%, transparent);
}
/* Soft glow hugging a rectangle (behind a mockup). Replaces -inset-8 rounded-[3rem] bg-* blur-3xl. */
@utility halo {
  --halo-fade: 6rem;
  margin: -2rem;
  background-color: currentColor;
  mask-image:
    linear-gradient(to right, transparent, #000 var(--halo-fade), #000 calc(100% - var(--halo-fade)), transparent),
    linear-gradient(to bottom, transparent, #000 var(--halo-fade), #000 calc(100% - var(--halo-fade)), transparent);
  mask-composite: intersect;
}
```

- A drifting glow keeps its `animate-*` class. It moves a gradient instead of a blur filter.
- A pulsing shadow moves to an `::after` that carries a static `box-shadow`, with only its
  `opacity` animated (`animation-delay: inherit` keeps per-element offsets).
- Decorative `backdrop-blur` is dropped, and its background nudged a step more opaque
  (`bg-white/80` → `/90`).

> **Verification tip for the user (not for the skill to run):** reproduce on a real iPhone,
> not a Mac. Desktop Safari's Responsive Design Mode does not emulate the memory limit.

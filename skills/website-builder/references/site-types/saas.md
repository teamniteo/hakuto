# SaaS Site Type

Content strategy reference — what a SaaS site must communicate and how. Section composition and ordering are per-project decisions driven by the chosen direction and dials (see `design-craft.md`); this file defines the *jobs*, not the layout.

## Core Characteristics
- **Conversion-focused**: every page pushes toward trial/signup/demo
- **Product-centric**: the software is the hero, not the company
- **Metrics-driven**: proof via usage numbers, customer logos, review ratings
- **Action-oriented**: clear next steps, friction removed

## When to Use
- User mentions: SaaS, software product, app, platform, tool, API
- Content indicates: pricing tiers, trials, login/signup flows, feature lists
- Goal: acquisition, conversions, signups, demos booked

---

## Content Jobs (requirements, not order)

**Homepage must:**
- Answer "what is this and why do I care" within the first viewport — value prop + one-line clarifier + primary CTA
- Show the product (real screenshot/demo — never a div-built fake)
- Explain what it does: problem→solution narrative if a problem statement exists, benefits-led feature presentation otherwise
- Establish credibility (see Proof & Trust) somewhere between the pitch and the ask
- Preview the path to paying (pricing teaser or link) if pricing exists
- Close with a strong CTA + risk reversal (free trial, no credit card)

**Features page must:** give each major capability real depth (headline + description + supporting visual), include technical specs for developer audiences, use-case examples where provided, and a CTA path.

**Pricing page must:** make tiers comparable at a glance, highlight the recommended tier, give every tier its own CTA (Enterprise → "Contact sales"), answer common pricing questions (FAQ), and show an annual/monthly toggle if applicable.

**Docs/API presence** (technical products): quick start, code examples, authentication guide, link to full docs — enable developer evaluation without a sales call.

## Content Adaptation Rules

- **Full copy provided** → extract the value prop for the hero, structure the rest around it, add CTAs even if the user didn't include them, suggest missing critical elements.
- **Partial copy** → use provided copy as anchors; invoke **professional-copywriter** for gaps; ask for missing critical elements (pricing, key features, audience).
- **Minimal copy** → invoke **professional-copywriter**; ask: primary benefit? target user? pricing?

## Navigation

Primary: Features · Pricing · Docs/Resources (if technical) · Login · **[Sign Up]** as a visually distinct button. Footer: About, Blog, Customers, Support, Careers. Developer products promote Docs; enterprise adds "Request Demo"; simple products trim to essentials.

## Messaging & Tone

- Action-oriented ("Start building", "Try free") and benefit-focused ("Ship 2× faster") — clarity over cleverness
- Subtle friction-removal, not fake urgency: "No credit card required", "Cancel anytime"
- **Technical/developer**: drop marketing fluff, use precision, show code, GitHub stars, integrations; no-nonsense tone
- **Business/enterprise**: ROI, security, compliance, SLAs; big-name logos and decision-maker testimonials; credible tone

## CTA Strategy

Multiple CTAs per page: at the hero, after the product story, near proof, at the close. Primary types: "Start free trial" (self-serve), "Sign up free" (freemium), "Request demo" (enterprise). Secondary: "View pricing", "See documentation", "Watch demo". Copy rules: be specific ("Start free 14-day trial", not "Try now"); remove friction near the button; two adjacent CTAs must not share an intent.

## Proof & Trust

In rough order of effectiveness: customer logos → usage metrics ("10K+ developers") → review ratings (G2, Capterra) → testimonials with attribution → case studies with numbers → integration badges. **Never invent metrics or logos** — if none provided, build a labeled placeholder section and tell the user to supply them.

Trust signals: security/compliance badges (SOC 2, GDPR), uptime/status page, support promise, money-back guarantee, data hosting location. Place near CTAs and pricing where they reduce friction, and in the footer.

## SEO & Technical

- Title: `[Product] - [Primary Benefit] for [Audience]`; meta includes benefit + audience
- Schema: SoftwareApplication, Product, Organization; feature pages target long-tail keywords
- Fast load critical — optimize screenshots, minimize above-fold weight
- Login is a nav link, not an auth flow to build

## Additional Pages

Integrations (logo grid + docs links) · Customers/Case studies (metrics-led) · Security (certifications, data handling) · Changelog (categorized, chronological) · About (secondary — product > company; keep brief). Every page needs a CTA. Avoid: burying pricing, fake urgency, walls of unscannable text.

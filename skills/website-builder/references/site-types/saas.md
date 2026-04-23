# SaaS Site Type

**Reference for website-builder skill. Content generation handled by professional-copywriter skill when needed.**

## Core Characteristics
- **Conversion-focused**: Every page pushes toward trial/signup/demo
- **Product-centric**: Software is the hero, not the company
- **Metrics-driven**: Social proof via usage numbers, customer logos, review ratings
- **Action-oriented**: Multiple CTAs, urgency, clear next steps

## When to Use This Site Type
- User mentions: SaaS, software product, app, platform, tool, API
- Content indicates: Pricing tiers, trial offers, login/signup flows, feature lists
- Goal: User acquisition, conversions, product signups, demos booked

---

## Page Structure Framework

### Homepage
**Purpose**: Convert visitors to trial/signup in first visit

**Section Framework**:

1. **Hero Section**
   - Primary value proposition as headline (benefit-driven if generating)
   - Clear primary CTA (Sign up, Start free trial, Get started)
   - Product visual (screenshot, demo, interface mockup)
   - One-line subheadline clarifying what product does

2. **Problem/Solution OR Feature Highlights**
   - If user provides problem statement → Problem → solution narrative
   - If user provides features → 3-5 feature sections with icons/visuals
   - If user provides benefits → Lead with benefits, support with features
   - Adapt based on content depth and style

3. **Social Proof** (position after features, before pricing)
   - Customer logos if provided
   - Testimonials with attribution
   - Usage metrics: "10K+ users", "1M+ API calls"
   - Placeholder section if none provided

4. **Pricing Preview** (if pricing provided)
   - Abbreviated tier comparison (3 tiers max)
   - Most popular tier highlighted
   - CTA linking to full pricing page

5. **Final CTA Section**
   - Strong signup push matching hero CTA
   - Risk reversal: free trial, no credit card, money-back
   - Alternative CTA for enterprise: Request demo, Contact sales

### Features Page
**Purpose**: Deep dive into product capabilities

**Structure**:
- Each feature = dedicated section
- Feature headline + detailed description + supporting visual
- Technical specs if developer audience
- Use case examples if provided
- CTA at end of each major section

### Pricing Page
**Purpose**: Convert qualified visitors to paid users

**Structure**:
- Tier comparison table with feature checkmarks
- Most popular tier highlighted
- CTA button per tier (Enterprise: "Contact sales")
- FAQ addressing common pricing questions
- Annual/monthly toggle if applicable

### Docs/API Page (if technical product)
**Purpose**: Enable developer evaluation

**Structure**:
- Quick start guide
- API reference or SDK documentation
- Code examples in multiple languages
- Authentication guide
- Link to full documentation

---

## Content Adaptation Rules

### User provides FULL copy:
1. Extract primary value proposition → hero headline
2. Structure features/benefits → dedicated sections
3. Position social proof after features
4. Create pricing preview or CTA
5. **Add multiple CTAs** even if user didn't include them
6. Suggest missing elements if critical

### User provides PARTIAL copy:
1. Use provided copy as anchors
2. **Website-builder invokes professional-copywriter** for missing sections
3. Match user's tone and style
4. Ask for missing critical elements: pricing, key features, target audience

### User provides MINIMAL copy:
1. **Website-builder invokes professional-copywriter** for structure
2. Ask clarifying questions: primary benefit? target user? pricing?

---

## Navigation Pattern

**Primary Navigation**:
- Features
- Pricing
- Docs or Resources (if technical)
- Login (existing users)
- [Sign Up] - Visually distinct CTA button

**Secondary Navigation** (footer):
- About, Blog, Customers/Case Studies, Support, Careers (if applicable)

**Adaptations**:
- Developer products: Prioritize Docs/API
- Enterprise focus: Add "Request Demo"
- Simple products: Reduce to Features, Pricing, Login, Sign Up

---

## Messaging & Tone Guidance

### Core Principles
- **Action-oriented**: "Start building", "Try free", "Get started", "Book demo"
- **Benefit-focused**: "Save 10 hours/week", "Increase revenue 30%", "Ship 2x faster"
- **Urgency (subtle)**: "No credit card required", "14-day money-back"
- **Clarity over cleverness**: Direct about what product does and who it's for

### Technical/Developer Products
- Drop marketing fluff, use technical precision
- Include code examples and specs
- Emphasize: API access, docs quality, integrations
- Show: GitHub stars, CLI tools, open source
- Tone: Technical, no-nonsense

### Business/Enterprise Products
- Emphasize: ROI, security, compliance, support
- Include: Case studies, enterprise features, SLAs
- Show: Customer logos (big names), decision-maker testimonials
- Tone: Professional, credible, trustworthy

---

## CTA Strategy

**Placement** (multiple throughout):
1. Hero (primary)
2. After feature sections
3. After social proof
4. Pricing preview
5. Final section

**Primary CTA Types**:
- "Start free trial" (self-service)
- "Sign up free" (freemium)
- "Get started" (generic)
- "Request demo" (enterprise)

**Secondary CTAs**:
- "View pricing"
- "See documentation"
- "Watch demo video"
- "Contact sales"

**CTA Copy Rules**:
- Be specific: "Start free 14-day trial" not "Try now"
- Remove friction: "No credit card required", "Cancel anytime"
- Create urgency (optional): "Join 10,000+ users"

---

## Visual Content Hierarchy

**Priority Order**:
1. **Product screenshots/demos** (highest)
   - UI mockups showing actual interface
   - Animated demos or screen recordings
   - Before/after comparisons

2. **Feature illustrations**
   - Icons or diagrams explaining capabilities
   - Workflow visualizations
   - Data visualizations if analytics product

3. **Customer logos** (social proof)
   - Recognizable brand logos
   - Industry leader logos

4. **Code examples** (if technical)
   - Syntax-highlighted code blocks
   - API request/response examples

5. **Team photos** (lower priority)
   - Only if enterprise focus or compelling founder story

---

## Social Proof Patterns

**Types** (in order of effectiveness):
1. **Customer logos**: Well-known brands using product
2. **Usage metrics**: "10K+ developers", "1M+ API calls/month", "99.9% uptime"
3. **Review ratings**: G2, Capterra, ProductHunt scores with stars
4. **Testimonials**: Short quotes with name, company, role
5. **Case studies**: Full stories with metrics
6. **Integration badges**: "Works with Slack, GitHub, Stripe"

**Positioning**:
- Homepage: After features, before pricing
- Features page: Testimonials specific to each feature
- Pricing page: Trust signals near CTA buttons

**If none provided**: Create placeholder sections, suggest adding

---

## Trust Signals

**Essential**:
- Security badges: SOC 2, GDPR, ISO 27001, HIPAA
- Uptime status: Link to status page, display uptime %
- Support: "24/7 support", "Response within 1 hour"
- Money-back guarantee: "14-day money-back", "Cancel anytime"
- Free trial: "No credit card required"
- Data location: "Hosted on AWS/Google Cloud", "US/EU data centers"

**Positioning**:
- Footer: Security badges, compliance
- Pricing page: Near CTAs (reduce friction)
- Homepage hero: "Free trial" or "No credit card" near CTA

---

## Technical Considerations

**Performance**: Fast load critical, optimize screenshots, minimize above-fold weight

**Analytics**: Conversion tracking on CTAs, scroll depth, heatmaps on pricing, A/B testing hooks

**SEO**:
- Title: [Product Name] - [Primary Benefit] for [Target Audience]
- Meta: Include benefit, audience, CTA
- Schema: SoftwareApplication, Product, Organization
- Feature pages: Target long-tail keywords

**Authentication**: Simple login link in nav, don't create complex auth flows

---

## Common Page Patterns

**Integration/Partners**: Grid of logos, search/filter, short descriptions, docs links

**Customers/Case Studies**: Logo grid, featured case studies with metrics, testimonials, industry filters

**Security/Compliance**: Certifications, compliance standards, data handling, privacy policy link

**Changelog**: Chronological updates, categorized (Features, Improvements, Fixes), RSS feed optional

---

## Notes for Implementation

**Blog Section**: See `features/blog-section.md` - SaaS blogs focus on product updates, tutorials, use cases, industry insights

**About Page**: Secondary priority (product > company). Include if enterprise focus or compelling founder story. Keep brief.

**Additional Pages**: Reference site-specification.md for consistency. Maintain conversion focus. Every page needs CTA.

**Avoid**: Long explanations (users scan), too many nav options, burying pricing, fake urgency tactics

---

*This reference is used by website-builder skill to structure SaaS sites. Content generation is handled by professional-copywriter skill when user provides partial or no content.*

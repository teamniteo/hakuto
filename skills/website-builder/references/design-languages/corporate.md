# Corporate Design Language

**Reference for website-builder skill. Professional, trustworthy aesthetic for business contexts and decision-makers.**

## Aliases
- Professional, Business, Enterprise, Corporate, Formal, Traditional, Executive

## Core Identity

**Philosophy**: Trust, credibility, and professionalism. Conservative color choices, polished presentation, structured layouts. Designed to appeal to decision-makers, establish authority, convey reliability. NOT boring, but refined and appropriate for serious business contexts.

**Non-negotiable characteristics**:
- Conservative, trustworthy color palettes (blues, grays, earth tones)
- Polished, professional typography
- Structured, predictable layouts
- Trust signals prominently displayed
- Clear hierarchy and organization
- Risk-averse design choices (no experimental layouts)
- Credibility over creativity
- Serious tone without being stiff

---

## Note on Usage

**This design language provides starting points and proven patterns. All suggestions are adaptable:**
- Color palettes → Can be customized to any hex codes
- Typography → Can use any font family
- Components → Can be styled any way
- Layouts → Can follow any structure

**Use this as intelligent scaffolding, not rigid constraints.** Start here, adapt freely based on user needs.

---

## Color Palettes

### Classic Blue (Default, Traditional)
**Use for**: Finance, consulting, traditional corporate
```
Primary: #003366 (navy blue)
Secondary: #0066CC (bright blue)
Background: #FFFFFF
Surface: #F8F9FA
Text Primary: #1A1A1A
Text Secondary: #666666
Accent: #0066CC or #FF6B35 (orange contrast)
Trust: Navy conveys stability
```

### Modern Tech Corporate (Modern)
**Use for**: Tech companies, B2B SaaS, modern enterprises
```
Primary: #1E3A8A (deep blue)
Secondary: #3B82F6 (modern blue)
Background: #FFFFFF
Surface: #F1F5F9
Text Primary: #0F172A
Text Secondary: #475569
Accent: #3B82F6 or #10B981 (green)
Trust: Modern yet professional
```

### Neutral Gray (Conservative)
**Use for**: Law firms, accounting, advisory services
```
Primary: #2C3E50 (charcoal)
Secondary: #34495E (slate)
Background: #FFFFFF
Surface: #F7F9FA
Text Primary: #1A1A1A
Text Secondary: #6B7280
Accent: #D4AF37 (gold) or #8B4513 (brown)
Trust: Serious, conservative, timeless
```

**Selection**:
- Financial/consulting → Classic Blue or Neutral Gray
- Tech B2B → Modern Tech Corporate
- Legal/accounting → Neutral Gray
- User has brand colors → Adapt closest palette

---

## Typography Systems

### Classic Serif + Sans (Default, Traditional)
**Use for**: Traditional industries, authoritative feel
- **Headings**: Merriweather or Georgia, weight 700
  - H1: 44px, H2: 34px, H3: 26px
- **Body**: Open Sans or system-ui, weight 400
  - Body: 17px, line-height 1.7
- **Characteristics**: Traditional, credible, established
- **Best for**: Law firms, financial institutions, consulting

### Modern Sans (Clean, professional)
**Use for**: Tech companies, modern businesses
- **Headings**: Inter or Roboto, weight 600-700
  - H1: 46px, H2: 36px, H3: 26px
- **Body**: Inter or Roboto, weight 400
  - Body: 17px, line-height 1.7
- **Characteristics**: Modern, readable, professional
- **Best for**: Tech companies, modern B2B, contemporary consultancies

**Selection**:
- Traditional industries → Classic Serif + Sans
- Tech/modern → Modern Sans

---

## Component Styling

### Classic Formal (Default, Conservative)
**Use for**: Traditional businesses, conservative approach
- **Buttons**: Solid primary fill, white text, no shadow, 4px radius, 44px height
- **Cards**: White background, thin border (1px), subtle shadow optional
  - Shadow: `0 2px 4px rgba(0,0,0,0.08)` if used
- **Inputs**: White background, border all around, focus: primary border
- **Navigation**: Clean horizontal, underline on active

### Modern Corporate (Polished, contemporary)
**Use for**: Modern enterprises, tech companies
- **Buttons**: Solid fill with subtle shadow, 6px radius, 48px height
  - Shadow: `0 1px 3px rgba(0,0,0,0.12)`
- **Cards**: White background, soft shadow, no border
  - Shadow: `0 4px 12px rgba(0,0,0,0.08)`
- **Inputs**: Subtle background, border bottom only, focus: full border
- **Navigation**: Elevated bar with shadow

**Selection**:
- Traditional/conservative → Classic Formal
- Modern corporate → Modern Corporate

---

## Layout Patterns

### Structured Grid (Default, Predictable)
**Use for**: Most corporate sites
- Strict 12-column grid adherence
- Even spacing throughout
- Centered, symmetrical layouts
- Clear hierarchy through size
- Consistent section padding

### Asymmetric Professional (Modern, dynamic)
**Use for**: Modern B2B, tech companies
- 7/5 or 8/4 column splits
- Offset content blocks
- Alternating section backgrounds
- Controlled asymmetry maintains professionalism

**Selection**:
- Most corporate sites → Structured Grid
- Modern/tech → Asymmetric Professional

---

## Contextual Adaptation

### Financial Services
- **Palette**: Classic Blue or Neutral Gray
- **Typography**: Classic Serif + Sans
- **Components**: Classic Formal
- **Layout**: Structured Grid
- **Notes**: Maximum trust signals, credentials prominent, security/compliance emphasized

### Tech B2B / SaaS
- **Palette**: Modern Tech Corporate
- **Typography**: Modern Sans
- **Components**: Modern Corporate
- **Layout**: Asymmetric Professional
- **Notes**: Product screenshots, integration logos, case studies, modern but credible

### Consulting / Professional Services
- **Palette**: Neutral Gray or Classic Blue
- **Typography**: Classic Serif + Sans
- **Components**: Classic Formal
- **Layout**: Structured Grid
- **Notes**: Team credentials, case studies, thought leadership, expertise demonstrated

### Healthcare Enterprise
- **Palette**: Classic Blue or Modern Tech Corporate
- **Typography**: Modern Sans
- **Components**: Modern Corporate
- **Layout**: Structured Grid
- **Notes**: Compliance badges, certifications, patient testimonials, trust paramount

### Legal / Accounting
- **Palette**: Neutral Gray
- **Typography**: Classic Serif + Sans
- **Components**: Classic Formal
- **Layout**: Structured Grid
- **Notes**: Credentials, bar associations, professional affiliations, conservative presentation

---

## Trust Signals (Critical for Corporate)

**Essential Elements**:
- Industry certifications and badges (ISO, SOC 2, etc.)
- Client logos (recognizable brands)
- Years in business ("Established 2005", "20+ years")
- Professional affiliations and memberships
- Case studies with quantifiable results
- Team credentials (degrees, certifications)
- Security/compliance statements
- Award recognition
- Physical address and contact info
- Privacy policy and legal compliance

**Positioning**: Above fold or prominently in hero, about page, footer

---

## Interaction & Animation

**Principles**: Subtle, professional, polished. Never distracting.

**Hover States**:
- Buttons: Slight darken (10%) or subtle lift (200ms)
- Cards: Subtle shadow increase (200ms)
- Links: Underline or color change (200ms)

**Page Transitions**: Subtle fade-ins (400ms), no elaborate animations

**Micro-interactions**: Minimal - form focus states, button feedback, loading indicators (professional spinners)

**Avoid**: Bouncy animations, playful effects, elaborate scroll effects

---

## Navigation

**Header**: Logo left, clean horizontal navigation, prominent CTA button, 64-80px height, sticky with subtle shadow

**Links**: Clean spacing (32-48px), professional hover states, dropdown menus for complex structures

**Footer**: Multi-column, organized sections (Services, Resources, Company, Legal), contact info prominent, trust badges

**Mobile**: Simplified hamburger menu, maintain professionalism, key info easily accessible

---

## Content Presentation

**Headlines**: Clear, benefit-focused, professional language, conservative sizing

**Body Text**: 17px minimum, generous line-height (1.7), dark gray (not black), scannable paragraphs

**Lists**: Professional bullet points, clear hierarchy, adequate spacing

**Data/Statistics**: Prominent display with context, charts/visualizations if complex, credibility through specificity

**Calls to Action**: Action-oriented, professional language ("Request Consultation", "Contact Sales", "Download Report")

---

## Photography & Imagery

**Photo Style**: Professional, high-quality, diverse teams, authentic business settings (not overly staged), consistent color grading

**Types**:
- Leadership/team: Professional headshots or office settings
- Facilities: Clean, organized professional spaces
- Client work: Real projects (with permission)
- Industry imagery: Professional, relevant to sector

**Treatment**: Minimal editing, slightly muted/professional, consistent aspect ratios, no heavy filters

**Avoid**: Generic stock photos (handshake clichés), amateur photography, overly artistic effects

---

## Special Components

**Buttons**: Substantial (48px height), clear action-oriented text, primary CTA prominent, secondary less prominent

**Forms**: Professional structured, required fields marked, longer forms acceptable (business context), privacy statement near form, GDPR considerations

**Cards**: Clean structured, used for services/team/case studies/resources, consistent sizing, subtle hover

**Tables**: Professional presentation, alternating rows (subtle), clear headers, responsive (stack on mobile)

**Testimonials**: Quote in larger text, attribution with name/title/company, company logo if available, professional photo optional

---

## Credibility Through Design

**Visual Polish**: Consistent spacing, aligned elements (grid discipline), professional photography, quality typography

**Professional Copy**: Industry-appropriate language, data-backed claims, specific not vague, third-person acceptable, avoid hype/exclamations/casual language

**Attention to Detail**: Consistent styling, unified colors, professional icons, proper aspect ratios, fast loading, mobile responsive

---

## Responsive Behavior

**Mobile**: Simplified navigation, maintain professionalism, larger touch targets (48px), single column, simplified tables, executive mobile users prioritized

**Desktop Priority**: Corporate sites often desktop-viewed, multi-column layouts, complex data tables acceptable

**Performance**: Fast loading critical, professional perception, mobile responsiveness essential

---

## Accessibility

**WCAG Compliance**: 4.5:1 contrast minimum (AA), consider AAA (7:1) for enterprise, keyboard navigation, screen reader compatible, semantic HTML

**Corporate Requirements**: Many clients require accessibility, public sector Section 508 compliance, legal liability considerations

---

## Example Variations

**Traditional Financial** (Banks, insurance):
- Classic Blue palette
- Classic Serif + Sans typography
- Classic Formal components
- Structured Grid layout

**Modern B2B Tech** (SaaS, platforms):
- Modern Tech Corporate palette
- Modern Sans typography
- Modern Corporate components
- Asymmetric Professional layout

**Executive Consulting** (Strategy, advisory):
- Neutral Gray palette
- Classic Serif + Sans typography
- Classic Formal components
- Structured Grid layout

---

## Essential Guidelines

✅ **Do**:
- Prioritize credibility and trust
- Use professional high-quality imagery
- Display credentials prominently
- Maintain consistent polished design
- Use conservative color palettes
- Provide clear contact information
- Include case studies and testimonials
- Ensure fast loading and performance
- Balance professional with approachable

❌ **Avoid**:
- Trendy or experimental layouts
- Casual or playful language
- Amateur photography or generic stock
- Overcomplicated navigation
- Sacrificing clarity for creativity
- Many bright saturated colors
- Ignoring mobile experience
- Forgetting trust signals

---

## When to Use Corporate Design

**Good fits**:
- B2B services and products
- Financial services, banking, insurance
- Legal, accounting, consulting
- Healthcare systems and enterprises
- Manufacturing and industrial
- Professional services
- Enterprise software
- Any business targeting decision-makers

**Poor fits**:
- Consumer apps (too formal)
- Creative agencies (need more personality)
- Startups targeting developers (too corporate)
- Entertainment/media (too serious)
- Youth-focused brands (too traditional)

---

## Communication to User

When applying, tell user:

> "Using **Corporate** design with [palette] colors. This creates a professional, trustworthy aesthetic appropriate for [industry]. Emphasizes credibility through [structured layouts/professional typography/trust signals], using [traditional/modern] styling. This will resonate with business decision-makers and establish authority in your industry."

Then generate consistently using selected elements while prioritizing trust, credibility, and professional polish throughout site.

---

*This reference guides website-builder skill in applying corporate design. Defaults: Classic Blue palette, Classic Serif + Sans typography, Classic Formal components, Structured Grid layout. Use when credibility and professionalism are paramount.*

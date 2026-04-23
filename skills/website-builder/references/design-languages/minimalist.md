# Minimalist Design Language

**Reference for website-builder skill. Used to apply clean, typography-focused design with generous whitespace.**

## Aliases
- Minimal, Clean, Simple, Minimalist, Whitespace, Typography-focused

## Core Identity

**Philosophy**: Less is more. Content and typography are primary visual elements. Generous whitespace creates breathing room and focus.

**Non-negotiable characteristics**:
- Generous whitespace (never cramped)
- Typography as primary hierarchy tool
- Restrained color palette (monochromatic or near-monochromatic)
- Subtle, purposeful animations
- Clean geometric shapes (no decorative elements)
- Content-first approach

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

### Pure Monochrome (Default)
**Use for**: Tech products, developer tools, content sites
```
Background: #FFFFFF
Surface: #FAFAFA
Text Primary: #0A0A0A
Text Secondary: #666666
Accent: #000000
Border: #E5E5E5
```

### Cool Minimal
**Use for**: SaaS products, FinTech, corporate sites
```
Background: #FAFBFC
Surface: #F3F4F6
Text Primary: #111827
Text Secondary: #6B7280
Accent: #3B82F6 (blue)
Border: #E5E7EB
```

### Warm Minimal
**Use for**: Creative agencies, health/wellness, approachable brands
```
Background: #FFFEF9
Surface: #F8F7F4
Text Primary: #2A2826
Text Secondary: #6B6763
Accent: #8B7355 (warm brown)
Border: #E8E6E1
```

**Selection**:
- User provides brand color → Use Pure Monochrome base, replace accent with brand color
- Tech/developer → Pure Monochrome or Cool Minimal
- Corporate/professional → Cool Minimal
- Creative/warm → Warm Minimal

---

## Typography Systems

### Modern Sans (Default)
**Use for**: Most sites, SaaS, general purpose
- **Font**: Inter or System UI, weights 400 (body), 600-700 (headings)
- **Sizes**: H1 48px, H2 36px, H3 24px, Body 16px
- **Line heights**: Headings 1.1-1.3, Body 1.6
- **Characteristics**: Clean, neutral, excellent readability

### Editorial Serif + Sans
**Use for**: Content sites, blogs, agencies
- **Headings**: Merriweather or Playfair Display, weight 600-700
- **Body**: Inter or System UI, weight 400
- **Sizes**: H1 52px, H2 40px, H3 28px, Body 18px
- **Line heights**: Headings 1.1-1.3, Body 1.7
- **Characteristics**: Sophisticated, readable, editorial feel

**Selection**:
- Content/blog sites → Editorial Serif + Sans
- All other sites → Modern Sans

---

## Component Styling

### Subtle Fills (Default)
**Use for**: Most sites, best balance of minimal + usability

**Buttons**:
- Primary: Solid fill (accent color), white text, hover: darken 10%
- Secondary: Light fill (5% accent), accent text, hover: 10% accent

**Cards**: Subtle background (surface color), no border, no shadow

**Inputs**: Subtle background, no border, focus: border appears

**Navigation**: Active item has subtle background, no border

### Border-Only (Purest minimal)
**Use for**: Content sites, portfolios, ultra-minimal aesthetic

**Buttons**:
- Primary: 1px solid border, text color, transparent, hover: fill with text color
- Secondary: Text only, underline on hover

**Cards**: 1px solid border, no shadow, white background

**Inputs**: 1px border bottom only, no background, focus: full border

**Navigation**: Text only, subtle underline on active

**Selection**:
- Content/blog/portfolio → Border-Only
- SaaS/corporate/most sites → Subtle Fills

---

## Layout Density

### Standard (Default)
**Use for**: Most sites
- Section spacing: 80px vertical
- Container max-width: 960px (text), 1280px (layouts)
- Element spacing: 24px between elements
- Padding: 32px sections, 16px cards

### Spacious (More whitespace)
**Use for**: Content sites, portfolios, editorial
- Section spacing: 120px vertical
- Container max-width: 720px (text), 1200px (layouts)
- Element spacing: 32px between elements
- Padding: 48px sections, 24px cards

**Selection**:
- Content/blog/portfolio → Spacious
- All other sites → Standard

---

## Contextual Adaptation

### SaaS Products
- **Palette**: Cool Minimal or Pure Monochrome
- **Typography**: Modern Sans
- **Components**: Subtle Fills (buttons need clear CTAs)
- **Density**: Standard
- **Notes**: Product screenshots need breathing room, code examples use subtle background

### General/Company Sites
- **Palette**: Warm Minimal or Pure Monochrome
- **Typography**: Modern Sans or Editorial Serif
- **Components**: Subtle Fills or Border-Only
- **Density**: Standard or Spacious
- **Notes**: Team photos need generous margins, testimonials benefit from serif typography

### Content/Blog Sites
- **Palette**: Pure Monochrome or Warm Minimal
- **Typography**: Editorial Serif + Sans
- **Components**: Border-Only
- **Density**: Spacious
- **Notes**: Reading priority: 18px body, 1.7 line-height, max-width 720px for articles

### Developer/Technical Products
- **Palette**: Pure Monochrome or Cool Minimal
- **Typography**: Modern Sans or System UI
- **Components**: Border-Only
- **Density**: Standard
- **Notes**: Code blocks with syntax highlighting, monospace font (Fira Code, JetBrains Mono), fast load priority

### Creative/Agency Sites
- **Palette**: Warm Minimal or Pure Monochrome
- **Typography**: Editorial Serif + Sans or Modern Sans
- **Components**: Border-Only
- **Density**: Spacious
- **Notes**: Portfolio images center stage, bold accent acceptable, asymmetric layouts, whitespace as design element

---

## Interaction & Animation

**Principles**: Subtle, purposeful, fast. Enhance usability, don't distract.

**Hover States**:
- Links: Underline or subtle color change (200ms)
- Buttons: Darken 10% or subtle lift (200ms)
- Cards: Subtle shadow or border color change (200ms)

**Page Transitions**:
- Fade in elements on scroll (400-600ms, ease-out)
- Stagger: 50-100ms delay between sequential elements

**Micro-interactions**:
- Form focus: Border color change (200ms)
- Button click: Subtle scale (0.98 → 1, 100ms)
- Success states: Checkmark fade in (300ms)

**Avoid**: Heavy animations, complex scroll effects, elaborate loading states

---

## Layout Patterns

**Grid**: 12-column, gutters 24px (desktop) / 16px (mobile), margins 48px (desktop) / 24px (mobile)

**Sections**: Full-width container with max-width constraint, consistent vertical spacing

**Alignment**: 
- Prefer left-aligned text (better readability)
- Center: Short headlines, CTAs, hero sections
- Avoid justified text

**White Space**: More space between sections than within, group related elements closely

---

## Content Presentation

**Headlines**: Short (5-8 words), generous margin below (24-32px), subheadlines 60% of headline size

**Body Text**: 60-75 characters line length, 1.5em paragraph spacing, first paragraph can be larger (18px)

**Lists**: Simple bullets, 12px spacing between items

**Images**: Full-bleed or within max-width, 48px margin around, consistent aspect ratios

**Quotes**: Large text (20-24px), serif font if editorial typography, subtle left border optional

---

## Navigation

**Header**:
- Logo left, navigation right, single line
- Background: Transparent or white, 1px bottom border optional
- Height: 64-80px
- Sticky with subtle shadow on scroll (if using shadows)
- Mobile: Hamburger menu (three lines, minimal)

**Links**: Text only, hover: underline or color change, active: underline or bold, spacing: 32-48px

**Footer**: Simple single/double column, links in secondary color, minimal

---

## Responsive Behavior

**Breakpoints**: Mobile <640px, Tablet 640-1024px, Desktop >1024px

**Mobile Adaptations**:
- Increase spacing slightly (mobile needs more breathing room)
- Single column layouts
- Larger tap targets (48px minimum)
- Simplified navigation
- Font sizes: -2px from desktop (14px body on mobile)

**Typography**: Use `clamp()` for fluid scaling - Example: `clamp(32px, 5vw, 48px)` for H1

---

## Special Components

**Buttons**: 44px height minimum, 16px horizontal padding, 12px vertical, border-radius 4px or 0, clear hover state

**Forms**: Labels above inputs, 48px input height, clear focus state, error text below input

**Cards**: Subtle background or border (not both), 24px padding (desktop), hover: lift or border change

**Modals**: Centered, backdrop rgba(0,0,0,0.5), white background, close X top right, fade in + scale animation

---

## Technical Notes

**CSS**: Utility-first (Tailwind) works well, rem units for typography, system fonts acceptable

**Performance**: Minimal CSS (<50kb gzipped), max 2 font weights, lazy load images

**Accessibility**: 4.5:1 contrast for body text, 3:1 for large text, visible focus indicators, semantic HTML

---

## Example Variations

**Pure Editorial** (Blog/Content):
- Pure Monochrome palette
- Editorial Serif + Sans typography
- Border-Only components
- Spacious density

**Modern SaaS** (Product):
- Cool Minimal palette
- Modern Sans typography
- Subtle Fills components
- Standard density

**Creative Portfolio** (Agency):
- Warm Minimal palette
- Editorial Serif + Sans typography
- Border-Only components
- Spacious density with asymmetry

---

## Essential Guidelines

✅ **Do**:
- Embrace generous whitespace
- Use typography for hierarchy
- Keep interactions subtle
- Maintain consistency
- Focus on readability
- Use one accent color strategically

❌ **Avoid**:
- Multiple accent colors
- Decorative elements
- Heavy shadows or gradients
- Elaborate animations
- Dense, cramped layouts
- Too many font weights (2-3 max)

---

## Communication to User

When applying, tell user:

> "Using **Minimalist** design with [palette] colors and [typography]. This emphasizes clean typography, generous whitespace, and subtle interactions. Adapting for [context] with [density] spacing for optimal content presentation."

Then generate consistently using selected elements throughout the site.

---

*This reference guides website-builder skill in applying minimalist design. Defaults: Pure Monochrome palette, Modern Sans typography, Subtle Fills components, Standard density. Adapt based on site type and context.*

# Dark Design Language

**Reference for website-builder skill. High-contrast dark backgrounds with elegant, sophisticated aesthetics.**

## Aliases
- Dark mode, Night mode, Black, Dark theme, Noir, Midnight

## Core Identity

**Philosophy**: High contrast with dark backgrounds, dramatic lighting, elegant and modern. NOT about tech/terminal aesthetics (that's Technology), but sophisticated dark color schemes with excellent readability and visual hierarchy through contrast and selective brightness.

**Non-negotiable characteristics**:
- Dark backgrounds (true black, near-black, or deep colors)
- High contrast text (white or very light on dark)
- Strategic use of bright accents for emphasis
- Depth through subtle gradients or layering
- Elegant, not tech-heavy (unless contextually appropriate)
- Excellent readability despite dark palette
- Sophisticated color choices, not just inverted light mode

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

### Soft Dark (Default, General purpose)
**Use for**: Most sites, easy on eyes
```
Background: #121212
Surface: #1E1E1E
Elevated: #2C2C2C
Text Primary: #E0E0E0 (off-white)
Text Secondary: #A0A0A0
Accent: #BB86FC (purple) or brand color
Border: #292929
Success: #03DAC6 (teal)
Error: #CF6679 (pink-red)
```

### Slate Dark (Neutral, modern)
**Use for**: Professional/tech sites
```
Background: #0F172A
Surface: #1E293B
Elevated: #334155
Text Primary: #F1F5F9
Text Secondary: #CBD5E1
Accent: #38BDF8 (sky blue) or brand color
Border: #293548
Success: #4ADE80 (green)
Error: #FB7185 (rose)
```

### Warm Dark (Cozy, creative)
**Use for**: Creative/design-focused sites
```
Background: #1A1614 (warm black-brown)
Surface: #241E1C
Elevated: #2F2725
Text Primary: #F5F1EE (warm white)
Text Secondary: #C4B5AD
Accent: #E8A87C (warm orange/peach)
Border: #332B28
Success: #90C695 (sage green)
Error: #E88388 (warm red)
```

**Selection**:
- General purpose → Soft Dark or Slate Dark
- Creative/design → Warm Dark
- User brand color → Choose palette that complements it

---

## Typography Systems

### Modern Sans (Default, Clean)
**Use for**: Most sites, excellent readability
- **Font**: Inter, weights 400 (body), 700-800 (headings)
- **Sizes**: H1 48px, H2 36px, H3 26px, Body 17px
- **Line heights**: Headings 1.1-1.3, Body 1.7 (larger for dark readability)
- **Characteristics**: Proven dark mode readability

### Display + Sans (Premium, distinctive)
**Use for**: Luxury/premium brands
- **Headings**: Playfair Display or Fraunces, weight 700
  - H1: 52px, H2: 40px, H3: 28px
- **Body**: Inter or system-ui, weight 400, 17px, line-height 1.7
- **Characteristics**: Elegant, sophisticated, fashion/luxury feel

**Selection**:
- Most sites → Modern Sans
- Premium/luxury → Display + Sans

**Dark Mode Typography Notes**:
- Increase body font size by 1-2px vs light mode
- Increase line-height slightly (1.6 → 1.7)
- Never use pure white on pure black (causes eye strain)
- Use #E0E0E0 or #F5F5F5 instead of #FFFFFF for body text

---

## Component Styling

### Elevated Surfaces (Default, Layered depth)
**Use for**: Professional/sophisticated sites
- **Buttons**: Bright accent fill, high contrast text, subtle shadow, 48-56px height
  - Primary: Accent color with shadow
  - Secondary: Surface color with border, hover elevated
- **Cards**: Raised surface color, shadow for depth
  - Shadow: `0 4px 12px rgba(0,0,0,0.3)`
- **Inputs**: Surface color, border on focus, subtle inner shadow
- **Navigation**: Elevated bar with subtle shadow

### Glow & Luminosity (Dramatic, eye-catching)
**Use for**: Entertainment/gaming/bold brands
- **Buttons**: Accent color with glow effect
  - Shadow: `0 0 24px rgba(accent, 0.4)`
- **Cards**: Glow on hover, subtle border glow
- **Inputs**: Glow on focus state
- **Navigation**: Items glow on hover/active

**Selection**:
- Professional/sophisticated → Elevated Surfaces
- Entertainment/gaming/bold → Glow & Luminosity

---

## Visual Depth Layers

### Shadow Depth (Default, Material Design-inspired)
**Use for**: Most sites
- 3-4 elevation levels using shadows
- Base: No shadow
- Raised: `0 2px 8px rgba(0,0,0,0.3)`
- Elevated: `0 4px 16px rgba(0,0,0,0.4)`

### Surface Brightness (Subtle, clean)
**Use for**: Minimal/clean aesthetic
- 3-4 elevation levels using lighter backgrounds
- Background → Surface → Elevated (each ~8-10% lighter)
- No shadows, depth through color alone

**Selection**:
- Most sites → Shadow Depth
- Minimal/clean → Surface Brightness

---

## Contextual Adaptation

### SaaS Products
- **Palette**: Slate Dark or Soft Dark
- **Typography**: Modern Sans
- **Components**: Elevated Surfaces
- **Depth**: Shadow Depth
- **Notes**: High contrast CTAs, product screenshots with subtle glow, professional not overly stylized

### Creative/Agency Sites
- **Palette**: Warm Dark or Soft Dark
- **Typography**: Display + Sans or Modern Sans
- **Components**: Glow & Luminosity or Elevated Surfaces
- **Depth**: Surface Brightness
- **Notes**: Portfolio showcased dramatically, artistic freedom, sophisticated presentation

### E-commerce/Retail
- **Palette**: Soft Dark or Slate Dark
- **Typography**: Modern Sans
- **Components**: Elevated Surfaces
- **Depth**: Shadow Depth
- **Notes**: Product images prominent with glow/shadow, luxury feel, clear CTAs

### Gaming/Entertainment
- **Palette**: Soft Dark with vibrant accents
- **Typography**: Modern Sans
- **Components**: Glow & Luminosity
- **Depth**: Shadow Depth
- **Notes**: Vibrant accent colors, animated effects, immersive experience, dramatic presentation

### Content/Media Sites
- **Palette**: Soft Dark or Warm Dark
- **Typography**: Display + Sans
- **Components**: Elevated Surfaces
- **Depth**: Surface Brightness
- **Notes**: Reading comfort priority, generous spacing, excellent typography, media showcased

---

## Interaction & Animation

**Principles**: Smooth, elegant, sophisticated. More elaborate than light mode.

**Hover States**:
- Buttons: Glow increase or lift (translateY -2px) (300ms)
- Cards: Lift + shadow increase (300ms)
- Links: Glow or brightness increase (200ms)

**Page Load**:
- Fade in with subtle slide up (600ms)
- Stagger: 100ms between elements
- Smooth, elegant easing

**Micro-interactions**:
- Button click: Scale slightly (0.98) + glow pulse (200ms)
- Success: Glow animation (400ms)
- Focus states: Glow or border highlight
- Loading: Subtle spinner or pulse

**Effects**:
- Glow: Use sparingly, subtle
- Blur: Backdrop blur on modals (performance consideration)
- Parallax: Very subtle on backgrounds

**Respect**: `prefers-reduced-motion` - disable elaborate effects

---

## Layout & Spacing

**Sections**: Generous spacing (100-120px vertical), dark backgrounds between sections

**Whitespace**: Critical in dark mode - prevents overwhelming, creates elegance

**Contrast Zones**: Alternate between background and surface colors for sections

**Hero Sections**: Large, dramatic with high-contrast elements, accent color CTAs

---

## Navigation

**Header**: Elevated surface, subtle shadow or border, logo left, nav right, 64-80px height, sticky with enhanced shadow on scroll

**Links**: Off-white text, accent color on hover/active, glow or brightness change (subtle)

**Mobile**: Dark hamburger menu, maintain elegance, smooth transitions

**Footer**: Surface or elevated color, slightly lighter than background, subtle top border, links in secondary color, social icons with hover glow

---

## Special Components

**Buttons**: Primary bright accent (high contrast), secondary border with accent, tertiary text only, height 48-56px, border-radius 6-8px, hover glow/lift

**Forms**: Input backgrounds surface/elevated, borders subtle/brighten on focus, focus state accent glow, labels secondary color above inputs

**Cards**: Elevated surface, shadow for depth, padding 28-36px, border-radius 8-12px, hover lift with increased shadow

**Modals**: Dark backdrop (rgba(0,0,0,0.7-0.9)), modal on elevated surface, backdrop blur optional, large soft shadow, fade in backdrop + scale modal

**Tags/Badges**: Surface/elevated color, accent for emphasis, small padding (6px 12px), optional glow for active

---

## Color Usage

**Contrast Ratios**: Body text 4.5:1 minimum (WCAG AA), large text 3:1, test all combinations, off-white better than pure white

**Accent Color**: Primary actions/CTAs, links, key headings, status indicators - use sparingly for impact

**Hierarchy Through Brightness**:
- Most important: Brightest (white/near-white)
- Secondary: 70-80% brightness
- Tertiary: 50-60% brightness
- Disabled: 30-40% brightness

**Status Colors**: Success green, Error red, Warning yellow/orange, Info blue/cyan

---

## Image Handling

**Treatments**: Reduce brightness 10-15% (optional), subtle border/shadow, elevate on cards, glow around key images (subtle)

**Galleries**: Dark background between images, elevated cards per image, hover lift/glow, lightbox dark backdrop

**Logos**: Provide light version, subtle glow/shadow for visibility, ensure contrast

**Icons**: Light versions (white/off-white), accent color for emphasis, glow on hover (subtle)

---

## Responsive Behavior

**Mobile**: Reduce glow effects (performance), simplify shadows, larger tap targets (48px), single column, simplified nav, test on OLED vs LCD

**Performance**: Blur effects expensive (use sparingly), reduce glow blur radius on lower-end devices, respect prefers-reduced-motion, test battery impact on OLED

---

## Accessibility Critical

**Essential Practices**:
- NEVER pure white on pure black (causes halation/eye strain)
- Use #E0E0E0 or #F5F5F5 for text on #000000
- Or #FFFFFF on #121212 (softer black)
- Test contrast ratios rigorously
- Provide light mode toggle if possible

**Eye Strain Reduction**: Avoid very bright accents on very dark, reduce saturation slightly, increase font sizes 1-2px, more line-height, reduce pure white usage

**Motion & Effects**: Respect prefers-reduced-motion, disable glows/animations/blur, provide settings to reduce effects

**Color Blindness**: Don't rely on color alone, use icons/labels/patterns, test with simulators

---

## Example Variations

**Premium OLED** (Luxury, entertainment):
- Soft Dark palette (with OLED optimization)
- Display + Sans typography
- Elevated Surfaces components
- Shadow Depth

**Modern Professional** (SaaS, B2B):
- Slate Dark palette
- Modern Sans typography
- Elevated Surfaces components
- Surface Brightness depth

**Creative Bold** (Agencies, portfolios):
- Warm Dark palette
- Display + Sans typography
- Glow & Luminosity components
- Surface Brightness depth

---

## Essential Guidelines

✅ **Do**:
- Use off-white text on near-black backgrounds
- Test contrast ratios rigorously
- Consider eye comfort and readability
- Provide elegant depth through subtle means
- Maintain sophistication
- Use strategic brightness for hierarchy
- Test on OLED and LCD displays
- Offer light mode toggle when possible

❌ **Avoid**:
- Pure white on pure black (eye strain)
- Overusing glow effects (amateurish)
- Low-contrast text (readability issues)
- Very bright saturated colors excessively
- Heavy shadows (too much in dark)
- Ignoring accessibility
- Assuming dark mode = tech aesthetic

---

## Dark vs Technology Language

**Dark Language**: Sophisticated/elegant/premium, ANY industry can use, focus on readability/aesthetics, sans-serif or display fonts, smooth animations, glows/gradients acceptable, visual sophistication

**Technology Language**: Technical/code-inspired/developer-focused, specifically tech products, monospace fonts, terminal references, snappy interactions, ASCII/grid patterns, technical authenticity

**When to Choose**:
- Dark = User wants dark mode for any site type (SaaS, creative, e-commerce, content)
- Technology = User wants tech/developer aesthetic specifically

---

## Communication to User

When applying, tell user:

> "Using **Dark** design with [palette]. This creates an elegant, high-contrast experience with dark backgrounds and strategic bright accents. Emphasizes readability while providing sophisticated, modern aesthetic through [elevated surfaces/gradient accents/glow effects]. This dark theme will be [cozy/professional/dramatic] based on your [context]."

Then generate consistently using selected elements, maintaining excellent contrast and readability throughout site.

---

*This reference guides website-builder skill in applying dark design. Defaults: Soft Dark palette, Modern Sans typography, Elevated Surfaces components, Shadow Depth. Use when user wants dark mode aesthetic for any site type (not specifically tech/developer).*

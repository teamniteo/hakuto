# Brutalist Design Language

**Reference for website-builder skill. Intentionally raw, stark aesthetic inspired by brutalist architecture and early web design.**

## Aliases
- Brutal, Raw, Brutalism, Anti-design, Stark, Utilitarian, Raw web

## Core Identity

**Philosophy**: Inspired by brutalist architecture—raw, honest, unpolished, intentionally stark. Rejects conventional beauty for functional honesty. HTML as material. Challenges design norms.

**Non-negotiable characteristics**:
- Intentionally raw or "undesigned" aesthetic
- HTML elements unstyled or minimally styled
- Raw typography (system fonts, default browser styles)
- Stark contrasts and bold type
- Asymmetric, unconventional layouts
- Exposed structure (borders, grids, wireframes visible)
- Minimal color (often monochrome)
- Anti-polish: rough edges intentional
- Functional over decorative

**Critical distinction**: This is NOT amateur or broken design. It's intentional anti-polish with strong artistic direction.

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

### Pure Monochrome (Default, Most brutal)
**Use for**: Developer projects, portfolios, purest brutalism
```
Background: #FFFFFF
Text: #000000
Borders: #000000 (thick, 2-4px)
Accents: None or single color (red, blue, yellow)
Links: #0000EE (browser blue) or black underline
```

### Harsh Contrast (High impact)
**Use for**: Experimental sites, maximum visual impact
```
Background: #FFFF00 (yellow) or #00FF00 (green)
Text: #000000
Accents: #FF0000 (red) or #0000FF (blue)
Borders: #000000 (thick)
Warning: Can be harsh on eyes
```

### Newspaper/Print (Editorial brutalism)
**Use for**: Publications, zines, readable brutalism
```
Background: #FFFFF0 (cream/newsprint)
Text: #1A1A1A
Borders: #000000
Accents: #FF0000
Links: Underlined black or red
```

**Selection**:
- Purest brutalism → Pure Monochrome
- Maximum impact → Harsh Contrast
- Editorial/readable → Newspaper

---

## Typography Systems

### System Fonts Only (Default, Purest)
**Use for**: Fast loading, raw aesthetic, most sites
- **Font**: System UI stack (no web fonts)
- **Headings**: Bold (700-900), often ALL CAPS
  - H1: 48-72px, H2: 36-48px, H3: 24-32px
- **Body**: Regular (400), 16-18px
- **Characteristics**: Zero web fonts, instant load, raw

### Monospace Everything (Terminal aesthetic)
**Use for**: Developer projects, typewriter feel
- **Font**: Courier New, Courier, monospace
- **Headings**: Bold, ALL CAPS optional
  - H1: 32-48px, H2: 24-36px, H3: 20-28px
- **Body**: 16-18px, line-height 1.5-1.6
- **Characteristics**: Typewriter, code, mechanical feel

**Selection**:
- Most sites → System Fonts Only
- Developer/terminal aesthetic → Monospace Everything

---

## Layout Patterns

### Raw Grid (Default, Exposed structure)
**Use for**: Most brutalist sites, structured approach
- Visible grid lines (1-2px black borders)
- Grid cells often bordered
- Sections divided with thick borders
- Wireframe aesthetic visible
- Table-like layouts acceptable

### Asymmetric Chaos (Controlled disorder)
**Use for**: Experimental sites, portfolios
- Elements positioned unconventionally
- Overlapping text and images
- Rotated elements (slight angles)
- Breaking grid intentionally
- Collage-like compositions

### Terminal/CLI (Command-line aesthetic)
**Use for**: Developer projects, minimal structure
- List-based layouts
- Indentation for hierarchy
- Text-heavy, utility-first
- Looks like terminal output

**Selection**:
- Structured approach → Raw Grid
- Experimental/portfolio → Asymmetric Chaos
- Developer/minimal → Terminal/CLI

---

## Component Styling

### Unstyled HTML (Default, Purest)
**Use for**: Most brutal aesthetic, developer projects
- **Buttons**: Basic with minimal styling, 2px solid black border, white background, no border-radius
- **Forms**: Default browser styling or minimal override
- **Links**: Underlined, browser blue or black
- **Tables**: Bordered, no styling beyond borders

### Thick Borders (Strong boundaries)
**Use for**: Emphasis through borders, industrial feel
- **Everything**: 2-4px black borders
- **Buttons**: Thick border, solid fill on hover (black)
- **Forms**: Heavy borders
- **Cards**: Bordered sections (not typical "cards")

**Selection**:
- Purest brutalism → Unstyled HTML
- Industrial/strong boundaries → Thick Borders

---

## Contextual Adaptation

### Art/Design Portfolios
- **Palette**: Pure Monochrome or Harsh Contrast
- **Typography**: System Fonts or Monospace
- **Layout**: Asymmetric Chaos or Raw Grid
- **Components**: Thick Borders
- **Notes**: Work takes center stage, minimal UI chrome, bold typography for titles

### Indie/Alternative Brands
- **Palette**: Harsh Contrast or Newspaper
- **Typography**: Monospace or System Fonts
- **Layout**: Asymmetric Chaos or Terminal/CLI
- **Components**: Unstyled HTML
- **Notes**: Anti-establishment messaging, intentional roughness conveys authenticity

### Tech/Developer Projects
- **Palette**: Pure Monochrome
- **Typography**: Monospace or System Fonts
- **Layout**: Terminal/CLI or Raw Grid
- **Components**: Unstyled HTML
- **Notes**: Fast loading critical, code-like aesthetic, minimal JS/CSS

### Editorial/Publications
- **Palette**: Newspaper or Pure Monochrome
- **Typography**: System Fonts
- **Layout**: Raw Grid
- **Components**: Unstyled HTML
- **Notes**: Reading experience matters, large bold headlines, text-heavy

### Experimental/Conceptual Sites
- **Palette**: Harsh Contrast
- **Typography**: Monospace
- **Layout**: Asymmetric Chaos
- **Components**: Thick Borders
- **Notes**: Push boundaries, challenge conventions, memorable impact

---

## Interaction & Animation

**Principles**: Minimal, functional, no polish

**Hover States**:
- Links: Bold or underline change (instant, no transition)
- Buttons: Invert colors or darken (instant or 100ms)
- No smooth transitions (brutalism = immediate feedback)

**Interactions**:
- No fade-ins, slide-ins, or elaborate animations
- State changes: Instant or very fast (50-100ms)
- Focus states: Thick border or invert
- Hover: Bold, invert, or change (immediate)

**Avoid**: Smooth transitions, subtle fades, complex scroll effects, loading animations (or use simple ASCII spinner)

---

## Layout Details

**Grid**: Visible borders, 12-column optional, thick dividers between sections

**Spacing**: Less refined than other styles, functional over aesthetic, unequal spacing acceptable

**Alignment**: Left-aligned common, centered for headlines, justified acceptable (imperfect spacing is fine)

**White Space**: Minimal compared to minimalist, functional spacing, tight grouping

---

## Special Elements

**Buttons**: 2-4px black border, no border-radius, no shadows, text-only or solid fill

**Forms**: Default browser styling or minimal override, thick borders, no fancy focus states

**Links**: Always underlined, browser blue or black, bold on hover

**Tables**: Thick borders, minimal styling, data-focused

**Images**: No filters, heavy black borders common, full-bleed or strictly bordered, can overlap text

**Icons**: Minimal or none, text symbols preferred (→, ×, ☰), simple SVG shapes if needed

---

## Typography Details

**Scale**: Less refined
- H1: 48-80px (varies widely)
- H2: 32-56px
- H3: 24-40px
- Body: 16-18px

**Text Effects**:
- ALL CAPS for emphasis
- BOLD for hierarchy
- Underline for links (always)
- NO gradients, shadows, glows

---

## Navigation

**Header**: Logo left, nav right or minimal, 1-2px bottom border, 64-80px height, no sticky (or minimal sticky)

**Links**: Text only, underlined or bold, no background, large spacing

**Footer**: Minimal, single column, black text on white (or inverse)

**Mobile**: Same aesthetic, stacking layout, minimal hamburger menu if needed

---

## Brutalist-Specific Features

**Exposed Structure**:
- Visible grid lines as design element
- Borders everywhere
- Raw HTML elements visible (`<hr>`, `<blockquote>` with thick borders)

**ASCII/Text Art** (optional):
- Dividers: `---`, `===`, `***`
- Borders: `┌─┐`, `│ │`, `└─┘`
- Arrows: `→`, `←`, `↓`, `↑`

**Exposed Metadata**:
- Timestamps visible
- File sizes shown
- "Last updated" dates
- Raw data exposed

---

## Responsive Behavior

**Approach**: Minimal adaptation, function over polish

**Mobile**: Same aesthetic smaller screen, text remains bold/large, stacking layout, horizontal scrolling sometimes acceptable (intentional)

**Performance**: Fast loading critical, system fonts = instant, minimal CSS/JS, optimized images

---

## Accessibility

**Critical**:
- High contrast helps accessibility
- Large text helps readability
- Clear focus states essential (thick borders)
- Semantic HTML matters
- Keyboard navigation must work

**Challenges**: Overlapping text or harsh colors can harm accessibility

**Best Practices**:
- Maintain 4.5:1 contrast minimum
- Keyboard-accessible interactive elements
- Alt text for images
- Semantic HTML despite raw aesthetic

---

## Example Variations

**Pure Web Brutalism** (Developer):
- Pure Monochrome palette
- System Fonts Only
- Unstyled HTML components
- Raw Grid layout

**Dark Experimental** (Music/Art):
- Pure Monochrome (black background)
- Monospace Everything
- Thick Borders components
- Asymmetric Chaos layout

**Editorial Brutalism** (Publication):
- Newspaper palette
- System Fonts Only
- Unstyled HTML components
- Raw Grid layout

---

## When to Use Brutalist Design

**Good fits**:
- Art/design portfolios
- Indie/alternative brands
- Music/cultural projects
- Experimental/conceptual sites
- Developer personal sites
- Publications/zines
- Manifesto/statement pages

**Poor fits**:
- E-commerce (users expect polish)
- Corporate/business (need credibility)
- Healthcare/medical (need trust)
- Finance/legal (need professionalism)
- General audiences (may confuse)

---

## Essential Guidelines

✅ **Do**:
- Be intentional about every raw choice
- Maintain functionality despite aesthetic
- Test usability (brutalism ≠ unusable)
- Embrace constraints (system fonts, minimal CSS)
- Challenge conventions purposefully
- Make it accessible despite raw appearance

❌ **Avoid**:
- Adding polish accidentally
- Using for clients expecting traditional design
- Making it actually broken or unusable
- Forgetting accessibility
- Using for e-commerce or corporate sites
- Making it look amateur (it's intentional)

---

## Communication to User

When applying, tell user:

> "Using **Brutalist** design with [palette] and [typography]. This creates an intentionally raw, unpolished look inspired by brutalist architecture and early web design. The style is stark, honest, and challenges conventional design norms through [thick borders/exposed structure/raw typography]. This works best for [art/culture/indie/experimental] contexts. The result will be bold, unconventional, and memorable."

**Important**: Confirm user understands brutalism is intentionally raw, not accidentally unfinished. Some users may not appreciate this aesthetic.

Then generate consistently using selected elements throughout site.

---

*This reference guides website-builder skill in applying brutalist design. Defaults: Pure Monochrome palette, System Fonts Only typography, Unstyled HTML components, Raw Grid layout. Use only when appropriate for context (art, indie, experimental, not corporate/e-commerce).*

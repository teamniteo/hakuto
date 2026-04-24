# Technology Design Language

**Reference for website-builder skill. Developer-focused aesthetic inspired by terminal interfaces, code editors, and command-line tools.**

## Aliases
- Tech, Terminal, Developer, Code, Hacker, Cyber, Digital

## Core Identity

**Philosophy**: Inspired by terminal interfaces, code editors, and developer tools. Monospace typography as accent, technical aesthetics, usually dark backgrounds with high-contrast text and neon/green accents. Functional over decorative, command-line inspired.

**Non-negotiable characteristics**:
- Monospace font used prominently (not just for code)
- Dark backgrounds preferred (or dark sections)
- High contrast text and accents
- Technical/digital aesthetic elements
- Code-inspired UI patterns
- Green, cyan, or neon accent colors common
- Grid patterns, ASCII art, or technical graphics
- Terminal/command-line visual references

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

### Classic Terminal (Default, Most iconic)
**Use for**: Developer tools, APIs, B2B SaaS
```
Background: #0D1117 (GitHub dark)
Surface: #161B22
Text Primary: #C9D1D9 (off-white)
Text Secondary: #8B949E
Accent Primary: #58A6FF (bright blue)
Accent Secondary: #39D353 (terminal green)
Border: #30363D
Code background: #161B22
```

### Matrix Green (Iconic hacker aesthetic)
**Use for**: Security products, privacy tools, hacker-focused
```
Background: #0D0208 (nearly black)
Surface: #1A1A1A
Text Primary: #00FF41 (matrix green)
Text Secondary: #008F11
Accent Primary: #00FF41
Accent Secondary: #39FF14 (neon green)
Border: #003B00
```

### Light Tech (Non-dark alternative)
**Use for**: Users averse to dark mode
```
Background: #FAFBFC
Surface: #F6F8FA
Text Primary: #24292F (dark gray)
Text Secondary: #57606A
Accent Primary: #0969DA (GitHub blue)
Accent Secondary: #1F883D (GitHub green)
Border: #D0D7DE
```

**Selection**:
- Developer tools/APIs → Classic Terminal
- Security/privacy → Matrix Green
- Users averse to dark → Light Tech

---

## Typography Systems

### Monospace Accents (Default, Balanced)
**Use for**: Most tech sites, professional with tech touches
- **Headings**: Space Grotesk or Inter, weight 600-700
  - H1: 46px, H2: 34px, H3: 24px
- **Body**: Inter, weight 400, 16px, line-height 1.6
- **Code/Labels**: JetBrains Mono or Fira Code
  - Used for: code blocks, buttons, labels, nav items
- **Characteristics**: Professional with technical touches

### Monospace Primary (Bold tech statement)
**Use for**: Strong tech identity
- **Headings**: JetBrains Mono or Fira Code, weight 700
  - H1: 42px, H2: 32px, H3: 24px
- **Body**: Inter or system-ui, weight 400, 16px, line-height 1.6
- **Code**: JetBrains Mono or Fira Code
- **Characteristics**: Headings look like code, bold statement

**Selection**:
- Most sites → Monospace Accents
- Bold tech statement → Monospace Primary

---

## Component Styling

### Terminal UI (Default, Most authentic)
**Use for**: Developer tools, CLI products
- **Buttons**: Rectangular, 1px border, accent color, monospace text, transparent background
  - Hover: Fill with accent, invert text
- **Cards**: 1px border, no shadow, monospace labels
- **Inputs**: Underline or full border, placeholder in secondary color, block cursor (█) if possible
- **Navigation**: Monospace, underline or `>` prefix on active
- **Code blocks**: Border, line numbers, syntax highlighting

### Clean Tech (Subtle, professional)
**Use for**: B2B SaaS, professional products
- **Buttons**: Solid fill, sharp corners, subtle tech detail (corner brackets), 40-48px height
- **Cards**: Sharp corners, thin borders, no shadows
- **Inputs**: Simple border, tech-inspired focus
- **Navigation**: Clean, monospace, minimal decoration
- **Code blocks**: Clean borders, syntax highlighting

**Selection**:
- Developer tools/CLI → Terminal UI
- Professional B2B → Clean Tech

---

## Layout Patterns

### Clean Geometric (Default, Professional)
**Use for**: Most tech sites
- Standard grid, clean sections
- Tech aesthetic via color/typography, not layout
- Professional, readable
- Grid structure without visible grid
- Focus on content hierarchy

### Terminal Sections (Most tech-forward)
**Use for**: Bold tech identity
- Sections styled as terminal windows
- Window chrome (title bars, close buttons)
- `$` or `>` prompt symbols
- Command-line style content
- Monospace everywhere

**Selection**:
- Professional/readable → Clean Geometric
- Bold tech identity → Terminal Sections

---

## Contextual Adaptation

### Developer Tools/APIs
- **Palette**: Classic Terminal
- **Typography**: Monospace Accents
- **Components**: Terminal UI or Clean Tech
- **Layout**: Clean Geometric or Terminal Sections
- **Notes**: Syntax-highlighted code blocks essential, API reference styling, dark mode default, CLI command examples, GitHub-style markdown

### Tech SaaS Products
- **Palette**: Classic Terminal
- **Typography**: Monospace Accents
- **Components**: Clean Tech
- **Layout**: Clean Geometric
- **Notes**: Balance tech aesthetic with conversion, product screenshots with terminal-style frames, code integration examples

### Security/Privacy Products
- **Palette**: Matrix Green or Classic Terminal
- **Typography**: Monospace Primary or Monospace Accents
- **Components**: Terminal UI
- **Layout**: Clean Geometric or Terminal Sections
- **Notes**: Security badges prominent, technical credibility, encryption/privacy messaging, hacker aesthetic appropriate

### Crypto/Web3 Products
- **Palette**: Matrix Green or Classic Terminal
- **Typography**: Monospace Primary
- **Components**: Terminal UI
- **Layout**: Terminal Sections
- **Notes**: Bold tech aesthetic, wallet integration UI, blockchain references, decentralized messaging

### Open Source Projects
- **Palette**: Classic Terminal or Light Tech
- **Typography**: Monospace Accents
- **Components**: Terminal UI or Clean Tech
- **Layout**: Clean Geometric
- **Notes**: GitHub integration prominent, contribution guidelines, documentation-focused, community emphasis

---

## Interaction & Animation

**Principles**: Snappy, fast, terminal-like. NOT slow or elaborate.

**Speed**: Fast transitions (100-200ms), instant feedback feeling, terminal responsiveness

**Hover States**:
- Buttons: Border color change or fill invert (150ms)
- Links: Color change + underline (100ms)
- Cards: Subtle border glow (150ms)

**Page Load**: Quick fade-ins (300ms), no elaborate transitions, stagger: 50ms between elements

**Terminal Effects** (optional, use sparingly):
- Typing animation for headlines (fast)
- Cursor blink (terminal-style)
- Scan lines (subtle, optional)
- Glitch effects (very subtle, on hover only)

**Avoid**: Slow animations, bouncy effects, elaborate transitions, heavy particle effects

---

## Navigation

**Header**: Dark background, monospace or sans nav items, accent color on hover/active, 60-80px height, sticky with subtle shadow or border

**Links**: Monospace or clean sans, accent color hover, `>` or underline indicator for active

**Mobile**: Dark hamburger overlay, maintain terminal aesthetic, full-screen menu

**Footer**: Dark background, monospace or small caps for labels, technical links (GitHub, API docs, Status page), minimal decoration

---

## Code Blocks & Technical Content

**Code Blocks**: Dark background (#161B22 or darker), syntax highlighting, line numbers optional, copy button, monospace font (JetBrains Mono/Fira Code), border or subtle glow

**Inline Code**: Background slightly lighter than text background, monospace font, accent color optional, padding: 2px 6px

**Command Examples**: Terminal-style (dark background, prompt symbol `$`, monospace, syntax highlighting), copy button prominent

**API Documentation**: Card-style with borders, monospace for endpoints, syntax-highlighted examples, collapsible sections, copy buttons everywhere

---

## Special Elements

**Buttons**: Rectangular (0-4px radius), monospace or geometric sans text, border with accent color, transparent or filled, hover invert or glow, 40-48px height

**Forms**: Dark inputs, monospace labels or small caps, focus: accent border or glow, error: red border + monospace error text, placeholders: secondary color

**Cards**: Dark background (lighter than page), 1px border (accent or border color), minimal radius, optional ASCII corners (┌, └), padding 24-32px, header with accent underline

**Tables**: Border all cells, monospace for values, alternating row colors (subtle), accent color headers, technical data presentation

**Badges/Tags**: Small monospace text, border or fill with accent, corner brackets or clean rectangles, used for tech labels (API, Beta, v1.2.0)

---

## Technical Symbols & Icons

**Symbols**:
- Arrow: `→` or `->`
- Bullet: `•`, `▸`, or `-`
- Success: `✓` or `[OK]`
- Error: `✗` or `[ERROR]`
- Prompt: `$`, `>`, or `#`

**Icons**: Terminal/command prompt, code brackets `</>`, Git logo, lightning bolt, lock, chip/circuit, API/plug

**ASCII Art** (use sparingly): Logo renditions, section dividers, decorative elements - must be subtle

---

## Color Usage

**Text Hierarchy**: Primary (white/off-white on dark), Secondary (60-70% opacity), Tertiary (40-50% opacity), Accent (sparingly for emphasis)

**Interactive**: Links accent color, Buttons accent border/fill, Hover brighter accent, Active slightly darker

**Status Colors**: Success green (#10B981 or #00FF41), Error red (#EF4444), Warning yellow/orange (#F59E0B), Info blue/cyan (#3B82F6)

**Backgrounds**: Page darkest, Surface slightly lighter, Elevated even lighter - three levels maximum

---

## Typography Details

**Scale**: H1 42-46px, H2 32-34px, H3 24px, Body 16-17px (slightly larger for dark mode)

**Code/Monospace**: Use for headings, labels, buttons, nav items, code blocks - NOT body text (readability)

**Body Text**: Sans-serif (Inter, system-ui) for readability, high contrast (4.5:1 minimum), line-height 1.6-1.7, max-width 680-720px

**Lists**: Square bullets or dashes, monospace markers optional, terminal-style prefixes (`>`, `$`, `*`) acceptable, accent color for markers

---

## Responsive Behavior

**Mobile**: Reduce glow effects (performance), simplify grid patterns, maintain monospace for key elements, larger tap targets (48px), simplify terminal UI (remove chrome decorations)

**Performance**: Glow effects expensive (use sparingly), scan lines/CRT effects (disable on low-end), respect prefers-reduced-motion, monospace fonts: load only, fallback to system

---

## Accessibility

**Color Contrast**: Maintain 4.5:1 minimum, test accent colors against backgrounds, don't rely on color alone

**Monospace Readability**: Body text should NOT be monospace (poor readability), use monospace strategically (headings, labels, code), increase font size if monospace for body (18px+)

**Motion**: Respect prefers-reduced-motion, disable glitch/scan lines/animations, provide toggle if effects prominent, essential info never conveyed by animation alone

**Dark Mode**: Pure black causes eye strain (use #0D1117 or #1E1E1E), reduce white to off-white (#C9D1D9), test in various lighting conditions

---

## Example Variations

**Classic Developer Terminal** (API docs, CLI tools):
- Classic Terminal palette
- Monospace Accents typography
- Terminal UI components
- Clean Geometric layout

**Modern Tech SaaS** (B2B dev tools):
- Classic Terminal palette
- Monospace Accents typography
- Clean Tech components
- Clean Geometric layout

**Security/Hacker Aesthetic** (Privacy, security):
- Matrix Green palette
- Monospace Primary typography
- Terminal UI components
- Terminal Sections layout

---

## Essential Guidelines

✅ **Do**:
- Balance tech aesthetic with readability
- Use monospace strategically
- Maintain high contrast
- Keep interactions snappy (fast)
- Test with actual developers
- Make code blocks look great
- Use dark mode thoughtfully
- Consider light mode variant
- Honor terminal/command-line heritage

❌ **Avoid**:
- Monospace for all body text (poor readability)
- Overusing glow effects (amateurish)
- Everything neon green (Matrix cliché)
- Too many tech effects (overwhelming)
- Sacrificing usability for aesthetic
- Illegible color combinations
- Slow animations (terminal should feel fast)
- Tech aesthetic for non-tech audiences

---

## Technology vs Dark Language

**Technology Language**: Technical/code-inspired/developer-focused, specifically tech products, monospace fonts prominent, terminal/CLI references, snappy interactions, ASCII art/grid patterns, technical authenticity

**Dark Language**: Sophisticated/elegant/premium, ANY industry can use, sans-serif or display fonts, smooth animations, glows/gradients acceptable, visual sophistication

**When to Choose**:
- Technology = Developer tools, APIs, tech products targeting developers
- Dark = Any site type wanting dark mode (not specifically tech)

---

## Communication to User

When applying, tell user:

> "Using **Technology** design with [palette] and [typography]. This creates a developer-focused look inspired by terminal interfaces and code editors, featuring [monospace accents/dark backgrounds/neon highlights]. The design feels technical and modern while maintaining readability and usability. Perfect for [use case context]."

Then generate consistently using selected elements and tech-inspired patterns throughout site.

---

*This reference guides website-builder skill in applying technology design. Defaults: Classic Terminal palette, Monospace Accents typography, Terminal UI components, Clean Geometric layout. Use specifically for tech products targeting developers, not general dark mode aesthetic.*

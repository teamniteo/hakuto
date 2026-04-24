# Site Specification Management

*Reference for managing site-specification.md*

---

## Purpose

Maintains consistency across sessions. Documents starting design + customizations = current site aesthetic.

**Focus:** Keep specification concise - only Configuration and Design Evolution sections.

---

## Timing

**Create:** After first page
**Read:** Before each subsequent page
**Update:** After design changes or customizations

If spec missing when building second+ page: Infer from existing files, then create.

---

## Structure

Site specification contains only TWO sections:

### 1. Configuration
Essential project metadata:
- Site Type (SaaS/General/E-commerce/Portfolio/etc.)
- Design Language Starting Point (Technology/Modern/Minimalist/etc.)
- Target Audience (who the site is for)
- Primary Goal (conversion/credibility/leads/signups/etc.)

### 2. Design Evolution
Tracks aesthetic changes over time:
- **Starting aesthetic**: Initial design language description
- **User customizations**: List of deviations from starting design (or "None yet")
- **Current style**: Concise description of actual aesthetic in use (colors, typography, visual patterns)

**That's it.** No other sections needed.

---

## Design Evolution Pattern

Design languages provide defaults. Users customize. Spec tracks both.

**Flow:**
1. Initial: Design language → starting aesthetic
2. User requests changes → apply modifications
3. Spec documents: Starting point + customizations
4. Future pages: Apply **Current** aesthetic (not original defaults)

**Example:** Started Minimalist monochrome → User wants warm tones → Update to warm palette → New pages use warm colors, not monochrome.

---

## Creating Spec

1. After building first page, gather:
   - Site type, design language selected
   - Target audience, primary goal
   - Any customizations made during build

2. Fill template:
   ```markdown
   # Site Specification

   ## Configuration
   - **Site Type**: SaaS
   - **Design Language (Starting Point)**: Technology
   - **Target Audience**: Small pharma and biotech companies
   - **Primary Goal**: Trial signups and demo bookings

   ## Design Evolution
   - **Starting aesthetic**: Technology design language (Classic Terminal palette)
   - **User customizations**: None yet - using default Technology design
   - **Current style**: Dark terminal-inspired aesthetic with GitHub dark colors (#0D1117 background, #58A6FF bright blue accent, #39D353 terminal green accent). Professional B2B SaaS look with technical credibility.
   ```

3. Keep it concise - aim for 15-25 lines total

---

## Reading Spec

Extract:
- Design Language (starting point)
- User Customizations (overrides)
- Current Style (actual aesthetic to apply)

**Apply Current style, not starting defaults.**

---

## Updating Spec

**After user requests design changes:**
1. Update "User customizations" section
2. Update "Current style" to reflect new aesthetic
3. Regenerate affected pages using new style

**Example update:**
```markdown
## Design Evolution
- **Starting aesthetic**: Technology design language (Classic Terminal palette)
- **User customizations**: Changed accent from blue (#58A6FF) to purple (#C792EA), increased border radius from 4px to 8px for softer look
- **Current style**: Dark terminal-inspired aesthetic with purple accent (#C792EA), softer rounded corners. GitHub dark base (#0D1117) with purple highlights and terminal green (#39D353) for success states.
```

---

## Common Workflows

**First page:** Build → Create spec → Inform user

**Additional page:** Read spec → Apply Current style → Build page

**User customizes:** Read spec → Apply changes → Update spec (customizations + current style) → Regenerate pages

**User returns later:** Read spec (especially Current Style) → Match actual site

---

## Rules

1. **Only 2 sections**: Configuration + Design Evolution
2. **Apply Current style**, not design language defaults
3. **Keep concise**: Aim for 15-25 lines total
4. **Update after design changes**, not after every page
5. **Document customizations** so they persist across sessions

---

## Key Pattern

Spec enables multi-session consistency:
1. **Starting**: Design language selected
2. **Evolution**: Customizations applied over time
3. **Current**: Actual site aesthetic to use

Always build to Current, not Starting.

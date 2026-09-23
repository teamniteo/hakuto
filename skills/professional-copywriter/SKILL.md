---
name: professional-copywriter
description: "Benefit-driven, conversion-focused copy for SaaS and company websites: heroes, headlines, taglines, feature and pricing sections, About pages, CTA and button text. Also strips AI-sounding patterns from existing site copy. Use when a page or section has missing or partial content, or the user asks to \"write the copy\", \"improve this headline\", \"rewrite the hero\", \"punch up the CTAs\", or \"make this sound less AI-generated\". Skip when the user has supplied finished copy and asked for no edits (place it verbatim), and skip blog posts and docs pages (`section-blog` and `section-docs` use neutral placeholders by design)."
---

# Professional Copywriting

Write website copy that says what the product does for the visitor, in plain words, without
sounding machine-generated. User-provided copy is never changed unless they ask.

## When to write, when to preserve

The user's words carry context you don't have: legal wording, positioning they fought over,
their own voice. Rewriting them unasked destroys that and forces them to undo your work.

For each page or section:

| Situation | Action |
|---|---|
| User supplied complete copy, no edit requested | Use it verbatim |
| User supplied partial copy (bullets, a headline, notes) | Keep their words as anchors, write only what's missing |
| No copy supplied | Write it |
| User asked for edits or a rewrite | Edit, keeping their core message |

When it's unclear whether text is final or a rough note, ask before rewriting it.

## Before writing: read the context

Copy has to fit the site it lands on. Before drafting, read `site-specification.md` if it
exists, and use whatever the invoking skill passed you:

- **Audience and primary goal** (Configuration section): who you're persuading and what the
  #1 CTA is.
- **Tone**: from the spec's Tone line or what the invoker passed. If neither exists, infer it
  from the direction's concept and the "Messaging & Tone" section of
  `${CLAUDE_PLUGIN_ROOT}/skills/website-builder/references/site-types/[saas|general].md`, and
  say which tone you used.
- **Content jobs**: the same site-type file lists what each page must accomplish. Cover those
  jobs; don't invent sections they don't call for.

A terse, technical direction for developers and a warm one for a local design studio should
not produce the same hero.

## Never invent facts

Generated sites ship. An invented "Trusted by 10,000 teams", a made-up testimonial or a
fabricated "cuts reporting time by 80%" becomes a false claim on the user's live site.

Numbers, customer names, logos, testimonials, awards, certifications and review scores come
from the user. When a section needs proof you don't have, write a placeholder that says
exactly what goes there and starts with `TODO`, so the prelaunch checklist's placeholder
scan catches it:

- `TODO: number of active customers`
- `TODO: quote from a customer about onboarding speed, with name and role`

Concrete-sounding claims without numbers are fine when they describe what the product
actually does ("Reply from Slack, archive in one click").

## Writing principles

### Benefits over features
Translate every feature into what the visitor gets. Apply the "So what?" test.

- ❌ "1,000-watt motor with stainless steel blades"
- ✅ "Blends frozen fruit smooth, with no chunks left behind"

### Structure for scanning
- Headings that state the point of the section, not a label for it
- Paragraphs of 1-3 sentences
- Real lists as bullets; don't disguise them as "The first… The second…" prose
- Most important information first

### Clarity over cleverness
- Write conversationally and directly. Avoid jargon unless the audience uses it.
- Every word must earn its place.
- Name the problem in the visitor's own words. A question hook ("Still chasing approvals
  over email?") works once per page; more than that reads as a template.

### Voice and specificity
- Have a stance: react to facts, don't just list them.
- Vary rhythm: uniform cadence reads as AI. Mix sentence lengths, but don't build paragraphs
  out of fragments ("Fast. Simple. Yours.").
- Be concrete about what the product does. Specific numbers are the strongest copy there is,
  and they must be the user's numbers (see above).
- Mirror customer language: use the words customers use in reviews, support tickets and
  interviews. Don't invent marketing vocabulary for them.
- One thing, one name: if it's the "dashboard" in the hero, it stays the "dashboard" in the
  CTA. Visitors read a new word as a new thing.

## AI tells

The full catalogue is in `references/ai-tells.md`, including the patterns that are fine in
context (fragments in a hero, "we" on a company site). These show up most in marketing copy:

- "It's not X, it's Y", and "Not X. Not Y. Just Z."
- Promotional clichés and stock AI vocabulary: seamless, robust, unlock, elevate, empower,
  leverage, cutting-edge, all-in-one solution
- Magic adverbs: quietly, deeply, fundamentally, truly, effortlessly
- Copula avoidance: "serves as", "stands as", "represents" → "is"
- Grandiose stakes, and fake-depth -ing tails ("...empowering teams, fostering collaboration")
- Vague attributions ("experts agree", "studies show") and quotable one-liners that say nothing
- Stacked triplets, anaphora ("Built for X. Built for Y. Built for Z."), and "The result? Y."
- Suspense transitions ("Here's the thing") and forced metaphors ("a Swiss Army knife for…")
- More than two or three em dashes per page, and title-case headings or buttons

One instance is rarely the problem. Several together, or one repeated down the page, is.

❌ **AI-sounding:**
> Our groundbreaking platform serves as a vibrant hub, empowering teams to navigate the complexities of modern collaboration. It's not just a tool — it's a testament to seamless productivity.

✅ **Human:**
> One shared inbox for your whole team. Reply from Slack, archive in one click, and stop losing threads in CC chains.

## Page patterns

### Hero
- Headline stating the main benefit
- Subhead that makes it specific: for whom, how
- One primary CTA
- Proof: logos, a stat or a short quote, from the user or as a `TODO` placeholder

Headline shapes to start from (not to fill in mechanically):
- `{Outcome} without {pain point}`: "Ship faster without breaking production"
- `The {category} for {audience}`: "The CRM for solo founders"
- `{Pain-point question}?`: "Still chasing approvals over email?" (the page's one question hook)

### Features and services
- A benefit headline per section, a short explanation, the visitor's outcome, and proof
  where the user has it

### Pricing
- Make the difference between tiers obvious at a glance
- Frame price against the value delivered
- Answer the likely objections (contracts, cancellation, limits) next to the price
- Label CTAs by buyer: "Start free" for individuals, "Talk to sales" for teams

## CTAs

Formula: action verb + what they get: "Start free trial", "See pricing", "Get the checklist".
Use sentence case on buttons and headings, keeping capitals for proper nouns.

- ❌ "Sign up now", "Submit", "Learn more"
- ✅ "Start your free trial", "See how it works"

Repeat the primary CTA after each major section so it's never far away, but don't stack two
CTAs with the same intent next to each other. A secondary CTA offers a different step
("See pricing" next to "Start free trial").

## Final anti-AI pass

Before delivering, read `references/ai-tells.md`, then re-read the whole draft once and ask:
**"what here sounds AI-generated?"** Revise those lines. The catalogue is easy to satisfy line
by line while the page as a whole still feels generated, so read it as a visitor would, top
to bottom, and watch for patterns that repeat across sections: every heading a
"What/Why/How", every section opening with a question, the same word paying itself off.

Then confirm:
- [ ] User copy preserved where provided; only missing parts written
- [ ] Tone matches the spec or the invoker's brief
- [ ] No invented numbers, names, quotes or logos; every gap is a `TODO:` placeholder
- [ ] Features translated to benefits
- [ ] Headings and buttons in sentence case
- [ ] CTAs name what the visitor gets

## Output

- **Invoked by `website-builder` or another skill during a build:** write the copy straight
  into the page or component files it's working on, then list any `TODO:` placeholders you
  left.
- **Direct request from the user:** show the copy in the chat grouped by section, and ask
  before writing it into files unless they already told you to.
- **Headlines and primary CTAs:** offer 2-3 alternatives with a one-line rationale each, with
  your pick first. For body copy, give one best draft.
- **Rewrites of existing copy:** show before and after for each changed passage, so the user
  can see what moved and why.
- **Tone:** if you inferred it, say which tone you used in one line.

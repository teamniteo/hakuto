---
name: professional-copywriter
description: "Benefit-driven, conversion-focused copy for SaaS and company websites: heroes, headlines, taglines, feature and pricing sections, About pages, CTA and button text. Also strips AI-sounding patterns from existing site copy. Use when a page or section has missing or partial content, or the user asks to \"write the copy\", \"improve this headline\", \"give me headline options\", \"fix the section headings\", \"rewrite the hero\", \"punch up the CTAs\", or \"make this sound less AI-generated\". Skip when the user has supplied finished copy and asked for no edits (place it verbatim), and skip blog posts and docs pages (`section-blog` and `section-docs` use neutral placeholders by design)."
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

Keep edits to the scope asked for. "Fix this headline" changes the headline, not the subhead
under it. Undo any change you can't give a reason for. If you spot a serious problem
elsewhere, mention it in one line and leave it alone.

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

If the user wrote some of the site's copy themselves, or pointed you at writing of theirs,
treat it as the voice sample. Match its sentence length, word choice, punctuation and how it
opens and moves between points. The sample overrides the defaults in this skill: if they use
dashes freely or write in "I", so do you.

## Find the one difference

Well-phrased copy that any competitor could also publish does nothing for the visitor.
Before drafting, write down in one sentence what this product does that the alternatives
don't, and for whom. The alternatives include doing nothing and the spreadsheet the visitor
already uses.

- **Quality isn't a difference.** "High quality", "great support", "easy to use" and
  "reliable" are what every competitor claims. Look for something specific: a method, a
  constraint, an audience nobody else serves, a thing the product refuses to do.
- **One idea, not the whole story.** The hero states the difference. Every later section
  supports it, and a visitor who reads nothing else still gets it. Extra benefits go further
  down the page; they don't share the headline.
- **Don't invent it.** Take the difference from the spec, the chosen direction's concept or
  the user's notes. On a direct request with none of those, ask the user what they'd say if
  a prospect asked "why you and not X?". During a build, don't stop to ask: write the hero
  around the clearest real benefit and add "no clear difference given" to the `TODO:` list
  you report at the end. Either way, don't guess a difference and build the page on it.

## Never invent facts

Generated sites ship. An invented "Trusted by 10,000 teams", a made-up testimonial or a
fabricated "cuts reporting time by 80%" becomes a false claim on the user's live site.

Numbers, customer names, logos, testimonials, awards, certifications and review scores come
from the user. When a section needs proof you don't have, write a placeholder that says
exactly what goes there and starts with `TODO`, so the prelaunch checklist's placeholder
scan catches it:

- `TODO: number of active customers`
- `TODO: quote from a customer about onboarding speed, with name and role` (ideally someone
  in the target audience's role: visitors trust testimonials from people like themselves)
- `TODO: "#1 rated" needs a G2 badge or a review export to back it`

Say what evidence would back the claim, so the user knows what to go and find. If the user
asks for a claim they can't support yet, write the supported version and tell them what
would unlock the stronger one.

For testimonials, suggest questions the user can ask a customer: what they used before,
what changed, a specific result, and their role. Answers to those make better quotes than
"Great product!". Use the user's numbers exactly as given: "11,847 teams" beats "10,000+".

Security, compliance and reliability claims are facts too: "SOC 2", "GDPR compliant",
"bank-level encryption", "enterprise-grade security", "99.9% uptime". They come from the
user or become a `TODO:`. Concrete-sounding claims without numbers are fine when they
describe what the product actually does ("Reply from Slack, archive in one click").

## Writing principles

### Benefits over features
Translate every feature into what the visitor gets. Apply the "So what?" test.

- ❌ "Real-time two-way sync with 40+ integrations"
- ✅ "Update a deal in HubSpot and it's already changed in your invoices"

**Technical buyers are the exception.** Developers and engineers judge a tool by what it
does and how, and read benefit language as fluff. For them, lead with the precise feature
("p99 latency under 50 ms", "one `npm install`, no config file"), show a code sample where
a sentence would describe one, and state real limits plainly. The benefit can follow in a
few words, or go unsaid when it's obvious to them.

### Structure for scanning
- Headings that state the point of the section, not a label for it
- Paragraphs of 1-3 sentences
- Real lists as bullets; don't disguise them as "The first… The second…" prose
- Most important information first

### Clarity over cleverness
- Write conversationally and directly. Avoid jargon unless the audience uses it.
- Every word must earn its place. Ask three questions of every line: Can the visitor
  picture it? Could someone prove it true or false? Could a competitor publish this exact
  sentence? A line that fails all three is filler.
- Name the problem in the visitor's own words. A question hook ("Still chasing approvals
  over email?") works once per page; more than that reads as a template.

### Voice and specificity
- Have a stance: react to facts, don't just list them.
- Vary rhythm: uniform cadence reads as AI. Mix sentence lengths, but don't build paragraphs
  out of fragments ("Fast. Simple. Yours.").
- Be concrete about what the product does. Specific numbers are the strongest copy there is,
  and they must be the user's numbers (see above). More facts persuade more visitors, so a
  long page is fine when every line adds a fact. Lines that add nothing should go.
- Mirror customer language: use the words customers use in reviews, support tickets and
  interviews. Don't invent marketing vocabulary for them.
- One thing, one name: if it's the "dashboard" in the hero, it stays the "dashboard" in the
  CTA. Visitors read a new word as a new thing.

### Persuade with what's already in the visitor's mind
- **Anchor new to familiar.** People take in something new only when it's tied to something
  they know. Name the category or the thing it replaces: "The CRM for solo founders", "Like
  a shared inbox, but for invoices".
- **Narrow beats broad.** A headline written for everyone leaves each visitor guessing
  whether it's for them. When the buyers are a small group, name them in the headline so
  they recognise themselves. Check how each claim reads to that group: "Move fast" sells to
  startups and sounds immature to enterprise buyers, and "Trusted by the Fortune 500" sounds
  like "not for me" to a two-person team.
- **Give the reason why.** Anything that looks surprising (a higher price, a free tier, a
  missing feature, a waitlist) gets its reason stated. Unexplained, visitors fill in a worse
  one.
- **Admit a real drawback, then answer it.** A small, true weakness makes the strengths
  believable. Pair it with a benefit on the same concern: a price drawback with a cost
  benefit ("It costs more than X because every plan includes migration and onboarding.").
  Only use drawbacks the user confirmed.
- **Don't tell visitors they chose wrong.** People defend past decisions. On switching copy,
  credit the old way and show what's next ("Your spreadsheet got you this far"), rather than
  attacking it ("Spreadsheets are broken").

## AI tells

The full catalogue is in `references/ai-tells.md`, including the patterns that are fine in
context (fragments in a hero, "we" on a company site). They share a root: a model picks
whatever fits every product, while a human picks for this one. So every sentence has to tell
the visitor something they didn't already have, from the heading, the line before or common
sense.

**Fix on one sighting.** These are staging, not stating, and a careful writer almost never
uses them on purpose:

- "It's not X, it's Y" in any form (split across two sentences, "X rather than Y", a clipped
  ", no guesswork" tail), and "Not X. Not Y. Just Z." A tail that answers a real objection
  stays: "Start free, no credit card required".
- One-line closers that restate the section ("That's the difference."), fragment rows and
  "Every. Single. Day."
- Sayings that sound deep ("Trust is the currency of growth") and staged run-ups ("Here's
  the thing", "Let's be honest")
- Arguing with no one: answering objections nobody raised ("You might think you need
  another tool. You don't."). Objections visitors really have (contracts, cancellation,
  migration) are fine to answer; see Pricing.
- Leftovers: chat residue in the page, guesses covering a missing fact, copy about the page
  ("Below you'll find…")

**Fix when stacked.** One alone is normal writing. Several in a section, or one repeated
down the page, is the tell. The full list is in the reference; these are the ones SaaS
pages collect most:

- Stock SaaS vocabulary and phrases: seamless, robust, unlock, empower, all-in-one,
  AI-powered, "Say goodbye to", "in just a few clicks"
- The product as the subject of human verbs ("The dashboard understands your team"), where
  the customer should be the one acting
- Stacked triplets, anaphora ("Built for X. Built for Y. Built for Z."), and "The result? Y."
- Performed cleverness ("Your inbox, minus the noise") and too many punchy moments: a page
  gets one or two
- Headings echoed by their first sentence or the eyebrow above them, more than two or three
  em dashes per page, and title-case headings or buttons

Customer testimonials and quotes are never edited for AI tells. They're the customer's words.

❌ **AI-sounding:**
> Our groundbreaking platform serves as a vibrant hub, empowering teams to navigate the complexities of modern collaboration. It's not just a tool — it's a testament to seamless productivity.

✅ **Human:**
> One shared inbox for your whole team. Reply from Slack, archive in one click, and stop losing threads in CC chains.

## Headlines

Most visitors read the headings and skim everything else, so the headings carry the pitch.
This covers the hero H1, section H2s and feature headings. Before drafting, read
`references/headlines.md`: formulas, a hero anatomy and label-to-claim rewrites.

### What a headline has to do

- **Make sense alone.** Headlines travel without the page: search results, link previews,
  tab titles, AI summaries. Read alone, the hero (eyebrow, H1 and subhead together) says
  what this is and who it's for. "Work smarter" says nothing.
- **Front-load the meaning.** Scanners take in the first two or three words of a heading.
  Put the category, outcome or audience there, not "Welcome to", "Introducing", "Meet" or
  the company name.
- **Carry one idea.** Two benefits in an H1 weaken both. The rest goes to the subhead and
  the sections below, which is where the one difference gets its support.
- **Talk about the visitor's outcome, not the company.** "We're a leading provider of…"
  loses to what the visitor gets.
- **Match what the visitor already knows.** Someone who only feels the problem needs it
  named in their words; someone comparing you to a competitor needs the difference and the
  offer. The awareness table in the reference maps this to page types.
- **Name the category somewhere above the fold**: eyebrow, H1 or subhead. Visitors who
  can't place the product guess, often wrong. Famous brands can drop it; an unknown one
  can't, so it needs more words than an Apple headline.
- **Prefer plain over clever.** In usability and A/B research, plain headlines beat puns and
  wordplay; clever lines also fail for non-native readers and out of context. When torn,
  pick the plain one.
- **Fit the space.** No magic length, but an H1 of about 4-12 words that fits 2-4 lines on
  a phone is the usual range. Section headings fit one line where possible.

**Subhead and eyebrow.** The subhead (1-2 sentences) says how the product delivers the
H1's promise, which is what makes it believable, and who it's for if the H1 didn't say. It
never restates the H1. An eyebrow is optional and carries what the H1 doesn't: usually the
category or audience.

**Section headings state the point.** "Features", "Integrations" and "Why us" are labels;
"Works with the bank you already use" is a claim. Reading the H2s alone, top to bottom,
should tell the pitch. Keep labels where visitors look things up instead of being
persuaded: FAQ, Pricing, Docs, Contact.

### How to write one

1. **Start from the material.** The one difference, and the user's customer language:
   reviews, support tickets, sales notes, testimonials they gave you. The best headline is
   often a customer's sentence, lightly edited. Don't invent customer phrasing.
2. **Draft wide before choosing.** Write 10-15 candidates for a hero H1 (fewer for a section
   heading) using at least four different formulas from the reference. First drafts are
   rarely the best, and drafting across formulas stops every option being the same shape.
   Keep the long list to yourself.
3. **Cut with the tests below**, then rank the survivors with the scoring in the reference.
4. **Present 2-3** (see Output), each with its subhead, since a headline is judged with the
   line under it. When the user asked only for the headline, the subheads are suggestions:
   say so, and leave their subhead in place unless they take one.

### Headline tests

Each candidate passes all of these on its own:

- **Read alone,** it says what you sell or what the visitor gets, with the category clear
  from the eyebrow, H1 or subhead.
- **Picture it, prove it, only us.** The three questions from Clarity over cleverness, with
  a higher bar: a body line is filler when it fails all three, but a headline has to pass
  all three.
- **"Now you can…"** in front of it reads as compelling and true.
- **Repeatable.** A visitor could restate its promise in their own words after one read.
- **Every fact is the user's.** A timeframe, number or "only" in a headline is a claim like
  any other: the user's, or a `TODO:`. The verb counts too: a tool that warns about
  breaches doesn't "keep you compliant", and one that drafts doesn't "write" for you.
- **No AI tells.** Headlines are where "not X, it's Y", performed cleverness, stock
  vocabulary and question hooks collect. Run the headline checks in `references/ai-tells.md`.

## Page patterns

Each part of a page meets the visitor in a different state, which sets how long the copy
can be and what goes first.

### Hero
The visitor is skimming and deciding whether to stay. They should know what this is and
who it's for within five seconds.

- Headline stating the main benefit or the one difference (see Headlines)
- Subhead that makes it specific: for whom, how
- One primary CTA
- Proof: logos, a stat or a short quote, from the user or as a `TODO` placeholder

### Features and services
The visitor is checking whether it fits their situation.

- A benefit headline per section, a short explanation, the visitor's outcome, and proof
  where the user has it
- 2-3 concrete situations where someone uses the feature ("Your contractor sends an invoice
  from their phone; it's in your books before you open the email"). They make a feature
  real without needing numbers.

### How it works and product shots
The visitor wants to know what using it is actually like.

- Steps are the real steps, as many as there really are, each starting with what the user
  does: "Connect your bank", "Pick which accounts to sync". Three steps that hide a fourth
  will be found out in the trial.
- Screenshot and demo captions say what the visitor is looking at and why it matters:
  "Every unpaid invoice, sorted by how late it is", not "Powerful dashboard".

### Pricing
The visitor is comparing: plans against each other, and you against the tab next to this one.

- Make the difference between tiers obvious at a glance
- Frame price against the value delivered
- Answer the likely objections (contracts, cancellation, limits) next to the price
- Label CTAs by buyer: "Start free" for individuals, "Talk to sales" for teams
- If the user hasn't named the plans, name them for who they suit ("Solo", "Team") rather
  than "Basic / Pro / Enterprise"
- Mark one plan as recommended. Several equal options stall the decision. Label it
  "Recommended for small teams" (or whoever it suits), not "Most popular": that claims sales
  data you don't have, unless the user confirms it.

### Objections and FAQ
Beyond price, SaaS visitors usually stall on four things: is my data safe, how much work is
setup, can I convince my team, and does it actually work. Answer the ones that apply where
they come up, with the user's real facts (security page, setup time, a shareable overview,
a trial or demo) or a `TODO:`.

An FAQ, especially on a pricing page, can include the standard questions: cancellation,
billing, plan changes, data export, security. Visitors really do ask them. What makes an FAQ
generic is the answers: "We take security seriously" answers nothing. Every answer states
the user's real terms (the notice period, what happens to data, where it's hosted) or is a
`TODO:` naming the fact needed. Beyond the standard set, questions come from the user's
sales calls or support notes; don't make up product-specific questions.

### About
The visitor wants to know who's behind this and whether to trust them. A real story beats
a mission statement, and the story has to come from the user. Ask them: Is there a number
that surprises people? A moment it almost failed? Something you believed that turned out
wrong? Why you, and not someone else, built this? Without answers (and during a build, where
you don't stop to ask), keep the page to plain facts and leave `TODO:`s for the story.

### Questions the page answers
Section order belongs to `website-builder`: the chosen direction and its dials decide the
layout, and the site-type file decides the content jobs. Don't reorder sections it built.
Within that layout, make sure the copy answers the visitor's questions somewhere: what it
is, what it does for you, how it works, what to do next, and why it's safe to try
(guarantee, trial terms, objections, proof).

"Why act now" belongs only when the user gives a real deadline, price change or limited
capacity. Invented urgency is an invented fact.

## CTAs

Formula: action verb + what they get: "Start free trial", "See pricing", "Get the checklist".
Use sentence case on buttons and headings, keeping capitals for proper nouns.

- ❌ "Sign up now", "Submit", "Learn more"
- ✅ "Start your free trial", "See how it works"

Where CTAs go is the layout's job: follow the CTA Strategy in the site-type file and the
sections `website-builder` built, and write the copy for each one. Don't stack two CTAs with
the same intent next to each other. A secondary CTA offers a different step ("See pricing"
next to "Start free trial").

Under the primary CTA, one short line takes away the risk of clicking: "14-day trial, no
card required", "Cancel anytime", "Export your data whenever you like", a money-back
guarantee. Use the user's real terms; if you don't have them, leave a `TODO:` for the
guarantee or trial terms.

## Final anti-AI pass

Before delivering, read `references/ai-tells.md`, then:

1. **Mark.** Re-read the whole draft once, top to bottom as a visitor would, and ask:
   **"what here sounds AI-generated?"** Mark every tell, strongest first. Look at page shape
   as well as sentences: every heading a "What/Why/How", every section opening with a
   question or closing on a one-liner, the same word paying itself off. The catalogue is easy
   to satisfy line by line while the page as a whole still feels generated. Read headlines
   and CTAs aloud; a line that's awkward to say is awkward to read.
2. **Restate, don't patch.** For each marked line, ask what it's trying to say and write
   that. Swapping "seamless" for "smooth" keeps the tell. If a sentence stays awkward,
   rewrite the paragraph around its main point.
3. **Check the facts didn't move.** When rewriting existing copy, compare against the
   original: every claim, number, name and promise is still there, and nothing new appeared.
   Cutting triplets and merging fragments drops claims most often. A dropped claim is an
   error unless a tell called for cutting it; an added fact is always an error.
4. **Re-scan the survivors.** These outlive a first rewrite most often: "not X, it's Y"
   contrasts, one-line closers, triplets, em dashes and bold-label bullets. Search for them
   once more, using the mechanical checks at the end of `references/ai-tells.md`. Vary your
   fixes: if every repair became ", because…" or a colon, that's the new tic.

Then confirm:
- [ ] User copy preserved where provided; only missing parts written
- [ ] The hero states one real difference, and later sections support it
- [ ] Rewrites keep every claim from the original and add none
- [ ] Tone matches the spec or the invoker's brief, and the user's own writing where they supplied some
- [ ] No invented numbers, names, quotes, logos, or security and compliance claims; every
      gap is a `TODO:` that names what would fill it
- [ ] Every FAQ answer states a real term or is a `TODO:`
- [ ] Features translated to benefits (or stated precisely, for technical buyers)
- [ ] Each headline alternative passes the headline tests on its own
- [ ] Section headings state a point; reading them alone tells the pitch
- [ ] Headings and buttons in sentence case
- [ ] CTAs name what the visitor gets

## Output

- **Invoked by `website-builder` or another skill during a build:** write the copy straight
  into the page or component files it's working on, then list any `TODO:` placeholders you
  left. You can't stop to ask during a build, so put the questions you'd have asked next to
  the `TODO:` they'd fill: the evidence a claim needs, the interview questions for a
  testimonial, the story questions for About, "why you and not X?" for a missing difference.
- **Direct request from the user:** show the copy in the chat grouped by section, and ask
  before writing it into files unless they already told you to.
- **Headlines and primary CTAs:** offer 2-3 alternatives, your pick first, each from a
  different formula, with its subhead and a one-line rationale naming who it's for and why
  it works. Each must pass the headline tests on its own. During a build, write your pick
  into the page and list the runners-up with the `TODO:`s. For body copy, give one best
  draft.
- **Rewrites of existing copy:** show before and after for each changed passage, so the user
  can see what moved and why.
- **Tone:** if you inferred it, say which tone you used in one line.

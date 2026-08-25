# Structured Data Checks

Find every `<script type="application/ld+json">` in the built page. JSON-LD unlocks rich
results in Google (knowledge panels, breadcrumbs, sitelinks) — but broken, contradictory or
unsubstantiated markup is worse than none, because it is machine-read and taken at face
value.

Parse each block first; everything below assumes a parsed object graph.

- Not found on a content page → ⚠️ warning: "No schema markup"
- Found, invalid JSON → ❌ critical: "Invalid JSON-LD: [error]"

---

## Per-Type Expectations

- **Organization / LocalBusiness**: check `name`, `url` → ✅ pass if present. Also expect
  `logo` and `sameAs` (social profiles) → ⚠️ warning if either missing: "Organization schema
  missing [logo/sameAs]".
- **Article / BlogPosting**: check `headline`, `author`, `datePublished` → present = ✅ pass.
  Additionally require:
  - `dateModified` → ⚠️ warning if missing: "Article schema missing dateModified (freshness
    signal)". Populate from git commit history, not hand-maintained.
  - `publisher` (Organization ref) and `image` → ⚠️ warning for each missing.
- **Product / SoftwareApplication** pages (pricing, app-download, product landing): expect a
  `Product`/`SoftwareApplication` node, ideally with `offers` → ⚠️ warning if the page is
  clearly a product page but carries no such schema. For `aggregateRating`, see
  *Rating Substantiation* below before recommending it.
- Other types → ✅ pass.

**Breadcrumbs:** if the page renders a visible breadcrumb trail (e.g.
`<nav aria-label="Breadcrumb">`, or an ordered list of ancestor links near the top), expect a
matching `BreadcrumbList` in JSON-LD.
- Visible breadcrumb present but no `BreadcrumbList` schema → ⚠️ warning: "Visible breadcrumb
  has no BreadcrumbList schema on [url]".

---

## Conflicting `@id` — nodes that silently merge

`@id` is an identity claim. A consumer reading two nodes with the same `@id` is *supposed*
to merge them into one entity, so two blocks that disagree produce an undefined result — and
the disagreement is invisible in both source files, because each one looks correct alone.

Collect every node carrying an `@id` across all JSON-LD blocks on the page (including nodes
nested inside `@graph`).

- Two or more nodes share an `@id` and **disagree on any property** — different values,
  different types for the same property (`logo` as a bare string in one and an `ImageObject`
  in the other), or one carrying a property the other omits → ❌ critical: "Conflicting
  `@id` [id] on [url]: N nodes, disagreeing on [properties]".
- Two nodes share an `@id` and are byte-identical → ⚠️ warning: redundant, harmless, worth
  deduplicating.

The usual cause is a page-specific block added to surface one extra property (founders, an
address) that duplicates the site-wide block instead of extending it. **The fix is always to
merge into the shared definition**, not to give the second node a different `@id` — two
entities where there is one entity is a worse outcome than the conflict.

---

## Rating Substantiation

Google requires rating markup to correspond to reviews **visible on the page carrying it**.
A site-wide `SoftwareApplication` or `Product` node with an `aggregateRating` gets emitted on
every page, so a rating sourced from one page's content ends up asserted on all of them.

For each page carrying `aggregateRating`, `ratingValue` or a `Review` node:

- The page renders no visible rating, star count or review count anywhere in `<body>` →
  ❌ critical: "aggregateRating on [url] but nothing on the page substantiates it".
- Site-wide count: the node appears on N pages and only M < N display a rating → ❌ critical:
  "aggregateRating asserted on N pages, displayed on M". Report this once, with the counts —
  not once per page.
- A displayed rating that names no review platform and links to no source → ⚠️ warning:
  "Rating cites no source". If the figure comes from a third-party platform, it should cite
  that platform rather than being aggregated as the site's own.
- A page whose `/user-reviews/`-style route shows testimonial quotes with no stars and no
  count, while other pages assert a rating → ⚠️ warning: the review page is the one page that
  most obviously ought to substantiate the claim.

The fix is to **scope `aggregateRating` to the pages that display the rating**, not to remove
the rating from the site.

---

## Entity-Escaped Values — data corruption

`<script type="application/ld+json">` is a raw-text element: the HTML parser does **not**
entity-decode its contents. Anything that HTML-escapes JSON string values before serializing
therefore ships literal `&apos;` / `&quot;` / `&amp;` inside the data, and consumers read
those characters verbatim.

Scan the parsed string values (not the raw markup) of every JSON-LD block:

- Any string value containing `&apos;`, `&quot;`, `&amp;`, `&lt;` or `&gt;` → ❌ critical:
  "Entity-escaped JSON-LD value on [url]: `[value]`". Quote the corrupted value — the point
  lands immediately once it is seen.
- Report once per distinct cause with a page count, not once per string.

This is a serializer bug, never a content bug: the source copy is virtually always clean.
The known culprit is `astro-seo-schema`'s `safeJsonLdReplacer`, which the Hakuto scaffold no
longer uses (see `scaffold/src/components/Schema.astro`). If it reappears, something
reintroduced HTML escaping as a "security fix" — the only sequence that actually needs
guarding inside a raw-text script element is `</`.

---

## Author Identity

- `author` on `Article`/`BlogPosting` is a bare string (`"author": "Jane Doe"`) → ⚠️ warning:
  "Byline on [url] is plain text — no `Person` node, no `url`". Neither a reader nor a
  crawler can connect the name to credentials that may well exist elsewhere on the site.
- `author` is a `Person` with a `url` (an author page, or an anchor on `/about/`) → ✅ pass.
- `author` is a `Person` with no `url` and no `sameAs` → ⚠️ warning: "Author node has no
  identifying link".

---

## Do Not Recommend

These types are still valid schema.org and still parse. They no longer produce any search
feature, so recommending them buys nothing and costs template complexity across every page
in the set.

| Type | Status |
| --- | --- |
| `HowTo` | Rich results deprecated September 2023; no longer appear in search. **Never recommend adding it**, however step-shaped the content is. `Article` + `BreadcrumbList` is the correct pairing for a procedural page. |
| `FAQPage` | Rich results retired May 2026. Do not add it to new pages expecting a search benefit. |
| `QAPage` | Still appropriate for genuine user-submitted Q&A. Not a substitute for `FAQPage` on marketing copy. |

Existing `HowTo` or `FAQPage` markup on a site: **leave it in place and do not report it.**
It costs nothing to keep, and churning 57 templates to delete inert markup is not a finding.

This block exists because two independent passes of an external audit tool recommended
adding `HowTo` markup on out-of-date reasoning. Ours must not.

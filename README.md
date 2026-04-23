<img width="1200" height="630" alt="Image" src="https://github.com/user-attachments/assets/b3257a27-d252-44cd-a620-e3ce10fe9b15" />

# Hakuto

An open-source [static website builder](https://hakuto.dev/) powered by Claude Code. Clone it, describe what you want, and ship a production-ready site in minutes.

Built with Astro, Tailwind CSS v4, and shadcn/ui. Deployed to Cloudflare CDN.

Documentation and more on https://hakuto.dev/. Also an [announcement post](https://hakuto.dev/blog/how-we-killed-our-new-ai-product/). 

Live example how a Hakuto repo looks like for a real website: https://github.com/teamniteo/site-hakuto

Two more websites we built with it: https://trialtrack.net/ & https://vendorvigilance.net/



## Quick Start

```sh
git clone https://github.com/teamniteo/hakuto.git
cd hakuto
bun install
bun run dev
```

Open [localhost:4321](http://localhost:4321) to see the site.

## How It Works

Hakuto is a website template designed to be edited by Claude Code. The `CLAUDE.md` file contains a full agent specification — design rules, component patterns, and a step-by-step workflow — so Claude can build and modify pages with consistent, high-quality output.

1. **Clone the template** — start from a working Astro site with shadcn/ui components pre-installed
2. **Describe your site** — tell Claude Code what you want (landing page, docs site, blog, etc.)
3. **Ship it** — deploy to Cloudflare Workers with `wrangler deploy`

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Astro](https://astro.build) 6.x |
| Styling | [Tailwind CSS](https://tailwindcss.com) v4 |
| Components | [shadcn/ui](https://ui.shadcn.com) (48 components) |
| Hosting | [Cloudflare Workers](https://workers.cloudflare.com) |
| Runtime | [Bun](https://bun.sh) |

## Project Structure

```
src/
├── assets/          # Images, favicon source
├── components/
│   ├── ui/          # shadcn/ui React components
│   └── *.astro      # Astro page sections
├── layouts/         # Base layout with SEO, fonts, schema
├── pages/           # File-based routing
└── index.css        # Theme tokens (Tailwind v4 @theme)

CLAUDE.md            # Agent specification for Claude Code
AGENTS.md            # Auto-generated page index
site-specification.md # Design decisions & style guide
worker/              # Cloudflare Worker entry
```

## Available Scripts

```sh
bun run dev       # Start dev server
bun run build     # Production build
bun run check     # TypeScript checks
bun run lint      # Lint with Biome
bun run format    # Format with Biome
```

## Built-in Skills

The Claude Code agent has access to specialized skills for common tasks:

- **website-builder** — Core page creation workflow
- **brand-designer** — Generate custom color palettes
- **professional-copywriter** — Conversion-optimized copy
- **section-form** — Contact forms and signups
- **section-blog** — Multi-page blog system
- **section-docs** — Documentation with sidebar nav
- **plausible-analytics** — Privacy-friendly analytics
- **testing-seo** — SEO validation

## Forms

These steps apply only when using Customer.io for forms.

1. Choose a stable ASCII-safe form name. The HTML form `name` field must match
   it; the form skill handles this for you. For example, submitting to
   `/~/form-contact` creates a `contact` form in Customer.io.
2. Merge and deploy the form to the live site, then submit the production form
   once. Customer.io only shows forms that have received data.
3. In Customer.io, open Integrations from the sidebar, then click Forms in the
   main view. Click the form you created.
4. Go to Campaigns and press Create campaign.
5. In the campaign, open the Workflow tab and set up the messages. A workflow
   can include email or Slack messages.
6. For email, set a subject. The subject can use any event data, for example
   `New sponsor-order from {{event.email}}`.
7. In the email editor, use the event on the left side to preview the data that
   triggered the workflow.
8. Add this body to the email template to dump all submitted values. Use `+` to
   customize the message:

```liquid
{% for pair in event %}
{{ pair[0] }}: {{ pair[1] }}

{% endfor %}
```
9. Use the email editor `...` menu to send a test email.
10. Use the Sent tab to see sent or drafted messages.
11. To enable sending, the campaign must not be in draft. Go to Actions and
    start the campaign.

## License

MIT

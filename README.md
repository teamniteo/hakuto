<img width="1200" height="630" alt="Image" src="https://github.com/user-attachments/assets/b3257a27-d252-44cd-a620-e3ce10fe9b15" />

# Hakuto

An open-source [static website builder](https://hakuto.dev/) powered by Claude Code. Clone it, describe what you want, and ship a production-ready site in minutes.

Built with Astro, Tailwind CSS v4, and shadcn/ui. Deployed to Cloudflare CDN.

Documentation and more on https://hakuto.dev/. Also an [announcement post](https://hakuto.dev/blog/how-we-killed-our-new-ai-product/). 

Live example how a Hakuto repo looks like for a real website: https://github.com/teamniteo/site-hakuto


## Quick Start

Hakuto ships as a [Claude Code plugin](https://code.claude.com/docs/en/plugins). Install once, scaffold new sites anywhere.

```sh
# Inside Claude Code:
/plugin marketplace add teamniteo/hakuto
/plugin install hakuto@hakuto
```

Then in an empty directory:

```sh
mkdir my-site && cd my-site
claude
```

```
/hakuto:init
```

Followed by:

```sh
bun install
bun run dev
```

Open [localhost:4321](http://localhost:4321) to see the site.

## How It Works

Hakuto is a Claude Code plugin bundling skills, a subagent, and an Astro scaffold. Skills (design rules, component patterns, copy, analytics, etc.) live in the plugin and update via `/plugin update hakuto`. The scaffolded `CLAUDE.md` ties everything together inside your site repo.

1. **Install the plugin** — one time, global
2. **`/hakuto:init`** — drops an Astro + Cloudflare starter into an empty directory
3. **Describe your site** — "Build me a landing page for a coffee roaster" and `website-builder` takes over
4. **Ship it** — `wrangler deploy` pushes to Cloudflare Workers

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Astro](https://astro.build) 6.x |
| Styling | [Tailwind CSS](https://tailwindcss.com) v4 |
| Components | [shadcn/ui](https://ui.shadcn.com) (48 components) |
| Hosting | [Cloudflare Workers](https://workers.cloudflare.com) |
| Runtime | [Bun](https://bun.sh) |

## Project Structure

### The plugin (this repo)

```
.claude-plugin/
├── plugin.json         # Plugin manifest
└── marketplace.json    # Single-plugin marketplace
commands/
└── init.md             # /hakuto:init scaffolder
skills/                 # 9 site-building skills
agents/                 # Astro file editor subagent
scaffold/               # Astro project copied by /hakuto:init
```

### A scaffolded site (what `/hakuto:init` drops in your cwd)

```
src/
├── assets/          # Images, favicon source
├── components/
│   ├── ui/          # shadcn/ui React components
│   └── *.astro      # Astro page sections
├── layouts/         # Base layout with SEO, fonts, schema
├── pages/           # File-based routing
└── index.css        # Theme tokens (Tailwind v4 @theme)

CLAUDE.md            # Agent spec for your site
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
- **seo-audit** — SEO validation

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

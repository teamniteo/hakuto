<img width="2048" height="533" alt="hakuto-light" src="https://github.com/user-attachments/assets/01aaaf47-2639-4f22-81aa-a4168126ef9f" />

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

## License

MIT

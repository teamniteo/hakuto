# Your Hakuto Site

Scaffolded by [Hakuto](https://hakuto.dev/), a Claude Code plugin for building Astro sites with shadcn/ui and Cloudflare Workers.

## Develop

```sh
bun install
bun run dev
```

Open http://localhost:4321.

### Optional: devenv

This scaffold ships with a [devenv](https://devenv.sh) config (`devenv.nix`, `devenv.yaml`, `.envrc`) that declares `bun` and `wrangler`. If you use devenv, `devenv up` starts the dev server.

**Don't use devenv?** Delete `devenv.nix`, `devenv.yaml`, and `.envrc`. Nothing else depends on them.

## Build & deploy

```sh
bun run build        # → dist/
wrangler deploy      # → Cloudflare Workers
```

Edit `wrangler.toml` to set the Worker name and custom domain:

```toml
name = "my-site"

[assets]
directory = "./dist"

[[routes]]
pattern = "example.com"
custom_domain = true
```

## Stack

Astro 6 · Tailwind CSS v4 · shadcn/ui · TypeScript · Biome · Bun · Cloudflare Workers

## Working with Claude

`CLAUDE.md` at the repo root carries the agent spec. The Hakuto plugin provides skills (`website-builder`, `brand-designer`, `professional-copywriter`, `section-form`, `section-blog`, `section-docs`, `plausible-analytics`, `testing-seo`) that auto-invoke based on what you ask for.

Update the plugin with `/plugin update hakuto` inside Claude Code.

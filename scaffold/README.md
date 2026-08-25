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
bun run build        # → dist/client/
wrangler deploy      # → Cloudflare Workers
```

### Deploying from Cloudflare Workers Builds

If the site builds on Cloudflare (Workers Builds / Pages CI) rather than from your machine, set the
project's **build command** to:

```sh
git fetch --unshallow || true && bun run build
```

Cloudflare checks the repo out as a shallow clone, so git only knows the tip commit and every file
looks like it was last modified at deploy time. Anything derived from git history — sitemap
`lastmod`, a doc or blog "Last updated" line, changelog ordering — then gets the same wrong date on
every page. `|| true` keeps the build green when the clone is already complete (`git fetch
--unshallow` errors on a full clone). Keep this in the Cloudflare dashboard build command, not in
`package.json`: local builds already have full history.

> **You may not need the dashboard.** If the Cloudflare MCP server is connected (`cloudflare-api`,
> `cloudflare-builds`), ask the agent to set the build command for you — it can read the project's
> current build configuration and update it in place. Fall back to the dashboard only when no
> Cloudflare MCP is available.

> Astro's Cloudflare adapter writes a redirected config at `dist/client/wrangler.json` and `.wrangler/deploy/config.json` during build — for this static-assets + custom-worker setup that generated config omits `main`, so a bare `wrangler deploy` picking it up would fail wrangler's `run_worker_first` check and skip deploying `worker/index.js`. The `build` script removes both generated files so `wrangler deploy` always falls back to the authoritative root `wrangler.toml`.

### Preview the built site

```sh
bun run preview
```

`bun run dev` starts Astro's development server with live reload and dev-only behavior. `bun run preview` builds the site and then serves it from `dist/client/` through `wrangler dev` — the same Cloudflare Workers runtime, `worker/index.js`, and `_headers`/`run_worker_first` rules as production — so use it for review before deploying.

Edit `wrangler.toml` to set the Worker name and custom domain:

```toml
name = "my-site"

[assets]
directory = "./dist/client"

[[routes]]
pattern = "example.com"
custom_domain = true
```

## Stack

Astro 6 · Tailwind CSS v4 · shadcn/ui · TypeScript · Biome · Bun · Cloudflare Workers

## Working with Claude

`CLAUDE.md` at the repo root carries the agent spec. The Hakuto plugin provides skills (`brand-designer`, `fonts`, `hakuto-review`, `pagespeed-audit`, `plausible-analytics`, `prelaunch-checklist`, `professional-copywriter`, `scaffold-sync`, `section-blog`, `section-docs`, `section-form`, `seo-audit`, `website-builder`) that auto-invoke based on what you ask for.

Update the plugin with `/plugin update hakuto` inside Claude Code.

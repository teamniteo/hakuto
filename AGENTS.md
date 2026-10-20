# Hakuto — plugin development

Hakuto is a Claude Code plugin that scaffolds and builds Astro + Cloudflare sites.
This file is memory for working **on the plugin** (`CLAUDE.md` imports it). It is not shipped to generated sites.

## Two audiences — know which tree you are editing

| Tree | Who loads it | Effect of a change |
|---|---|---|
| `skills/`, `agents/`, `commands/` | Claude Code, when the plugin is installed | Changes agent behaviour on the next `/plugin update hakuto` |
| `scaffold/` | Copied into an empty directory by `/hakuto:init` | Changes what **new** sites get |
| `scaffold/AGENTS.md` | The generated site's agent (Claude Code via the `scaffold/CLAUDE.md` import stub, Codex directly) | A shipped artifact — **not** this repo's memory |
| `.codex-plugin/` | Codex, when the plugin is installed there | Loads `skills/` only — no `agents/`, no `commands/` (so no `/hakuto:init`) |

Existing sites never pick up scaffold changes on their own. Anything they need requires a
versioned entry in the Migration Registry, `skills/scaffold-sync/references/migrations.md`.

## Commands

`bun` is **not on PATH** — it comes from devenv/direnv. From `scaffold/`:

```sh
export PATH="$PWD/.devenv/profile/bin:$PATH"   # or: devenv shell
bun install
bun run check                    # astro check — type errors
bun run build                    # → dist/client (also regenerates the page_summary block in AGENTS.md)
bun run lint                     # biome lint --write — rewrites files in place
bun test test/dev-smoke.test.ts  # 7 tests; spawns `bun run preview` (builds first — slow)
```

Never pipe a bun command straight into `tail`/`head`. A missing `bun` exits 127, but a
pipeline reports the *tail's* status, so a build that never ran looks like it passed and
`&&` happily continues. Grep the output for `command not found` — don't trust the exit code.

## Gotchas

- **Do not hand-edit `version` in `.claude-plugin/plugin.json` or `.codex-plugin/plugin.json`.**
  `.github/workflows/bump-plugin-version.yml` bumps the minor in both on every same-repo PR.
  Merging to `main` is the release — the Migration Registry entry uses that bumped version.
- **`bun run dev` does not run the worker.** `astro.config.mjs` disables the Cloudflare
  adapter in development, so `/~/*` returns Astro's HTML 404. Test worker routes with
  `bun run preview` (build + `wrangler dev` on `127.0.0.1:8787`).
- **Only the `page_summary` block at the end of `scaffold/AGENTS.md` is regenerated** by
  every build (`@nuasite/agent-summary`); the site rules above it are preserved. The block
  still dirties the tree — run `git diff scaffold/AGENTS.md` and drop block-only changes you
  didn't intend. Don't `git checkout` the whole file: that also reverts intended rule edits.
  The plugin finds the block with `indexOf` on the opening tag, so **never write the tag in
  angle brackets anywhere above the block** — the build would replace everything from that
  mention down. Its meta-description regex `content=["']([^"']*)["']` truncates at the
  first apostrophe (0.0.36), so descriptions in the block are unreliable — read the real
  string out of `dist/client/`.
- **`_headers` rules scoped to `/` match the homepage only.** `/` is an exact path, not a
  prefix, and it fails silently — no build error, no deploy error. Site-wide rules go under
  `/*`. Verify with `curl -sI <origin>/some/inner/page/`, never `curl -sI <origin>/`, which
  passes either way.
- **`public/` and `src/pages/` share a URL namespace.** `public/robots.txt` and
  `src/pages/robots.txt.ts` cannot coexist — deleting the `public/` file is part of the
  change, not cleanup afterwards.
- **JSON-LD must not be HTML-escaped.** `<script type="application/ld+json">` is a raw-text
  element, so entities are never decoded and `&apos;` reaches consumers literally. See
  `scaffold/src/components/Schema.astro` — it escapes `<` only, and that is deliberate.

## Testing a skill change

Run `claude --plugin-dir .` from the repo root to load this checkout instead of the installed
plugin, then exercise the skill in a throwaway site created with `/hakuto:init` in an empty
directory. skill-creator eval output goes in `skills/<name>-workspace/`, which is gitignored.

## Skill authoring

- Frontmatter is `name` + `description` only. The description carries the trigger phrases
  **and** explicit "Skip if…" negatives — that is what stops skills firing on each other's
  work. Match the house style in `skills/*/SKILL.md`.
- Keep `SKILL.md` to flow, severity and output format. Long check catalogues and reference
  material go in `references/`; templates and code in `assets/`.
- A skill that names another skill as a follow-up must also appear in the Skills list in
  `scaffold/AGENTS.md`, or site agents will never discover it.

---
description: Scaffold a new Hakuto site in the current directory
disable-model-invocation: true
---

Scaffold a new Hakuto site in the current working directory.

## Preconditions — check before doing anything

Refuse to proceed if the current directory is not empty enough. Bail with a clear message if any of these exist:

- `package.json`
- `src/`
- `CLAUDE.md`
- `astro.config.mjs`

Run this check via Bash:

```bash
for f in package.json src CLAUDE.md astro.config.mjs; do
  if [ -e "$f" ]; then
    echo "ERROR: $f already exists. /hakuto:init needs an empty directory."
    exit 1
  fi
done
```

If the check fails, stop and tell the user to run `/hakuto:init` in an empty directory instead.

## Scaffold

Copy the entire scaffold tree (including dotfiles and `.claude/`) into the current directory:

```bash
cp -a "${CLAUDE_PLUGIN_ROOT}/scaffold/." ./
```

`cp -a` preserves timestamps/permissions and copies hidden files. The trailing `/.` ensures dotfiles are included.

Verify the copy worked by listing a couple of expected files:

```bash
ls -la package.json astro.config.mjs CLAUDE.md .claude/settings.local.json
```

## Next steps — tell the user

Output this message verbatim (replace nothing):

> Hakuto scaffold ready. Next:
>
> 1. `bun install` (or `devenv up` if you use devenv — bun and wrangler are already declared)
> 2. `bun run dev` — opens http://localhost:4321
> 3. Describe your site ("Build me a landing page for a coffee roaster") and the `website-builder` skill will take over.
>
> The project's `CLAUDE.md` is now at the repo root. Skills, agents, and statusline come from the installed plugin and update via `/plugin update hakuto`.
>
> **Not using devenv?** Delete `devenv.nix`, `devenv.yaml`, and `.envrc`. Nothing else depends on them.

Then stop. Do not run `bun install` or `bun run dev` yourself — the user runs those.

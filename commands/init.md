---
description: Scaffold a new Hakuto site in the current directory
disable-model-invocation: true
---

Scaffold a new Hakuto site in the current working directory.

Run this **one Bash block** — it guards, scaffolds, and inits git atomically. If the guard trips, the copy never happens.

```bash
set -e

# Guard: refuse if target already has an Astro/Hakuto project
for f in package.json src CLAUDE.md astro.config.mjs astro.config.ts; do
  if [ -e "$f" ]; then
    echo "ERROR: $f already exists. /hakuto:init needs a clean directory." >&2
    exit 1
  fi
done

# Copy full scaffold (incl. dotfiles and .claude/)
cp -a "${CLAUDE_PLUGIN_ROOT}/scaffold/." ./

# Sanity check the copy
ls package.json astro.config.mjs CLAUDE.md >/dev/null

# Initialize git (scaffold ships a .gitignore)
[ -d .git ] || git init -q -b main

echo "Scaffold complete."
```

If the guard trips, **stop**. Tell the user to run `/hakuto:init` in a clean directory (or remove the conflicting files first). Do not proceed to any other step.

## After a successful scaffold, output this verbatim

> Hakuto scaffold ready. Next:
>
> 1. `bun install` (or `devenv up` if you use devenv — bun is already declared)
> 2. `bun run dev` — opens http://localhost:4321
> 3. `git add -A && git commit -m "Initial scaffold"` — a local git repo was initialized for you
> 4. Describe your site ("Build me a landing page for a coffee roaster") and the `website-builder` skill will take over.
>
> Skills and agents come from the installed plugin and update via `/plugin update hakuto`.
>
> **Not using devenv?** Delete `devenv.nix`, `devenv.yaml`, and `.envrc`. Nothing else depends on them.

Do not run `bun install`, `bun run dev`, or any git commands yourself — the user runs those.

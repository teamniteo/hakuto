---
name: scaffold-sync
description: Pull selective scaffold updates from the installed Hakuto plugin into an existing Hakuto site. Compares the site's last-synced scaffold version against the current `${CLAUDE_PLUGIN_ROOT}/scaffold` tree, shows a per-file diff, and applies only files the user approves. Never overwrites silently. Persists state in `.hakuto-sync.json` at the site root. Use when the user requests "sync scaffold", "check for scaffold updates", "pull scaffold changes", "update scaffold", "what's new in the scaffold", or "is my scaffold current?".
---

# Scaffold Sync Skill

Pull selective scaffold updates from the installed Hakuto plugin into an existing site. The skill is **interactive and report-first** — every change is shown to the user and applied only on explicit per-file approval. State is persisted in `.hakuto-sync.json` at the site root so each run only considers drift since the last sync.

Run when the user says any of:
- "Sync scaffold"
- "Check for scaffold updates"
- "Pull scaffold changes"
- "Update scaffold"
- "What's new in the scaffold"
- "Is my scaffold current?"

---

## Execution Flow

### 1. Locate upstream

Resolve the plugin scaffold:

```bash
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:?run scaffold-sync from a Hakuto plugin context (CLAUDE_PLUGIN_ROOT not set)}"
SCAFFOLD="${PLUGIN_ROOT}/scaffold"
test -d "$SCAFFOLD" || { echo "ERROR: $SCAFFOLD missing — plugin install is incomplete." >&2; exit 1; }
```

If `CLAUDE_PLUGIN_ROOT` is unset or `scaffold/` is missing, stop with a one-line error. Do not attempt fallbacks.

### 2. Resolve current upstream identity

Try git first, fall back to a content hash:

```bash
if git -C "$PLUGIN_ROOT" rev-parse --git-dir >/dev/null 2>&1; then
  CURRENT_SHA=$(git -C "$PLUGIN_ROOT" rev-parse HEAD)
  CURRENT_METHOD="git"
else
  # Stable content hash of the scaffold tree (excludes generated/state dirs)
  CURRENT_SHA=$(find "$SCAFFOLD" -type f \
    -not -path '*/node_modules/*' \
    -not -path '*/.astro/*' \
    -not -path '*/dist/*' \
    -not -path '*/.wrangler/*' \
    -not -path '*/.git/*' \
    | sort | xargs sha256sum | sha256sum | awk '{print $1}')
  CURRENT_METHOD="content-hash"
fi
```

Record both `CURRENT_SHA` and `CURRENT_METHOD` for the state file.

Also read the current plugin version from `${PLUGIN_ROOT}/.claude-plugin/plugin.json`:

```bash
CURRENT_PLUGIN_VERSION=$(jq -r '.version // "unknown"' "${PLUGIN_ROOT}/.claude-plugin/plugin.json" 2>/dev/null || echo "unknown")
```

Record `CURRENT_PLUGIN_VERSION` for the state file and migration report.

### 3. Read site state

Read `.hakuto-sync.json` at the site root.

- **Missing** → **auto-baseline silently.** Write `.hakuto-sync.json` with the current SHA, print one line:
  > Baseline initialized at SHA `xxxxxxx` — no diff shown this run. Run `scaffold-sync` again later to see future drift.

  Then exit. (This handles legacy sites scaffolded before this skill existed.)

- **Present and `last_synced_sha == CURRENT_SHA`** → print "Already in sync." and exit.

- **Present, methods mismatch** (e.g. previous run used `git`, this run is `content-hash`, or vice versa) → print a one-line warning ("upstream history unavailable, falling back to 2-way diff") and continue with the degraded flow in Step 5.

- Otherwise → proceed to Step 4.

### 4. Collect version migration notes

Before computing file drift, compare the site's `last_synced_plugin_version` with `CURRENT_PLUGIN_VERSION`. If the field is missing, treat it as "unknown" and show all migration notes newer than the site's `last_synced_sha` when possible; otherwise show all active migration notes and mark them "review".

Use the migration registry at the bottom of this skill. Each plugin version entry lists:
- files that usually need to be applied from scaffold
- package/dependency changes that require `bun install`
- code patterns to update manually in customized files
- verification commands to run after applying

Include these notes in the Step 7 summary before per-file decisions. Do not apply them automatically. The notes are a checklist to help the user decide which scaffold files to accept and which local files need manual edits.

### 5. Compute candidate file list

Walk `$SCAFFOLD` recursively, excluding the same paths used in Step 2's hash plus a few user-state paths:

**Hard-exclude** (never compare, never apply, never delete):
- `node_modules/`
- `.astro/`
- `dist/`
- `.wrangler/`
- `.git/`
- `bun.lockb`, `bun.lock`, `package-lock.json`, `pnpm-lock.yaml` (lockfiles are user state)
- `.DS_Store`
- `.hakuto-sync.json` itself

For every other path P, compare three versions:
- **A** = previous upstream (from `last_synced_sha`, only available in `git` mode)
- **B** = current upstream (read from `$SCAFFOLD/<P>`)
- **C** = site local (read from `<site>/<P>`)

Classify each path into exactly one bucket (in this order):

| Bucket | A | B | C | Action |
|---|---|---|---|---|
| `identical` | * | X | X | skip silently |
| `user-only-changed` | X | X | Z (Z≠X) | preserve, no action |
| `upstream-only-changed` | X | Y (Y≠X) | X | safe to fast-forward |
| `both-changed` | X | Y (Y≠X) | Z (Z≠X, Z≠Y) | **conflict** — 3-way diff |
| `upstream-added` | absent | Y | absent | propose adding |
| `upstream-added (conflict)` | absent | Y | Z (Z≠Y) | conflict — site has its own version |
| `upstream-removed` | X | absent | X | propose removing |
| `upstream-removed (conflict)` | X | absent | Z (Z≠X) | flag — user customized a now-deleted file |
| `user-added` | absent | absent | C | leave alone, don't list |

If `last_sync_method == "content-hash"` (or A is unavailable for any reason), collapse the truth table to two columns (B, C) and label every non-identical path as `needs-review` for Step 8.

### 6. Resolve previous upstream content (git mode only)

For each path P that needs A, fetch the historical version:

```bash
git -C "$PLUGIN_ROOT" show "${last_synced_sha}:scaffold/<P>" 2>/dev/null
```

A non-zero exit means the file didn't exist in the previous version → A is "absent". Cache results so each path is queried at most once.

### 7. Present summary first (before any per-file decisions)

Output a one-screen overview:

```
Scaffold sync — drift since SHA xxxxxxx (2026-02-18)

Current upstream: yyyyyyy (3 commits ahead)
Mode: git (3-way diff available)
Plugin version: 0.1.2

Migration notes:
  - 0.1.2: Unpic/WebP image service — apply astro.config.mjs,
    package.json, bun.lock, CLAUDE.md; update local Picture usage to
    formats={['webp']} fallbackFormat="webp"; render SVGs with <img>.

📊 Summary:
✅ Already in sync: 142 files
⚡ Safe fast-forward: 3 files
⚠️  Conflict (both changed): 2 files
➕ Upstream additions: 1 file
➖ Upstream removals: 0 files
🤚 User-customized (preserved): 5 files

⚡ Safe to apply (no local edits):
  - astro.config.mjs
  - scaffold/CLAUDE.md
  - public/_headers

⚠️  Conflicts (need review):
  - src/layouts/Layout.astro
  - wrangler.toml

➕ New files upstream:
  - public/llms.txt   (does not exist locally)
```

Then ask via `AskUserQuestion`:

> How do you want to proceed?
> - **Review every change** (recommended) — walk through each file, decide individually
> - **Auto-apply safe fast-forwards, then review conflicts/additions/removals**
> - **Review only conflicts** (skip safe fast-forwards entirely)
> - **Cancel** — make no changes, leave `.hakuto-sync.json` untouched

### 8. Per-file decisions

For each file in the chosen scope, in this order: `upstream-added` → `upstream-only-changed` → `both-changed` → `upstream-removed`.

Show the diff before asking. Use `git diff --no-index` for clarity:

```bash
# 3-way: show A→B (upstream change) and A→C (user change) separately
git diff --no-index -- <(echo "$A") <(echo "$B")  # upstream change
git diff --no-index -- <(echo "$A") <(echo "$C")  # user change
```

For 2-way (no A available), show only B vs C with a note: "Cannot distinguish upstream change from user change — review carefully."

Then ask via `AskUserQuestion`:

> File: `src/layouts/Layout.astro`
> - **Apply upstream version** (overwrites local)
> - **Skip** (keep local as-is)
> - **Skip and note for manual review** (logs path so user can revisit)
> - **Cancel sync entirely** (no further changes; state file untouched)

For `upstream-removed` paths, swap "apply" with "delete locally". Always default the option order to the safer choice (skip).

For `CLAUDE.md` specifically — it's almost always appended-to with a `## Project Plan` section — call this out before showing the diff and recommend hunk-level manual review over wholesale replace.

### 9. Apply approved changes

- **Apply upstream version** → `Write` tool, full file replace.
- **Add new file** → `Write` tool.
- **Delete locally** → `Bash rm -- "<path>"` (one file per call, never `-rf`).

Never run `git add`, `git commit`, `bun install`, `bun run build`, or any other side-effecting command. The user owns version control and dependency management.

### 10. Update state

On a clean run (user did not pick "Cancel"), write `.hakuto-sync.json`:

```json
{
  "last_synced_sha": "yyyyyyy",
  "last_synced_at": "2026-05-06T14:32:00Z",
  "last_sync_method": "git",
  "last_synced_plugin_version": "0.1.2",
  "applied_paths": ["astro.config.mjs", "public/_headers"],
  "skipped_paths": ["src/layouts/Layout.astro"],
  "removed_paths": [],
  "schema_version": 1
}
```

If the user cancelled, **do not touch the state file** — the next run resumes the same diff window.

### 11. Final report

Print a closing summary:

```
Scaffold sync complete.

Applied (3): astro.config.mjs, public/_headers, scaffold/CLAUDE.md
Skipped (2): src/layouts/Layout.astro, wrangler.toml
Removed (0):

Recommended next steps:
  bun run check       # type-check
  bun run build       # confirm production build
  git diff            # review what changed before committing
```

If any conflicts were skipped, list them with one-line reminders so the user can revisit later.

---

## State file schema (`.hakuto-sync.json`)

```jsonc
{
  // SHA recorded at the most recent successful sync (or "unknown" on first scaffold without git).
  "last_synced_sha": "abc1234...",

  // ISO-8601 UTC timestamp of last sync.
  "last_synced_at": "2026-05-06T14:32:00Z",

  // "git" if the SHA came from `git rev-parse`, "content-hash" if from sha256 of the tree.
  "last_sync_method": "git",

  // Plugin version that provided the scaffold at the most recent successful sync.
  "last_synced_plugin_version": "0.1.2",

  // Paths applied on the last run (relative to site root).
  "applied_paths": [],

  // Paths the user explicitly skipped on the last run.
  "skipped_paths": [],

  // Paths deleted on the last run.
  "removed_paths": [],

  // Bumpable for forward-compatible migrations.
  "schema_version": 1
}
```

The file is intended to be **tracked in git** at the site root — visible in diffs, survives re-clones, easy to inspect.

---

## Migration Registry

Use this registry during Step 4. Add one entry every time a plugin version ships a scaffold change that existing sites may need to apply manually.

### 0.1.2 — Unpic/WebP image service

Apply from scaffold when not heavily customized:
- `astro.config.mjs`
- `package.json`
- `bun.lock`
- `CLAUDE.md`
- any scaffold page examples that still show `formats={['avif', 'webp']}`

Manual edits for customized sites:
- add `@unpic/astro`
- import `imageService` from `@unpic/astro/service`
- set `image: { service: imageService() }` in `defineConfig`
- set Cloudflare adapter image service to `imageService: "custom"`
- change local raster `<Picture>` usage to `formats={['webp']}` and `fallbackFormat="webp"`
- render imported SVG assets with native `<img src={asset.src} width={asset.width} height={asset.height}>`

After applying:
- run `bun install` if `package.json` or `bun.lock` changed
- run `bun run build`
- verify optimized Astro image assets are real WebP files and no AVIF files are emitted

---

## Output Format

```markdown
Scaffold Sync Report
====================

📊 Summary:
✅ In sync: 142 | ⚡ Safe FF: 3 | ⚠️ Conflicts: 2 | ➕ Added: 1 | ➖ Removed: 0 | 🤚 Preserved: 5

---

## Applied (✅)

1. `astro.config.mjs` — upstream-only-changed (no local edits)
2. `public/_headers` — upstream-only-changed
3. `scaffold/CLAUDE.md` — upstream-only-changed

## Skipped (⏭️)

1. `src/layouts/Layout.astro` — both-changed; user opted to keep local
2. `wrangler.toml` — both-changed; flagged for manual review

## Preserved (🤚) — local edits, no upstream change

- `src/components/Header.astro`
- `src/components/Footer.astro`
- `src/index.css`
- `src/pages/index.astro`
- `public/llms.txt`

## Recommended Next Steps

- `bun run check` — type-check
- `bun run build` — confirm production build
- `git diff` — review staged changes before committing
```

---

## Guardrails

- **Read-only on `${CLAUDE_PLUGIN_ROOT}`** — never modify the plugin scaffold itself, even temporarily.
- **No silent overwrites** — every applied file passes through Step 7's `AskUserQuestion`.
- **No git operations** — the user owns commits, branches, and tags.
- **No build commands** — the user runs `bun install`, `bun run check`, `bun run build` after the sync.
- **No `rm -rf`** — deletions are one file at a time, only with explicit per-file approval.
- **State file is the source of truth** — don't infer "in sync" from filesystem mtimes or any other signal.
- **CLAUDE.md special-case** — call out the appended `## Project Plan` section explicitly before diffing, so the user doesn't accidentally wholesale-replace their plan.

---

## Notes

- Run from the site's project root (the directory with `package.json` and `astro.config.mjs`), not from inside `${CLAUDE_PLUGIN_ROOT}`.
- The skill is interactive — every decision goes through `AskUserQuestion`. Expect a multi-turn conversation on sites with significant drift.
- Lockfiles (`bun.lock` etc.) are excluded by design — they're user state, not scaffold drift. Run `bun update` separately when you want fresh deps.
- If `last_sync_method == "content-hash"`, the skill degrades to a 2-way diff (current upstream vs site). It still works, just with less precision; every changed file is presented as "needs review" instead of being auto-classified.
- A new scaffolded site (via `/hakuto:init`) writes the initial `.hakuto-sync.json` automatically — first-run baseline ceremony only applies to legacy sites.

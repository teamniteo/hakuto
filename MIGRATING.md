# Migrating an existing Hakuto site to the plugin

If you have a site built from the old git-clone Hakuto template (before the plugin), it carries vendored copies of every skill, the subagent, and the statusline. Installing the plugin without cleaning up leaves you with **both** copies loaded — duplicate `website-builder`, duplicate `brand-designer`, etc. That confuses the model and defeats `/plugin update hakuto`.

This is a one-time manual cleanup per site.

## 1. Install the plugin (once, globally)

```
/plugin marketplace add teamniteo/hakuto
/plugin install hakuto@hakuto
```

## 2. Clean up each existing Hakuto site

```sh
cd /path/to/your-hakuto-site

# Remove plugin content that used to be vendored
rm -rf .claude/skills
rm -f  .claude/agents/astro-file-editor.md
rmdir  .claude/agents 2>/dev/null || true
rm -f  .claude/statusline.sh

# Commit
git add -A
git commit -m "Switch to hakuto plugin"
```

## 3. What stays in your repo

Keep these — they're yours, not the plugin's:

| File | Why |
|---|---|
| `CLAUDE.md` | You may have appended `## Project Plan`, site notes, or customizations |
| `.claude/settings.local.json` | Your personal permissions and overrides |
| `site-specification.md` | Per-site design decisions |
| `src/`, `public/`, `worker/`, `package.json`, `wrangler.toml`, etc. | Your site |

## 4. If you edited a skill locally

You'll lose those edits — the plugin ships the canonical version. Check `git log -- .claude/skills/` before deleting. If you have local improvements worth keeping, open a PR against [teamniteo/hakuto](https://github.com/teamniteo/hakuto) before cleanup.

## 5. Statusline

The old template shipped `.claude/statusline.sh` and wired it via `statusLine.command` in `.claude/settings.local.json`. The plugin does **not** automatically restore it — `${CLAUDE_PLUGIN_ROOT}` doesn't resolve in a project's statusLine config.

If you want it back, set it globally in `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "/Users/YOU/.claude/plugins/cache/hakuto/hakuto/<version>/assets/statusline.sh"
  }
}
```

Or skip it — the built-in statusline is fine.

## 6. Verify

In the migrated site, launch Claude and run:

- `/` — confirm exactly one of each Hakuto skill (no duplicates)
- `/agents` — confirm `astro-file-editor` appears once
- `bun run dev` — site still serves

Drift is fine across sites; each can migrate on its own schedule.

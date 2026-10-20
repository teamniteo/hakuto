---
name: agent-browser
description: Drive a headless browser against the local preview (`bun run preview`) or a deployed Hakuto site to check what static audits can't — submit a form end to end, click through navigation, take mobile, desktop and dark-mode screenshots, run an axe accessibility pass, read console errors. Use for "test the contact form", "screenshot the site on mobile", "click through the site", "any console errors?". Skip for reading page text (WebFetch), markup or SEO checks (`seo-audit`), Lighthouse scores (`pagespeed-audit`), building a form (`section-form`), or tasks needing the user's own signed-in Chrome.
---

# Site QA with agent-browser

`agent-browser` (vercel-labs, npm `agent-browser`) is a CLI that drives headless Chrome
through a background daemon. The core loop is **snapshot → ref → act**: `snapshot -i` lists
interactive elements with refs (`@e1`, `@e2`), and commands act on those refs. Refs come
from the accessibility tree, so they survive re-renders and hydration where CSS selectors
break; take a fresh snapshot after any navigation or large DOM change.

The full command list is in `references/commands.md` — read it when you need a command
beyond the flow below. `agent-browser skills get core` prints the upstream guide matched to
the installed version, if a flag here doesn't behave as described.

## 1. Check the install

```sh
command -v agent-browser && agent-browser --version
```

If it is missing, don't install it yourself — tell the user to run one of:

```sh
npm install -g agent-browser     # or: brew install agent-browser
agent-browser install            # first time only: downloads Chrome for Testing
```

`agent-browser install` is only needed when no Chrome/Chromium is already on the machine;
existing installs are detected. Avoid `bun install -g` here: bun's global bin directory is
usually not on `PATH` outside devenv, so the command "installs" and then isn't found.
`agent-browser doctor` diagnoses a broken install.

## 2. Pick the target

- **Deployed site:** use the URL the user gives.
- **Local:** worker routes (`/~/…`, i.e. every form endpoint) only run under
  `bun run preview`, which builds and serves site + worker on `http://127.0.0.1:8787`.
  `bun run dev` (port 4321) has no worker and no Pagefind index — fine for layout
  screenshots, wrong for forms or search.

  Check before starting anything: `lsof -iTCP:8787 -sTCP:LISTEN` (and `:4321` for dev). If
  nothing is listening and you need forms or search, start `bun run preview` in the
  background from the site root and wait until `curl -s -o /dev/null http://127.0.0.1:8787/`
  succeeds. Don't start a second server if one is already up.

## 3. QA flow

Run per page the user asked about (default: home, plus any page with a form). The daemon
shuts itself down after an hour idle (`--idle-timeout`, or `AGENT_BROWSER_IDLE_TIMEOUT_MS`),
but close it explicitly when done.

```sh
agent-browser open http://127.0.0.1:8787/contact/
agent-browser snapshot -i                  # refs for links, inputs, buttons
```

**Interact.** Act on refs from the latest snapshot:

```sh
agent-browser click @e9                    # submit empty — expect inline field errors
agent-browser get text main                # read the errors back
agent-browser fill @e5 "Ada Lovelace"
agent-browser fill @e6 "ada@example.com"
agent-browser check @e8                    # checkbox
agent-browser click @e9
agent-browser wait --text "Message sent"   # whatever success text the form shows
agent-browser network requests --method POST   # confirm the POST to /~/form-… and its status
```

If a click reports the target is covered (cookie banner, dialog), dismiss that element first
and re-snapshot. Navigation: click each header/footer link from the snapshot and confirm the
URL and `<h1>` with `get url` / `get text h1`.

**Errors.** After the page has loaded and after each interaction:

```sh
agent-browser console                      # log / warn / error messages
agent-browser errors                       # uncaught exceptions
```

**Screenshots.** Mobile and desktop, then dark mode:

```sh
agent-browser set viewport 375 812
agent-browser screenshot                   # no path → saved to a temp dir; the path is printed
agent-browser set viewport 1280 800
agent-browser screenshot --full
agent-browser set media dark
agent-browser screenshot
```

`set media dark` only emulates `prefers-color-scheme`. Hakuto's dark styles hang off a `.dark`
class (`@custom-variant dark (&:is(.dark *))`), so if the site toggles that class itself
rather than following the system setting, add it directly:
`agent-browser eval "document.documentElement.classList.add('dark')"`.
Look at each screenshot (Read the printed path) before reporting on it.

**Accessibility.**

```sh
agent-browser a11y --tags wcag2a,wcag2aa
```

Report violations by impact (critical, serious, moderate, minor). Items under "incomplete"
need a human look — mention them, don't count them as failures.

**Close.**

```sh
agent-browser close
```

Stop a `bun run preview` you started yourself; leave one the user started.

## 4. Report

One block per page, most severe first:

```
## /contact/  (http://127.0.0.1:8787, preview)
Console:  0 errors, 1 warning — "<message>"
Errors:   none
a11y:     1 serious — color-contrast on .toast (3.9:1); 2 incomplete (manual review)
Form:     empty submit → 3 inline errors ✓; valid submit → POST /~/form-contact 200, success toast ✓
Nav:      6/6 header links resolve ✓
Screens:  375px <path> · 1280px <path> · dark <path>
```

Finish with a short list of what to fix, each pointing at the file in `src/` when it is
obvious (e.g. contrast → `src/index.css` token). This skill reports; it does not fix.

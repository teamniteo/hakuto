# agent-browser command reference

Read this when the QA flow in SKILL.md needs a command it doesn't show. Checked against
the upstream README and `agent-browser --help` for v0.39. For anything not listed, run
`agent-browser --help` or `agent-browser skills get core --full` — both match the
installed version.

## Contents

- Setup and lifecycle
- Navigation
- Snapshot and refs
- Interaction
- Reading the page
- Waiting
- Viewport, device, colour scheme
- Screenshots and visual diffs
- Console, errors, network
- Accessibility
- WebMCP
- Batching and JSON output

## Setup and lifecycle

```sh
agent-browser install            # download Chrome for Testing (first time, if no Chrome found)
agent-browser upgrade            # update via the original install method
agent-browser doctor [--fix]     # diagnose install, clean stale daemon files
agent-browser close              # close the browser (aliases: quit, exit)
agent-browser close --all        # close every session
```

The daemon starts on the first command and exits after 1 hour without commands. Change it
with `--idle-timeout 5m` (also `10s`, `1h`, raw ms; `0` disables) or
`AGENT_BROWSER_IDLE_TIMEOUT_MS=300000`.

## Navigation

```sh
agent-browser open <url>         # launch + navigate (aliases: goto, navigate)
agent-browser back | forward | reload
agent-browser get url
agent-browser get title
```

## Snapshot and refs

```sh
agent-browser snapshot           # full accessibility tree with refs
agent-browser snapshot -i        # interactive elements only (links, inputs, buttons)
agent-browser snapshot -i --urls # include link hrefs — useful for a link walk
agent-browser snapshot -c        # compact: drop empty structural nodes
agent-browser snapshot -d 3      # limit depth
agent-browser snapshot -s "main" # scope to a CSS selector
agent-browser diff snapshot      # what changed since the last snapshot
```

Refs look like `@e1`. Surviving elements keep their refs across snapshots; re-snapshot after
navigation. CSS selectors (`"#email"`), `text=Submit` and `xpath=//button` also work, as do
semantic locators:

```sh
agent-browser find role button click --name "Send message"
agent-browser find label "Email" fill "ada@example.com"
agent-browser find text "Pricing" click
```

## Interaction

```sh
agent-browser click <sel>               # --new-tab to open in a new tab
agent-browser fill <sel> <text>         # clear, then type
agent-browser type <sel> <text>         # type without clearing
agent-browser press <key>               # Enter, Tab, Escape, Control+a
agent-browser select <sel> <value>      # native <select>, by value or label
agent-browser check <sel> | uncheck <sel>
agent-browser hover <sel>
agent-browser focus <sel>
agent-browser scroll down 600           # up/down/left/right [px]
agent-browser scrollintoview <sel>
agent-browser upload <sel> <files>
agent-browser dialog accept | dismiss   # JS alert/confirm
```

Radix Select (shadcn) is not a native `<select>`: click the trigger, snapshot, then click the
option ref.

## Reading the page

```sh
agent-browser get text <sel>            # e.g. get text main, get text h1
agent-browser get value <sel>
agent-browser get attr <sel> <attr>
agent-browser get count <sel>
agent-browser get styles <sel>          # computed styles
agent-browser is visible|enabled|checked <sel>
agent-browser eval "<js>"               # run JavaScript in the page
```

## Waiting

```sh
agent-browser wait <selector>           # until visible
agent-browser wait --text "Message sent"
agent-browser wait --url "**/thanks/"
agent-browser wait --load load          # or domcontentloaded / networkidle
agent-browser wait "#spinner" --state hidden
agent-browser wait 500                  # ms — last resort
```

Prefer a selector, text or URL condition over a fixed delay.

## Viewport, device, colour scheme

```sh
agent-browser set viewport 375 812      # [scale], e.g. 2 for retina
agent-browser set device "iPhone 14"
agent-browser set media dark            # or light; emulates prefers-color-scheme
agent-browser set offline on|off
```

## Screenshots and visual diffs

```sh
agent-browser screenshot                # no path → temp dir, path printed
agent-browser screenshot shots/home.png
agent-browser screenshot --full         # full page
agent-browser screenshot --annotate     # numbered labels matching refs
agent-browser diff screenshot --baseline before.png         # pixel diff vs a baseline
agent-browser diff screenshot --baseline before.png -o diff.png
agent-browser diff url <url1> <url2> --screenshot           # e.g. preview vs production
```

`--screenshot-dir <dir>` (or `AGENT_BROWSER_SCREENSHOT_DIR`) sets the default directory.

## Console, errors, network

```sh
agent-browser console [--clear]         # log, warn, error, info
agent-browser errors [--clear]          # uncaught exceptions
agent-browser network requests --method POST
agent-browser network requests --status 400-599
agent-browser network request <id>      # full request/response detail
agent-browser vitals [url]              # LCP/CLS/TTFB/FCP/INP from this run (not a Lighthouse score)
```

## Accessibility

```sh
agent-browser a11y                      # axe-core audit of the current page
agent-browser a11y <url>
agent-browser a11y --tags wcag2a,wcag2aa
agent-browser a11y --selector "main"
agent-browser a11y --json               # counts, violations, incomplete, nodes
```

axe-core is embedded, so it works offline and under the site's CSP.

## WebMCP

Hakuto sites expose WebMCP tools (`search-site`, `get-page-content`, `navigate`) by default;
`open` prints a summary when it finds them.

```sh
agent-browser webmcp list --json
agent-browser webmcp invoke search-site --params '{"query":"pricing"}'
```

`search-site` needs the Pagefind index, so it only returns results on a built origin
(`bun run preview` or deployed).

## Batching and JSON output

```sh
agent-browser batch "open http://127.0.0.1:8787/" "snapshot -i" "screenshot"
agent-browser batch --bail "click @e1" "screenshot"     # stop on first error
agent-browser snapshot -i --json                         # machine-readable output
```

Chaining with `&&` also works; the daemon keeps the browser between commands.

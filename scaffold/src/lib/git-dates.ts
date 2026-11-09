import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

// Last-commit dates for sitemap <lastmod> and schema `dateModified`.
//
// A shallow clone (CI checkouts often default to depth 1) reports the HEAD
// commit for every file, which would stamp one identical date on every URL —
// worse than no date, because search engines then learn to ignore the field.
// So in a shallow clone, and for files git doesn't track, this returns
// undefined and callers omit the value.

const git = (...args: string[]) =>
	execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();

let fullHistory: boolean | undefined;
function hasFullHistory(): boolean {
	if (fullHistory === undefined) {
		try {
			fullHistory = git("rev-parse", "--is-shallow-repository") === "false";
		} catch {
			fullHistory = false;
		}
	}
	return fullHistory;
}

const cache = new Map<string, string | undefined>();

/** ISO 8601 date of the last commit touching `file` (repo-relative), or undefined. */
export function lastModified(file: string | undefined): string | undefined {
	if (!file) return undefined;
	if (cache.has(file)) return cache.get(file);
	let date: string | undefined;
	if (hasFullHistory() && existsSync(file)) {
		try {
			date = git("log", "-1", "--format=%cI", "--", file) || undefined;
		} catch {
			date = undefined;
		}
	}
	cache.set(file, date);
	return date;
}

/**
 * Source file that renders a built URL path, for sitemap <lastmod>.
 * Covers `src/pages/` routes and content collections whose entries live at
 * `src/content/<section>/<slug>.md(x)` (the blog and docs sections). Extend it
 * when you add a dynamic route whose source lives elsewhere — an unmatched URL
 * simply gets no <lastmod>.
 */
export function sourceForPath(pathname: string): string | undefined {
	const p = pathname.replace(/^\/|\/$/g, "");
	const [section, ...rest] = p.split("/");
	const slug = rest.join("/");
	const candidates = [
		...(p === "" ? ["src/pages/index.astro"] : []),
		`src/pages/${p}.astro`,
		`src/pages/${p}/index.astro`,
		...(slug
			? [`src/content/${section}/${slug}.md`, `src/content/${section}/${slug}.mdx`]
			: []),
	];
	return candidates.find((c) => existsSync(c));
}

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Last-commit dates for sitemap <lastmod> and schema `dateModified`.
//
// A shallow clone reports the HEAD commit for every file, which would stamp one
// identical date on every URL — worse than no date, because search engines then
// learn to ignore the field. Cloudflare Workers Builds clones only the latest
// commit, so a shallow checkout is deepened once per build. If that fails (no
// network, no credentials), and for files git doesn't track, this returns
// undefined and callers omit the value.

const git = (...args: string[]) =>
	execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();

let fullHistory: boolean | undefined;
function hasFullHistory(): boolean {
	if (fullHistory === undefined) {
		try {
			if (git("rev-parse", "--is-shallow-repository") === "true") {
				execFileSync("git", ["fetch", "--unshallow", "--quiet"], {
					stdio: "ignore",
					timeout: 120_000,
				});
			}
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

// URL slug → entry file for one content collection folder. An entry is indexed
// under its frontmatter `slug:` (the blog builds URLs from it) and under its
// path without extension (the docs and Astro's default ids), so a post whose
// filename differs from its slug, or that sits in a subfolder, still resolves.
const slugIndex = new Map<string, Map<string, string>>();
function entriesFor(section: string): Map<string, string> {
	let index = slugIndex.get(section);
	if (index) return index;
	index = new Map();
	const root = `src/content/${section}`;
	if (existsSync(root)) {
		for (const rel of readdirSync(root, { recursive: true, encoding: "utf8" })) {
			if (!/\.mdx?$/.test(rel)) continue;
			const file = join(root, rel);
			index.set(rel.replace(/\.mdx?$/, "").replaceAll("\\", "/"), file);
			const slug = readFileSync(file, "utf8").match(/^slug:\s*["']?([^"'\n]+?)["']?\s*$/m)?.[1];
			if (slug) index.set(slug, file);
		}
	}
	slugIndex.set(section, index);
	return index;
}

/**
 * Source file that renders a built URL path, for sitemap <lastmod>.
 * Covers `src/pages/` routes and content collections under
 * `src/content/<section>/` (the blog and docs sections). Extend it when you add
 * a dynamic route whose source lives elsewhere — an unmatched URL simply gets
 * no <lastmod>.
 */
export function sourceForPath(pathname: string): string | undefined {
	const p = pathname.replace(/^\/|\/$/g, "");
	const [section, ...rest] = p.split("/");
	const slug = rest.join("/");
	const page = [
		...(p === "" ? ["src/pages/index.astro"] : []),
		`src/pages/${p}.astro`,
		`src/pages/${p}/index.astro`,
	].find((c) => existsSync(c));
	return page ?? (slug ? entriesFor(section).get(slug) : undefined);
}

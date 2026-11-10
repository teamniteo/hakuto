import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Sitemap <lastmod> from frontmatter dates, never from git or the build clock.
//
// A content entry under `src/content/<section>/` gets `updated:` if it has one,
// else `date:`. `updated:` is set by hand when the content itself changes, so
// edits to titles, meta descriptions, typos, formatting or lint fixes don't
// move it. Git dates did: one bulk commit re-dated every page it touched, and
// once search engines see lastmod moving without real changes they ignore it.
//
// Every other page (src/pages/ routes) gets no <lastmod>. A missing date is
// better than one that isn't reliable.

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
			const slug = frontmatter(file).match(/^slug:\s*["']?([^"'\n]+?)["']?\s*$/m)?.[1];
			if (slug) index.set(slug, file);
		}
	}
	slugIndex.set(section, index);
	return index;
}

function frontmatter(file: string): string {
	return readFileSync(file, "utf8").match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? "";
}

function dateField(fm: string, key: string): string | undefined {
	const raw = fm.match(new RegExp(`^${key}:\\s*["']?([^"'\\n#]+?)["']?\\s*(#.*)?$`, "m"))?.[1];
	if (!raw) return undefined;
	const date = new Date(raw);
	return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

/** `updated:` or else `date:` from a content entry's frontmatter, as ISO 8601. */
export function contentDate(file: string | undefined): string | undefined {
	if (!file || !existsSync(file)) return undefined;
	const fm = frontmatter(file);
	return dateField(fm, "updated") ?? dateField(fm, "date");
}

/**
 * <lastmod> for a built URL path: the date of the content entry that renders
 * it, or undefined for anything that isn't a content entry. Covers
 * `/<section>/<slug>/` for every collection folder under `src/content/` (the
 * blog and docs sections). Extend it if a collection is served from a URL
 * prefix that differs from its folder name.
 */
export function lastmodFor(pathname: string): string | undefined {
	const [section, ...rest] = pathname.replace(/^\/|\/$/g, "").split("/");
	const slug = rest.join("/");
	return slug ? contentDate(entriesFor(section).get(slug)) : undefined;
}

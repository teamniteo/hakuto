import { appendFileSync, existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { AstroIntegration } from "astro";

// Permanent trailing-slash redirects, served by Cloudflare's asset layer.
//
// html_handling = "force-trailing-slash" answers /pricing and
// /pricing/index.html with a 307 to /pricing/. A 307 is temporary. After the
// build, this integration appends a 301 rule for each page to
// dist/client/_redirects. The asset layer applies _redirects rules before
// html_handling, so the 301 is sent instead of the 307, without a Worker
// invocation.

// Cloudflare's cap on static rules in _redirects. Rules past it are ignored.
export const STATIC_RULE_LIMIT = 2000;

/** `pricing/index.html` → `/pricing/`; `404.html` → `/404/`; `index.html` → `/`. */
function slashedPath(htmlFile: string): string {
	const path = htmlFile.replaceAll("\\", "/").replace(/(^|\/)index\.html$/, "$1").replace(/\.html$/, "/");
	return `/${path}`;
}

/** Source paths of the static rules in an existing _redirects file. */
function staticSources(existing: string): Set<string> {
	const sources = new Set<string>();
	for (const line of existing.split("\n")) {
		const source = line.trim().split(/\s+/)[0];
		if (!source || source.startsWith("#") || source.includes("*") || source.includes(":")) continue;
		sources.add(source);
	}
	return sources;
}

/**
 * 301 rules for the built HTML files, skipping sources `existing` already
 * redirects. Unslashed rules come first, then `index.html` rules, and the list
 * stops where `existing` plus the new rules would pass STATIC_RULE_LIMIT.
 */
export function slashRedirectRules(htmlFiles: string[], existing = ""): { rules: string[]; dropped: number } {
	const taken = staticSources(existing);
	const unslashed: string[] = [];
	const indexHtml: string[] = [];
	for (const file of [...htmlFiles].sort()) {
		const target = slashedPath(file);
		const html = `/${file.replaceAll("\\", "/")}`;
		if (target !== "/" && !taken.has(target.slice(0, -1))) unslashed.push(`${target.slice(0, -1)} ${target} 301`);
		if (!taken.has(html)) indexHtml.push(`${html} ${target} 301`);
	}
	const all = [...unslashed, ...indexHtml];
	const room = Math.max(0, STATIC_RULE_LIMIT - taken.size);
	return { rules: all.slice(0, room), dropped: Math.max(0, all.length - room) };
}

function htmlFilesIn(dir: string): string[] {
	return readdirSync(dir, { recursive: true, encoding: "utf8" }).filter((file) => file.endsWith(".html"));
}

export function slashRedirects(): AstroIntegration {
	let clientDir: URL;
	return {
		name: "slash-redirects",
		hooks: {
			"astro:config:done": ({ config }) => {
				clientDir = config.build.client;
			},
			"astro:build:done": ({ logger }) => {
				const dir = fileURLToPath(clientDir);
				const file = join(dir, "_redirects");
				const existing = existsSync(file) ? readFileSync(file, "utf8") : "";
				const { rules, dropped } = slashRedirectRules(htmlFilesIn(dir), existing);
				if (rules.length > 0) {
					const separator = existing === "" || existing.endsWith("\n") ? "" : "\n";
					appendFileSync(file, `${separator}# Permanent trailing-slash redirects (src/lib/slash-redirects.ts)\n${rules.join("\n")}\n`);
				}
				logger.info(`Added ${rules.length} trailing-slash 301 rules to _redirects.`);
				if (dropped > 0) {
					logger.warn(
						`${dropped} trailing-slash rules left out: _redirects is capped at ${STATIC_RULE_LIMIT} static rules. Those URLs keep the asset layer's 307.`,
					);
				}
			},
		},
	};
}

import type { APIRoute } from "astro";

// Generated rather than shipped as `public/robots.txt` so the `Sitemap:` line
// can name the real host. `@astrojs/sitemap` does NOT write robots.txt, so
// nothing else supplies that line.
//
// `context.site` is Astro's build-time `site` config, not a runtime env var —
// the "no `import.meta.env` under src/" rule in AGENTS.md does not apply here.
export const GET: APIRoute = ({ site }) => {
	const sitemap = site ? new URL("sitemap-index.xml", site).href : "/sitemap-index.xml";

	const body = `User-agent: *
Allow: /

# AI preferences (https://datatracker.ietf.org/doc/draft-canel-robots-content-signal/).
# Also sent as an HTTP header from public/_headers for forward-compatibility.
Content-Signal: ai-train=no, search=yes, ai-input=yes

# AI crawlers: training is blocked, search is allowed — the same preference as
# the Content-Signal line above, enforced for the bots that honour robots.txt.
# Search and user-triggered fetchers are what make the site citable in ChatGPT,
# Claude and Perplexity answers; blocking them removes it from those answers.
# Google-Extended gates Gemini training only — Google Search and AI Overviews
# use Googlebot, which the * group above already allows.
# A bot that matches a named group ignores the * group, so any Disallow you add
# to * must be repeated in the search group below.
User-agent: GPTBot
User-agent: ClaudeBot
User-agent: Google-Extended
User-agent: Applebot-Extended
User-agent: CCBot
User-agent: Bytespider
User-agent: meta-externalagent
Disallow: /

User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: Claude-SearchBot
User-agent: Claude-User
User-agent: PerplexityBot
User-agent: Perplexity-User
Allow: /

Sitemap: ${sitemap}
`;

	return new Response(body, {
		headers: { "Content-Type": "text/plain; charset=utf-8" },
	});
};

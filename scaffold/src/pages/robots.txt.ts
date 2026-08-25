import type { APIRoute } from "astro";

// Generated rather than shipped as `public/robots.txt` so the `Sitemap:` line
// can name the real host. `@astrojs/sitemap` does NOT write robots.txt, so
// nothing else supplies that line.
//
// `context.site` is Astro's build-time `site` config, not a runtime env var —
// the "no `import.meta.env` under src/" rule in CLAUDE.md does not apply here.
export const GET: APIRoute = ({ site }) => {
	const sitemap = site ? new URL("sitemap-index.xml", site).href : "/sitemap-index.xml";

	const body = `User-agent: *
Allow: /

# AI preferences (https://datatracker.ietf.org/doc/draft-canel-robots-content-signal/).
# Also sent as an HTTP header from public/_headers for forward-compatibility.
Content-Signal: ai-train=no, search=yes, ai-input=yes

# No crawler-specific rules by default: every bot is allowed. Decide explicitly
# whether training-only crawlers should be blocked, then uncomment what you want.
# Note that Google-Extended gates Gemini *training* only — it has no effect on
# Google Search indexing or AI Overviews, which use Googlebot.
#
# User-agent: GPTBot          # OpenAI, model training
# User-agent: ClaudeBot       # Anthropic, model training
# User-agent: PerplexityBot   # Perplexity, search index + training
# User-agent: Google-Extended # Gemini training (NOT Google Search)
# User-agent: Bytespider      # ByteDance, model training
# User-agent: CCBot           # Common Crawl, open dataset
# Disallow: /

Sitemap: ${sitemap}
`;

	return new Response(body, {
		headers: { "Content-Type": "text/plain; charset=utf-8" },
	});
};

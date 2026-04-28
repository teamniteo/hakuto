// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import fs from "node:fs";
import path from "node:path";
import { defineConfig as viteConfig } from "vite";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import favicons from "astro-favicons";
import pagefind from "astro-pagefind";
import { agentsSummary } from "@nuasite/agent-summary";
import { astroGrab } from "astro-grab";
import cloudflare from "@astrojs/cloudflare";

const isProduction =
  process.env.NODE_ENV === "production" ||
  Boolean(process.env.CF_PAGES) ||
  Boolean(process.env.CLOUDFLARE_BUILD) ||
  Boolean(process.env.CI);

/**
 * Read Hakuto configuration from .hakuto/config.json.
 *
 * `.hakuto/config.json` is the single source of truth for the production
 * `site` URL (used by the sitemap, canonical links, JSON-LD, etc.). It MUST
 * be tracked in git — otherwise Cloudflare's build runs without the file
 * and the site URL falls back, baking the wrong domain into the sitemap.
 *
 * In production builds we fail loud if the file is missing or has no
 * `domain`. Locally we fall back to localhost so `astro dev` still works
 * before the domain is wired up.
 */
function getHakutoConfig() {
  const configPath = path.resolve(process.cwd(), ".hakuto/config.json");
  let config = null;

  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    } catch (err) {
      throw new Error(
        `[hakuto] .hakuto/config.json exists but is not valid JSON: ${err.message}`,
      );
    }
  }

  if (isProduction) {
    if (!config) {
      throw new Error(
        "[hakuto] Production build but .hakuto/config.json is missing. " +
          "This file is the source of truth for the site URL (sitemap, canonical links, etc.). " +
          "Create it with {\"domain\":\"yoursite.com\",\"siteName\":\"Your Site\"} and commit it to git.",
      );
    }
    if (!config.domain) {
      throw new Error(
        "[hakuto] Production build but .hakuto/config.json has no `domain`. " +
          "Set it to your live domain (e.g. \"yoursite.com\") and commit the change.",
      );
    }
  }

  return {
    domain: config?.domain ?? null,
    siteName: config?.siteName ?? "Hakuto",
  };
}

const hakuto = getHakutoConfig();
const site = hakuto.domain ? `https://${hakuto.domain}` : "http://localhost:4321";

// https://astro.build/config
export default defineConfig({
  site,
  output: "static",
  trailingSlash: "always",
  integrations: [
    react(),
    sitemap(),
    agentsSummary(),
    pagefind(),
    astroGrab(),
    favicons({
      input: "./src/assets/favicon.png",
      name: "Site",
      short_name: "Site Name",
    }),
  ],

  vite: viteConfig({
    cacheDir: ".astro/vite",
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": "/src",
      },
    },
  }),

  build: {
    concurrency: 4,
  },

  server: { port: 4321, host: "0.0.0.0", allowedHosts: true },
  devToolbar: { enabled: false },
  adapter: isProduction
    ? cloudflare({ imageService: "compile", prerenderEnvironment: "node" })
    : undefined,

  fonts: [],
});

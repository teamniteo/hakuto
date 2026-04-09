// @ts-check
import { defineConfig } from "astro/config";
import fs from "node:fs";
import path from "node:path";

import { defineConfig as viteConfig } from "vite";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import favicons from "astro-favicons";
import pagefind from "astro-pagefind";
import { agentsSummary } from "@nuasite/agent-summary";
import { devErrors } from "./src/integrations/dev-errors";
import { astroGrab } from "astro-grab";

import cloudflare from "@astrojs/cloudflare";

/**
 * Read Hakuto configuration from .hakuto/config.json
 * This allows domain and siteName to persist across template updates
 */
function getHakutoConfig() {
  try {
    const configPath = path.resolve(process.cwd(), '.hakuto/config.json');
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
  } catch {
    // Ignore errors, use defaults
  }
  return { domain: null, siteName: "Hakuto" };
}

const hakuto = getHakutoConfig();
const site = hakuto.domain ? `https://${hakuto.domain}` : "https://preview.hakuto.dev";

// https://astro.build/config
export default defineConfig({
  site,
  output: "static",
  integrations: [
      react(),
      sitemap(),
      agentsSummary(),
      pagefind(),
      devErrors(),
      astroGrab(),
      favicons({
          input: "./src/assets/favicon.png",
          name: hakuto.siteName,
          short_name: hakuto.siteName,
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
  adapter: cloudflare({ imageService: "compile", prerenderEnvironment: "node" }),
});
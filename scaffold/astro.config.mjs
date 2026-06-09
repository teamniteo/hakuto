// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import { imageService } from "@unpic/astro/service";
import { defineConfig as viteConfig } from "vite";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import favicons from "astro-favicons";
import pagefind from "astro-pagefind";
import { agentsSummary } from "@nuasite/agent-summary";
import astroAgentAnnotate from "astro-agent-annotate";
import cloudflare from "@astrojs/cloudflare";

const isDevelopment = process.env.NODE_ENV === "development";
const devToolbar = { enabled: isDevelopment };

// https://astro.build/config
export default defineConfig({
  site: "http://localhost:4321",
  output: "static",
  trailingSlash: "always",
  image: { service: imageService() },
  integrations: [
    react(),
    sitemap(),
    agentsSummary(),
    pagefind(),
    ...(devToolbar.enabled ? [astroAgentAnnotate()] : []),
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
  devToolbar,
  adapter: isDevelopment
    ? undefined
    : cloudflare({ imageService: "custom", prerenderEnvironment: "node" }),

  fonts: [],
});

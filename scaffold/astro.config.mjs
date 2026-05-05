// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import { defineConfig as viteConfig } from "vite";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import favicons from "astro-favicons";
import pagefind from "astro-pagefind";
import { agentsSummary } from "@nuasite/agent-summary";
import { astroGrab } from "astro-grab";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: "http://localhost:4321",
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
    client: "./dist/client",
    concurrency: 4,
  },

  server: { port: 4321, host: "0.0.0.0", allowedHosts: true },
  devToolbar: { enabled: false },
  // The Cloudflare adapter is always loaded so `bun run dev` runs the worker
  // exactly as production does — wrangler.toml's `run_worker_first` filter
  // and the worker entry are live in dev too.
  adapter: cloudflare({ imageService: "compile", prerenderEnvironment: "node" }),

  fonts: [],
});

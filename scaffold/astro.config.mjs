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
  adapter:
      process.env.NODE_ENV === "production"
          ? cloudflare({ imageService: "compile", prerenderEnvironment: "node" })
          : undefined,

  fonts: [],
});

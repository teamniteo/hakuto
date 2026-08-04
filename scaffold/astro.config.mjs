// @ts-check
import { defineConfig, fontProviders } from "astro/config";
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
  // No `image.service` key on purpose: Astro's schema default is already
  // `astro/assets/services/sharp`, which is what we want. Setting it explicitly
  // buys nothing — and see the adapter note below before changing `imageService`.
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
  // `imageService: "custom"` is load-bearing — do NOT "fix" it to "compile".
  // In the adapter's `setImageConfig()`, "compile" returns the workerd image
  // service (v13 does so unconditionally; v14 keeps sharp only if a custom
  // service is set, and `hasUserImageService()` explicitly excludes sharp).
  // "custom" is the only branch that returns the config untouched, so it is
  // what lets Astro's sharp service survive. `prerenderEnvironment: "node"`
  // pairs with it so sharp runs in plain Node during the build, not workerd.
  adapter: isDevelopment
    ? undefined
    : cloudflare({ imageService: "custom", prerenderEnvironment: "node" }),

  fonts: [],
});

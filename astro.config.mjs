import mdx from "@astrojs/mdx";
// @ts-check
import { defineConfig } from "astro/config";

import sitemap from "@astrojs/sitemap";

import AstroPWA from "@vite-pwa/astro";

// https://astro.build/config
export default defineConfig({
  site: "https://tetsu-tech-blog.pages.dev",
  integrations: [
    mdx(),
    sitemap(),
    AstroPWA({
      injectRegister: "auto",
      manifest: {
        name: "Name",
        short_name: "Short Name",
        description: "Description",
        theme_color: "#000000",
        icons: [
          {
            src: "/favicon.svg",
            size: "192x192",
            type: "image/svg+xml",
          },
          {
            src: "/favicon.svg",
            size: "512x512",
            type: "image/svg+xml",
          },
        ],
      },
    }),
  ],
});

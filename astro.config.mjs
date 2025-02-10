import mdx from "@astrojs/mdx";
// @ts-check
import { defineConfig } from "astro/config";

import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
	site: "https://tetsu-tech-blog.pages.dev",
	integrations: [mdx(), sitemap()],
});

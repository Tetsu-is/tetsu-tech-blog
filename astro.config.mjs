import mdx from "@astrojs/mdx";
// @ts-check
import { defineConfig } from "astro/config";

import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
	site: "https://example.com",
	integrations: [mdx(), sitemap()],
	adapter: cloudflare(),
	output: 'hybrid',
	experimental: {
		serverIslands: true,
	}
});

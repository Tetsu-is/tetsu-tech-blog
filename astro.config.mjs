import mdx from "@astrojs/mdx";
// @ts-check
import { defineConfig } from "astro/config";

import sitemap from "@astrojs/sitemap";

import svelte from "@astrojs/svelte";

import { rehypeToc } from "./plugins/rehype-toc.js";

// https://astro.build/config
export default defineConfig({
	site: "https://tetsu-tech-blog.pages.dev",
	integrations: [
		mdx(),
		sitemap(),
		svelte({
			configFile: "svelte.config.js",
			extensions: [".svelte"],
			compilerOptions: {},
		}),
	],
	markdown: {
		rehypePlugins: [rehypeToc],
	},
});

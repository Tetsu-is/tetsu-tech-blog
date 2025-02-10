import { defineCollection, z } from "astro:content";

export type BlogSchema = {
	title: string;
	description: string;
	pubDate: Date;
	updatedDate?: Date;
	heroImage?: string;
	blogID: string;
};

const blog = defineCollection({
	type: "content",
	// Type-check frontmatter using a schema
	schema: z.object({
		title: z.string(),
		description: z.string(),
		// Transform string to Date object
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.string().optional(),
		blogID: z.string(),
	}),
});

export const collections = { blog };

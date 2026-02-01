export interface ZennArticle {
	id: number;
	post_type: string;
	title: string;
	slug: string;
	published: boolean;
	comments_count: number;
	liked_count: number;
	body_letters_count: number;
	article_type: string;
	emoji: string;
	is_suspending_private: boolean;
	published_at: string;
	body_updated_at: string;
	source_repo_updated_at: string | null;
	pinned: boolean;
	path: string;
	user: {
		id: number;
		username: string;
		name: string;
		avatar_small_url: string;
	};
	publication: null | any;
	og_image_url?: string;
}

export interface ZennResponse {
	articles: ZennArticle[];
	next_page: number | null;
}

/**
 * Fetch articles from Zenn API
 * @param username - Zenn username
 * @returns Array of Zenn articles
 */
export async function fetchZennArticles(
	username: string,
): Promise<ZennArticle[]> {
	try {
		const response = await fetch(
			`https://zenn.dev/api/articles?username=${username}&order=latest`,
		);

		if (!response.ok) {
			console.error(
				`Failed to fetch Zenn articles: ${response.status} ${response.statusText}`,
			);
			return [];
		}

		const data: ZennResponse = await response.json();
		return data.articles.filter((article) => article.published);
	} catch (error) {
		console.error("Error fetching Zenn articles:", error);
		return [];
	}
}

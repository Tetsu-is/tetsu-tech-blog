blog/new:
	sh ./scripts/create_blog.sh

migrate/local:
	bunx wrangler d1 migrations apply prod-d1 --local

migrate/remote:
	bunx wrangler d1 migrations apply prod-d1 --remote
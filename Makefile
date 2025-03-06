blog/new:
	sh ./scripts/create_blog.sh

migrate/local:
	bunx wrangler d1 migrations apply prod-d1 --local

migrate/remote:
	bunx wrangler d1 migrations apply prod-d1 --remote

run/astro:
	bun run dev

run/server:
	bunx wrangler pages dev server/index.ts

run/all:
	make run/astro & make run/server

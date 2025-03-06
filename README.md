# Tetsu tech blog

### 目的

- ブログでアウトプットをしたい
- 成果物が欲しい
- Zenn や Qiita では検索汚染にならないか不安

という悩みを解決する！！

### 特徴

- Astro の md でブログを管理
- D1 Database でメタ情報を管理
- CI/CD で投稿フローを自動化

## Project Structure

```text
├── dist/               # build files
├── functions/          # use Hono API in pages functions
├── migrations/         # D1 migrations
├── public/             # static assets
├── scripts/            # dev scripts
├── server/
│   └── index.ts        # Hono API implementation
├── src/
│   ├── components/
│   ├── content/
│   │   └── blog/       # blog posts
│   ├── layouts/
│   ├── pages/
│   ├── styles/
├── .gitignore
├── astro.config.mjs
├── biome.json
├── bun.lockb
├── Makefile
├── package.json
├── README.md
├── tsconfig.json
└── wrangler.toml
```

## Make Commands

| Command               | Action                        |
| :-------------------- | :---------------------------- |
| `make blog/new`       | Create .md and migration file |
| `make migrate/local`  | Migrate local D1 database     |
| `make migrate/remote` | Migrate remote D1 database    |

## Environment Variables

`.env`
| Name | Value |
| :--------------- | :---------------------- |
| `PUBLIC_API_URL` | `http://localhost:8788` |

## 🧞 bun Commands

All commands are run from the root of the project, from a terminal:

| Command           | Action                                       |
| :---------------- | :------------------------------------------- |
| `bun install`     | Installs dependencies                        |
| `bun run dev`     | Starts local dev server at `localhost:4321`  |
| `bun run build`   | Build your production site to `./dist/`      |
| `bun run preview` | Preview your build locally, before deploying |
| `bun run format`  | Format your project files                    |
| `bun run lint`    | Lint your project for formatting and errors  |
| `bun run check`   | Check your project for formatting and errors |

# Tetsu tech blog

### 目的

- ブログでアウトプットをしたい
- 成果物が欲しい
- ZennやQiitaでは検索汚染にならないか不安

という悩みを解決する！！

### 特徴

Astro + Cloudflare Pages で簡単にコンテンツ管理とデプロイできる

ブログの更新はAstroの`src/content/`内にmdを追加する。

Cloudflare Pagesで自動deployので設定をしている。

- main->production automatic deployment
- develop->preview automatic deployment



##  Project Structure

```text
├── public/
├── src/
│   ├── components/
│   ├── content/ <-ブログをmdで書いて追加
│   ├── layouts/
│   └── pages/
├── astro.config.mjs
├── README.md
├── package.json
└── tsconfig.json
```


## Astro

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

The `src/content/` directory contains "collections" of related Markdown and MDX documents. Use `getCollection()` to retrieve posts from `src/content/blog/`, and type-check your frontmatter using an optional schema. See [Astro's Content Collections docs](https://docs.astro.build/en/guides/content-collections/) to learn more.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |


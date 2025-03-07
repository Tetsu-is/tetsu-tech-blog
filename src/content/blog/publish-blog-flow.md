---
title: "自作ブログサイトの投稿フローを整備した話"
description: "自作ブログサイトの投稿フローの効率化方法について説明します。"
pubDate: "Feb 15 2025"
heroImage: "/og/publish-blog-flow.png"
blogID: "01JM4JYQ9Q9G2F7X20JVNRMBEY"
---

#### はじめに

私は Astro+Cloudflare Pages を使って自作ブログを運営しています。本プロジェクトはブログなどの静的コンテンツは markdown で管理し、良いね数などの動的なデータは DB で管理しています。そのためブログ更新のたびに markdown と DB を更新する必要があります。そこでファイル作成や CLI 実行が煩雑になるという問題があり、今回のフロー改善に至りました。

#### プロジェクトの説明

いきなり改善点だけを説明しても分かりづらいので、簡単にプロジェクトの説明をします。

**技術構成**

- Astro:
  - SSG が便利なフロントエンドフレームワーク
  - ブログを markdown として管理している
  - markdown を書くとビルド時に html を生成してくれる
- Cloudflare Pages:
  - 静的サイトのホスティングサービス
  - main に merge すると自動デプロイされるようにしている
- Cloudflare Pages Function:
  - サーバーレス関数を公開できるサービス
  - Hono で API を実装。
  - いいね数の更新、取得を行う
- Cloudflare D1 Database:
  - SQLite 互換のサーバーレスデータベース
  - ブログのメタデータの格納している
  - ID、タイトル、良いね数

#### 今回のフロー改善の効果

**▲ 既存の投稿フロー**

1. md ファイルの手動作成
2. ULID を 発行して md ファイルのメタ情報に記述
3. md ファイルに内容を書く
4. マイグレーションファイルの作成
5. マイグレーションを CLI で実行
6. 差分を main ブランチにマージする
7. CD で自動デプロイ

**★ 改善後の投稿フロー**

1. `make blog/new` md とマイグレーション自動作成
2. md ファイルに内容を書く
3. 差分を main ブランチにマージする
4. CD で自動デプロイ

効果の一覧は以下の通りです。

| 項目                                         | 改善前                            | 改善後      |
| -------------------------------------------- | --------------------------------- | ----------- |
| md ファイルの作成                            | 手作業                            | 自動化      |
| ULID の採番                                  | ULID Generator のサイトからコピペ | 自動化      |
| レコード追加のためのマイグレーションファイル | 手書き                            | 自動化      |
| マイグレーションの実行                       | CLI 手打ち                        | main マージ |

**個別の説明**

ここからは、それぞれの改善点がどのように良くなったかを説明します。

① md ファイルの作成

Astro の[Content collection](https://docs.astro.build/en/guides/content-collections/)を使うために以下の作業が必要になります。

- content/blog/に markdown ファイルを追加
- markdown に meta 情報を記述(astro 側で項目の設定が可能)
  - DB のレコードと対応付けするために blogID を記述

blog1.md

```md
---
title: "sample_title"
description: "sample_description"
pubDate: "Feb 15 2025"
heroImage: "/blog-placeholder-4.jpg" <!-- public/に配置した画像 -->
blogID: "01JM4JYQ9Q9G2F7X20JVNRMBEY" <!-- DB と紐づけるためのID -->
---

〜〜記事の本文〜〜
```

メタデータは自動で生成されるようになったので、description と記事の本文だけ書けば良いようになりました 👍

② ULID の採番

これは Astro 側で管理している markdown と DB のレコードを一致させるために必要になります。ULID は shell で実行するツールで良さげなものがなかったので毎回 ULID を生成サイトに頼っていました。今回は`make blog/new`コマンドの実行時に ULID を生成する TS ファイルを実行するようにしました。npm に便利な[ulid](https://www.npmjs.com/package/ulid)ライブラリがあるのでそれを使っています。

③ マイグレーションファイルの作成

自動生成されたマイグレーションファイル(5 番目のファイルの場合)

0005_insert_blog_01JM7E6R3KV1J3BYD4XY17ND2N.sql

```sql
-- Migration number: 0005 	 2025-02-16T13:12:17.743Z
INSERT INTO blogs (id, name, likes_count) VALUES ("01JM7E6R3KV1J3BYD4XY17ND2N", "SAMPLE_BLOG_NAME", 0);
```

cloudflare D1 のマイグレーション作成コマンドとマイグレーション用のクエリ作成の手間がなくなりました 👍

④ マイグレーションの実行

cloudflare D1 のマイグレーションコマンドを github actions で自動実行するようにしました。
main に pull_request がマージされるとマイグレーションが実行されたうえで自動デプロイされるようになりました 👍

#### 実装箇所の説明

**Makefile**

```make
blog/new:
	sh ./scripts/create_blog.sh # 記事生成用のスクリプト

migrate/local:
	bunx wrangler d1 migrations apply prod-d1 --local # ローカルのマイグレーション

migrate/remote:
	bunx wrangler d1 migrations apply prod-d1 --remote # 本番のマイグレーション
```

**create_blog.sh**

```sh
#constant vars
DB_NAME="prod-d1"

# get title from input
read -p "Enter title: " title
if [ -z "$title" ]; then
    echo "Error: Title cannot be empty."
    exit 1
fi

title=$title
description="description"
pubDate=$(date +"%b' '%d' '%Y")
blogID=$(bun scripts/ulid.ts) # ulidを生成するだけのtsファイルを実行
heroImage="heroImage"
migration_name="insert_blog_$blogID"

# envsubstのために変数を環境変数にしておく。envsubstは環境変数を使ってtemplateに変数を埋め込む
export title description pubDate blogID heroImage

# template.mdの$variableを変数で置換したものを、src/content/blog/$title.mdに出力
if ! envsubst <./scripts/template.md >"src/content/blog/$title.md"; then
    echo "Failed to create markdown file."
    exit 1
fi

# wranglerを使ってd1のマイグレーションファイルを作成する
bunx wrangler d1 migrations create $DB_NAME $migration_name

target=$(find migrations -name "*_$migration_name.sql")

query="INSERT INTO blogs (id, name, likes_count) VALUES (\"${blogID}\", \"${title}\", 0);"

# 空のマイグレーションファイルにクエリを書き込む
echo $query >$target
```

**template.md**

```md
---
title: "$title"
description: "$description"
pubDate: "$pubDate"
heroImage: "$heroImage"
blogID: "$blogID"
---
```

**merge_main.yml**

```yml
on:
  pull_request:
    types: [closed]
    branches:
      - main

jobs:
  migrate:
    runs-on: ubuntu-latest
    if: github.event.pull_request.merged == true
    steps:
      - uses: actions/checkout@v4
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
      - name: Apply migrations
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: d1 migrations apply prod-d1 --remote
  deploy:
    runs-on: ubuntu-latest
    timeout-minutes: 60
    needs: migrate
    if: github.event.pull_request.merged == true
    steps:
      - uses: actions/checkout@v4
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
      - name: Install dependencies
        run: bun install
      - name: Build
        run: bun run build
      - name: Deploy
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy ./dist --project-name tetsu-tech-blog
```

#### まとめ

今回は自作ブログサイトの投稿フロー改善に挑戦してみました。
これからはブログ更新のハードルが一気に下がったので、これからどんどんブログを更新しようと思います。

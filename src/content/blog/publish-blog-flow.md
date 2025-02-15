---
title: "自作ブログサイトの投稿フローを整備した話"
description: "自作ブログサイトの投稿フローの効率化方法について説明します。"
pubDate: "Feb 15 2025"
heroImage: "/blog-placeholder-4.jpg"
blogID: "01JM4JYQ9Q9G2F7X20JVNRMBEY"
---

#### はじめに

私は Astro+Cloudflare Pages を使って自作ブログを運営しています。本プロジェクトはブログなどの静的コンテンツは markdown で管理し、良いね数などの動的なデータは DB で管理しています。そのためブログ更新のたびに markdown と DB を更新する必要があります。そこでファイル作成や CLI 実行が煩雑になるという問題があり、今回のフロー改善に至りました。

#### プロジェクトの説明

いきなり改善点だけを説明しても分かりづらいので、簡単にプロジェクトの説明をします。

**技術構成**

- Astro:
  - SSG が便利なフロントエンドフレームワーク
  - build 時に`md`を`html`にしてくれる。共通レイアウトなども使いやすい。
  - 記事を md で書いて公開している
- Cloudflare Pages:
  - 静的サイトのホスティングサービス
  - 基本無料で使える
  - CD を組んでいて main ブランチに merge するだけでデプロイできる
- Cloudflare Pages Function:
  - サーバーレス関数を公開できるサービス
  - 無料で 100,000 リクエスト/日まで使用可能
  - Pages の`function/`内に配置することで API を作成できる
  - Hono を使って API として使っている
- Cloudflare D1 Database:
  - SQLite 互換のサーバーレスデータベース
  - これも無料枠がでかくて便利
  - 記事ごとの良いね数を保存している

#### 今回のフロー改善の効果

**一覧**

効果の一覧は以下の通りです。

| 項目                                         | 改善前                            | 改善後       |
| -------------------------------------------- | --------------------------------- | ------------ |
| md ファイルの作成                            | 手作業                            | 自動化       |
| ULID の採番                                  | ULID Generator のサイトからコピペ | 自動化       |
| レコード追加のためのマイグレーションファイル | 手書き                            | 自動化       |
| マイグレーションの実行                       | CLI 手打ち                        | コマンド実行 |

**個別の説明**

ここからは、それぞれの改善点がどのように良くなったかを説明します。

★md ファイルの作成

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

これまでは手作業で md ファイルを作成して、ULID 生成サイトから ID をコピペしてきて、DB 側と一致させていましたが、
`make blog/new`コマンドでテンプレートから自動作成するようにしました。

★ ULID の採番

これは Astro 側で管理している markdown と DB のレコードを一致させるために必要になります。ULID は shell で実行するツールで良さげなものがなかったので毎回 ULID を生成サイトに頼っていました。今回は`make blog/new`コマンドの実行時に ULID を生成する TS ファイルを実行するようにしました。npm に便利な[ulid](https://www.npmjs.com/package/ulid)ライブラリがあるのでそれを使っています。

★ マイグレーションファイルの作成

本プロジェクトでは良いね機能のために各記事の"良いね数"をテーブルに保存しています。

blogs テーブル

```sql
CREATE TABLE blogs (
  id TEXT PRIMARY KEY, -- md側と一致させる
  name TEXT,
  like_count INTEGER -- 良いね数
);
```

migration には wrangler(cloudflare の CLI)でマイグレーションファイルを作成して、クエリを書く必要があります。こちらも`make blog/new`コマンドで md といっしょにマイグレーションファイルも自動生成するようにしました。

★ マイグレーションの実行

マイグレーションは wrangler の CLI で行います。
`bunx wrangler d1 migrations apply <DB_NAME> --remote`を毎回打つのが面倒でした。そこで今回は`make migrate/local`、`make migrate/remote`を作成してコマンドを実行するようにしました。

#### 詰まったこと&学び

**make コマンド上でロジックを書くのが難しかった**

make の中でロジックを書くと変数の管理が面倒になったり、shell のパイプが複雑で見づらくなることがありました。

shell でロジックを書いて make で呼び出すという格好にしたところ簡潔になり、実装も楽になりました。タスクランナーとして使っているので呼び出しだけを書くほうが見やすくなりました。

**ULID を生成するツールの選定が難しかった**

shell で使えるツールで良いものが見つからなかったので、npm パッケージを使うことにしました。
ulid の部分のみ ts ファイルで実行する格好になったので少し格好悪くなりましたが、使い勝手は良くなりました。

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

# get tittle from input
read -p "Enter title: " title
if [ -z "$title" ]; then
    echo "Error: Title cannot be empty."
    exit 1
fi

tittle=$title
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

#### まとめ

今回は自作ブログサイトの投稿フロー改善に挑戦してみました。
はじめは npm パッケージに頼る部分、wrangler 実行、 shell でのファイル作成などが色々あって make コマンドとしてどうまとめようか迷いました。きれいに作ろうとするよりもコマンドとしての使い勝手を優先しようと考えたところ思いのほかスムーズに実装できました。体験設計から逆算して作っていくのが良いなと感じました。いろいろやってみて Zenn ってすごいなぁと思いましたね、、。それはさておき、今回の修正でブログ更新のハードルが一気に下がったので、これからどんどんブログを更新しようと思います。

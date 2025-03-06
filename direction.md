# OGP イメージを生成する関数を Cloudflare Pages Function にデプロイすることで ogp の image を動的に生成して返却する

# 想定されるタスク

- 画像生成関数の作成

  - canvas に og-template.png を描画する
  - その上からタイトルの文字列を描画する
  - png として画像にして返却する

- 関数を functions/ディレクトリに配置する
  - 既存の API 実装とルーティングが干渉するので修正する
  - API は/api/\*\*に画像生成は/image/og などに割り当ててファイルベースドルーティングを行う
    
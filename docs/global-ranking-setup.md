# 全ユーザー共通ランキングの有効化手順

ゲームの共通ランキング用コードは `functions/api/rankings.js` に入っています。
Cloudflare Pages の D1 バインディング名を `DB` にすると、自動で有効になります。

## 手順

1. Cloudflare ダッシュボードで D1 データベースを作成する
2. Pages プロジェクト `one-minute-tools` を開く
3. Settings -> Functions -> D1 database bindings を開く
4. Variable name に `DB` を指定する
5. 作成した D1 データベースを選んで保存する
6. 再デプロイする

## 動作

- `DB` が未設定の場合: 端末内ランキングだけ表示します
- `DB` が設定済みの場合: `/api/rankings` がスコアを保存し、みんなのランキングを表示します
- テーブルは初回アクセス時に自動作成されます

保存する情報はゲーム名、匿名プレイヤーID、スコア、日時だけです。

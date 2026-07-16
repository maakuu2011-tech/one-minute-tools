# 1分ツール

仕事や生活の「ちょっと困った」をすぐ片づける小ツール集です。

- 本番サイト: https://1mintool.com/
- 運用状況: [`docs/project-status.md`](docs/project-status.md)
- 運営基準: [`docs/site-operations.md`](docs/site-operations.md)
- Codex運用ガイド: [`AGENTS.md`](AGENTS.md)

## 開発

```bash
npm install
npm run dev
```

Windows PowerShellで実行ポリシーのエラーが出る場合は、`npm.cmd` を使用します。

```powershell
npm.cmd install
npm.cmd run dev
```

## ビルド

```bash
npm run build
```

`main` ブランチへpushすると、Cloudflare Pagesが本番サイトへ自動反映します。

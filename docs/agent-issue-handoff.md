# ChatGPT / Work → 自宅PCの実装フロー

このリポジトリの公開Issueを、ChatGPT / Work（iPhoneを含む）から作業指示の受け渡しに使います。公開Issueには機密情報を書かないでください。`main` へのpushは本番デプロイにつながるため、ローカルランナーは別ブランチにドラフトPRだけを作ります。マージは人が差分とレポートを確認してから行います。

## 使い始める前に

1. 自宅Windowsに通常の `claude` CLI、`codex` CLI、GitHub CLI、Node.js、Gitを用意します。`claude` CLIがない場合は、[AnthropicのWindows向け案内](https://code.claude.com/docs/en/setup)に従いPowerShellで `winget install Anthropic.ClaudeCode` を実行し、新しいPowerShellを開いてください。AgentCodeGUIのアプリ内ログインは通常のCLIに引き継がれるとは限りません。
2. PowerShellで `claude auth login` を実行し、`claude auth status` と `codex.exe login status` が通ることを確認します。GitHub CLIには既存のGit Credential Manager認証を実行時だけ渡します。認証情報はファイルに保存しません。
3. このPCには新しい `codex.exe` があり、ログイン済みです。別に入っている古い `codex.cmd` は現在の設定で起動エラーになるため、ランナーは `codex.exe` を使います。
4. 作業前に `npm.cmd ci` と `npm.cmd run build` が通常のリポジトリで通ることを確認します。

## 1件の開始方法

1. ChatGPT / Workに依頼し、`maakuu2011-tech/one-minute-tools` にIssueを作ります。Issueはリポジトリ所有者 `maakuu2011-tech` が作成し、目的、対象ページ、受け入れ条件を書きます。
2. 内容を確認した後、所有者がIssueに `agent-approved` ラベルを付けます。ラベルが実行承認です。外部の人が作ったIssueやラベル付与者が所有者でないIssueは実行しません。
3. 自宅PCで次を実行します。`--dry-run` は承認確認だけをします。

```powershell
cd C:\Users\maaku\Documents\Codex\one-minute-tools
node automation\agent-issue-runner.mjs --issue 123 --dry-run
node automation\agent-issue-runner.mjs --issue 123
```

`--scan` は未実行の承認済みIssueを最大1件探します。CLIログイン後、次のコマンドで1時間ごとのWindowsタスクを登録できます。最初のコマンドは登録内容を表示するだけです。タスクはPCが起動し、同じWindowsユーザーがサインインしている時だけ動きます。

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\automation\register-agent-issue-task.ps1 -DryRun
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\automation\register-agent-issue-task.ps1
```

## 停止条件と確認場所

- ランナーはIssue本文をコマンドとして実行せず、Claude Codeにはファイルの読み書きだけを許します。ビルドとGit操作は固定されたコマンドでランナーが行います。
- 実装は最大12ターン・推定2米ドル、指摘修正は最大6ターン・推定1米ドル、Codexレビューは最大2回です。各エージェントは10分以内、1回の起動でIssueは最大1件、1日の開始は最大2件です。変更は最大20ファイル・差分100KBで停止します。費用上限はClaude Code側の推定額に基づき、実際の請求の厳密な上限ではありません。Codex CLIにはこのランナーから厳密なトークン上限を設定できないため、回数・時間・差分量で使用量を抑えます。
- 作業ブランチとログはリポジトリとは別の `C:\Users\maaku\Documents\Codex\one-minute-tools-agent-runs` に残ります。Issueごとの再実行は自動では行いません。異常終了後に `runner.lock` が残った場合は、実行中のプロセスがないことを確かめてから手動で取り除きます。
- ビルド失敗、レビュー不備、CLIエラーでは停止します。成功時はドラフトPRとIssueコメントにリンクが残ります。ChatGPT / Workには「このリポジトリの新しいドラフトPRを確認して」と依頼すれば、差分とレポートを読み取れます。
- PRを確認して明示的にマージするまで本番サイトには反映されません。ランナー自身はマージもデプロイもしません。Cloudflare Pagesでブランチのプレビュー公開が有効なら、PR用ブランチのpush時にプレビューが作られる可能性があります。

Codex CLIの非対話レビューと出力形式は[OpenAIの例](https://developers.openai.com/cookbook/examples/codex/build_iterative_repair_loops_with_codex)に、Claude Codeのターン数・費用制限・権限設定は[AnthropicのCLIリファレンス](https://code.claude.com/docs/en/cli-reference)に基づきます。

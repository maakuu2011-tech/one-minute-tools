$ErrorActionPreference = 'Stop'
$repository = Split-Path -Parent $PSScriptRoot
$runtime = Join-Path (Split-Path -Parent $repository) 'one-minute-tools-agent-runs'
New-Item -ItemType Directory -Path $runtime -Force | Out-Null
$log = Join-Path $runtime 'scan.log'

try {
  "$(Get-Date -Format o) scan started" | Add-Content -LiteralPath $log -Encoding UTF8
  & node.exe (Join-Path $PSScriptRoot 'agent-issue-runner.mjs') --scan *>> $log
  exit $LASTEXITCODE
}
catch {
  "$(Get-Date -Format o) scan failed: $($_.Exception.Message)" | Add-Content -LiteralPath $log -Encoding UTF8
  exit 1
}

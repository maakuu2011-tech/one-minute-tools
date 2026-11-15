param([switch]$DryRun)

$ErrorActionPreference = 'Stop'
$repository = Split-Path -Parent $PSScriptRoot
$scanner = Join-Path $PSScriptRoot 'run-agent-issue-scan.ps1'
$taskName = 'OneMinuteToolsApprovedIssues'

if (-not $DryRun) {
  foreach ($command in @('node.exe', 'git.exe', 'gh.exe', 'codex.exe', 'claude.exe')) {
    if (-not (Get-Command $command -ErrorAction SilentlyContinue)) {
      throw "$command is unavailable. Install and authenticate the CLI before registering the task."
    }
  }
  & claude.exe auth status | Out-Null
  if ($LASTEXITCODE -ne 0) { throw 'Claude Code CLI is not signed in.' }
  & codex.exe login status | Out-Null
  if ($LASTEXITCODE -ne 0) { throw 'Codex CLI is not signed in.' }
}

$action = New-ScheduledTaskAction -Execute "$env:WINDIR\System32\WindowsPowerShell\v1.0\powershell.exe" `
  -Argument "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$scanner`"" `
  -WorkingDirectory $repository
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(2) `
  -RepetitionInterval (New-TimeSpan -Hours 1) -RepetitionDuration (New-TimeSpan -Days 3650)
$principal = New-ScheduledTaskPrincipal -UserId ([Security.Principal.WindowsIdentity]::GetCurrent().Name) `
  -LogonType Interactive -RunLevel Limited
$settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Minutes 50) `
  -MultipleInstances IgnoreNew -StartWhenAvailable

if ($DryRun) {
  "Would register $taskName for the signed-in user, once per hour."
  "Scanner: $scanner"
  exit 0
}

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger `
  -Principal $principal -Settings $settings -Description 'Checks owner-approved Issues and creates draft PRs' -Force | Out-Null
"Registered $taskName. The first scan starts in about two minutes."

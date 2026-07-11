Param(
  [string]$TaskName = "Apex-IndicatorLab-Monthly",
  [string]$RunnerPs1 = "C:\Apex\code\scripts\windows\run_indicator_lab_monthly.ps1",
  [string]$StartTime = "03:10",
  [int]$DayOfMonth = 1
)

$ErrorActionPreference = "Stop"

if (!(Test-Path $RunnerPs1)) {
  throw "Runner script not found: $RunnerPs1"
}
if ($DayOfMonth -lt 1 -or $DayOfMonth -gt 31) {
  throw "DayOfMonth must be between 1 and 31"
}

$taskCmd = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$RunnerPs1`""

try {
  schtasks /Delete /TN $TaskName /F | Out-Null
} catch {
  # ignore if task doesn't exist
}

schtasks /Create /TN $TaskName /TR $taskCmd /SC MONTHLY /D $DayOfMonth /ST $StartTime /F | Out-Null
Write-Host "Installed scheduled task '$TaskName' (monthly day $DayOfMonth at $StartTime)."
Write-Host "Run now (optional): schtasks /Run /TN `"$TaskName`""

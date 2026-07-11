Param(
  [string]$CodeRoot = "C:\Apex\code",
  [string]$AlphaRoot = "",
  [string]$Mql4Path = "C:\Users\Administrator\AppData\Roaming\MetaQuotes\Terminal\0727F3F88B5F0FE006962B330B91FF37\MQL4",
  [string]$RunRoot = "C:\Apex\cert\indicator_lab_monthly",
  [string]$Symbols = "AUDCAD,AUDCHF,AUDJPY,AUDNZD,AUDUSD,CADCHF,CADJPY,CHFJPY,EURAUD,EURCAD,EURCHF,EURGBP,EURJPY,EURNZD,EURUSD,GBPAUD,GBPCAD,GBPCHF,GBPJPY,GBPNZD,GBPUSD,NZDCAD,NZDCHF,NZDJPY,NZDUSD,USDCAD,USDCHF,USDJPY,XAUUSD",
  [string]$SeedTimeframes = "M1,M5,M15,H1,H4,D1",
  [string]$SeedFromDate = "2020-01-01",
  [int]$RollingWindowDays = 1825,
  [switch]$SkipSeedRefresh,
  [switch]$AllowSkipSeedRefresh,
  [switch]$UseCalibratedBrokerCosts,
  [string]$AccountReportHtml = "",
  [string]$BrokerCostCsv = "",
  [int]$SeedDownloadRetries = 6,
  [int]$SeedDownloadTimeoutMin = 20,
  [int]$SeedBatchPauseMs = 2500,
  [int]$SeedCommandRetries = 3,
  [int]$SeedRetryPauseSec = 20,
  [int]$SeedMinPresentFilesOnFailure = 80,
  [int]$TopN = 16,
  [ValidateSet("LIVE","WATCH")]
  [string]$PublishMode = "LIVE"
)

$ErrorActionPreference = "Stop"

if($SkipSeedRefresh -and -not $AllowSkipSeedRefresh){
  throw "SkipSeedRefresh is blocked for monthly production runs. Remove -SkipSeedRefresh (or add -AllowSkipSeedRefresh for manual debug only)."
}

if([string]::IsNullOrWhiteSpace($AlphaRoot)){
  $AlphaRoot = Join-Path $CodeRoot "alpha_discovery_factory"
}

$ExternalSeed = Join-Path $CodeRoot "scripts\apex_external_seed_pipeline.py"
$MainLab = Join-Path $AlphaRoot "main_indicator_lab.py"
$Publish = Join-Path $CodeRoot "scripts\apex_publish_indicator_lab_policy.py"
$Bridge = Join-Path $CodeRoot "scripts\apex_scalp_execution_bridge.py"
$LiveEdgeParser = Join-Path $CodeRoot "scripts\mt4_detailed_report_edge.py"
$CostCalibrationModule = "src.cost_calibration"
$BrokerYaml = Join-Path $AlphaRoot "config\broker_costs.yaml"
$BrokerYamlCal = Join-Path $AlphaRoot "config\broker_costs_calibrated.yaml"
$PublishCfg = Join-Path $AlphaRoot "config\live_publish.yaml"
$LeaderCsv = Join-Path $AlphaRoot "output_indicator_lab\ranker\leaderboard.csv"
$SpecsCsv = Join-Path $AlphaRoot "output_indicator_lab\strategy_builder\strategy_specs.csv"
$SeedOutDir = Join-Path $CodeRoot "outputs\seeds\dukascopy_bid_2020_2025"

$PolicyCsv = Join-Path $Mql4Path "Files\ApexScalpPolicy.csv"
$ExecPolicyCsv = Join-Path $Mql4Path "Files\ApexScalpExecutionPolicy.csv"
$ReadyMarker = Join-Path $Mql4Path "Files\ApexScalpExecutionPolicy.ready"
$WfCsv = Join-Path $Mql4Path "Files\ApexWalkForwardCandidates.csv"
$MonthlyCsv = Join-Path $Mql4Path "Files\ApexMonthlyPolicy.csv"
$PolicyCsvNext = Join-Path $Mql4Path "Files\ApexScalpPolicy.next.csv"
$ExecPolicyCsvNext = Join-Path $Mql4Path "Files\ApexScalpExecutionPolicy.next.csv"
$WfCsvNext = Join-Path $Mql4Path "Files\ApexWalkForwardCandidates.next.csv"
$MonthlyCsvNext = Join-Path $Mql4Path "Files\ApexMonthlyPolicy.next.csv"

if(!(Test-Path $ExternalSeed)){ throw "Missing: $ExternalSeed" }
if(!(Test-Path $MainLab)){ throw "Missing: $MainLab" }
if(!(Test-Path $Publish)){ throw "Missing: $Publish" }
if(!(Test-Path $Bridge)){ throw "Missing: $Bridge" }
if(!(Test-Path $LiveEdgeParser)){ throw "Missing: $LiveEdgeParser" }
if(!(Test-Path "$Mql4Path\Files")){ throw "Missing MQL4 Files folder: $Mql4Path\Files" }
if(!(Test-Path $BrokerYaml)){ throw "Missing broker config: $BrokerYaml" }

function Resolve-PythonCommand{
  $candidates = @()
  if(Get-Command python -ErrorAction SilentlyContinue){
    $candidates += "python"
  }
  if(Get-Command py -ErrorAction SilentlyContinue){
    $candidates += "py:-3"
  }

  # Common per-user installs (useful when scheduled task runs under a different account).
  foreach($p in @(
    "$env:LOCALAPPDATA\Programs\Python\Python311\python.exe",
    "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe",
    "$env:LOCALAPPDATA\Programs\Python\Python313\python.exe",
    "$env:LOCALAPPDATA\Programs\Python\Python314\python.exe",
    "C:\Users\Administrator\AppData\Local\Programs\Python\Python311\python.exe",
    "C:\Users\Administrator\AppData\Local\Programs\Python\Python312\python.exe",
    "C:\Users\Administrator\AppData\Local\Programs\Python\Python313\python.exe",
    "C:\Users\Administrator\AppData\Local\Programs\Python\Python314\python.exe",
    "C:\Python311\python.exe",
    "C:\Python312\python.exe",
    "C:\Python313\python.exe",
    "C:\Python314\python.exe"
  )){
    if(Test-Path $p){ $candidates += $p }
  }

  foreach($c in $candidates){
    if($c -eq "python"){
      return [PSCustomObject]@{ Cmd = "python"; Args = @() }
    }
    if($c -eq "py:-3"){
      return [PSCustomObject]@{ Cmd = "py"; Args = @("-3") }
    }
    if(Test-Path $c){
      return [PSCustomObject]@{ Cmd = $c; Args = @() }
    }
  }
  return $null
}

$pyResolved = Resolve-PythonCommand
if($null -eq $pyResolved){
  throw "No Python launcher found (python/py/common absolute paths)."
}
$PY = [string]$pyResolved.Cmd
$PYV = @($pyResolved.Args)

$ts = Get-Date -Format "yyyyMMdd_HHmmss"
$RunDir = Join-Path $RunRoot "runs\$ts"
New-Item -ItemType Directory -Force -Path $RunDir | Out-Null
$Log = Join-Path $RunDir "run.log"

function Log([string]$m){
  $line = "[{0}] {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $m
  Write-Host $line
  $wrote = $false
  for($i = 0; $i -lt 6; $i++){
    try {
      Add-Content -Path $Log -Value $line -ErrorAction Stop
      $wrote = $true
      break
    } catch {
      Start-Sleep -Milliseconds 100
    }
  }
  if(-not $wrote){
    # Do not abort the run because log file was temporarily locked by Tee-Object.
    Write-Warning "Log write skipped (file lock): $Log"
  }
}

function Exec([string[]]$cmd, [string]$cwd = ""){
  Log ('$ ' + ($cmd -join ' '))
  $prevEap = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  $rc = 0
  try {
    if([string]::IsNullOrWhiteSpace($cwd)){
      & $cmd[0] $cmd[1..($cmd.Count-1)] 2>&1 | Tee-Object -FilePath $Log -Append | Out-Host
      $rc = $LASTEXITCODE
    } else {
      Push-Location $cwd
      try {
        & $cmd[0] $cmd[1..($cmd.Count-1)] 2>&1 | Tee-Object -FilePath $Log -Append | Out-Host
        $rc = $LASTEXITCODE
      } finally {
        Pop-Location
      }
    }
  } finally {
    $ErrorActionPreference = $prevEap
  }
  return [int]$rc
}

function Get-SymbolCsv([string]$raw){
  $arr = @()
  foreach($x in ($raw -split ",|;")){
    $s = $x.Trim().ToUpper()
    if($s){ $arr += $s }
  }
  return (($arr | Sort-Object -Unique) -join ",")
}

function ParseCsvList([string]$raw){
  $arr = @()
  foreach($x in ($raw -split ",|;")){
    $s = $x.Trim().ToUpper()
    if($s){ $arr += $s }
  }
  return ($arr | Sort-Object -Unique)
}

function Ensure-NonEmptyFile([string]$path, [string]$label){
  if(!(Test-Path $path)){
    throw ("Missing {0}: {1}" -f $label, $path)
  }
  $len = (Get-Item $path).Length
  if($len -le 0){
    throw ("{0} is empty: {1}" -f $label, $path)
  }
}

function Swap-InPlace([string]$src, [string]$dst, [string]$histDir, [string]$tsTag){
  Ensure-NonEmptyFile $src "staged file"
  if(Test-Path $dst){
    $base = [System.IO.Path]::GetFileNameWithoutExtension($dst)
    $ext = [System.IO.Path]::GetExtension($dst)
    $bak = Join-Path $histDir ($base + "_swapbak_" + $tsTag + $ext)
    try {
      [System.IO.File]::Replace($src, $dst, $bak, $true)
    } catch {
      Copy-Item -Path $src -Destination $dst -Force
      Remove-Item -Path $src -Force -ErrorAction SilentlyContinue
    }
  } else {
    Move-Item -Path $src -Destination $dst -Force
  }
}

function GetSeedCoverageStats([string]$seedDir, [string]$symbolsCsv, [string]$tfCsv){
  $symbols = ParseCsvList $symbolsCsv
  $tfs = ParseCsvList $tfCsv
  $expected = $symbols.Count * $tfs.Count
  $present = 0
  $missing = @()
  foreach($s in $symbols){
    foreach($tf in $tfs){
      $p = Join-Path $seedDir ("seed_{0}_{1}.csv" -f $s, $tf)
      if(!(Test-Path $p)){
        $missing += $p
      } else {
        try {
          $lines = (Get-Content $p -TotalCount 3 | Measure-Object).Count
          if($lines -lt 2){
            $missing += $p
          } else {
            $present += 1
          }
        } catch {
          $missing += $p
        }
      }
    }
  }
  $pct = 0.0
  if($expected -gt 0){
    $pct = [Math]::Round((100.0 * $present) / $expected, 2)
  }
  return [PSCustomObject]@{
    Expected = $expected
    Present = $present
    Missing = $missing
    CoveragePct = $pct
  }
}

Log "Indicator-lab monthly run start"
Log "CodeRoot=$CodeRoot AlphaRoot=$AlphaRoot"
Log "Mql4Path=$Mql4Path"
Log "PythonCmd=$PY"

if([string]::IsNullOrWhiteSpace($AccountReportHtml)){
  $cand = Join-Path $Mql4Path "Files\AccountHistory_Detailed.htm"
  if(Test-Path $cand){ $AccountReportHtml = $cand }
}

# Keep existing ready marker/policy active while rebuild runs.
# We only swap to new policy files after full successful publish.
$ymNow = (Get-Date).ToUniversalTime().ToString("yyyyMM")
$haveExecPolicy = (Test-Path $ExecPolicyCsv) -and ((Get-Item $ExecPolicyCsv).Length -gt 0)
if($haveExecPolicy){
  $markerValue = ""
  if(Test-Path $ReadyMarker){
    try { $markerValue = (Get-Content -Path $ReadyMarker -Raw).Trim() } catch { $markerValue = "" }
  }
  if($markerValue -ne $ymNow){
    Set-Content -Path $ReadyMarker -Value $ymNow -Encoding ASCII
    Log "Carry-forward ready marker set for ongoing trading during rebuild: $ReadyMarker ym=$ymNow"
  } else {
    Log "Ready marker already current: $ReadyMarker ym=$ymNow"
  }
} else {
  Log "No existing execution policy found; trading remains paused until first successful publish."
}

$symbolsCsv = Get-SymbolCsv $Symbols
if([string]::IsNullOrWhiteSpace($symbolsCsv)){
  throw "No symbols provided"
}

$seedFromEffective = $SeedFromDate
if($RollingWindowDays -gt 0){
  try {
    $seedFloorDate = [DateTime]::Parse($SeedFromDate).ToUniversalTime().Date
    $rollingDate = (Get-Date).ToUniversalTime().Date.AddDays(-1 * $RollingWindowDays)
    if($rollingDate -gt $seedFloorDate){
      $seedFromEffective = $rollingDate.ToString("yyyy-MM-dd")
    } else {
      $seedFromEffective = $seedFloorDate.ToString("yyyy-MM-dd")
    }
  } catch {
    throw "Invalid SeedFromDate '$SeedFromDate' (expected YYYY-MM-DD)"
  }
}

if(-not $SkipSeedRefresh){
  New-Item -ItemType Directory -Force -Path $SeedOutDir | Out-Null
  $downloadRoot = Join-Path $RunRoot "dukascopy_cache"
  New-Item -ItemType Directory -Force -Path $downloadRoot | Out-Null
  $toDate = (Get-Date).ToUniversalTime().ToString("yyyy-MM-dd")

  $seedCmd = @($PY) + $PYV + @(
    "-u", $ExternalSeed,
    "--symbols", $symbolsCsv,
    "--download",
    "--from-date", $seedFromEffective,
    "--to-date", $toDate,
    "--download-root", $downloadRoot,
    "--download-timeframes", $SeedTimeframes,
    "--timeframes", $SeedTimeframes,
    "--out-dir", $SeedOutDir,
    "--drop-weekends",
    "--prefer-mid",
    "--include-single-side",
    "--download-retries", "$SeedDownloadRetries",
    "--download-timeout-min", "$SeedDownloadTimeoutMin",
    "--batch-pause-ms", "$SeedBatchPauseMs"
  )
  $seedHelp = (& $PY @PYV "-u" $ExternalSeed "--help" 2>&1 | Out-String)
  if($seedHelp -match "--npx-exe"){
    $seedCmd += @("--npx-exe", "npx.cmd")
  } else {
    Log "Seeder does not support --npx-exe; continuing without it."
  }
  Log "Seed refresh start symbols=$symbolsCsv from=$seedFromEffective to=$toDate rollingWindowDays=$RollingWindowDays"
  $seedRc = 1
  $attemptMax = [Math]::Max(1, $SeedCommandRetries)
  for($a = 1; $a -le $attemptMax; $a++){
    Log "Seed refresh command attempt=$a/$attemptMax"
    $seedRc = Exec $seedCmd
    if($seedRc -eq 0){ break }
    Log "Seed refresh command failed rc=$seedRc"
    if($a -lt $attemptMax){
      Start-Sleep -Seconds ([Math]::Max(1, $SeedRetryPauseSec))
    }
  }
  $coverage = GetSeedCoverageStats $SeedOutDir $symbolsCsv $SeedTimeframes
  Log ("Seed coverage summary present={0}/{1} missing={2} coveragePct={3}" -f `
    $coverage.Present, $coverage.Expected, $coverage.Missing.Count, $coverage.CoveragePct)
  if($seedRc -ne 0){
    if($coverage.Present -lt [Math]::Max(1, $SeedMinPresentFilesOnFailure)){
      $sampleMissing = (($coverage.Missing | Select-Object -First 8) -join "; ")
      throw "Seed refresh failed rc=$seedRc and usable seed coverage is too low (present=$($coverage.Present)/$($coverage.Expected), minPresent=$SeedMinPresentFilesOnFailure). Missing samples: $sampleMissing"
    }
    Log "Seed refresh failed rc=$seedRc but existing seed coverage is sufficient; continuing."
  }
}

# Optional broker-cost calibration using live statement + broker cost table.
$brokerConfigToUse = $BrokerYaml
if($UseCalibratedBrokerCosts){
  $summaryCsv = Join-Path $AlphaRoot "output_indicator_lab\cost_calibration\cost_calibration_summary.csv"
  New-Item -ItemType Directory -Force -Path (Split-Path $summaryCsv) | Out-Null

  if([string]::IsNullOrWhiteSpace($BrokerCostCsv)){
    $analysisDir = Join-Path $CodeRoot "outputs\analysis"
    if(Test-Path $analysisDir){
      $latestCost = Get-ChildItem -Path $analysisDir -Filter "roboforex_procent_costs_*.csv" -File -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1
      if($latestCost){
        $BrokerCostCsv = $latestCost.FullName
      }
    }
  }

  if([string]::IsNullOrWhiteSpace($AccountReportHtml)){
    $cand = Join-Path $Mql4Path "Files\AccountHistory_Detailed.htm"
    if(Test-Path $cand){ $AccountReportHtml = $cand }
  }

  $calCmd = @($PY) + $PYV + @(
    "-m", $CostCalibrationModule,
    "--broker-yaml-in", $BrokerYaml,
    "--broker-yaml-out", $BrokerYamlCal,
    "--summary-csv-out", $summaryCsv
  )

  if(-not [string]::IsNullOrWhiteSpace($AccountReportHtml) -and (Test-Path $AccountReportHtml)){
    $calCmd += @("--report-html", $AccountReportHtml)
    Log "Cost calibration using MT4 report: $AccountReportHtml"
  } else {
    Log "Cost calibration: no MT4 report found (skipping report input)"
  }

  if(-not [string]::IsNullOrWhiteSpace($BrokerCostCsv) -and (Test-Path $BrokerCostCsv)){
    $calCmd += @("--cost-table-csv", $BrokerCostCsv)
    Log "Cost calibration using broker-cost CSV: $BrokerCostCsv"
  } else {
    Log "Cost calibration: no broker-cost CSV provided/found"
  }

  $rc = Exec $calCmd $AlphaRoot
  if($rc -ne 0){ throw "Cost calibration failed rc=$rc" }
  if(Test-Path $BrokerYamlCal){
    $brokerConfigToUse = $BrokerYamlCal
  }
}

$labCmd = @($PY) + $PYV + @(
  "-u", $MainLab,
  "--config-dir", "config",
  "--symbols-config", "symbols.yaml",
  "--data-config", "data_indicator_lab.yaml",
  "--broker-config", (Split-Path $brokerConfigToUse -Leaf),
  "--lab-config", "indicator_lab.yaml"
)

Log "Indicator lab run start broker_config=$brokerConfigToUse"
$rc = Exec $labCmd $AlphaRoot
if($rc -ne 0){ throw "Indicator lab run failed rc=$rc" }

if(!(Test-Path $LeaderCsv)){ throw "Missing leaderboard: $LeaderCsv" }
if(!(Test-Path $SpecsCsv)){ throw "Missing strategy specs: $SpecsCsv" }

$liveTradesCsv = Join-Path $RunDir "live_trades.csv"
$liveSummaryCsv = Join-Path $RunDir "live_edge_summary.csv"
if(-not [string]::IsNullOrWhiteSpace($AccountReportHtml) -and (Test-Path $AccountReportHtml)){
  $liveCmd = @($PY) + $PYV + @(
    "-u", $LiveEdgeParser,
    "--report-html", $AccountReportHtml,
    "--out-trades-csv", $liveTradesCsv,
    "--out-summary-csv", $liveSummaryCsv
  )
  if(-not [string]::IsNullOrWhiteSpace($BrokerCostCsv) -and (Test-Path $BrokerCostCsv)){
    $liveCmd += @("--cost-table-csv", $BrokerCostCsv)
  }
  Log "Live-trade extraction start report=$AccountReportHtml"
  $liveRc = Exec $liveCmd
  if($liveRc -ne 0){
    Log "Live-trade extraction failed rc=$liveRc (continuing without Bayesian overlay input)"
    $liveTradesCsv = ""
  }
} else {
  Log "Live-trade extraction skipped (AccountHistory_Detailed.htm not found)"
  $liveTradesCsv = ""
}

$histDir = Join-Path $RunRoot "published_history"
New-Item -ItemType Directory -Force -Path $histDir | Out-Null
foreach($p in @($PolicyCsv, $ExecPolicyCsv, $WfCsv, $MonthlyCsv)){
  if(Test-Path $p){
    $base = [System.IO.Path]::GetFileNameWithoutExtension($p)
    $ext = [System.IO.Path]::GetExtension($p)
    Copy-Item $p (Join-Path $histDir ($base + "_prepublish_" + $ts + $ext)) -Force
  }
}

foreach($p in @($PolicyCsvNext, $ExecPolicyCsvNext, $WfCsvNext, $MonthlyCsvNext)){
  if(Test-Path $p){
    Remove-Item $p -Force -ErrorAction SilentlyContinue
  }
}

$publishCmd = @($PY) + $PYV + @(
  "-u", $Publish,
  "--leaderboard-csv", $LeaderCsv,
  "--strategy-specs-csv", $SpecsCsv,
  "--out-policy-csv", $PolicyCsvNext,
  "--out-exec-policy-csv", $ExecPolicyCsvNext,
  "--out-wf-csv", $WfCsvNext,
  "--out-monthly-csv", $MonthlyCsvNext,
  "--bridge-script", $Bridge,
  "--top-n", "$TopN",
  "--mode", $PublishMode,
  "--require-exact-state",
  "--publish-config", $PublishCfg,
  "--python", $PY,
  "--source-tag", "indicator-lab-monthly-v1"
)
if(-not [string]::IsNullOrWhiteSpace($liveTradesCsv) -and (Test-Path $liveTradesCsv)){
  $publishCmd += @("--live-trades-csv", $liveTradesCsv)
}

Log "Live policy publish start topN=$TopN mode=$PublishMode"
$rc = Exec $publishCmd
if($rc -ne 0){ throw "Publish failed rc=$rc" }

Ensure-NonEmptyFile $PolicyCsvNext "staged policy csv"
Ensure-NonEmptyFile $ExecPolicyCsvNext "staged execution policy csv"
Ensure-NonEmptyFile $WfCsvNext "staged walk-forward csv"
Ensure-NonEmptyFile $MonthlyCsvNext "staged monthly csv"
$execRows = (Import-Csv $ExecPolicyCsvNext | Measure-Object).Count
if($execRows -lt 1){
  throw "Publish produced zero execution-policy rows; refusing live swap."
}
Log "Staged publish validated exec_rows=$execRows"

Log "Swapping staged policy files into live paths..."
Swap-InPlace $PolicyCsvNext $PolicyCsv $histDir $ts
Swap-InPlace $ExecPolicyCsvNext $ExecPolicyCsv $histDir $ts
Swap-InPlace $WfCsvNext $WfCsv $histDir $ts
Swap-InPlace $MonthlyCsvNext $MonthlyCsv $histDir $ts
Log "Live policy swap complete."

Copy-Item $PolicyCsv (Join-Path $histDir ("ApexScalpPolicy_" + $ts + ".csv")) -Force
Copy-Item $ExecPolicyCsv (Join-Path $histDir ("ApexScalpExecutionPolicy_" + $ts + ".csv")) -Force
Copy-Item $WfCsv (Join-Path $histDir ("ApexWalkForwardCandidates_" + $ts + ".csv")) -Force
Copy-Item $MonthlyCsv (Join-Path $histDir ("ApexMonthlyPolicy_" + $ts + ".csv")) -Force

# Success marker: EA should only trade when this marker exists and is current.
Set-Content -Path $ReadyMarker -Value $ymNow -Encoding ASCII
Log "Ready marker written: $ReadyMarker ym=$ymNow"

$summary = Join-Path $RunDir "summary.txt"
@(
  "run_id=$ts",
  "alpha_root=$AlphaRoot",
  "seed_dir=$SeedOutDir",
  "leaderboard=$LeaderCsv",
  "strategy_specs=$SpecsCsv",
  "policy_csv=$PolicyCsv",
  "exec_policy_csv=$ExecPolicyCsv",
  "wf_csv=$WfCsv",
  "monthly_csv=$MonthlyCsv",
  "publish_mode=$PublishMode",
  "top_n=$TopN",
  "live_trades_csv=$liveTradesCsv",
  "live_summary_csv=$liveSummaryCsv",
  "seed_from_effective=$seedFromEffective",
  "rolling_window_days=$RollingWindowDays",
  "broker_config_used=$brokerConfigToUse",
  "ready_marker=$ReadyMarker"
) | Set-Content $summary -Encoding UTF8

Log "Done. policy=$PolicyCsv exec=$ExecPolicyCsv wf=$WfCsv monthly=$MonthlyCsv"
Log "Important EA runtime switches for backtest-like execution:"
Log "  EnableScalpExecutionPolicyHook=true"
Log "  ScalpExecutionRequireMatch=true"
Log "  ScalpTradeOnlyPolicySymbols=true"
Log "  ScalpExecutionBypassEdgeAndConvictionGates=true"
Log "  ScalpExecutionBypassPortfolioRiskGates=true"
Log "  ScalpExecutionRequireStatEdge=false (recommended for strict backtest parity)"

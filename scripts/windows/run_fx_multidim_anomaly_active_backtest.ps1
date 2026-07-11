Param(
  [string]$CodeRoot = "C:\Apex\code",
  [string]$ProjectRoot = "",
  [string]$PythonCmd = "python",
  [string]$Timeframes = "M5,M15,H1,H4,D1",
  [switch]$Quick
)

$ErrorActionPreference = "Stop"

if([string]::IsNullOrWhiteSpace($ProjectRoot)){
  $ProjectRoot = Join-Path $CodeRoot "hf_portfolio_backtest\alpha_discovery_factory"
}

$Main = Join-Path $ProjectRoot "main_indicator_lab.py"
$CfgDir = Join-Path $ProjectRoot "config"
$SymbolsCfg = Join-Path $CfgDir "symbols_multidim_anomaly.yaml"
$DataCfg = Join-Path $CfgDir "data_multidim_anomaly_active.yaml"
$LabCfg = Join-Path $CfgDir "backtest_multidim_anomaly.yaml"
$BrokerCfg = Join-Path $CfgDir "broker_costs.yaml"

if(!(Test-Path $Main)){ throw "Missing: $Main" }
if(!(Test-Path $SymbolsCfg)){ throw "Missing: $SymbolsCfg" }
if(!(Test-Path $DataCfg)){ throw "Missing: $DataCfg" }
if(!(Test-Path $LabCfg)){ throw "Missing: $LabCfg" }
if(!(Test-Path $BrokerCfg)){ throw "Missing: $BrokerCfg" }

$timeframesList = @()
foreach($x in ($Timeframes -split ",|;")){
  $s = $x.Trim().ToUpper()
  if($s){ $timeframesList += $s }
}
$timeframesList = $timeframesList | Select-Object -Unique
if($Quick){
  $timeframesList = @("H1")
}

$ts = Get-Date -Format "yyyyMMdd_HHmmss"
$runRoot = Join-Path $ProjectRoot ("output\multidim_anomaly_active_{0}" -f $ts)
New-Item -ItemType Directory -Force -Path $runRoot | Out-Null

$tmpSymbols = Join-Path $runRoot "symbols.runtime.yaml"
$tmpData = Join-Path $runRoot "data.runtime.yaml"

$tmpLab = Join-Path $runRoot "backtest_multidim_anomaly.yaml"
$tmpBroker = Join-Path $runRoot "broker_costs.yaml"
Copy-Item -Path $LabCfg -Destination $tmpLab -Force
Copy-Item -Path $BrokerCfg -Destination $tmpBroker -Force

python - <<PY
import yaml
from pathlib import Path
symbols_path = Path(r"$SymbolsCfg")
data_path = Path(r"$DataCfg")
out_symbols = Path(r"$tmpSymbols")
out_data = Path(r"$tmpData")
timeframes = r"$($timeframesList -join ',')".split(',')
with symbols_path.open('r', encoding='utf-8') as f:
    s = yaml.safe_load(f)
s['timeframes'] = timeframes
with out_symbols.open('w', encoding='utf-8') as f:
    yaml.safe_dump(s, f, sort_keys=False)
with data_path.open('r', encoding='utf-8') as f:
    d = yaml.safe_load(f)
d['output_dir'] = str(Path(r"$runRoot").resolve())
with out_data.open('w', encoding='utf-8') as f:
    yaml.safe_dump(d, f, sort_keys=False)
print('Prepared runtime configs:')
print(out_symbols)
print(out_data)
PY

Push-Location $ProjectRoot
try{
  & $PythonCmd "./main_indicator_lab.py" `
    --config-dir "$runRoot" `
    --symbols-config "symbols.runtime.yaml" `
    --data-config "data.runtime.yaml" `
    --lab-config "backtest_multidim_anomaly.yaml" `
    --broker-config "broker_costs.yaml"
} finally {
  Pop-Location
}

Write-Host "Run complete. Output root: $runRoot"

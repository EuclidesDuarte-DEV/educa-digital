# V111.18: Chatterbox expressivo com REFERENCIA FEMININA OU Kokoro pf_dora.
param(
  [switch]$ComMuseTalk,
  [switch]$SomenteKokoro,  # Mantido por compatibilidade com V111.18
  [switch]$Expressiva,     # Chatterbox opcional, mais pesado
  [string]$ReferenciaFeminina = ''
)
$EducaProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$ErrorActionPreference = 'Stop'
Set-Location $EducaProjectRoot
$varsFile = Join-Path $EducaProjectRoot 'lia_motor\.motor.vars.local'
if (-not (Test-Path $varsFile)) { throw 'Execute CONFIGURAR_LIA_LOCAL_WINDOWS.ps1 para criar as credenciais.' }
$line = Get-Content $varsFile | Where-Object { $_ -match '^LIA_API_TOKEN=' } | Select-Object -First 1
if (-not $line) { throw 'LIA_API_TOKEN ausente.' }
$env:LIA_API_TOKEN = ($line -split '=',2)[1].Trim()
$python = Join-Path $EducaProjectRoot 'lia_motor\.venv\Scripts\python.exe'
if (-not (Test-Path $python)) { throw 'Ambiente Python da Lia ausente.' }
if ($SomenteKokoro -and $Expressiva) { throw 'Use apenas -SomenteKokoro OU -Expressiva.' }
$defaultRef = Join-Path $EducaProjectRoot 'lia_motor\assets\lia_voz_feminina_pf_dora.wav'
$ref = if ($ReferenciaFeminina) { $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($ReferenciaFeminina) } else { $defaultRef }
if ($Expressiva -and -not (Test-Path $ref)) {
  if ($ReferenciaFeminina) { throw 'Referencia feminina indicada nao existe. Confira o caminho WAV.' }
  Write-Host 'Criando voz feminina sintetica da Lia (Kokoro pf_dora)...' -ForegroundColor Cyan
  & $python (Join-Path $EducaProjectRoot 'lia_motor\gerar_referencia_feminina.py')
  if ($LASTEXITCODE -ne 0) {
    Write-Warning 'Falha ao gerar referencia feminina. Iniciando somente Kokoro pf_dora (feminina), sem Chatterbox.'
    $Expressiva = $false
  }
}
$env:LIA_VOICE_REFERENCE = $ref
$env:LIA_TTS_ENGINE = if ($Expressiva) { 'chatterbox' } else { 'kokoro' }
$env:LIA_PREWARM_VOICE = 'true' # Carrega Kokoro enquanto o servidor inicia
$env:LIA_MUSETALK_ENABLED = if ($ComMuseTalk) { 'true' } else { 'false' }
if ($ComMuseTalk -and -not $env:LIA_MUSETALK_DIR) { throw 'Configure LIA_MUSETALK_DIR para habilitar MuseTalk.' }
Write-Host "Lia V111.21: voz padrao $env:LIA_TTS_ENGINE; voz feminina pf_dora disponivel na videochamada." -ForegroundColor Green
Write-Host 'API local: http://127.0.0.1:8900 (nao e uma pagina web).' -ForegroundColor Cyan
Push-Location (Join-Path $EducaProjectRoot 'lia_motor')
try { & $python -m uvicorn server:app --host 127.0.0.1 --port 8900 }
finally { Pop-Location }

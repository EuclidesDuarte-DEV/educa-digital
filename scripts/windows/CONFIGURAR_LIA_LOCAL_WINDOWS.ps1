# V111.19 - Configuração local idempotente: nunca substituir segredos existentes.
$EducaProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$ErrorActionPreference = 'Stop'
Set-Location $EducaProjectRoot
$dev = Join-Path $EducaProjectRoot '.dev.vars'
$motor = Join-Path $EducaProjectRoot 'lia_motor\.motor.vars.local'
function Get-Var([string]$File,[string]$Key) {
  if (-not (Test-Path $File)) { return '' }
  $found = Get-Content -LiteralPath $File | Where-Object { $_ -match ('^' + [regex]::Escape($Key) + '=') } | Select-Object -First 1
  if (-not $found) { return '' }
  return ($found -split '=',2)[1].Trim()
}
function Write-Config([string]$File,[string]$Value) {
  [System.IO.File]::WriteAllText($File,$Value,(New-Object System.Text.UTF8Encoding($false)))
}
$hasDev = Test-Path $dev
$hasMotor = Test-Path $motor
if ($hasDev -and $hasMotor) {
  $left = Get-Var $dev 'LIA_BACKEND_TOKEN'
  $right = Get-Var $motor 'LIA_API_TOKEN'
  if ($left -and $right -and $left -ne $right) {
    throw 'Os tokens locais nao coincidem. Corrija-os manualmente sem compartilhar os valores.'
  }
  if (-not $left -or -not $right) { throw 'Configuracao incompleta. Confira as variaveis sem apagar os arquivos.' }
  Write-Host 'Credenciais existentes preservadas; motor e Worker usam o mesmo token.' -ForegroundColor Green
  exit 0
}
if ($hasDev) {
  $token = Get-Var $dev 'LIA_BACKEND_TOKEN'
  if ($token.Length -lt 20) { throw 'Arquivo .dev.vars existe mas o token esta ausente ou e curto; nao alterado.' }
  Write-Config $motor "LIA_API_TOKEN=$token`n"
  Write-Host 'Credencial do motor reparada com o token ja existente em .dev.vars.' -ForegroundColor Green
  exit 0
}
if ($hasMotor) {
  $token = Get-Var $motor 'LIA_API_TOKEN'
  if ($token.Length -lt 20) { throw 'Credencial do motor existe mas e curta; nao alterada.' }
} else {
  $token = ([guid]::NewGuid().ToString('N') + [guid]::NewGuid().ToString('N'))
  Write-Config $motor "LIA_API_TOKEN=$token`n"
}
$code = [guid]::NewGuid().ToString('N')
Write-Config $dev "LIA_ENABLED=true`nLIA_BACKEND_URL=http://127.0.0.1:8900`nLIA_BACKEND_TOKEN=$token`nLIA_STAFF_CODE=$code`n"
Write-Host 'Configuracao local criada sem sobrescrever os segredos existentes.' -ForegroundColor Green
Write-Host 'O codigo de equipe esta somente em .dev.vars (LIA_STAFF_CODE). Nao compartilhe o arquivo.' -ForegroundColor Yellow

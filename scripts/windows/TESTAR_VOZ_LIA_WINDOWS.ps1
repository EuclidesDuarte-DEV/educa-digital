# Compara a voz feminina Kokoro pf_dora e a expressiva Chatterbox da Lia.
param(
  [switch]$PreCarregar,
  [ValidateSet('feminina','expressiva')][string]$Voz = 'feminina',
  [ValidateSet('natural','calma','clara')][string]$Estilo = 'natural',
  [string]$Texto = 'Oi, tudo bem? Eu sou a Lia! Que bom te encontrar. Vamos conversar um pouquinho?'
)
$EducaProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$ErrorActionPreference = 'Stop'
Set-Location $EducaProjectRoot
$varsFile = 'lia_motor\.motor.vars.local'
if (!(Test-Path $varsFile)) { throw 'Credenciais nao encontradas. Execute CONFIGURAR_LIA_LOCAL_WINDOWS.ps1.' }
$line=Get-Content $varsFile | Where-Object {$_ -match '^LIA_API_TOKEN='} | Select-Object -First 1
if (!$line) { throw 'LIA_API_TOKEN nao encontrado.' }
$token=($line -split '=',2)[1].Trim()
$headers=@{ Authorization = 'Bearer ' + $token }
$base='http://127.0.0.1:8900'
try {
 $info=Invoke-RestMethod -Uri "$base/health" -Headers $headers -TimeoutSec 15
 Write-Host ("Motor principal: {0}; feminina Kokoro pronta: {1}" -f $info.voice_engine,$info.female_voice_ready) -ForegroundColor Cyan
 if ($Voz -eq 'expressiva' -and $info.voice_engine -ne 'chatterbox') {throw 'O motor atual esta em Kokoro. Reinicie INICIAR_LIA_VOZ_HUMANA_WINDOWS.ps1 com -Expressiva para comparar o Chatterbox.'}
 if ($Voz -eq 'expressiva' -and -not $info.voice_installed) {throw ('Motor Chatterbox indisponivel: ' + $info.voice_reason)}
 if ($Voz -eq 'feminina' -and -not $info.female_voice_ready) {throw 'Kokoro pf_dora nao esta instalado.'}
 if ($PreCarregar) {
  $preloadEngine = if ($Voz -eq 'feminina') { 'feminina' } else { 'padrao' }
  Write-Host 'Precarregando a voz escolhida para reduzir o atraso da primeira fala...' -ForegroundColor Yellow
  $ready=Invoke-RestMethod -Uri "$base/v1/lia/preload?engine=$preloadEngine" -Method Post -Headers $headers -TimeoutSec 900
  if (!$ready.voice_loaded) {throw 'O modelo nao confirmou o carregamento.'}
 }
 $engine = if ($Voz -eq 'feminina') {'feminina'} else {'padrao'}
 if ([string]::IsNullOrWhiteSpace($Texto) -or $Texto.Length -gt 450) { throw 'Use um texto entre 1 e 450 caracteres.' }
 $body=@{text=$Texto;style=$Estilo;engine=$engine} | ConvertTo-Json
 $bytes=[System.Text.Encoding]::UTF8.GetBytes($body)
 $result=Invoke-RestMethod -Uri "$base/v1/lia/speak" -Method Post -Headers $headers -ContentType 'application/json; charset=utf-8' -Body $bytes -TimeoutSec 900
 if (!$result.audio_url -or $result.audio_url -notmatch '^/v1/media/[a-f0-9]{32}\.wav$') {throw 'Nao foi gerado um WAV valido.'}
 $target=Join-Path $EducaProjectRoot ('teste_lia_' + $Voz + '_' + $Estilo + '.wav')
 Invoke-WebRequest -Uri ($base + $result.audio_url) -Headers $headers -OutFile $target -TimeoutSec 90
 if ((Get-Item $target).Length -lt 1024) {throw 'Audio incompleto.'}
 Write-Host ("Audio criado: {0} / motor {1}." -f $target,$result.voice_engine) -ForegroundColor Green
 Start-Process $target
} catch {
 Write-Host 'Falha no teste:' $_.Exception.Message -ForegroundColor Red
 Write-Host 'Confira tambem o terminal do servidor; nao compartilhe credenciais.' -ForegroundColor Yellow
 exit 1
}

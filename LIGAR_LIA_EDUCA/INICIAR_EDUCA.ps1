param([ValidateSet('ollama','voz','site')][string]$Servico='site')
$ErrorActionPreference='Stop'
$raiz=(Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$original=Join-Path $env:USERPROFILE 'Desktop\LIA_AI_INDEPENDENTE_V1_0'
$ports=@{ollama=11434;voz=8900;site=5015}
$port=$ports[$Servico]
if(Test-NetConnection -ComputerName 127.0.0.1 -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue){
 Write-Host "Servico $Servico ja ouvindo na porta $port. Nao iniciar duplicado." -ForegroundColor Yellow
 if($Servico -eq 'site'){Start-Process 'http://127.0.0.1:5015'}
 return
}
if($Servico -eq 'ollama'){
 if(-not(Get-Command ollama -ErrorAction SilentlyContinue)){throw 'Ollama nao instalado ou fora do PATH.'}
 Write-Host 'Iniciando Ollama na porta 11434...' -ForegroundColor Green
 & ollama serve
 return
}
if($Servico -eq 'voz'){
 $file=Join-Path $raiz 'lia_motor\.motor.vars.local'
 if(-not (Test-Path $file)){
  $rng=New-Object byte[] 32
  [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($rng)
  $token=[Convert]::ToBase64String($rng).TrimEnd('=').Replace('+','-').Replace('/','_')
  [System.IO.File]::WriteAllText($file,"LIA_API_TOKEN=$token`n",(New-Object System.Text.UTF8Encoding($false)))
  Write-Host 'Token local de voz criado (nao sera exibido).' -ForegroundColor Green
 }
 $line=Get-Content $file|Where-Object {$_ -match '^LIA_API_TOKEN='}|Select-Object -First 1
 if(-not $line){throw 'Token da voz ausente em lia_motor\.motor.vars.local'}
 $env:LIA_API_TOKEN=$line.Substring(14).Trim()
 $env:LIA_TTS_ENGINE='kokoro'
 $env:LIA_MUSETALK_ENABLED='false' # video de fala ilustrativo; MuseTalk opt-in com GPU
 $env:LIA_PREWARM_VOICE='true'
 $pyCandidates=@(
  (Join-Path $original 'lia_motor\.venv\Scripts\python.exe'),
  (Join-Path $original '.venv\Scripts\python.exe'),
  (Join-Path $raiz 'lia_motor\.venv\Scripts\python.exe')
 )
 $py=$pyCandidates|Where-Object {Test-Path $_}|Select-Object -First 1
 if(-not $py){throw 'Python da LIA nao encontrado. Instale a voz no ambiente lia_motor\.venv, sem alterar a LIA pessoal.'}
 Push-Location (Join-Path $raiz 'lia_motor')
 try {
  & $py -c 'import uvicorn, kokoro, soundfile; print("Kokoro e dependencias encontrados")'
  if($LASTEXITCODE -ne 0){throw 'Ambiente Python encontrado mas Kokoro ou uvicorn ausente.'}
  & $py -m uvicorn server:app --host 127.0.0.1 --port 8900
 }finally { Pop-Location }
 return
}
if($Servico -eq 'site'){
 $env:LIA_EDUCA_MODELO=if($env:LIA_EDUCA_MODELO){$env:LIA_EDUCA_MODELO}else{'qwen3:1.7b'}
 $python=Join-Path $raiz '.venv\Scripts\python.exe'
 if(-not (Test-Path $python)){
  if(-not(Get-Command py -ErrorAction SilentlyContinue)){throw 'Python 3.11 necessario.'}
  & py -3.11 -m venv (Join-Path $raiz '.venv')
  if($LASTEXITCODE -ne 0){throw 'Falha ao criar ambiente Python local.'}
  & $python -m pip install -r (Join-Path $raiz 'requirements.txt')
  if($LASTEXITCODE -ne 0){throw 'Falha ao instalar Flask.'}
 }
 Push-Location $raiz
 try{
  Write-Host 'Educa+ Digital + Lia avancada: http://127.0.0.1:5015' -ForegroundColor Cyan
  & $python -c 'from app import app; app.run(host="127.0.0.1",port=5015,debug=False,use_reloader=False)'
 }finally{Pop-Location}
}

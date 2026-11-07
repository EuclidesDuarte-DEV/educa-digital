# Exemplo: .\INICIAR_MOTOR_LIA_WINDOWS.ps1 -MuseTalkDir 'C:\IA\MuseTalk' -MuseTalkPython 'C:\Users\SEU_USUARIO\miniconda3\envs\MuseTalk\python.exe'
param([string]$MuseTalkDir='C:\IA\MuseTalk', [string]$MuseTalkPython='python')
Set-Location (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
if (!(Test-Path 'lia_motor/.motor.vars.local')) { throw 'Rode primeiro CONFIGURAR_LIA_LOCAL_WINDOWS.ps1' }
$line = Get-Content 'lia_motor/.motor.vars.local' | Where-Object { $_ -match '^LIA_API_TOKEN=' } | Select-Object -First 1
if (!$line) { throw 'Token do motor nao encontrado' }
$env:LIA_API_TOKEN = $line.Substring('LIA_API_TOKEN='.Length)
$env:LIA_MUSETALK_ENABLED = 'true'
$env:LIA_MUSETALK_DIR = $MuseTalkDir
$env:LIA_MUSETALK_PYTHON = $MuseTalkPython
$env:LIA_MUSETALK_FP16 = 'true'
Write-Host 'Motor Lia na porta 8900. Nenhuma plataforma de video por minuto sera usada.' -ForegroundColor Cyan
Push-Location lia_motor
try {
    # Execute dentro da venv Kokoro instalada, com uvicorn disponivel.
    python -m uvicorn server:app --host 127.0.0.1 --port 8900
} finally { Pop-Location }

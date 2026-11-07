# V111.1: ativar SOMENTE o TTS; a renderizacao 3D ocorre no navegador.
# Execute a partir da raiz do projeto, apos instalar a venv do lia_motor.
Set-Location (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
if (!(Test-Path 'lia_motor/.motor.vars.local')) {
    throw 'Configure primeiro o token no arquivo privado lia_motor/.motor.vars.local (consulte CONFIGURAR_LIA_LOCAL_WINDOWS.ps1).'
}
$token = Get-Content 'lia_motor/.motor.vars.local' | Where-Object { $_ -match '^LIA_API_TOKEN=' } | Select-Object -First 1
if (!$token) { throw 'Token privado da Lia nao foi configurado.' }
$env:LIA_API_TOKEN = $token.Substring('LIA_API_TOKEN='.Length)
$env:LIA_MUSETALK_ENABLED = 'false'
Write-Host 'Iniciando Kokoro na porta 8900, SEM renderizacao de video. Para a Cloudflare, configure um endpoint HTTPS seguro.' -ForegroundColor Cyan
Push-Location lia_motor
try { python -m uvicorn server:app --host 127.0.0.1 --port 8900 }
finally { Pop-Location }

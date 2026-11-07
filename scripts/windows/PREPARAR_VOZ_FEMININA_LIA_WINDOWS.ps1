# Sintetiza uma referencia feminina original a partir da voz Kokoro pf_dora.
# Na primeira execução pode baixar o modelo. Nao precisa de assinatura.
$EducaProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$ErrorActionPreference = 'Stop'
Set-Location $EducaProjectRoot
$python = Join-Path $EducaProjectRoot 'lia_motor\.venv\Scripts\python.exe'
if (!(Test-Path $python)) { throw 'Python da Lia nao encontrado; instale o ambiente virtual primeiro.' }
& $python (Join-Path $EducaProjectRoot 'lia_motor\gerar_referencia_feminina.py')
if ($LASTEXITCODE -ne 0) { throw 'Nao foi possivel criar a voz feminina. Confira os erros acima.' }
Write-Host 'Pronto: referencia feminina Kokoro pf_dora no projeto.' -ForegroundColor Green

# Educa+ Digital — V110.8 — diagnostico corrigido (PowerShell 5.1+)
# Uso: .\DIAGNOSTICO_AVATAR_WINDOWS.ps1 [-MuseTalkDir 'C:\IA\MuseTalk'] [-MuseTalkPython 'python']
# Nao instala programas, nao altera configuracoes do Windows e nao exibe segredos.
param(
    [string]$MuseTalkDir = 'C:\IA\MuseTalk',
    [string]$MuseTalkPython = 'python'
)

$EducaProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
Write-Host '=== Educa+ Digital V110.8 | Diagnostico corrigido do avatar neural ===' -ForegroundColor Cyan
Write-Host "Pasta do projeto: $EducaProjectRoot"

Write-Host "`n[1/5] GPUs" -ForegroundColor Cyan
try {
    $gpus = @(Get-CimInstance -ClassName Win32_VideoController -ErrorAction Stop)
    foreach ($gpu in $gpus) { Write-Host ('  ' + $gpu.Name) }
} catch {
    Write-Warning ('Falha ao consultar a GPU: ' + $_.Exception.Message)
}
if (Get-Command 'nvidia-smi' -ErrorAction SilentlyContinue) {
    & nvidia-smi --query-gpu=name,memory.total,driver_version --format=csv,noheader
} else {
    Write-Warning 'nvidia-smi nao localizado; confira driver NVIDIA e o PATH.'
}

Write-Host "`n[2/5] FFmpeg" -ForegroundColor Cyan
if (Get-Command 'ffmpeg' -ErrorAction SilentlyContinue) {
    $ffmpegLine = & ffmpeg -version 2>&1 | Select-Object -First 1
    Write-Host ('  ' + [string]$ffmpegLine) -ForegroundColor Green
} else {
    Write-Warning 'FFmpeg nao encontrado no PATH. Instale via winget install --id Gyan.FFmpeg -e e reinicie o terminal.'
}

Write-Host "`n[3/5] Python, PyTorch e CUDA" -ForegroundColor Cyan
if (Get-Command $MuseTalkPython -ErrorAction SilentlyContinue) {
    & $MuseTalkPython --version
    # Arquivo temporario evita problemas de escape de aspas em python -c no PowerShell do Windows.
    $tempPy = Join-Path ([System.IO.Path]::GetTempPath()) (('educa_lia_diag_' + [guid]::NewGuid().ToString('N')) + '.py')
    $pythonCode = @'
import sys
print('Executavel Python:', sys.executable)
try:
    import torch
    print('PyTorch:', torch.__version__)
    print('CUDA no PyTorch:', torch.cuda.is_available())
    if torch.cuda.is_available():
        print('GPU CUDA:', torch.cuda.get_device_name(0))
        try:
            free, total = torch.cuda.mem_get_info(0)
            print('VRAM CUDA livre/total (MiB):', free // (1024 * 1024), '/', total // (1024 * 1024))
        except Exception as exc:
            print('Nao foi possivel consultar memoria CUDA:', type(exc).__name__)
except ImportError:
    print('PyTorch: nao instalado neste ambiente Python')
except Exception as exc:
    print('Erro PyTorch/CUDA:', type(exc).__name__, str(exc)[:250])
'@
    try {
        [System.IO.File]::WriteAllText($tempPy, $pythonCode, ([System.Text.UTF8Encoding]::new($false)))
        & $MuseTalkPython $tempPy
        if ($LASTEXITCODE -ne 0) { Write-Warning 'A verificacao Python terminou com erro. Consulte a saida acima.' }
    } catch {
        Write-Warning ('Erro ao executar diagnostico Python: ' + $_.Exception.Message)
    } finally {
        Remove-Item -LiteralPath $tempPy -Force -ErrorAction SilentlyContinue
    }
} else {
    Write-Warning ('Python nao encontrado no PATH: ' + $MuseTalkPython)
}

Write-Host "`n[4/5] MuseTalk e arquivos do modelo" -ForegroundColor Cyan
if (Test-Path -LiteralPath $MuseTalkDir -PathType Container) {
    Write-Host ('Diretorio MuseTalk encontrado: ' + $MuseTalkDir) -ForegroundColor Green
    $requiredFiles = @(
        'models/musetalkV15/unet.pth',
        'models/musetalkV15/musetalk.json',
        'models/whisper/config.json',
        'models/sd-vae/config.json'
    )
    foreach ($relative in $requiredFiles) {
        $fullPath = Join-Path $MuseTalkDir $relative
        if (Test-Path -LiteralPath $fullPath -PathType Leaf) {
            Write-Host ('  OK: ' + $relative) -ForegroundColor Green
        } else {
            Write-Warning ('  Ausente: ' + $relative)
        }
    }
    Write-Host 'Observacao: esse teste nao valida todos os pesos ou dependencias do MuseTalk.'
} else {
    Write-Warning ('MuseTalk nao encontrado em ' + $MuseTalkDir + '. Este e o caminho padrao do diagnostico.')
}

Write-Host "`n[5/5] Configuracao local do projeto" -ForegroundColor Cyan
$devVars = Join-Path $EducaProjectRoot '.dev.vars'
if (Test-Path -LiteralPath $devVars -PathType Leaf) {
    Write-Host '.dev.vars: presente (segredos nao exibidos).' -ForegroundColor Green
} else {
    Write-Warning '.dev.vars: ausente. Configure depois pelo script CONFIGURAR_LIA_LOCAL_WINDOWS.ps1; nao publique credenciais.'
}
Write-Host "`nDiagnostico concluido. Ele NAO instala modelos e NAO renderiza video." -ForegroundColor Cyan
Write-Host 'GTX 1650 (4GB): apenas avalie o modo fp16; chamada fotorrealista em tempo real nao esta garantida.' -ForegroundColor Yellow

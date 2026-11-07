# Correção do diagnóstico V110.8 — 25/10/2026

O comando `python -c '...'` no diagnóstico original podia perder aspas no PowerShell do Windows. A versão corrigida grava um pequeno script Python temporário, o executa e o apaga. Não imprime segredos, não altera a política de execução e não instala programas.

## Passo a passo

Abra PowerShell na raiz do projeto e execute:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
.\DIAGNOSTICO_AVATAR_WINDOWS.ps1
```

No computador analisado, o diagnóstico anterior já confirmou NVIDIA GeForce GTX 1650 com 4096 MiB de VRAM. A instalação do FFmpeg estava ausente do PATH. Para instalar por uma fonte conhecida:

```powershell
winget install --id Gyan.FFmpeg --exact
```

Feche e reabra o terminal e verifique `ffmpeg -version`.

O MuseTalk e os modelos não estavam presentes no local padrão `C:\IA\MuseTalk`. O diagnóstico deve primeiro confirmar a instalação do Python/PyTorch e compatibilidade CUDA. Instalar FFmpeg sozinho não faz o avatar neural falar. A versão MuseTalk 1.5 pode usar 4 GB em condições específicas, mas uma GTX 1650 é inferior à RTX 3050 Ti testada pelos autores e não há garantia de renderização em tempo real. Para vídeo de baixa latência em uso cotidiano, provavelmente será preciso uma GPU mais potente ou uma solução de avatar 3D com expressão procedural.

As credenciais locais podem ser preparadas pelo `CONFIGURAR_LIA_LOCAL_WINDOWS.ps1`, mas elas NÃO devem ser compartilhadas. Isso não instala GPU, PyTorch ou os pesos.

Documentação original: https://github.com/TMElyralab/MuseTalk

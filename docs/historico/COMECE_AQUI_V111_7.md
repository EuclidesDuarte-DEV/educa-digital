# Educa+ Digital V111.7 — Lia com lip-sync realmente gerado por resposta

## O que a pesquisa revelou

- O Lovable pode gerar um pequeno clipe usando modelos de vídeo. Esse clipe NÃO é um motor conversacional. O ZIP exportado de `realistic-3d-avatar` contém apenas o aplicativo inicial: não há nele inferência de avatar em tempo real.
- MuseTalk 1.5 altera os lábios por áudio, mantendo os movimentos já gravados em um vídeo-base. Não inventa gestos de mãos ou corpo. Para isso você precisa de gravações da personagem fictícia com movimentos (20–40 segundos recomendados) ou um motor adicional como LivePortrait (animar cabeça/olhos com vídeo condutor).
- Nesta versão o botão **Verificar avatar com IA** aparece na chamada sem parâmetro especial. Ele verifica a disponibilidade GPU + Kokoro e autentica o código da equipe; só há indicação de sincronia quando um MP4 de resposta real é produzido.
- Sem GPU, a videochamada continua por **voz e texto**, e o vídeo Lovable continua sendo apenas uma referência pré-gravada curta. Não há lip-sync real sem inferência, nem execução do MuseTalk no Cloudflare Worker.

## Para testar agora no computador

```powershell
npm.cmd install
npm.cmd test
npm.cmd run dev
```

Em outro terminal, veja a GPU:

```powershell
python lia_motor/diagnosticar_gpu.py
```

Para testar apenas o áudio no navegador, abra o simulador e toque Atender. Para testar o lip-sync real, precisará configurar o motor separado abaixo.

## Motor neural real, sem cobrança por minuto de plataforma de avatar

1. Instale [MuseTalk 1.5 oficial](https://github.com/TMElyralab/MuseTalk) em `C:\IA\MuseTalk`, Python/CUDA e os pesos conforme README oficial. Instale `ffmpeg` no PATH.
2. Instale Python 3.11+ para o motor Kokoro (dependências em `lia_motor/requirements.txt`), incluindo espeak-ng quando necessário.
3. Tenha uma GPU NVIDIA com VRAM suficiente. Não há garantia de tempo real no hardware comum. Consulte o diagnóstico.
4. Recomendado: obtenha uma gravação de **20–40 s** com **a mesma Lia fictícia** fazendo piscadas, pequenos acenos, gestos discretos, sem falas e sem cortes. Para preparar a 25fps e sem áudio: `python lia_motor/preparar_movimentos_lia.py "C:\videos\lia_gestos.mp4"`. A preparação sobrescreve apenas o clipe de referência dentro desta V111.7; mantenha seu original separado.
5. Na pasta raiz, rode `./CONFIGURAR_LIA_LOCAL_WINDOWS.ps1` UMA VEZ (gera `.dev.vars` para testes locais e código da equipe); em caso de arquivos existentes, NÃO substitua segredos. Inicie o motor por `./INICIAR_MOTOR_LIA_WINDOWS.ps1 -MuseTalkDir 'C:\IA\MuseTalk' -MuseTalkPython 'C:\IA\MuseTalk\.venv\Scripts\python.exe'` ajustando o Python ao seu ambiente.
6. Rode `npm.cmd run dev` e abra `/`. Inicie o Modo Livre, atenda à ligação e toque **Verificar avatar com IA**; insira o código da equipe salvo no `.dev.vars` local. O Worker verifica autorização SEM fazer chamada cara ao motor.
7. Teste **Ouvir Lia**. Kokoro produz a voz, MuseTalk cria novo MP4 e o vídeo é tocado com áudio. Espere processamento; isto ainda é geração por turnos, NÃO transmissão contínua de 30 FPS com baixa latência garantida.
8. Para o site em produção na Cloudflare, o motor deve estar acessível por endereço HTTPS público (por exemplo Cloudflare Tunnel autenticado), e os segredos `LIA_ENABLED`, `LIA_BACKEND_URL`, `LIA_BACKEND_TOKEN`, `LIA_STAFF_CODE` precisam estar configurados com segurança no Worker. **Não configure 127.0.0.1 no Worker hospedado**, pois o endereço aponta para a infraestrutura da Cloudflare, não o seu PC. Nunca exponha a porta 8900 diretamente à Internet.

## Verificação

`npm.cmd test` — testes JavaScript; `python -m unittest discover -s lia_motor -p 'test_*.py'` — testes de contrato Python; estes são testes SEM modelo nem GPU. Valide qualidade e latência usando hardware real antes de declarar pronto.

## Segurança

Lia é personagem original fictícia. A interface sinaliza simulação, os Pix são fictícios e nenhuma foto/voz real de terceiros deve ser usada sem autorização. Não inclua senhas pessoais na ferramenta.

## Links oficiais

- https://lovable.dev/blog/ai-models-and-tools-in-lovable
- https://github.com/TMElyralab/MuseTalk
- https://github.com/KlingAIResearch/LivePortrait
- https://github.com/hexgrad/kokoro

# Educa+ Digital V111.17 — Lia com escuta melhor, voz rápida e vídeo suave

## O que foi entregue

- **Escuta em português brasileiro**: a videochamada usa os resultados parciais e finais do reconhecimento de fala do navegador, mostra quando está ouvindo, não envia respostas parciais e bloqueia envios duplicados.
- **Retomada da escuta**: se o usuário habilitar o microfone, a Lia escuta novamente após terminar a fala. Permissões continuam sob controle do usuário.
- **Resposta mais objetiva**: o prompt da IA recomenda até duas frases por turno e o máximo de tokens foi reduzido no cenário de videochamada para diminuir a espera por geração e síntese. A velocidade final depende do provedor/da rede.
- **Dissolução entre vídeos (420 ms)**: a imagem antiga só desaparece após o vídeo seguinte começar a reproduzir. Isso vale para alternância entre clipes gravados e para a volta de fala para escuta. Na opção `prefers-reduced-motion`, o efeito é abreviado.
- **Duas prioridades** em `••• > Prioridade da chamada`: `Resposta rápida (voz primeiro)` por padrão, ou `Sincronizar a boca` para aguardar mais pela renderização do MuseTalk.
- **Chatterbox otimizado**: a referência de voz fictícia é codificada uma vez no carregamento do modelo, não a cada frase. Inclui rota autenticada `POST /v1/lia/preload` para aquecer o modelo antes de testar.
- **Script de diagnóstico**: `TESTAR_VOZ_LIA_WINDOWS.ps1` mostra erros úteis, não imprime a chave e abre `teste_lia.wav` apenas depois de um download válido.
- Mantidos: personagem fictícia, aviso de simulação, Cloudflare Worker, D1, fluxo do treino, Kokoro e MuseTalk opcionais. Nenhum SDK da Simli.

## Como testar no notebook (Windows)

1. Extraia o ZIP inteiro. Abra a pasta `EDUCA_DIGITAL_V111_17_LIA_VIDEO_SUAVE` no VS Code.
2. Confirme `py -3.11 --version` e `git --version` no terminal PowerShell. O Git é necessário para algumas dependências do Chatterbox.
3. Se for a primeira instalação neste notebook, execute na **raiz do projeto**, uma linha por vez:

```powershell
py -3.11 -m venv .\lia_motor\.venv
.\lia_motor\.venv\Scripts\python.exe -m pip install --upgrade pip
.\lia_motor\.venv\Scripts\python.exe -m pip install -r .\lia_motor\requirements.txt
.\lia_motor\.venv\Scripts\python.exe -m pip install --upgrade "https://github.com/resemble-ai/chatterbox/archive/refs/heads/master.zip"
```

4. Se ainda não houver `lia_motor/.motor.vars.local` e `.dev.vars`, crie suas credenciais com:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\CONFIGURAR_LIA_LOCAL_WINDOWS.ps1
```

5. **Terminal 1**, mantenha aberto:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\INICIAR_LIA_VOZ_HUMANA_WINDOWS.ps1
```

6. **Terminal 2**, teste a voz. `-PreCarregar` carrega o Chatterbox antes de gerar a primeira frase; pode demorar e consumir muita memória:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\TESTAR_VOZ_LIA_WINDOWS.ps1 -PreCarregar
```

7. Abra o Educa+ em modo de desenvolvimento com `npm install` e `npm run dev` (isso exige configurações do Worker/D1). Na videochamada, use `••• > Verificar avatar com IA` e o código local da equipe **depois de configurar o gateway privado no Worker**. O navegador não deve acessar diretamente o token do motor.

## Escolher entre velocidade e boca sincronizada

- **Resposta rápida** (padrão): após o WAV ficar pronto, se MuseTalk não produzir o vídeo rapidamente (janela de até 2,4 s, fora o tempo da geração de voz), começa a voz com movimentos ilustrativos e transições suaves. **Não é lipsync fonético.**
- **Sincronizar a boca**: aguarda até 16 s pela renderização do MuseTalk, fora o tempo de sintetizar a voz. Se sair um vídeo neural a tempo, reproduz o MP4 com o WAV correspondente. Se não, reproduz a voz com os clipes de fala para evitar silêncio prolongado. **Não troca de MP4 neural no meio da frase.**
- MuseTalk exige pesos do modelo, FFmpeg, GPU compatível e `LIA_MUSETALK_ENABLED=true`; no Windows inicie com `INICIAR_LIA_VOZ_HUMANA_WINDOWS.ps1 -ComMuseTalk`, configurando antes `LIA_MUSETALK_DIR`.

## Limites importantes

- A qualidade **sonora real** ainda precisa ser validada ouvindo a Lia no notebook. Testes automatizados não executam o Chatterbox nem o MuseTalk com os pesos reais.
- Reconhecimento de fala via Web Speech API depende do navegador e, conforme implementação, pode usar serviço remoto do fornecedor. Portanto ainda não é STT independente/offline.
- O sistema continua com turnos: não é WebRTC bidirecional contínuo. Resposta rápida não garante latência fixa, sobretudo em CPUs sem GPU.
- Crossfade remove cortes secos perceptíveis, mas não corrige saltos de pose entre clipes de origem muito diferentes.
- Cloudflare Workers hospeda o site e a IA conversacional, **não** a GPU. A conexão com o motor local exige um gateway HTTPS privado e o notebook ligado.
- O script de configuração gera credenciais novas. Nunca compartilhe `.dev.vars` ou `lia_motor/.motor.vars.local`. Se um token apareceu em captura de tela, gere novos tokens antes de publicar.
- O exercício de prevenção a golpes deve continuar claramente rotulado como simulação com personagem fictícia.

## Verificações realizadas

- 79 testes automatizados JavaScript aprovados.
- 15 testes Python aprovados, com motores neurais simulados (sem GPU).
- Referência vocal: WAV mono 24 kHz, 12 segundos. Clipe de fala validado por ffprobe: MP4 720×1280, 24 fps.

## Fontes

- Web Speech API: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition
- MuseTalk 1.5: https://github.com/TMElyralab/MuseTalk
- Chatterbox TTS: https://github.com/resemble-ai/chatterbox

# Educa+ Digital V111.19 — Lia com voz feminina e conversa mais natural

Esta é uma **cópia integral e local** do projeto V111.18 fornecido pelo responsável, com melhorias focadas na videochamada. **Não é um deploy.** Nenhum dado D1 remoto foi alterado.

## O que foi alterado

1. **Voz feminina como padrão ao iniciar no Windows**: `INICIAR_LIA_VOZ_HUMANA_WINDOWS.ps1` agora seleciona Kokoro `pf_dora` por padrão. O Chatterbox, mais pesado e cujo timbre depende de uma referência, somente é usado com `-Expressiva`. A opção `-SomenteKokoro` continua aceita por compatibilidade.
2. **Escuta com menos interrupções**: o reconhecimento aceita resultados parciais e múltiplos segmentos finais; aguarda uma pausa de ~650 ms e envia uma mensagem por turno. Se o navegador encerrar o reconhecimento, envia o resultado final consolidado. O microfone só é habilitado pelo usuário.
3. **Vídeos com transição mais segura**: browsers que oferecem `requestVideoFrameCallback` aguardam o primeiro quadro decodificado para fazer a troca A/B. O crossfade continua em 420 ms; há fallback para navegadores antigos.
4. **Continuidade**: ao falhar uma resposta da IA ou faltar a voz feminina do navegador, a Lia pode voltar ao estado de escuta, sem prender a chamada no estado de fala.
5. **Precarregamento feminino seletivo**: a API privada aceita `POST /v1/lia/preload?engine=feminina`, inclusive com Chatterbox como motor principal. O teste PowerShell com `-PreCarregar` agora carrega a voz selecionada.
6. **Credenciais preservadas**: o script `CONFIGURAR_LIA_LOCAL_WINDOWS.ps1` reaproveita e repara configurações locais incompletas sem sobrescrever arquivos que já têm tokens. Um token divergente é sinalizado, não substituído automaticamente.
7. **Gateway**: considera Kokoro feminino pronto mesmo quando o modo Chatterbox opcional não estiver configurado.

## Como iniciar no notebook (PowerShell do VS Code)

Extraia esta versão numa **nova pasta** e abra a pasta onde está `app.py`.

Se o Python 3.11 já estiver disponível, mas a pasta `lia_motor/.venv` não existir, crie o ambiente:

```powershell
py -3.11 -m venv .\lia_motor\.venv
```

Instale as dependências uma única vez (modelos grandes podem ser baixados no primeiro uso):

```powershell
.\lia_motor\.venv\Scripts\python.exe -m pip install --upgrade pip
.\lia_motor\.venv\Scripts\python.exe -m pip install -r .\lia_motor\requirements.txt
```

Se não existir Python 3.11, instale-o e reinicie o terminal antes de executar os comandos. **O ZIP não inclui Python, `.venv`, pesos neurais, Git nem drivers CUDA.**

Configure as credenciais locais (não envie os arquivos gerados):

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\CONFIGURAR_LIA_LOCAL_WINDOWS.ps1
```

Inicie a voz feminina **sem Chatterbox** no primeiro terminal:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\INICIAR_LIA_VOZ_HUMANA_WINDOWS.ps1
```

Quando o servidor estiver ativo em `http://127.0.0.1:8900`, abra **outro** terminal e teste **a voz real**:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\TESTAR_VOZ_LIA_WINDOWS.ps1 -Voz feminina -PreCarregar
```

Isso deve gerar `teste_lia_feminina.wav` e abri-lo. **Escute** o arquivo para confirmar que a voz está feminina e inteligível.

### Site + videochamada

Em um terceiro terminal:

```powershell
npm.cmd install
npm.cmd run dev
```

Abra o endereço local informado pelo Wrangler (geralmente `http://127.0.0.1:8787`). O site permanece com pré-teste, trilhas, 22 atividades e Modo Livre. Na videochamada, use **Verificar avatar com IA** e informe o código privado da equipe, encontrado em `.dev.vars`, chave `LIA_STAFF_CODE`. Nunca publique ou envie essa chave em capturas de tela.

Para comparar voz expressiva, **pare o servidor** com Ctrl+C e reinicie com:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\INICIAR_LIA_VOZ_HUMANA_WINDOWS.ps1 -Expressiva
```

Esse modo exige Chatterbox compatível e gera uma amostra feminina de referência, se necessário; pode consumir muita RAM e baixar pesos. Na videochamada, a opção **Feminina brasileira · Dora** continua disponível mesmo com Chatterbox ativado.

### Boca sincronizada por fonemas

**A V111.19 não cria lip-sync neural sem GPU.** Os vídeos incluídos são clipes ilustrativos de movimento; só o MuseTalk com pesos/FFmpeg/CUDA configurados gera MP4 sincronizado com a fala de cada resposta. Para habilitar, siga a documentação do MuseTalk no projeto e o comando `-ComMuseTalk`; esse modo não foi testado com a GPU deste notebook. Não use `-ComMuseTalk` sem configurar corretamente o ambiente neural. O vídeo pode demorar mais que o áudio.

### Diagnóstico rápido

```powershell
py -3.11 --version
Test-Path .\lia_motor\.venv\Scripts\python.exe
Test-Path .\lia_motor\.motor.vars.local
Test-Path .\.dev.vars
```

Se o arquivo WAV não for criado, observe o erro do terminal do servidor e o do segundo terminal; não tente abrir um arquivo inexistente.

## Verificações automatizadas nesta entrega

- `npm test` — **85/85** testes JavaScript.
- `python -m unittest discover -s lia_motor -p 'test_*.py' -v` — **19/19** testes Python, com motores neurais simulados.
- `node --check` no frontend e Worker; Python compilado sem erros.
- Não houve teste real dos pesos Kokoro/Chatterbox, da GPU MuseTalk, do microfone do notebook ou de navegação visual em celulares.

## Restrições preservadas

Sem alterações no esquema D1, pré-teste obrigatório, banco, seis módulos, 22 atividades, videos existentes e lógica pedagógica. A Lia é uma **personagem fictícia**, usada em simulação educativa. Nenhum Pix real é executado. Não publicar tokens, não sincronizar no GitHub nem fazer deploy sem revisão e permissão explícita.

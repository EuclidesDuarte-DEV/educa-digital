# Educa+ Digital V111.21 — Lia: resposta rápida, memória da conversa e movimento natural

**Origem:** V111.20 completa. **Publicação:** não publicada na Cloudflare nem houve migração do banco D1. 
**Segurança:** personagem ficcional de treinamento; Pix e mensagens de treino, jamais dados reais.

## O que mudou

1. **Escuta:** após a última parte reconhecida, a Lia inicia o turno em cerca de 450 ms de silêncio (antes 650 ms). O reinício do microfone após resposta passa de 400 para 260 ms. Se o Chrome encerrar reconhecimento sem enviar resultado `isFinal`, a fala parcial suficientemente longa não é perdida. Esses tempos são apenas janelas do código; a velocidade total depende de navegador, rede, IA, TTS e hardware.
2. **Conversa:** instrução mais cuidadosa para responder a última pergunta, manter os últimos turnos, não repetir nem inventar fatos. Mantém Workers AI configurado e todas as proteções de dados reais. Modo padrão: Llama 3.1 8B, priorizando latência e consumo menor. Opcional `LIA_AI_MODEL=inteligente` usa Llama 3.3 70B FP8 Fast via Cloudflare — pode custar mais e demorar mais. **A IA não fica rodando no notebook apenas com o motor de voz.**
3. **Voz:** Kokoro `pf_dora` é pré-carregado no servidor quando iniciado, usando thread separada. Não assegura tempo fixo de resposta, mas evita parte do tempo de carregamento inicial. Também há pré-carregamento autenticado após configurar o motor na chamada.
4. **Rosto:** os vídeos de escuta continuam em movimento enquanto a Lia está em silêncio/ouvindo. Quando o WAV neural toca, seu volume real modula discretamente a velocidade dos clipes ilustrativos de fala (quando o navegador autorizar Web Audio). A transição A/B de 420 ms permanece. A animação não altera velocidade do áudio.
5. **Sincronia verdadeira:** é possível somente quando o MuseTalk com modelos, FFmpeg e GPU está efetivamente ativo e gera MP4 a partir do mesmo WAV. Modo **Sincronizar a boca** espera até 16 s pelo vídeo gerado; modo **Resposta rápida** espera apenas 900 ms e prioriza fala, mesmo que a boca fique aproximada. Não há troca para vídeo neural durante uma fala já iniciada.

## Aplicar PATCH sem perder ambiente Python

Use `PATCH_V111_21_LIA_RESPOSTA_RAPIDA.zip` sobre a pasta original da **V111.20**.

1. Encerre o servidor e o `npm run dev`, se estiverem abertos, com `Ctrl+C`.
2. **Faça backup da pasta.** Extraia **o conteúdo interno** do patch sobre a pasta da V111.20 (a mesma pasta que contém `app.py` e `lia_motor`), substituindo os arquivos alterados.
3. Não remova `lia_motor\.venv`, `.dev.vars`, `lia_motor\.motor.vars.local`, `data` nem arquivos de banco.
4. Reabra a pasta no VS Code e inicie o motor:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\INICIAR_LIA_VOZ_HUMANA_WINDOWS.ps1
```

5. Em **outro terminal**, teste primeiro a voz feminina:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\TESTAR_VOZ_LIA_WINDOWS.ps1 -Voz feminina -Estilo natural -PreCarregar
```

6. Para testar conversa com IA no modo livre, a aplicação web precisa rodar com o Cloudflare Worker e o binding AI configurado. O servidor Python de `127.0.0.1:8900` **sozinho não conecta a IA conversacional nem liga automaticamente o navegador ao backend**. A chamada da Lia utiliza a rota `/api/avatar/*` do Worker, que precisa de `LIA_ENABLED`, `LIA_BACKEND_URL`, `LIA_BACKEND_TOKEN` e `LIA_STAFF_CODE` válidos. Não exponha senhas ou tokens em prints.

### Modo de IA mais avançada (opcional)

No **Worker** local, acrescente `LIA_AI_MODEL=inteligente` ao arquivo `.dev.vars` existente sem apagar os demais valores e sem compartilhar esse arquivo. No deploy remoto, use variável de ambiente do Worker. Se ausente, continua no 8B rápido por padrão. O modelo grande não é garantidamente mais rápido ou gratuito.

### Testar sincronia da boca

- Sem MuseTalk/GPU: no ajuste de videochamada use **Resposta rápida**. A Lia fala com Kokoro e movimenta-se através de clipes ilustrativos; o ritmo desses clipes pode seguir a energia do áudio, mas **não há fonemas precisos**.
- Com MuseTalk configurado e GPU: iniciar o motor com `-ComMuseTalk`, configurar o código da equipe e escolher **Sincronizar a boca** na chamada. O motor gera vídeo com boca sincronizada ao mesmo WAV, mas ainda de forma assíncrona, não uma sessão de vídeo neural streaming com latência zero.
- O vídeo de escuta preserva piscadas/cabeça/expressões *gravadas no próprio clipe*, não geradas pelo motor em tempo real. Se quiser novos gestos, será preciso uma fonte de movimento de vídeo adequada.

## Testes executados no ambiente de desenvolvimento

- `npm test`: 90 testes JavaScript aprovados.
- `python -m unittest discover -s lia_motor -p 'test_*.py'`: 25 testes Python aprovados.
- Não foi possível verificar tempo de resposta com a IA Cloudflare real nem síntese Kokoro + vídeo MuseTalk numa GPU do seu notebook. Esses testes de equipamento e desempenho precisam de validação local.

## Compatibilidade e cuidado

Os scripts usam `window.SpeechRecognition` do navegador, que **não é suportado de modo uniforme em todos os navegadores e dispositivos**. O usuário pode digitar se a escuta falhar. Os clipes de fala sem GPU são aproximações; para sincronia exata, a fonte de vídeo precisa ser gerada para a fala específica. O projeto não liga sua webcam sem ação expressa.

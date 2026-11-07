# V111.32 — Voz pf_dora com pré-aquecimento durante WhatsApp

Esta versão é uma evolução da V111.31, sem reconstruir Educa+ Digital e sem serviços pagos. O site ainda NÃO foi publicado na Cloudflare.

## Melhorias
- Assim que o usuário entra no **Modo Livre**, o motor carrega e produz antecipadamente os **dois primeiros trechos fixos** da abertura. Isso acontece durante a simulação do WhatsApp e não reproduz áudio antecipadamente.
- Esses dois WAVs podem ser guardados no **Cache Storage do navegador**, sem guardar dados, áudios do participante ou mensagens dinâmicas. Isso reduz a demora nas próximas aberturas.
- Enquanto a voz atual toca, o Kokoro gera **um próximo trecho** em paralelo com a reprodução, diminuindo pausas entre as frases (o processador ainda pode ser lento).
- A página `/testar-voz-lia.html` permite testar **WebGPU fp32**. Somente após gerar áudio com sucesso é que a preferência é salva para a videochamada. A CPU q8 continua disponível.
- Nenhuma chamada externa de TTS pago. Os modelos externos são baixados uma vez e dependem do dispositivo/Cache API.

## Testar
1. Extraia em nova pasta no VS Code. Execute `npm.cmd install`, `npm.cmd test`, `npm.cmd run dev`.
2. Entre em `/testar-voz-lia.html`, teste primeiro CPU (já funcional) e depois WebGPU. Se WebGPU falar corretamente, será utilizada nas chamadas seguintes.
3. Abra `/` e comece **Modo Livre → WhatsApp → videochamada**. Enquanto estiver no WhatsApp, o Kokoro aquece; durante a chamada, observe a redução do tempo entre frases.
4. Em caso de problema com WebGPU, volte à página de teste, selecione CPU e gere uma fala bem-sucedida para salvá-la novamente.
5. Somente após confirmar no Chrome: `npx.cmd wrangler deploy`.

**Limitação:** sem servidor com GPU, a boca do MP4 ainda usa clipes aproximados guiados pela energia do áudio, não é lipsync neural exato. CPU q8 pode continuar lenta. Esta atualização não resolve o tempo de inferência do hardware; evita esperas desnecessárias e permite GPU compatível.

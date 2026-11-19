# V111.94 — Voz feminina realista sem TTS pago (Web Educa+)

## Escopo
Somente a **Web** do Educa+ recebe a decisão automática de usar GPU e a política de menor espera. O backend compartilhado apenas acrescenta o arquivo público oficial `onnx/model.onnx` à lista restrita do proxy. Android e iOS mantêm suas escolhas anteriores. Nenhuma migração D1, segredo ou alteração financeira.

## Qualidade e agilidade
- O **Kokoro-82M pf_dora** (voz neural feminina pt-BR, modelo aberto e gratuito) continua como motor local, sem enviar conversas para provedores de voz. O navegador baixa arquivos estáticos do modelo.
- Quando a Web é usada em computador com WebGPU, ao menos 6 núcleos lógicos, memória suficiente, sem modo de economia de dados e entrada de ponteiro não grosseira, o pré-aquecimento seleciona automaticamente o modelo **fp32 WebGPU**, que pode oferecer timbre mais natural e melhor velocidade depois de aquecido. Quando o dispositivo não atende às condições, permanece em WASM q8.
- Se a GPU falhar, **uma única tentativa automática** usa WASM q8. Preferências manuais de CPU/GPU não são sobrescritas.
- Enquanto a voz neural carrega, uma voz feminina pt-BR do sistema (preferencialmente Natural/Neural) responde. Se o Kokoro já estiver pronto mas ultrapassar **2,6 s** para começar uma fala, a alternativa inicia; quando o modelo está frio, o limite é **1,2 s** para quem tem voz feminina no dispositivo. Nos demais aparelhos o tempo anterior é mantido.
- Respostas do Modo Livre Web preservam o limite de tokens já validado (110) e mantêm o histórico, a simulação educativa e os limites de segurança. O reconhecimento final da Web espera **320 ms** em vez de 450 ms; Android/iOS seguem iguais.
- A Web deixa `hqVoiceEnabled=false` e **não solicita a rota do Grok TTS**. Nenhuma cobrança de voz por caractere é acionada pela LIA.
- Cache só de falas fixas da simulação, sem gravar respostas pessoais, áudio ou microfone. A fala natural depende de GPU, banda, vozes instaladas e navegador; **não há latência ou realismo garantidos**.

## Verificação
Rodar `node --test tests/platform-web-free-neural-voice-v11194.test.js` e os demais testes CI. Verificar sintonia em notebook com GPU, computador sem WebGPU e celular. O primeiro download do fp32 pode ter centenas de megabytes e levar tempo; a voz feminina do navegador mantém o exercício acessível enquanto o motor aquece.

## Cloudflare
O Worker somente espelha o arquivo original `onnx/model.onnx` da lista fixa. Não ativa Container/GPU pagos nem altera a produção D1. O deploy oficial depende de aprovação da CI e merge para `main`.

Fontes:
- https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/blob/main/onnx/model.onnx
- https://developers.cloudflare.com/workers-ai/platform/pricing/

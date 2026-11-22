# V112.06 — LIA Web: áudio neural gratuito pt-BR + tela cheia sem recortar

## Escopo

**Somente Web.** Não modificar Android/iOS nativos, segredo ElevenLabs,
D1, login, base Neural, ferramentas nem conteúdo dos treinos.

## Voz gratuita experimental

- Motor: Paradee-8M Pt-BR, paradee_dora_int8.onnx, cerca de 8,46 MB
- Voz: Dora, feminina brasileira, destilada da voz Kokoro pf_dora
- Licença: Apache-2.0; crédito a Eraldo R./astrowar:
  https://huggingface.co/eraldohug/Paradee-8M-PtBr
- Custo por fala: zero. Não chama a ElevenLabs e não exige credenciais.
- Privacidade: processamento do texto no Web Worker do próprio aparelho;
  apenas arquivos públicos do modelo são baixados pelo Worker Cloudflare.
- Execução: ONNX Runtime Web WASM (um thread), eSpeak pt-br via Spellophone.
- Carregamento: download e aquecimento iniciais, com cache HTTP do modelo.
- Velocidade: documentação reporta 25×–50× real-time em CPU; não é
  garantia no Safari. Medir tempo de espera, inferência e reprodução.
- Qualidade: neural brasileira, mas NÃO é a Roberta; pode soar sintética.
  Avaliar com o público antes de declará-la voz final.

### Alternativas

- Roberta ElevenLabs ainda disponível mediante crédito da conta.
- Voz do aparelho apenas por escolha explícita, nunca disfarçada de neural.
- Apenas a Web oferece o motor gratuito como escolha inicial experimental.
- O plano de fallback em caso de falha é mostrar erro e manter legendas,
  nunca reproduzir voz robótica sem autorização.

## Teste

1. Abrir /testar-voz-neural-gratis.html e clicar Preparar voz.
2. Aguardar Pronto, ouvir frase brasileira e medir espera total e inferência.
3. Comparar com /testar-voz-roberta.html sem consumir créditos
   involuntariamente (esta segunda página cobra se o modelo gerar).
4. Abrir videochamada, atender, ouvir gratuitamente e verificar legenda.
5. Testar 320, 375, 390 e 430 px, desktop e iPhone Safari.
6. Confirmar retrato de cabeça e ombros SEM recortes na tela cheia.

## Enquadramento Web

Apenas na tela cheia do elemento ou do celular expandido:
object-fit:contain no pôster E nos clipes em fala/escuta, sem
zoom. A barra respeita safe-area do iPhone, a selfie fica acima
dos controles e o botão de retry sai de cima do rosto.

## Segurança

A rota /api/lia-free-model/* só aceita config.json e
onnx/paradee_dora_int8.onnx. Não se lê URLs do usuário,
não se transmitem conversas ou dados pessoais.
Spellophone/eSpeak requer revisão de licenças antes de
redistribuir bundles GPL; nada foi embarcado em nativos.

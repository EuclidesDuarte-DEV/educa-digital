# LIA — Voz natural rápida na Web (V112.02)

## Objetivo

Melhorar a naturalidade da voz feminina em português brasileiro sem aguardar
o download/inferência local de um modelo Kokoro no iPhone. Este PR **não**
altera o comportamento de Android/iOS nativos nem toca D1, Neural, dados
administrativos ou chaves de API.

## Como funciona

- Somente `data-educa-platform="web"`: ao receber uma chamada, consulta
  `GET /api/lia/voz-web/status` sem consumir áudio pago.
- Se a equipe habilitar **explicitamente** uma voz externa e tiver credenciais,
  o Worker faz o proxy seguro de `POST /api/lia/voz-web/speak`.
- ElevenLabs Flash v2.5 sintetiza MP3 44,1 kHz, 128 kbps com `language_code=pt`
  e velocidade 1,04; selecionar na biblioteca uma voz feminina que soe natural
  em português brasileiro. A chave e o ID de voz nunca são enviados ao navegador.
- A fala é dividida em trechos curtos antes da síntese, para reduzir a espera
  inicial. Não reproduzir áudio de turno antigo após outra resposta/encerramento.
- Se o serviço falhar ou exceder 2,2 segundos no navegador, voltar à voz do
  aparelho sem tentar cobrança outra vez no mesmo turno. Falhas de áudio podem
  exigir toque do usuário por política do Safari.
- O pré-aquecimento Kokoro no navegador Web é desativado no fluxo de treinamento,
  preservado nos canais nativos.

## Ativação administrativa (não realizada automaticamente)

A configuração não deve gerar despesas por iniciativa do código. Requer que o
responsável aprove custos, verifique condições do provedor, configure limites,
rate-limits na Cloudflare, e publique estas configurações de modo seguro:

- **Secret:** `LIA_ELEVENLABS_API_KEY` — configurado em Cloudflare Worker
  Secrets, nunca no GitHub, em issue, PR nem neste chat.
- **Secret ou variável protegida:** `LIA_ELEVENLABS_VOICE_ID` — ID real de
  voz com boa pronúncia pt-BR, escolhido/testado pela equipe.
- **Variável:** `LIA_WEB_HQ_TTS_PROVIDER=elevenlabs`
- **Variável:** `LIA_WEB_HQ_TTS_ENABLED=true` — habilitar somente após
  concordância com o custo e teste em Preview.

Enquanto qualquer configuração estiver ausente, o status informa
`enabled:false` e não faz nenhuma requisição ElevenLabs. Não adicionar chaves
a `wrangler.toml` nem ao front-end. Fazer Preview antes da produção, com
segredos exclusivos do Preview quando necessário.

## Segurança, limites e privacidade

O endpoint só aceita origem da própria hospedagem, `POST`, texto de até 450
caracteres e rejeita links, e-mails e sequências numéricas extensas. O
limitador em memória atual é apenas proteção complementar (não um teto global).
A equipe deve configurar rate limits persistentes / WAF, cotas e orçamento
do provedor antes de disponibilizar publicamente. Não é uma integração
de clonagem de voz de pessoas reais: selecionar apenas voz licenciada.

**Atenção:** respostas fictícias sintetizadas são transmitidas ao fornecedor
de voz. Não enviar conversas privadas, transcrições integrais ou dados do aluno.

## Testar

- `node --test tests/platform-web-lia-natural-fast-tts-v11202.test.js`
- `npm test` e GitHub Actions de Preview, canais e layout.
- Confirmar `GET /api/lia/voz-web/status` desligado antes de ativar custos.
- Com credenciais autorizadas em Preview, medir latência até a primeira fala,
  pronúncia, transição entre trechos e iPhone com botão de som.

A linguagem do modelo, a qualidade real no Safari e o desempenho devem ser
validados com a voz escolhida. Nunca interpretar o CI como prova de que o
fornecedor foi contratado ou de que uma resposta realmente foi ouvida.

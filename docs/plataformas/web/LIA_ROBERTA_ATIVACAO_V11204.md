# V112.04 — Roberta pronta para ativação por Secret no Worker Web

**Escopo:** somente Web oficial; Android/iOS nativos, Preview, D1 e Neural preservados.

## Configuração de produção

O Worker Web oficial recebe:
- `LIA_WEB_HQ_TTS_PROVIDER="elevenlabs"`
- `LIA_ELEVENLABS_VOICE_ID="RGymW84CSmfVugnA5tvA"`
- `LIA_WEB_HQ_TTS_ENABLED="true"`

**Isto sozinho NÃO ativa gastos.** A função `hqWebVoiceStatus` requer,
adicionalmente, o Secret `LIA_ELEVENLABS_API_KEY` com um valor não vazio.
Sem esse segredo, `GET /api/lia/voz-web/status` responde `enabled:false`
e `POST /api/lia/voz-web/speak` retorna 503.

A chave da ElevenLabs foi preparada no painel com escopo Text to Speech
e teto de 1.000 créditos. Ela NÃO foi transmitida ao repositório.
Por restrições de segurança, a credencial precisa ser copiada pelo
administrador diretamente de ElevenLabs para o Secret Cloudflare.
O token da ElevenLabs pode aparecer apenas uma vez durante a criação;
se não estiver acessível, gere outra chave com permissões estritas e
revogue a chave anterior não utilizada.

## Conclusão manual de credencial

1. ElevenLabs → API Keys → criar chave com `Text to Speech=Access`,
   outros endpoints `No Access` e limite de 1.000 créditos, sem assinatura.
   Copiar a chave no mesmo navegador.
2. Cloudflare → Workers & Pages → `educa-digital` → Settings →
   Variables and Secrets → Add → tipo **Secret** →
   nome exato `LIA_ELEVENLABS_API_KEY` → colar valor diretamente →
   Save/Deploy. Não usar o tipo Text.
3. Abrir `https://educa-digital.educamaisdigital.workers.dev/api/lia/voz-web/status`
   e confirmar `enabled:true`, `provider:"elevenlabs-flash-v2.5"`.
4. Testar chamada real na Web e confirmar áudio da Roberta em vez de
   voz do sistema, sem demora excessiva. Inspecionar erros 422/429/502/503.
5. Controlar créditos e desabilitar produção na Cloudflare se houver
   abuso; o rate limiter em memória do Worker não substitui proteção global.

A chave não pode ser inserida por GitHub, no chat, em logs nem em documentos.
O Preview continua `LIA_WEB_HQ_TTS_ENABLED=false` para não duplicar custos.

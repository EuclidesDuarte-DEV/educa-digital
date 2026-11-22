# V112.03 — Roberta escolhida para LIA na Web

## Voz aprovada e implementação

O proprietário escolheu a amostra da **Roberta – For Conversational**, voz feminina
brasileira da biblioteca ElevenLabs.

- Voice ID (público): `RGymW84CSmfVugnA5tvA`
- Modelo: `eleven_flash_v2_5`
- Idioma: `pt` (português brasileiro na voz escolhida)
- Saída: MP3 por `/api/lia/voz-web/speak`, via Cloudflare Worker.
- Web mostra a Roberta quando o status do provedor está disponível e usa voz
  rápida do aparelho quando o serviço não estiver ativo.
- Ao atender, a Web aguarda no máximo 650 ms pela consulta de status; a
  requisição de áudio tem prazo de até 2,8 s antes do fallback. Esses prazos
  não garantem que a voz natural toque sem atraso em todas as redes.
- A chave não está no repositório, nem é entregue ao cliente.
- Não alterar versões nativas Android e iOS, D1 ou Neural.

## Ativação segura pendente

O plugin ElevenLabs no ChatGPT pode selecionar e gerar uma amostra, mas **não**
fornece automaticamente a chave da API ao Worker Cloudflare. Até que a equipe
instale a chave e autorize uso cobrado, a configuração declara
`LIA_WEB_HQ_TTS_ENABLED = "false"` em produção **e** Preview; não há gastos
de TTS decorrentes dessa implementação.

Passos após renovação da sessão Cloudflare e definição de limites de uso:

1. Na conta ElevenLabs, entrar em API Keys e criar chave com escopo restrito a
   Text to Speech. Selecionar a voz Roberta na biblioteca caso a API da
   conta não reconheça o ID. **Não colar a chave em chat, issue, log ou GitHub**.
2. Em Cloudflare Workers & Pages → `educa-digital` → Settings → Variables and
   Secrets, instalar o valor da chave como **Secret** chamado
   `LIA_ELEVENLABS_API_KEY`. Fazer antes no Preview com credencial de teste
   quando o ambiente oferecer isolamento de segredos.
3. Confirmar limites de créditos/custos e bloqueio de abuso no serviço.
   O limitador em memória atual não garante um orçamento global; exigir
   controles duráveis de quota/custo antes de acesso público irrestrito.
4. Ativar `LIA_WEB_HQ_TTS_ENABLED = "true"` no ambiente desejado com um
   novo deploy, mantendo `LIA_WEB_HQ_TTS_PROVIDER = "elevenlabs"` e
   `LIA_ELEVENLABS_VOICE_ID = "RGymW84CSmfVugnA5tvA"`.
5. Verificar `GET /api/lia/voz-web/status` com `enabled:true`,
   `provider:"elevenlabs-flash-v2.5"` e escutar uma chamada real no
   iPhone Safari. Se vier `enabled:false`, a voz natural **ainda não
   funciona**, mesmo com código publicado.

O serviço recebe apenas o texto fictício da LIA gerado para simulações, não
conversas completas nem dados de participantes. Rejeita links, e-mails
e sequências numéricas longas; requer fiscalização antes de distribuição.

## Testes

```bash
node --test tests/platform-web-lia-roberta-v11203.test.js
node --test tests/platform-web-hq-voice-v11193.test.js
```

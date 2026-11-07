# V110.4 · Sincronização labial de visemas pt-BR

## O que muda
- Uma fala produzida pelo **Azure Speech** gera áudio WAV e eventos de **visemas com carimbos de tempo**, no mesmo ciclo.
- O player acompanha `HTMLAudioElement.currentTime`, não cronômetros imaginários.
- A interface da Lia usa oito poses de boca, agrupando 22 visemas. Isso melhora o *tempo*, mas **não torna a fotografia um vídeo neural**; as imagens-base ainda são sprites.
- Sem Azure configurado, continua o TTS do navegador e sincronização **aproximada**.
- O `Workers AI` existente continua responsável pelas respostas. O Azure acrescenta somente a voz e os visemas.

## Ativação opcional, apenas com autorização e cota

1. Crie um recurso **Azure Speech** no portal Azure; confira os preços e os limites do nível gratuito da região/conta.
2. Configure a região e a flag em `wrangler.toml` sob `[vars]` ou em `.dev.vars` local:

```toml
[vars]
AZURE_SPEECH_REGION = "brazilsouth"
AVATAR_SPEECH_ENABLED = "true"
```

3. Guarde a chave SOMENTE como secret Cloudflare:

```powershell
npx.cmd wrangler secret put AZURE_SPEECH_KEY
```

4. Para `wrangler dev` local: crie `.dev.vars` (NÃO versionar) contendo `AZURE_SPEECH_KEY=...`; configure região e habilitação no mesmo arquivo se necessário.
5. `npm.cmd run dev`, atenda videochamada e ouça a voz `pt-BR-FranciscaNeural`.

## Segurança de produção

- A rota `/api/avatar/speech-token` fornece um token TEMPORÁRIO de Azure; NÃO exponha sua chave primária.
- O exemplo inclui limite rudimentar por IP/instância (10 solicitações/10 min), **insuficiente para produção**. Adicione Cloudflare WAF/Turnstile, autenticação real e limite global antes de ativar para o público.
- O cadastro atual é DEMONSTRATIVO; ele **não serve como controle de acesso** a APIs pagas.
- Não grave o áudio nem as transcrições sem consentimento.
- Voice STT atualmente usa o reconhecimento de fala do navegador e pode transmitir áudio para o provedor do navegador.
- Se o browser impedir carregar SDK externo, o sistema usa voz local aproximada; nenhum segredo é colocado no front-end.
- Antes de publicar V110.4, testar em Android e iOS, inclusive bloqueios de autoplay e interrupções de microfone.

## Estado de conclusão
- Implementada a rota protegida por configuração e o cliente com visemas cronometrados.
- **Não ativado/testado ao vivo:** não temos credenciais Azure do projeto.
- **Não implementado:** avatar neural fotorrealista contínuo com boca e face gerados em vídeo (precisa de serviço especializado).

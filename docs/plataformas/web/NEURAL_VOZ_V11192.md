# V111.92 — Neural e voz feminina da LIA (Web)

## O que foi preparado
- **Neural Obsidian-like:** o grafo visual e a biblioteca D1 continuam no PR #44. A API Web recupera no máximo três trechos de notas **publicadas, públicas e não pessoais** em WhatsApp, SMS, ligação e videochamada. Não há sincronização direta com um aplicativo Obsidian do computador.
- **Diagnóstico:** `GET /api/lia/neural/health` responde apenas com `schema_ready`, `published_count`, `ai_enabled`, `rag_active`, `reason` e `platform`. Sem conteúdo, nomes de notas ou tokens.
- **Voz Kokoro pf_dora:** quando o participante inicia o Modo Livre Web, o modelo aquece em segundo plano. Depois de pronto e se não houver fala em andamento, prepara **somente** o WAV do cumprimento fixo "Oi, sou a Lia." para ser reutilizado na abertura.
- **Baixa latência:** a primeira parte de respostas dinâmicas pode ser sintetizada mais cedo quando o Kokoro está aquecido. Se houver voz feminina pt-BR no navegador e o Kokoro ainda não estiver pronto, a resposta dinâmica é narrada em uma fala contínua, reduzindo cortes artificiais.
- **Isolamento:** os ajustes de áudio são condicionados ao canal Web; Android/iOS continuam com o comportamento anterior. Nenhum dado de fala livre ou áudio do participante é cacheado.

## Verificar o Neural antes de afirmar que está ativo
1. No **Preview** do PR #44, consultar `/api/lia/neural/health`.
2. Se `reason=SCHEMA_REQUIRED`, migrar **somente o banco `educa-digital-preview`**, conforme `LIA_NEURAL_V11187.md`.
3. Configurar o secret `LIA_NEURAL_ADMIN_TOKEN` no ambiente Preview com `npx wrangler preview base-config secret put LIA_NEURAL_ADMIN_TOKEN` (ou pelas configurações de Preview no painel Cloudflare). **Não** usar `wrangler secret put` simples, que pode atingir produção. Nunca colocar o valor no GitHub, mensagens ou código.
4. Importar a base e as pesquisas. Todas começam em `draft/private`. Revisar e aprovar manualmente as notas adequadas, marcando-as `published/public`. Nunca publicar `memoria`.
5. Conferir `rag_active=true` e testar **quatro canais** com o modelo Workers AI vinculado ao Preview. Caso contrário, a biblioteca não estará alimentando a IA.
6. Após aprovação dos testes, solicitar separadamente o rollout em produção. Este PR não faz deploy remoto nem migração de produção.

## Limites honestos
- O endpoint `/api/avatar/health` de produção estava com `enabled=false` e `public_voice=false` na verificação. O Kokoro remoto continua **desligado**; esta alteração acelera o caminho **local** sem prometer tempo fixo ou voz de estúdio em todos os aparelhos.
- Em navegadores sem voz feminina pt-BR e sem modelo Kokoro pronto, a primeira fala pode demorar. Motores remotos de alta qualidade dependem de infraestrutura, licença, privacidade e autorização adicionais.
- Evite sincronizar automaticamente pastas privadas do Obsidian com conteúdo público do protótipo. Toda publicação de conhecimento precisa ser revisada por um administrador.

# V111.25 — Educa+ Digital é a aplicação principal

## O que acontece ao abrir o endereço da hospedagem

O visitante abre **somente o Educa+ Digital** no endereço publicado na Cloudflare.
Não há segundo site ou aplicativo da LIA. O Worker atende a conversa do Modo
Livre usando o binding `AI` já presente no `wrangler.toml`. Os vídeos de fala e
de escuta originais permanecem no próprio site. O microfone é solicitado apenas
quando a pessoa ativa a conversa; o navegador precisa oferecer reconhecimento
de voz compatível e receber permissão do usuário.

Se não houver serviço neural externo configurado, a videochamada tenta usar
uma voz feminina pt-BR **disponível no dispositivo do visitante** por Web Speech.
Se nenhuma voz adequada estiver instalada, a conversa escrita continua; a voz
não é garantida. Isso não é o Kokoro e não produz sincronismo labial fonético
preciso. O usuário não precisa executar `.cmd`, Ollama, Flask nem FastAPI para
a IA hospedada responder. Basta acessar o site — assumindo a hospedagem com
Workers AI/D1 configurada e dentro dos seus limites de cota.

Endpoint de diagnóstico do site: `GET /api/modo-livre/capacidades`.

## Como ter a voz Kokoro automaticamente na hospedagem

É necessário colocar o **motor de voz Kokoro da videochamada** em um serviço
remoto, com HTTPS e disponibilidade contínua. Não é possível iniciar o processo
no notebook com a simples abertura de uma página pública da Cloudflare. A
Cloudflare Worker também não executa diretamente os modelos Python pesados.
A LIA independente não precisa ser hospedada nem copiada.

O motor remoto deve oferecer `/health`, `/v1/lia/speak`, `/v1/media/<id>.wav`
e autenticação `Authorization: Bearer <token>`, como `lia_motor/server.py`.
Pode haver cobrança por CPU/GPU, banda e armazenamento; não há promessa de GPU
gratuita contínua. MuseTalk requer uma infraestrutura própria ainda maior.

**Apenas para administradores, uma vez depois de provisionar o backend:**

1. Na Cloudflare, configurar os segredos do Worker `LIA_BACKEND_URL` (URL
   HTTPS **do servidor**, sem barra final), `LIA_BACKEND_TOKEN` (segredo forte
   guardado no backend) e a variável `LIA_ENABLED=true`.
2. Para permitir voz a alunos sem código de equipe, configurar
   `LIA_PUBLIC_VOICE_ENABLED=true` **somente após** implantar limites persistentes
   por IP/usuário com WAF/rate limiting, controle de gastos e monitoramento.
   A proteção local por mapa de memória do Worker NÃO é suficiente para produção.
   Sem essa variável, permanece o acesso restrito à equipe (`LIA_STAFF_CODE`).
3. Publicar com `npm run deploy` a partir de uma máquina de desenvolvimento
   autenticada na conta Cloudflare. Os visitantes não executam comandos.
4. Validar `/api/avatar/health`: `enabled:true`, `voice_installed:true`,
   `public_voice:true` indicam serviço anunciado como disponível.
   **Isso não substitui o teste de síntese e reprodução real**.

Com esse modo habilitado, a chamada no site usa Kokoro sem pedir código e sem
ligar serviços localmente. O proxy só oferece WAV para usuários comuns; MuseTalk
continua restrito à equipe e o avatar preserva os vídeos existentes. O token
privado do motor nunca é enviado ao navegador. Voz pública tem limite de 300
caracteres por mensagem e 8 MB por WAV. O acesso real exige backend remoto
ativo, autorização válida e conectividade. Nenhuma configuração secreta foi
inventada ou ativada neste pacote.

## Preservado

- V111.24 como base, sem reconstrução.
- Fluxo WhatsApp → videochamada → ligação e Pix de treinamento sem transferência.
- Pré-teste, trilhas, atividades, cadastro, login, D1 e vídeos.
- Arquivos da LIA AI pessoal fora do Educa+.
- Caminho anterior de teste local e acesso privado da equipe (mantidos para
  compatibilidade, mas não exigidos para visitar o site hospedado).

## Limitações que ainda exigem validação

Este ZIP foi validado com testes automatizados que simulam a resposta de um
backend remoto; não houve publicação no Cloudflare, criação de servidor de
Kokoro, microfone real, teste de voz em celular ou renderização MuseTalk nesta
sessão. O Worker e a interface estão **preparados** para o modo online, e não
significa que um backend 24/7 já exista.

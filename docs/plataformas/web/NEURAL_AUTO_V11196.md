# V111.96 — Neural D1 ativo, RAG Web e aprendizado coletivo com proteção de dados

## Ativação
O Worker tem duas ligações D1 isoladas, existentes no projeto: `educa-digital-preview` para Previews e `educa-digital` para produção. A variável `LIA_NEURAL_AUTO_SETUP=true` é explícita no `wrangler.toml` de cada ambiente. Na primeira chamada ao diagnóstico ou ao Modo Livre **Web**, `setupNeuralDB` cria **somente** as tabelas novas `lia_kb_nodes`, `lia_kb_links` e `lia_training_signals`, com índices `IF NOT EXISTS`. Não altera usuários, atividades, progresso, login nem Pix. Executa `INSERT OR IGNORE` de quatro notas anti-golpe baseadas em fontes oficiais do Banco Central e CERT.br, preservando edições existentes.

O painel Obsidian-like permanece em `/static/channels/web/lia-neural-v11187.html`. A API do painel continua exigindo `LIA_NEURAL_ADMIN_TOKEN` para editar/importar notas. **A ativação da base e RAG não depende desse secret**, mas a curadoria administrativa e importação das 16 pesquisas opcionais dependem.

## O que é aprendido de cada treino
No Modo Livre Web existe a caixa **opcional e desmarcada por padrão** “Melhorar os treinos com a comunidade”. Somente após escolha do participante, mensagens **em memória** são classificadas em `verify`, `refuse`, `question`, `accept`, `other` e descartadas. A conclusão gera `safe` ou `unsafe`. O D1 recebe somente somatórios de **dia + cenário + canal + tipo + categoria**, sem texto, telefone, e-mail, IP, áudio, nome, identificador de sessão ou chave Pix. Proteção simples de origem, limite por IP somente em memória e retenção de até 30 dias.

Após dez conclusões de um cenário, um **resumo agregado** é criado como **nota privada e em rascunho** na categoria Aprendizado do grafo. O resumo **nunca é publicado automaticamente** para a LIA. O administrador pode conferir a nota e aprová-la; caso não queira, ela não sai da área privada.

O modelo adapta **apenas pistas educativas de segurança**, com sinais coletivos mínimos e instruções para verificar identidade. Não usa chats passados para criar instruções criminosas, pressionar participantes, nem ensinar a fraudar pessoas reais. Uma biblioteca D1 + RAG não equivale a retreinamento dos pesos do modelo.

## Fluxo
- O Web `/api/modo-livre/conversar-web` recupera até 3 notas publicadas relevantes, nas simulações de WhatsApp, SMS, ligações e LIA. Android/iOS usam a rota original.
- `GET /api/lia/neural/health` mostra `schema_ready`, `published_count`, `rag_active`, `learning_ready` e `raw_chat_stored=false` sem token.
- `POST /api/lia/training/outcome` recebe exclusivamente categoria de conclusão e consentimento booleano, nunca falas.
- Em falha do Neural, a IA continua respondendo, sem bloquear as atividades.
- `banco/lia_neural_v11187.sql` e `banco/lia_neural_training_v11196.sql` registram os mesmos esquemas para manutenção e recuperação. Bootstrap via Worker é intencionalmente aditivo e idempotente.

## Cautelas
Não há sincronização direta com um cofre privado do Obsidian instalado no PC. Não importar conversas brutas automaticamente. O conteúdo importado de fora permanece privado em rascunho até aprovação. Desativar o bootstrap exige alterar a flag em **ambos** os ambientes e republicar. O painel administrativo exige segredo gerado no Cloudflare, fora do GitHub e fora do navegador.

Fontes dos quatro itens curados:
- https://www.bcb.gov.br/estabilidadefinanceira/pix-seguranca
- https://www.bcb.gov.br/meubc/faqs/p/cuidado-com-ligacoes-de-falsas-centrais-de-atendimento
- https://www.bcb.gov.br/meubc/faqs/p/dicas-gerais-para-evitar-golpes
- https://cartilha.cert.br/

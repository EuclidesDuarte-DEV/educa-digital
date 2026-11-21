# V111.97 — exemplos curtos de simulação com consentimento

O pedido de armazenar todas as conversas foi adaptado para **amostras curtas com autorização distinta**, já que os participantes podem compartilhar dados privados mesmo numa simulação.

**Consentimento:** a caixa “Compartilhar exemplos de conversas do treino (opcional)” fica desmarcada. O aceite anterior de estatísticas não habilita este recurso.

**Escopo:** somente Web, Modo Livre e simulações fictícias de WhatsApp, videochamada LIA, SMS e ligações suspeitas. Conversas normais e atividades fora do treino nunca são amostradas.

**Exemplos:** cada par inclui até 190 caracteres da última fala do participante e até 330 da resposta do personagem, além da categoria educativa. Filtros descartam contatos, links, códigos, números longos e declarações pessoais detectáveis. O filtro não consegue identificar tudo: não há coleta automática sem opt-in.

**Retenção:** sete dias, com expiração no próprio D1 e limpeza ao ler/inserir. Não existem colunas de IP, login, pessoa, telefone, sessão ou áudio.

**Administração:** o token LIA_NEURAL_ADMIN_TOKEN existente protege GET /api/lia/neural/examples e DELETE /api/lia/neural/examples/:id. O painel permite visualizar e excluir exemplos; não entram automaticamente no RAG nem em treinamento do modelo.

**Objetivo:** a equipe revisa os diálogos e cria lições mais úteis sobre identificação e prevenção de golpes. A IA já usa indicadores coletivos agregados, sem aprender a persuadir pessoas reais.

**Ativação:** o Worker cria a tabela D1 de modo idempotente após deploy. LIA_EXAMPLES_ENABLED=true habilita apenas o caminho de amostragem consentida. Nenhum histórico anterior é importado e nenhuma conversa completa é guardada. O painel administrativo continua exigindo secret configurado na Cloudflare.

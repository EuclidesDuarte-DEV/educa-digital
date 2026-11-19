# LIA Neural V111.87 — Base de Conhecimento do Educa+ Digital

A LIA tem agora um **grafo visual com notas, arquivos, projetos, conexões e revisão humana**.
O painel é separado do aplicativo dos participantes:

- **Painel Web:** `/static/channels/web/lia-neural-v11187.html`
- **Prévia pública:** 15 notas e 19 relações, **somente leitura**, mesmo sem banco configurado.
- **Banco real:** Cloudflare D1, nas tabelas `lia_kb_nodes` e `lia_kb_links`.
- **Consulta pela IA:** apenas notas com `status='published'`, `visibility='public'` e categoria diferente de `memoria`.
- **Conteúdos pessoais e histórico de chats:** não são importados nem gravados automaticamente.
- **Alterações de canais:** UI exclusiva Web; o motor compartilhado só acrescenta contexto à rota Web já existente. Android/iOS preservados.

## Preparar Preview — ação administrativa manual

1. Use a conta correta da Cloudflare e confirme que o banco Preview é o `educa-digital-preview`.
2. Crie um token forte com no mínimo 24 caracteres, aleatório, e configure-o como secret no Worker, **sem colocá-lo em nenhum arquivo**:

   ```bash
   npx wrangler secret put LIA_NEURAL_ADMIN_TOKEN
   ```

3. Migre primeiro o **banco Preview**, revisando o nome do banco e garantindo que o comando não aponta para produção:

   ```bash
   npx wrangler d1 execute educa-digital-preview --remote --file=./banco/lia_neural_v11187.sql
   ```

4. Valide o endpoint `GET /api/lia/neural/status` com `Authorization: Bearer <seu-token>` e abra o painel na URL do Worker Preview. Não copie o token para mensagens, prints, arquivos ou GitHub.
5. Após validar os testes e aprovar o rollout, aplique **separadamente** a migração no banco de produção:

   ```bash
   npx wrangler d1 execute educa-digital --remote --file=./banco/lia_neural_v11187.sql
   ```

> Os comandos acima são instruções para executar **somente com autorização**. O desenvolvimento não migra bancos D1 de produção automaticamente.

## Usar

1. Abra o painel; o grafo demonstrativo aparece mesmo sem login.
2. Clique em **Acesso administrativo**, informe o token Cloudflare e abra a biblioteca.
3. Clique em **Carregar base inicial** para inserir 15 notas educativas e 19 conexões (ação idempotente).
4. Use **Nova nota** ou importe vários arquivos `.md`, `.txt`, `.json`, `.csv` (até 18 KB cada, 40 por lote).
5. Conecte conhecimentos manualmente ou utilize as relações iniciais. A importação também propõe até 2 ligações por palavras-chave em comum.
6. Revise títulos, fontes e conteúdo. Para a LIA poder consultar, escolha **Revisado** e **Para a IA** e confirme. `Memória` é sempre privada.
7. A IA Web recupera até três trechos pertinentes (máximo total 1.500 caracteres) da coleção aprovada. Isso é **recuperação de informação (RAG)**, não retreinamento do modelo.

## Limitações e proteção

- O conteúdo de projetos e arquivos é persistido no D1, mas não é sincronizado com o Obsidian instalado no computador.
- PDFs, DOCX e imagens **ainda não são importados**; converta o texto para Markdown/TXT antes da primeira versão. Nenhum arquivo binário é enviado para a IA.
- O painel não memoriza automaticamente as conversas dos idosos. Não armazene dados pessoais sem base legal, informação clara, consentimento quando aplicável e controles de retenção.
- O token fica apenas na memória da aba; ao atualizar, será solicitado novamente. Seu hash é comparado no servidor. Não habilite autenticação por número de telefone demonstrativo para administrar a biblioteca.
- Notas privadas e rascunhos nunca entram no prompt público. Notas aprovadas são fornecidas como **referências**, não como instruções que substituam a segurança da LIA.
- A visualização apresenta uma rede de relações entre documentos, **não os neurônios ou pensamentos internos do modelo**.
- Faça backups regulares do D1 e revisão periódica das fontes. Uma biblioteca persistente não equivale a memória infalível.

## Áreas

| Área | Uso |
| --- | --- |
| Conhecimentos | Pix, WhatsApp, SMS, segurança digital |
| Cenários | Falso filho, falso banco, entrega, videochamada |
| Memória | Contexto e notas autorizadas, sempre privadas |
| Aprendizado | Atualizações de conteúdos com fontes verificadas |
| Decisões | Recusas, verificações, respostas a golpes e riscos |

Consulte o código em `src/lia-neural.js`, `src/lia-neural-seeds.js`, `src/free-chat.js` e `banco/lia_neural_v11187.sql`.

# V111.99 — ativação guiada da biblioteca e painel mais legível

Quando o usuário entra com o secret administrativo já salvo **na Cloudflare**, o painel acessa o **D1 real**. Na demonstração pública, o grafo pode mostrar 31 nós e 43 conexões, mas a produção começou com 4 notas públicas e nenhuma ligação. Os dois ambientes não são a mesma biblioteca; a chave não é conhecida pelo ChatGPT e **não deve ser copiada ao GitHub ou enviada por conversa**.

## Painel aprimorado
- Novo cartão `Conectar mais conhecimentos`, visível **somente depois do login administrativo**.
- Um botão `Preparar biblioteca completa` chama, na ordem, duas rotas **já protegidas** pelo token: `POST /api/lia/neural/seed` e `POST /api/lia/neural/seed/research-2026`.
- O primeiro lote possui 15 notas e 19 conexões; o segundo, 16 pesquisas e até 24 conexões. As quatro notas públicas originais permanecem. Em um banco vazio além dessas quatro, o total esperado é **35 nós e até 43 conexões**, conforme vínculos encontrados e sem duplicar registros existentes.
- Todos os **31 itens importados ficam privados e em rascunho**, não são automaticamente promovidos para RAG. A equipe deverá revisar fontes e publicar apenas conhecimentos confiáveis usando o botão existente `Revisar notas para LIA e WhatsApp`. Notas de memória pessoal continuam privadas.
- Importação usa SQL `INSERT OR IGNORE`, é segura para reexecução, preserva edições existentes e não remove informações. A interface mostra resultados e erros sem expor segredo.
- O contador deixa claro que **31/35 nós não significam 31/35 notas usadas pela LIA**: apenas `status=published` + `visibility=public` + categoria não-memória entram no RAG Web.
- Lateral direita ampliada e botões administrativos organizados em uma coluna, com quebras de linha e espaço para leitura no celular.
- A opção de consentimento de exemplos do Modo Livre e o modelo Kokoro não são alterados.

## Procedimento para ativar a biblioteca
Abra o painel oficial, autentique-se usando a chave **somente no seu navegador** e clique em `Preparar biblioteca completa`. Depois examine cada fonte em `Revisar notas para LIA e WhatsApp`, aprove as relevantes e use `/api/lia/neural/health` para confirmar o aumento em `published_count`.

## Segurança
Nenhuma conversa completa do usuário é armazenada sem consentimento específico. A inclusão de pesquisas como rascunhos não equivale a treinar os pesos da IA. Para manter UX rápida, a importação ocorre **por um clique administrativo explícito**, não no início de cada chamada de voz.

# V111.75 — Responsividade e navegação limpa no Modo Livre

## Diagnóstico das capturas
- As opções flutuantes **Início** e **0 situações** ficam acima de formulários nas telas de Navegador/Agenda, embora cada recurso já tenha botão Voltar no cabeçalho.
- Os títulos de recursos (`Navegador`, `Agenda`) e subtítulos ocupam até 3 linhas com texto muito grande e invadem conteúdo.
- Nomes dos 12 aplicativos na Home quebram indevidamente em sílabas, e a busca do rodapé vira texto de duas linhas.
- Formulários, cartões e lista de sites usam a mesma ampliação indiscriminada para rótulos e botões, gerando elementos "inchados".

## Ajustes implementados
1. **Navegação redundante removida** no Modo Livre: `#phoneScreen.free-active #freeFloatingHome {display:none!important}`. Permanecem os controles originais Voltar e Sair, e o progresso continua na lógica interna do treino.
2. **Títulos de recursos** ficam em uma linha com reticências no limite da largura, sem cobrir a área rolável. Recursos com formulários usam `.webreal-scroll` a partir de `top:105px`, abaixo do cabeçalho de 67px (começa em 38px).
3. **Botões e cartões da Agenda/Navegador** continuam com mínimo de 44px de altura, linhas dinâmicas e rolagem vertical. A seção "Sites conhecidos" usa colunas automáticas, ou uma coluna onde o telefone for estreito.
4. **Home e Busca:** grade 4×3 com nomes no máximo em duas linhas, `hyphens:none` e `word-break:normal`. Busca de uma linha com reticências apenas se necessário. Dock e ícones permanecem proporcionais.
5. **Acessibilidade proporcional:** modo Normal/Grande/Muito grande com variáveis separadas por papel textual. O escalonador genérico do Web deixa o CSS controlar regiões específicas sem valores inline prioritários.
6. **PWA atualizável:** cache de Service Worker `educa-cf11175-free-resources` e folha `responsive-v11175.css` depois das correções V111.72–V111.74.

## Validação
- Novo Playwright `scripts/validar-modo-livre-recursos-v11175.mjs`: 9 tamanhos de viewport, 3 tamanhos de letra e fullscreen em três larguras. Verifica Home, Agenda, Navegador, ausência da barra flutuante, rolagem até último botão, título/subtítulo em uma linha e cortes.
- Continuam as auditorias V111.72, V111.73 (50 telas) e V111.74 (WhatsApp), incluindo Pix, conclusão, Modo Livre e chats.
- `tests/v11175-free-resources-reflow.test.js` valida estrutura, cache, responsividade e sintaxe.
- Não há modificações de lógica da IA LIA, pontuação, dados, pagamentos, backend Cloudflare, iOS/Android nativos.

## Referências
- https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
- https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html
- https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout

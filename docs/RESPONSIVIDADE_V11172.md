# Educa+ Digital — V111.72 · auditoria de responsividade e texto muito grande

## Diagnóstico baseado nas capturas

**Confirmação Pix:** no modo de letras muito grandes, o título do Banco crescia mas `.bank-sub-header` preservava `height:55px`. Os cartões e a pergunta ficavam sob esse cabeçalho. A estrutura `.bank-content` usava `height:calc(100% - 48px)`, que não descontava corretamente a altura variável, criando cortes e duas regiões de rolagem em alguns modos. O guia mostrava `O que você faria?` sobre a própria pergunta, apesar de as alternativas já estarem destacadas.

**Conclusão:** `.success-screen` tinha `padding:80px 30px 50px`, `.lesson-success-screen` adicionava padding superior e `.lesson-success-actions` usava margem automática no fluxo. Com o título/texto ampliado, as explicações e botões ultrapassavam a altura útil do telefone e não havia rolagem própria consistente. A Web também aplicava um `font-size:important` em linha à descrição e ao título, competindo com o CSS.

## Alterações no projeto

- **`public/static/css/responsive-v11172.css`** — corrige estruturalmente `.bank-sub-screen` e a rolagem única do Banco; o cabeçalho passa a usar `height:auto` e grid de coluna de texto `minmax(0,1fr)`. Linhas de dados Pix crescem naturalmente; opções mantêm alvos de toque de pelo menos 44px. No modo extra, o marcador da resposta fica em sua própria linha, sem apertar o texto.
- **Conclusão `#successView`** — rolagem vertical única dentro do painel de sucesso, paddings compactos, título escalável com teto, texto com line-height legível, cartões com altura automática e ações após o conteúdo. Não se usa `transform:scale` ou `zoom` para corrigir o problema.
- **`training.js`** — quando o alvo é o grupo de alternativas Pix/golpe, mantém holofote nos botões sem o balão redundante sobre a pergunta. Em qualquer outra tela, se não houver área realmente livre acima ou abaixo, oculta o balão e preserva a área clicável.
- **Web `overrides.js`** — evita a dupla aplicação de `font-size:important` aos campos `#successTitle` e `#successText`. Os tamanhos dessas duas peças passam a ser definidos pelo CSS adaptativo.
- **Outras telas** — espaço horizontal minimizado e rolagem adaptativa nas trilhas, aprendizagem, exercícios guiados, cartões, serviços e vídeo, sem adicionar um segundo scroller à raiz do celular.
- **Cache do PWA** — versão `educa-cf11172-responsive-text-reflow`, inclusão da nova folha na instalação offline e cache-busting de stylesheet, script do guia e registro do service worker.

Nenhuma regra de Pix, respostas, pontuação, login, IA ou banco foi alterada.

## Validação automática

Arquivo `scripts/validar-reflow-v11172.mjs`, rodando Chromium/Playwright em **320, 360, 390, 430, 768, 1024, 1366, 1920 e 896px**, tanto com **texto normal** como **texto extra grande**. Verifica visualização do cabeçalho sem sobreposição, alternativas dentro da largura, ausência de rolagem horizontal, acesso aos botões no final da conclusão e cartões de aprendizagem. Salva screenshots de Pix e conclusão no artefato `artifacts/reflow-v11172`.

Há também testes Node em `tests/v11172-responsive-super-large.test.js` e as regressões anteriores do projeto. Teste automatizado não substitui auditoria manual com Safari/iOS, Firefox/Android ou zoom do navegador.

## Referências da pesquisa

1. [W3C WCAG 2.2 — Critério 1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) — reflow a 320px CSS sem rolagem nos dois eixos.
2. [W3C WCAG 2.2 — 1.4.4 Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) — texto ampliável a 200% sem perder conteúdo ou funcionalidade.
3. [W3C WCAG 2.2 — 1.4.12 Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html) — espaçamentos de linha e palavras sem cortes.
4. [MDN — CSS container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries) — unidades e estilos dependentes do contêiner, não só da janela.
5. [MDN — CSS Flexbox](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout) e [CSS Grid](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout) — `min-width:0`, `minmax(0,1fr)` e distribuição de altura fluida.

## Limite e entrega

Este ajuste afeta a interface compartilhada em navegadores, PWA e clientes nativos que carregam o frontend do Worker; os binários Android/iOS não são modificados. A aplicação final na Cloudflare dependerá do build e deploy da `main` concluídos com sucesso. Verificar um build de Preview não significa que o site oficial já recebeu a alteração.

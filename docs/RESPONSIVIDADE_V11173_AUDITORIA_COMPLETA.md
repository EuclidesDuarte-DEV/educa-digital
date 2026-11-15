# Educa+ Digital V111.73 — responsividade em todas as telas e tamanhos de letra

## Problema real enviado pelo usuário

O WhatsApp do Modo Livre estava funcional, mas nos modos **Grande / Muito grande** os nomes como "Filho — número novo" quebravam no meio da palavra, as bolhas e os botões ficavam visualmente inchados, e os botões **Conferir por outro canal** e **Bloquear contato** avançavam sobre a conversa. O mesmo bug aparecia ao ampliar o protótipo para tela cheia.

### Causa encontrada no CSS legado

- `#phoneScreen.free-family-chat #chatView .chat-wallpaper { bottom: 135px }` não reservava a altura real das escolhas.
- `.free-family-actions { position:absolute; bottom:70px; grid-template-columns:1.35fr 1fr }` possuía duas colunas fixas, independente do tamanho de texto.
- `.free-original-compose { position:absolute; bottom:16px }` não participava do layout das escolhas.
- `.chat-header { grid-template-columns:... 1fr auto; height:58px }` não garantia `minmax(0,1fr)` e a camada Web de acessibilidade aplicava `font-size:... !important` a ícones, nomes e botões da conversa.
- No modo fullscreen, o contêiner aumenta, mas esses `bottom` permanecem em pixels.

## O que foi mudado

**1. Layout real de chat, em quatro linhas independentes**

```css
#phoneScreen :is(#chatView,#normalChatView) .chat-surface {
  display: grid !important;
  grid-template-rows: minmax(55px,auto) minmax(0,1fr) auto auto !important;
  container-type: inline-size;
}
```

Cabeçalho na linha 1; mensagens **roláveis verticalmente** na linha 2; escolhas acessíveis na linha 3; digitação na linha 4. Os contêineres passaram de `position:absolute` com `bottom` fixo para `position:relative` dentro do grid. Mesmo com milhares de caracteres, os elementos não precisam cobrir uns aos outros.

**2. Tipografia por função, não escala indiscriminada**

| Elemento | Normal | Grande | Muito grande |
| --- | ---: | ---: | ---: |
| Mensagens | 14px | 17px | 20px |
| Nome do contato | 14px | 16px | 18px |
| Decisões | 13px | 15px | 16px |
| Campo de digitação | 15px | 17px | 19px |

O nome do contato permanece em uma linha, com reticências se necessário; o texto completo permanece no DOM para tecnologias assistivas. Avatares, controles de envio e ícones mantêm tamanhos proporcionais. As mensagens crescem e quebram naturalmente, apenas com **rolagem vertical**, sem deformar o aparelho.

**3. Botões e campo de mensagem independentes**

Escolhas usam duas colunas apenas com largura suficiente no protótipo (container query), ou uma coluna nas larguras menores. Cada botão tem altura mínima acessível e largura `minmax(0,1fr)`. Em tela pequena e orientação horizontal, o bloco de escolhas tem rolagem própria em vez de cortar conteúdo.

**4. Todos os dispositivos, sem trocar as lógicas de golpes**

Correção CSS do frontend compartilhado por navegador desktop, notebook, tablet, celular, PWA e WebViews nativas, sem interferir nas mensagens da LIA, fluxo de atividades, Pix ou banco de dados. O escalonador Web deixa de sobrepor tamanhos em linha nas duas conversas do WhatsApp. A regra também vale para treino e conversa normal.

**5. Cache de aplicativos instalados**

A folha `responsive-v11173.css` é carregada após V111.72; o Service Worker muda para `educa-cf11173-all-screens-reflow` e passa a pré-carregar a folha nova. O app PWA atualizará os arquivos após novo carregamento.

## Auditoria automatizada em TODAS as telas

O script `scripts/validar-a11y-todas-telas-v11173.mjs` é executado em Chromium pelo CI existente.

- 9 viewports: **320×640, 360×780, 390×844, 430×932, 768×1024, 1024×768, 1366×768, 1920×1080, 896×414**.
- 3 modos: texto **Normal, Grande e Muito grande**.
- Mockup em todos; fullscreen adicional em 390, 896 e 1366px.
- Percorre cada `.android-view[data-view]` disponível e registra clipping/rolagem horizontal e botões que escapam da moldura.
- Testa separadamente o caso real WhatsApp do Modo Livre com **3 mensagens**, dois botões de decisão e campo de mensagem, além do chat comum.
- Rejeita colusão de cabeçalho/chat/ações/composer, texto cortado e botões menores que 44px.
- Produz `artifacts/reflow-v11173/diagnostico.json` e capturas de tela por resolução/fonte/modo para auditoria.

Esta auditoria complementa (não substitui) V111.72, que já cobre Pix, golpes, conclusão e aprendizagem. Um resultado de CI aprovado **não é garantia absoluta** de todos os navegadores e tamanhos do mundo; é necessário validar também em Safari/iOS e aparelhos físicos.

## Arquivos

- `public/static/css/responsive-v11173.css` — novo reflow do chat e componentes de todos os modos.
- `public/static/channels/web/overrides.js` — preserva hierarquia de fonte nos chats.
- `public/html/index.html` e `public/static/sw.js` — publicação e cache.
- `scripts/validar-a11y-todas-telas-v11173.mjs` — auditoria de todas as telas.
- `.github/workflows/mobile-v11148.yml` — executa script Playwright e disponibiliza relatórios.
- `tests/v11173-all-screens-font-a11y.test.js` — testes de regressão em Node.

## Pesquisa / práticas consultadas

- [WCAG 2.2, 1.4.10 — Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html): reorganização em 320 CSS px sem perda de funcionalidade nem duas barras de rolagem obrigatórias.
- [WCAG 2.2, 1.4.4 — Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html): texto até 200% sem sobreposição ou corte.
- [WCAG 2.2, 2.5.8 — Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): espaços adequados para controles.
- [MDN — CSS container size and style queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_size_and_style_queries): decidir reflow usando a largura do telefone, não só do navegador.
- [MDN — Grid layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout): `minmax(0,1fr)` e `min-height:0` para chat rolável.

## Como verificar na produção

Após o PR estar integrado à `main` e as verificações do Workers Build e produção confirmarem sucesso:
1. Abra o Educa+ Digital oficial e vá em **Acessibilidade → Muito grande**.
2. Entre no **Modo Livre → WhatsApp → Filho — número novo**; confira nome, mensagens e escolhas, e mande uma resposta.
3. Ative **tela cheia** e repita em notebook, tablet e celular. Troque Normal, Grande e Muito grande na mesma sessão.
4. Verifique também Pix, conclusão, GOV.BR e trilhas; se o PWA permanecer em cache, feche e reabra.

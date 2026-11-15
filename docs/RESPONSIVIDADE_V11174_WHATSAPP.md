# Educa+ Digital V111.74 — WhatsApp acessível sem rodapé inchado

## Problemas reproduzidos nas capturas (15/11/2026)

Nas fontes **Grande** e **Muito grande**, o WhatsApp de treinamento:
- mostrava os rótulos inferiores "Conver-sas", "Atualiza-ções", "Comuni-dades" em duas linhas e ocupava espaço excessivo;
- deixava o último conteúdo da lista parcialmente escondido e diminuía a área de rolagem;
- cortava nomes no meio da palavra e consumia até quatro linhas com prévias;
- exibia a notificação didática de nova mensagem como um cartão grande sobre a busca e os filtros.

### Causas técnicas verificadas

No frontend legado `free-mode.css`, o seletor `#phoneScreen.free-active #whatsappView .wa-chat-list` usa `max-height:calc(100% - 290px)`, apesar de o footer ocupar área própria. Em `app.css` há um `.whatsapp-bottom` com posição sticky, alternando com absolute e `bottom` fixo, sem reserva de altura variável. O escalonador de acessibilidade Web adicionava `font-size:... !important` a cada texto, inclusive cabeçalhos, nomes e abas, desconsiderando a largura real do telefone simulado.

### Mudanças

1. **Grid interno do WhatsApp:** linhas definidas para cabeçalho, busca, busca ativa, filtros, arquivadas, **lista rolável com `minmax(0,1fr)`** e barra inferior de 58px. Elimina o cálculo de 290px e a sobreposição.
2. **Abas inferiores:** quatro colunas proporcionais (`0.9fr 1.1fr 1.25fr 0.75fr`), reservando maior largura para “Comunidades”, ícones fixos e rótulos completos em uma linha (11px para os três modos e 9,5px apenas em telefones simulados muito estreitos); são etiquetas complementares aos ícones/aria-labels acessíveis.
3. **Conversas:** nomes por hierarquia 14/16/17px com uma linha e reticências quando necessário, sem separar a palavra no meio; prévias 12/13/14px com duas linhas; datas e círculos de não lidas permanecem visíveis. Ao tocar na conversa, a mensagem completa permanece acessível no chat, que mantém a fonte maior (V111.73).
4. **Filtros:** linha de chips horizontalmente rolável sem cortar as sílabas e com alvos adequados.
5. **Aviso de mensagem:** cartão de aviso reduzido a até 108px com texto resumido em duas linhas e botão **Abrir** preservado para ver a mensagem completa.
6. **Web accessibility scaling:** pula o interior do WhatsApp da rotina de escala em linha, usando regras de fonte proporcionais no CSS (como já ocorre no chat V111.73).
7. **Cache PWA:** versão `educa-cf11174-whatsapp-navigation`, stylesheet carregado por último e adicionado ao cache de instalação.

## Testes incluídos

- `scripts/validar-whatsapp-nav-v11174.mjs` — Playwright em 9 tamanhos de viewport, 3 tamanhos de texto e fullscreen nos tamanhos 390px, 896px e 1366px. Valida ordem geométrica de cabeçalho → busca → filtros → arquivadas → lista → footer; limites das quatro abas, largura de cada linha, prévias de no máximo duas linhas, scroll até a última conversa e tamanho da notificação.
- `tests/v11174-whatsapp-bottom-reflow.test.js` — regressão de carregamento CSS, cache, layout e sintaxe do teste visual.
- Os testes V111.72 e V111.73 continuam em execução no mesmo CI, cobrindo Pix, conclusão e todas as telas em 3 fontes.

**Limites:** fonte de nomes e prévias só é menor onde a largura é restrita; a mensagem inteira e os controles de acessibilidade continuam no chat. A auditoria Chromium não comprova comportamento idêntico em todos os iPhones/Safari; validação manual em aparelhos reais continua recomendada.

## Referências de engenharia

- W3C WCAG 2.2 1.4.10 (Reflow): https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
- W3C WCAG 2.2 1.4.4 (Resize Text): https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html
- MDN CSS Grid: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout
- MDN CSS Container Queries: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_size_and_style_queries

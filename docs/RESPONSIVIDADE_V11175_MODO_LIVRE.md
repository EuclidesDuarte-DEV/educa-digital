# Educa+ Digital V111.75 — Modo Livre limpo em três tamanhos de fonte

## Problemas confirmados nas capturas de 15/11/2026

- Tela inicial: nomes dos aplicativos e o rótulo "Pesquisar" quebravam no meio das palavras na fonte **Muito grande**, chegando a encostar no gesto inferior.
- Navegador: cabeçalho fixo de 64px com subtítulo ampliado cobria o texto informativo; links "GOV.BR", "Gmail" e "YouTube" eram espremidos.
- Agenda: campos de data, instruções e botões cresciam, mas parte do formulário ficava atrás dos controles flutuantes **"Início"** e **"0 situações"**.
- Em geral no Modo Livre, a duplicação da navegação ocupava área do telefone simulado sem agregar funcionalidade.

## Correção aplicada

**Controles desnecessários:** a regra CSS `#phoneScreen.free-active #freeFloatingHome` remove visualmente o painel redundante sem alterar os manipuladores JavaScript da notificação. O contador continua sendo incrementado normalmente e aparece na tela final de feedback/resumo; não se apaga pontuação. As telas dos recursos web já possuem o botão **Voltar à tela inicial** no cabeçalho; o gesto de início do aparelho simulado também continua disponível.

**Tela inicial e pesquisa:** o grid de aplicativos ficou isolado entre o cabeçalho e a barra dos favoritos, com rolagem vertical quando necessário. Os ícones permanecem proporcionais, e os nomes quebram apenas em palavras inteiras (até duas linhas). A barra "Pesquisar" usa `grid-template-columns:24px minmax(0,1fr) 22px 22px` com texto em uma linha, sem ocupar a barra gestual.

**Agenda, Navegador e demais recursos:** a estrutura `#webRealView` usa Grid para as linhas de cabeçalho de 66px e conteúdo `minmax(0,1fr)`, sem os `top:102px;bottom:23px` absolutos do CSS anterior. O conteúdo pode rolar verticalmente até os botões. Campos, botões, textos e cartões se redimensionam automaticamente, com quebra de palavras apropriada. O subtítulo repetitivo "Modo Livre · recursos web" fica oculto apenas nos modos de letra grande, liberando espaço para o título.

**Proteção do fluxo educativo:** o teste original V111.53 revelou que o holofote do pré-teste podia reaparecer de forma assíncrona e interceptar o toque em **Abrir** na notificação simulada do WhatsApp. Agora a captura em `training.js` libera os cliques quando `#phoneScreen.free-active`, enquanto o CSS esconde o holofote **apenas no Modo Livre**. Nas atividades guiadas, a proteção do tutorial permanece inalterada.

**Acessibilidade:** tipografia diferenciada para navegação (15px ícones em "Muito grande" e 18px busca) e conteúdo da ferramenta (19px corpo e 22px títulos em "Muito grande"). A camada Web não injeta um segundo `font-size !important` no cabeçalho e na navegação do Modo Livre. As mensagens e exercícios não foram diminuídos.

## Arquivos

- `public/static/css/responsive-v11175.css` — regras de pesquisa, ícones, recursos e formulário.
- `public/static/js/free-mode.js` — preservado no comportamento original de navegação, eventos e progresso.
- `public/static/channels/web/overrides.js` — escala proporcional na Web apenas no Modo Livre.
- `public/html/index.html` e `public/static/sw.js` — stylesheet e cache atualizado.
- `scripts/validar-modo-livre-v11175.mjs` — teste visual dos 10 aplicativos em 9 resoluções, 3 níveis de fonte, fullscreen e mockup.
- `tests/v11175-free-mode-reflow.test.js` — teste de regressão.
- `.github/workflows/mobile-v11148.yml` — rodar os testes visuais e disponibilizar capturas.

## Escopo da validação

A matriz percorre: **320×640, 360×780, 390×844, 430×932, 768×1024, 1024×768, 1366×768, 1920×1080 e 896×414** em texto Normal, Grande e Muito grande, mais tela cheia em 390, 896 e 1366px.

O teste visita **Chrome/Navegador, Agenda, Câmera, Fotos, Gmail, Maps, YouTube, Telefone, Mensagens, Play Store**, além da tela inicial, barra de pesquisa e atalhos. Testa sobreposição de cabeçalho/rolagem, posicionamento dos controles, acesso à última ação e clipping de títulos, buscando evitar bugs em outros aplicativos. A suíte anterior V111.73 continua testando as ~50 telas e V111.74 mantém os testes do WhatsApp.

Não significa que a interface foi comprovada em todos os navegadores físicos; Safari no iPhone ainda merece validação manual. Nenhuma integração externa real é acionada pelos testes.

## Referências

- WCAG 2.2 1.4.10 Reflow: https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
- WCAG 2.2 1.4.4 Resize Text: https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html
- WCAG 2.2 2.5.8 Target Size: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- MDN CSS Grid: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout

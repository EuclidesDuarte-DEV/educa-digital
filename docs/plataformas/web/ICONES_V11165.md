# Educa+ Digital — Design System de ícones Web (V111.65)

A atualização foi aplicada **exclusivamente no canal Web**. Os clientes Android e iOS nativos não mudam.

## Pesquisa e escolha técnica

Bibliotecas consultadas:

- **Lucide**, documentação https://lucide.dev, licença ISC https://lucide.dev/license. SVGs leves, traço uniforme de 2 px, cor `currentColor`, sem necessidade de carregar uma fonte externa.
- **Google Material Symbols**, https://developers.google.com/fonts/docs/material_symbols, licença Apache 2.0. Também é uma boa opção para interfaces Android, mas misturar dois estilos de traço no mesmo protótipo prejudicaria a consistência.
- **Acessibilidade W3C WCAG 2.2**, https://www.w3.org/TR/WCAG22/: alvos mínimos de 24 × 24 CSS px (nível AA, com exceções) e recomendação ampliada de 44 × 44 (AAA). O protótipo utiliza alvos a partir de 44 px nos componentes críticos; ícones podem ser menores que a área clicável.

## Arquivos

- `public/static/channels/web/icons-data-v11165.json`: 54 SVGs Lucide locais, provenientes do repositório oficial, apenas as formas internas do SVG.
- `public/static/channels/web/icons-v11165.js`: conversão dos símbolos dos botões para SVG sem remover elementos ou eventos.
- `public/static/channels/web/overrides.js`: injeta o módulo de ícones **somente na Web**.
- `public/static/channels/web/overrides.css`: tamanho, cor, espaçamento, alto contraste e reflow.
- `public/static/channels/web/LUCIDE-LICENSE.txt`: texto da licença ISC.
- `tests/platform-web-icons-v11165.test.js`: testes para Pix, canal exclusivo Web, SVG e ausência de CDN.

## Mapeamento funcional

| Tela | Antes | Agora |
| --- | --- | --- |
| Pix — tipo E-mail | glifo de envelope | `mail` |
| Pix — Celular | quadrado genérico | `smartphone` |
| Pix — CPF | círculo genérico | `id-card` |
| Banco — Pagar | símbolo quadrado | `receipt-text` |
| Banco — Extrato | três linhas | `list` |
| Banco — Cartão | retângulo | `credit-card` |
| Pix — QR Code, Copia e Cola, Chaves | caracteres especiais | `qr-code`, `copy`, `key-round` |
| Banco — Enviar e Receber Pix | setas de fonte | `arrow-up-right`, `arrow-down-left` |
| Segurança, aviso, validação | emojis e símbolos | `shield-check`, `shield-question-mark`, `circle-check` |
| gov.br — navegação | casa/pessoa/quadrado/menu | `house`, `user-round`, `qr-code`, `id-card`, `menu` |
| gov.br — serviços | emojis, caracteres de documento | `users`, `mail`, `file-pen-line`, `calendar-days`, `scan-face` e outros |
| Mensagens e chamadas | carinhas, telefone e símbolos | `message-circle`, `paperclip`, `camera`, `mic`, `phone`, `send` |
| Configurações e avisos | glifos de segurança/rede | `wifi`, `lock-keyhole`, `settings`, `shield-check` |
| Play Store simulada | check gráfico de fonte | `shield-check`, `badge-check` |

**Não trocar:** logos de aplicativos e marcas (Pix, WhatsApp, gov.br, Gmail, Play Store), fotografias, ícones Android/WhatsApp já em SVG adequado, avatar LIA, QR codes reais de leitura, e gráficos de barras/indicadores que não são ícones.

## Acessibilidade e funcionamento

- SVGs decorativos: `aria-hidden="true"`; o botão conserva seu texto visível ou recebe `aria-label`.
- Ícones com 18–22 px, em botões que continuam tendo área clicável ampla.
- Estado selecionado marcado por **borda e contraste**, não apenas pela cor.
- No modo de letras grandes, o ícone mantém proporção e o texto se reorganiza.
- Evitar atualizar a posição do guia Pix ao substituir SVG: `MutationObserver` ignora o próprio holofote e alterações provocadas pela biblioteca.
- Falha de rede ao buscar o JSON: os glifos antigos continuam visíveis e o treinamento permanece funcional.
- Fonte de ícones local no mesmo domínio Cloudflare; nenhum token, dado pessoal ou serviço de terceiros é acessado.

## Como inserir um ícone futuro

1. Escolha um nome existente em https://lucide.dev/icons.
2. Salve apenas o SVG aprovado no JSON local `icons-data-v11165.json` e preserve a licença.
3. Acrescente o seletor da tela e o nome do ícone em `staticRules` ou em um mapa de texto no `icons-v11165.js`.
4. Prefira `glyph()` para espaços que contêm **somente símbolo** e `prefix()` para botões com **símbolo + texto** (assim o texto não desaparece).
5. Teste `node --test tests/platform-web-icons-v11165.test.js` e rode os checks de responsividade antes do merge.

Todos os demais canais usam os seus arquivos exclusivos de interface; o mesmo backend Cloudflare continua sendo compartilhado.

# Educa+ Digital V111.77 — Design System leve das atividades (exclusivamente Web)

## Objetivo e referência

A equipe aprovou o fluxo simples da V111.76, mas considerou as trilhas excessivamente cinzas e pediu: **logo do assunto no topo**, **ícone de conclusão mais bonito**, **cores suaves do Design System** e **tela de vídeo com o mesmo padrão**, sem perder o visual simples.

Esta atualização altera **somente a apresentação do canal Web**. Não modifica estrutura compartilhada, regras de progresso, marcação de atividade, lógica de vídeo, conteúdo da IA LIA, bancos D1, aplicativos Android ou iOS.

## Design das seis trilhas existentes

| Assunto real | Ícone local | Cor de destaque |
|---|---|---|
| PIX | `/static/icons/pix.svg` | verde-petróleo |
| WhatsApp | `/static/icons/whatsapp.svg` | verde |
| Segurança | `/static/channels/web/security-shield-v11177.svg` | violeta |
| Ajustes | `/static/icons/settings.svg` | azul-acinzentado |
| GOV.BR | `/static/icons/govbr.svg` | azul |
| Apps seguros | `/static/icons/playstore.svg` | cobre |

Não há download de ícones por CDN nem novas dependências. A marca do assunto foi colocada **entre Voltar e o título do cabeçalho**, permanecendo visível quando a trilha chega a 100%, pois o cartão introdutório desaparece nesse estado. O mesmo ícone é mostrado no cabeçalho do vídeo.

A nova paleta colore **apenas detalhes** (ícone, bordas suaves, progresso, hover/foco e botão de prática). Os cartões continuam claros, o texto continua escuro e o layout simples é preservado.

## Conclusão sem estado artificial

As atividades concluídas recebem um **círculo verde com check vetorial branco** via CSS em `.module-lesson-card.is-complete .module-lesson-number`. A classe `.is-complete` já é fornecida por `training.js`, com base no estado real.

A V111.77 **não altera os cliques**, **não recria cartões**, **não grava conclusão** e **não modifica porcentagens**. O progresso continua derivado da lista original, inclusive nos estados 0/3, 1/3, 2/3, 3/3 e em temas de quatro atividades.

## Vídeo de aprendizagem

A tela `#videoLessonView` utiliza o tema da trilha aberta:
- cabeçalho com ícone local e título legível;
- vídeo com borda discreta e botão **Ampliar vídeo** evidente;
- texto resumido sem cortes;
- cartão **Treino seguro** verde, com boa separação do conteúdo;
- ação principal **Agora quero praticar** na cor do assunto, com alvo de toque amplo e contraste conferido.

Nenhum endereço de vídeo, duração, comportamento do player ou fluxo de prática é alterado.

## Acessibilidade e responsividade

As fontes respeitam **Normal, Grande e Muito grande**. A escala Web genérica não aplica uma segunda ampliação prioritária nas telas de trilha e vídeo; o canal Web aplica tipografia por elemento. A descrição pode rolar, os ícones não ficam gigantes, a barra do navegador e o gesto inferior não são cobertos.

CSS respeita `prefers-reduced-motion`, preserva `focus-visible` e evita `zoom` e `transform:scale`.

## Arquivos alterados

- `public/static/channels/web/overrides.js` — identifica tema da trilha e insere marca nos cabeçalhos; mantém lógica existente.
- `public/static/channels/web/overrides.css` — Design System e vídeo por assunto.
- `public/static/channels/web/security-shield-v11177.svg` — ícone vetorial local de Segurança.
- `tests/platform-web-activity-design-v11177.test.js` — testes de seis logos, temas, progresso, conclusão, vídeo e isolamento.
- `docs/plataformas/web/DESIGN_SYSTEM_ATIVIDADES_V11177.md` — este relatório.

**Nenhum arquivo compartilhado foi alterado.** O código permanece restrito a `data-educa-platform="web"`; os outros canais não carregam estas mudanças.

## Verificação

1. Web → Atividades → PIX: ver marca no cabeçalho, cores discretas, passos e progresso.
2. Concluir uma etapa: apenas a concluída recebe o novo check, mantendo o botão clicável para revisão.
3. Repetir com WhatsApp, Segurança, Ajustes, GOV.BR e Apps seguros.
4. Abrir uma lição que tenha vídeo, conferir marca da trilha, vídeo, cartão seguro e botão de prática.
5. Testar fontes Normal, Grande e Muito grande no telefone simulado, em PC/notebook e tela cheia.
6. Confirmar que Android e iOS mantêm o visual anterior.

## Princípios de referência

- WCAG 2.2 — [contraste mínimo](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- WCAG 2.2 — [redimensionamento de texto](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)
- WCAG 2.2 — [reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- MDN — [CSS Grid](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout)

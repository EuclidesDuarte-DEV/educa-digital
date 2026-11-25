# V112.52 — polimento da trilha Segurança

Referência visual: segunda imagem enviada pelo responsável do Educa+ Digital em 25/11/2026.

Ajustes no ambiente Web: cabeçalho mais limpo e compacto, escudo roxo ao lado do título, introdução cinza-clara sem borda de destaque, progresso compacto e quatro cards uniformes. O primeiro card permanece um botão clicável, sem desabilitar a etapa seguinte.

Aplicação exclusivamente visual ao módulo Segurança da Web por seletores `html[data-educa-platform="web"] #modulePathView[data-topic="security"]`. O atributo de tópico é definido pelo controlador compartilhado, mas não altera seleção, sequência, progresso armazenado, conteúdo ou conclusão de nenhuma atividade.

Acessibilidade: manter foco visível, altura mínima de toque, fontes ampliadas, contraste diferenciado e rolagem. O HTML principal e o service worker são arquivos comuns às plataformas, por isso o PR usa escopo `[all]`, embora os estilos sejam exclusivos da Web.

# Educa+ Digital V111.40 — Painel lateral de acessibilidade

A V111.40 foi construída sobre a V111.39. **Não há alterações no banco ou no backend da LIA.**

- Botão de acessibilidade permanece no cabeçalho da página inicial e abaixo de "Sair da tela cheia" quando o protótipo estiver ampliado.
- Quando acionado, abre **painel lateral à direita** com fundo suavemente escurecido, sem cobrir o centro da tela com um modal grande.
- No celular, o painel ocupa a largura da tela para manter a leitura e os controles confortáveis.
- Letras maiores, contraste reforçado e leitura em voz alta permanecem independentes e salvos no navegador.
- Os três botões antigos do rodapé foram reorganizados: **Restaurar padrão** discreto e **Concluir** em destaque. O botão **Fechar (X)** fica no cabeçalho.
- Alterações aplicadas na hora; clicar fora, tocar em X ou pressionar Esc fecha o painel.
- As atividades, trilhas, pré-teste, Modo Livre, LIA e Kokoro foram preservados.

## Executar

No VS Code, execute `npm.cmd install` e `npm.cmd run dev`. Abra o endereço informado pelo terminal (em geral http://localhost:8787). Para limpar cache, `Ctrl+Shift+R`.

## Verificações

Execute `npm.cmd test` e revise manualmente em desktop, celular e tela cheia. O serviço não foi publicado no Cloudflare.

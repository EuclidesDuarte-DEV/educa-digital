# Educa+ Digital — V111.76 | Atividades simplificadas (exclusivamente Web)

## Referência aprovada pela equipe

As duas imagens enviadas mostram a mesma trilha **PIX** em dois estados:

- **0/3 e 0%**: cabeçalho cinza-claro, botão Voltar, texto "Atividades livres / PIX", cartão de orientação "Aprenda como fazer um Pix com segurança", subtítulo "Siga os passos e pratique no seu ritmo.", indicador de progresso e cartões numerados: **Encontrar o Pix no banco**, **Entender as chaves Pix**, **Reconhecer pedido suspeito**.
- **3/3 e 100%**: substitui a introdução pela mensagem de parabéns, mantém os três cartões (agora com indicadores ✓) disponíveis para revisão e exibe "Volte quando quiser para revisar o que aprendeu!".

A versão Web foi refinada usando esse modelo: fundo branco e neutro, pouco texto, cartões de toque grandes, contraste escuro, cantos arredondados, sem badges duplicados de capítulo nem descrições sob cada atividade. Os demais assuntos usam a mesma composição simplificada, sem inventar progresso.

## Arquitetura / isolamento

Arquivos de interface alterados: **somente**
- `public/static/channels/web/overrides.css`
- `public/static/channels/web/overrides.js`

O canal só é carregado quando `data-educa-platform="web"`. **Não modificamos** `training.js`, HTML compartilhado, Android, iOS, banco D1 ou dados de usuários. A edição continua respeitando o escopo `[web]` do validador de plataformas.

O JavaScript do canal Web observa a reconstrução original da lista `#moduleLessonList` feita por `training.js`. Seu contador é calculado usando os cartões de verdade com `.is-complete`, que por sua vez dependem da lógica de progresso do sistema. **Não existe novo armazenamento nem conclusão artificial**.

A atualização não muda `data-module-lesson`, seus botões ou os listeners responsáveis por abrir vídeos e atividades. Ao terminar, os botões permanecem ativos para revisão.

Para PIX, o texto introdutório replica a proposta da equipe. Para os demais assuntos, preserva-se a descrição específica do assunto definida no motor de atividades. O CSS utiliza variáveis separadas para textos Normal, Grande e Muito grande, sem transformação de escala.

## Como validar

1. Abrir a Web oficial e escolher **Atividades → PIX**, com progresso zerado: introdução e `0/3`, três cartões numerados, terceiro acessível com rolagem.
2. Concluir uma atividade e voltar: conferir `1/3` e o indicador ✓ somente na concluída.
3. Concluir as três: conferir mensagem `Parabéns! 100% das atividades concluídas!`, três indicadores ✓ e nota final de revisão.
4. Tocar uma concluída: o fluxo de vídeo/atividade original precisa abrir sem perder a conclusão.
5. Repetir em fonte Normal, Grande e Muito grande, em janela de celular, tablet, PC e tela cheia.
6. Testar outro tema de 4 atividades: contador `x/4` e textos de seu próprio tema.
7. Conferir que Android e iOS preservam exatamente o layout anterior.

## Testes automatizados

`tests/platform-web-simple-activities-v11176.test.js` reproduz 0/3, 1/3, 2/3, 3/3, abertura de outra trilha com quatro lições, ausência de mudanças Android/iOS e estrutura visual. As verificações originais de Pix, responsividade, login e progresso continuam aplicáveis no CI.

Se o navegador carregar folhas antigas em cache, atualizar a página forçando recarga (`Ctrl+F5` em desktop) ou fechar/reabrir a aba. O Service Worker original usa a estratégia rede-primeiro para assets de `/static/`.

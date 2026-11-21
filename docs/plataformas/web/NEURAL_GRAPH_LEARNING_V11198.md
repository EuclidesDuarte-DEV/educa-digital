# V111.98 — Grafo Neural conectado à LIA e liberação revisada

## Estado constatado em produção
O diagnóstico /api/lia/neural/health informa RAG ativo com **quatro notas publicadas**. O painel da equipe mostra **31 nós e 43 relações**, mas rascunhos e memórias não são automaticamente utilizados no prompt da IA.

## O que foi melhorado
1. **RAG com vínculos do grafo:** a IA Web continua recuperando até três notas pertinentes e acrescenta no máximo um conhecimento conectado **também publicado e público**, limitado a 1.500 caracteres no total. Arestas privadas, categoria memoria, rascunhos e textos sem aprovação continuam excluídos. WhatsApp, SMS, ligação e LIA usam a mesma rota Web; nativo Android/iOS permanece independente.
2. **Ativação da biblioteca após revisão:** o painel administrativo mostra quantas notas estão disponíveis para LIA. O botão `Revisar notas para LIA e WhatsApp` lista fontes candidatas, permite abrir o conteúdo e selecionar notas revisadas para publicar. A ação em lote é **autenticada** pelo token existente, exige confirmação explícita e aceita no máximo 25 IDs distintos por operação. Apenas notas de conhecimento, cenário e decisão com fonte HTTPS de instituições conhecidas (gov.br, Banco Central, CERT.br, NIC.br ou Febraban) são elegíveis. Não publica memórias, aprendizado pessoal, notas sem fonte validada, textos com dados sensíveis detectados ou qualquer conteúdo automaticamente.
3. **Aprendizado com participantes:** o D1 já acrescenta contagens anônimas de decisões e perguntas por cenário **somente quando o participante autorizou**. Novo painel `Ver dificuldades coletivas` mostra orientações educativas apenas em cenários com **12 ou mais** exercícios consentidos nos últimos 30 dias. Sem revelar dados individuais.
4. **Exemplos consentidos:** permanecem com retenção máxima de sete dias, revisão administrativa, sem entrar automaticamente no RAG. As conversas completas não são gravadas indiscriminadamente.

## Limites
O grafo e os registros permitem *adaptação de treinamento por recuperação e estatísticas*, e não retreinamento dos pesos do modelo. Dados pessoais, áudio, histórico integral e informações bancárias reais não devem ser persistidos sem uma base legal, consentimento significativo e controles técnicos proporcionais. A revisão humana impede que informação não verificada enviada por participantes vire resposta de referência.

O sistema não torna técnicas de fraude reais mais eficazes; o objetivo são simulações educativas mais coerentes, com identificação do treino, verificação independente e sinais de alerta.

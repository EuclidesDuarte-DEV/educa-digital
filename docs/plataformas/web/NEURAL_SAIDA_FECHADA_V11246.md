---
tags: [educa-digital, lia-neural, seguranca, integridade-personagem]
version: V112.46
visibility: private
---
# Saída fechada e isolamento da IA

Complementa [[NEURAL_INTEGRIDADE_PERSONAGEM_V11245]].

- O modelo seleciona um identificador de um catálogo fechado por cenário.
- O servidor resolve o identificador; nunca exibe texto livre do modelo, mesmo se a entrada não for detectada.
- Sem notas privadas, RAG bruto, credenciais ou ferramentas no seletor.
- Histórico do contato só contém falas previamente aprovadas; mensagens do participante são dados.
- Falha de seleção usa resposta segura local. Encerramento e verificação legítima têm prioridade.
- Não grava exemplos brutos pelo seletor. Indicadores de resultado consentidos continuam no endpoint próprio.
- Limite: a seleção pode ser manipulada entre opções aprovadas; a conversa fica menos livre. O catálogo é a fronteira de segurança, não o prompt.

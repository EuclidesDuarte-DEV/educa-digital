# V111.12 — teste automatizado

- Testes JavaScript: 65 aprovados (`npm test`).
- Motor Python: 8 aprovados (`python -m unittest discover -s lia_motor -p 'test_*.py' -v`).
- Testes de fluxo com temporizadores simulados: WhatsApp → resumo temporizado → videochamada → resumo temporizado → ligação telefônica → nova situação. Sair do treino cancela a transição.
- Checagens de HTML/CSS: controles de diagnóstico recolhidos, legenda expansível e ferramenta de conferir identidade preservada.

Foi renderizada uma prévia estática do telefone em Chromium para conferência do enquadramento em tamanhos de 390 px e 1200 px de viewport; após detectar rótulo de botão grande, ele foi corrigido. Não se trata de teste funcional ponta a ponta no navegador. Validação de GPU real e implantação no Worker de produção não foram realizadas; esses pontos requerem teste manual no dispositivo e na hospedagem.

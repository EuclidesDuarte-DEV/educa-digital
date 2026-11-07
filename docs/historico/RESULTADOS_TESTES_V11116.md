# Testes V111.16 — Lia com voz mais natural

- 74 testes Node.js aprovados (`npm test`).
- 14 testes Python aprovados (`python -m unittest discover -p 'test_*.py' -q`, dentro de `lia_motor`).
- Testes incluem escolha do estilo, passagem autenticada pelo Worker, normalização PT-BR, pausas, montagem de WAV, mocks de Kokoro e Chatterbox.
- **Ainda não foi testada a inferência real com pesos de Kokoro/Chatterbox ou GPU de MuseTalk neste ambiente.** Não afirmar que a voz humanizada foi avaliada por audição nem que o modelo está implantado na Cloudflare.

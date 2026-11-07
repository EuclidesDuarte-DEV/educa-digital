# Regras para manutenção — Educa+ Digital (base funcional V111.40)

1. Leia `README.md`, `wrangler.toml`, `docs/ESTRUTURA.md` e os testes antes de alterar código.
2. Preserve o pré-teste, os módulos e **todas as atividades atualmente implementadas**. O catálogo pode crescer; não imponha uma quantidade fixa como limite de projeto.
3. Preserve mídias, tutoriais, acessibilidade, a experiência Android original, Modo Livre (WhatsApp → videochamada), LIA AI, voz Kokoro opcional, banco e interfaces responsivas.
4. O simulador é educativo e usa dados fictícios. Não integre contas bancárias reais, credenciais de usuários ou pagamentos reais.
5. Não exponha chaves/segredos da IA no navegador. Nunca inclua `.env`, `.dev.vars`, `.venv` ou bancos locais em pacotes de distribuição.
6. Não execute deploy ou migração D1 remotos sem autorização. O esquema de `banco/schema.sql` é usado pelo ambiente local.
7. Valide `npm test`, pré-teste, cadastro, acessibilidade, atividades, WhatsApp e videochamada em computador e celular.
8. `docs/historico/` reúne notas de versões anteriores; não as trate como configuração atual ou como checklist de funcionalidade concluída.
9. A V111.41 só reorganiza arquivos e documentação. O GitHub/Cloudflare não são alterados automaticamente.

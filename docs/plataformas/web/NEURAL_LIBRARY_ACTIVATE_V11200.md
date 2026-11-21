# V112.00 — preparar D1 Neural diretamente por deploy do Worker

Autorização do proprietário: importar o conteúdo existente da biblioteca e liberar somente conhecimentos verificados, sem solicitar o token administrativo de produção.

## Processo executável
- `LIA_NEURAL_LIBRARY_BOOTSTRAP=true` em produção e Preview, com bancos D1 isolados.
- `GET /api/lia/neural/health` importa a primeira vez (e não bloqueia respostas de áudio ou chats do Modo Livre).
- Em transações/lotes idempotentes: 15 notas iniciais, 16 pesquisas de golpes, 19+24 conexões originais e 5 conexões adicionais entre notas publicadas e orientações já verificadas.
- Todas as 31 notas novas entram em `draft/private`. As quatro notas oficiais existentes são preservadas.
- Cinco notas de fontes institucionais específicas foram verificadas editorialmente e são publicadas por identificador. Exige fonte e texto exatamente iguais aos do repositório original; se um administrador alterou a nota, não é liberada automaticamente.
- Controle `lia_kb_bootstrap_jobs` registra `neural-full-library-v11200` somente depois de concluir. Não apaga notas, não sobrescreve conteúdos existentes, não grava históricos de conversas, não depende do segredo administrativo.
- `/api/lia/neural/health` informa `node_count`, `link_count`, `published_count` e `library_bootstrapped` (somente números e estado, sem conteúdo privado).
- **Expectativa caso o banco oficial tenha somente as quatro notas anteriores:** 35 nós, 48 conexões e 9 notas publicadas. Se o administrador já importou algumas, o SQL idempotente preserva o estado e evita duplicação; contagens podem variar.

## Fontes conferidas em 21 nov. 2026
1. Febraban, `research-central-2026`: https://portal.febraban.org.br/noticia/4471/pt-br
2. INSS, `research-inss-prova-2026`: https://www.gov.br/inss/pt-br/assuntos/noticias/inss-alerta-aposentados-sao-vitimas-de-golpe-envolvendo-falsa-prova-de-vida/
3. INSS, `research-inss-biometria-2026`: https://www.gov.br/inss/pt-br/assuntos/noticias/inss-esclarece-e-falsa-a-informacao-de-que-vai-bloquear-beneficio-de-quem-nao-tiver-documento-com-biometria
4. NIC.br/CERT.br, `research-deepfake-video-2026` e `research-clonagem-voz-2026`: https://nic.br/noticia/releases/vai-usar-ia-novo-fasciculo-do-cert-br-da-dicas-de-como-tirar-proveito-da-tecnologia-de-forma-segura-e-responsavel/

Outras notas aguardam conferência editorial pela equipe; nenhuma memória de participante ou exemplo privado foi publicada. Android/iOS nativos e Kokoro não sofrem alterações.

## Confirmação
Após deploy, consultar o diagnóstico oficial e verificar `library_bootstrapped=true`, contagem de notas e `rag_active=true`. O painel administrativo já exibirá a biblioteca real ao atualizar. A função "Preparar biblioteca completa" permanece idempotente caso usada novamente.

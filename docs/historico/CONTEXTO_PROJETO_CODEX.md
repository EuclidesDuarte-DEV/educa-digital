# Educa+ Digital — contexto técnico e histórico para Codex

> Atualizado em 24 de outubro de 2026, com base no projeto V104.6 local, no repositório GitHub e em verificação HTTP da hospedagem. Datas e versões devem ser rechegadas quando usadas futuramente.

## 1. Finalidade e público
O Educa+ Digital é um protótipo de inclusão digital que ensina usuários, prioritariamente pessoas idosas, a usar ferramentas digitais em um ambiente seguro e simulado. Secundariamente atende adultos e estudantes. A experiência enfatiza autonomia, acessibilidade, orientação gradual, botões grandes, bom contraste, linguagem natural do Brasil e redução de poluição visual.

## 2. Estado e versões — três ambientes distintos
- **Versão local mais recente entregue:** V104.6, pasta `EDUCA_DIGITAL_V104_6_PIX_ARCHIE_VOZ_UNICA` (este pacote é uma cópia pronta para Codex). Não foi automaticamente enviada ao GitHub nem publicada na Cloudflare.
- **GitHub existente:** https://github.com/EuclidesDuarte-DEV/educa-digital — repositório público, branch padrão `main`, README descrevendo a **V102** organizada. Clone: `https://github.com/EuclidesDuarte-DEV/educa-digital.git`. Não presuma que contém V104.6.
- **Hospedagem pública:** https://educa-digital.educamaisdigital.workers.dev — Cloudflare Workers com assets estáticos e banco D1. Em teste HTTP em 24/10/2026 retornou 200; o `training.js` servido apontava para `/static/videos/pix-key.mp4?v=1043`, portanto não correspondia à V104.6.
- **Importante:** `compatibility_date` no Wrangler não indica a versão implantada. Diferenças entre código de produção e ZIP devem ser auditadas ANTES de sobrescrever produção.

## 3. Estrutura, tecnologia e implantação
- **Frontend:** HTML semântico em `public/html/index.html`; CSS em `public/static/css/app.css` e `android-system.css`; JavaScript de trilhas e simuladores em `public/static/js/training.js`, `android-system.js` e `android-bridge.js`.
- **Mídias e PWA:** `public/static/videos`, `/icons`, `/icons_pwa`, `/img`, `public/static/sw.js` e `manifest.webmanifest`.
- **Servidor local:** Python/Flask (`app.py`) + SQLite local em `.local/educa_digital.sqlite3`. Mesmo HTML/JS/CSS do Worker; banco separado do remoto.
- **Servidor em produção:** Cloudflare Worker (`src/worker.js`), catálogo (`src/catalogo.js`), assets (`public/`) e banco Cloudflare D1 ligado por `wrangler.toml`. Nome do Worker e banco: `educa-digital`; binding `DB`. Não colocar o identificador do banco em logs públicos, usar config local existente.
- **Conteúdo pedagógico:** `data/modulos.json` (6 módulos, 22 atividades); existe representação similar em `src/catalogo.js`. Ao alterar catálogo, manter ambos consistentes.
- **Testes:** `tests/*.test.js` para Node/Worker/Android; `tests/test_*.py` para Flask/SQLite. Na verificação deste pacote, seis testes Node passaram; ainda realizar testes de ponta a ponta e em celulares reais.
- **Publicação:** `npm.cmd install`, `npm.cmd test`, `npm.cmd run deploy` apenas após autenticação Wrangler, revisão e aprovação. Cache PWA (`public/static/sw.js`) deve ser versionado coerentemente para não servir arquivos antigos.

## 4. Produto e módulos educacionais
O catálogo vigente contém 6 módulos e 22 atividades:
1. PIX: 3 capítulos/3 atividades (abrir Pix no banco, conhecer chaves, prevenção de golpes).
2. Segurança: 4 capítulos/4 atividades (falso familiar, links falsos, código SMS, falsa central bancária).
3. WhatsApp: 4 capítulos/4 atividades (conversas, mensagens, chamadas, outros recursos conforme catálogo).
4. Ajustes: 3 capítulos/3 atividades (fonte, som e Wi-Fi).
5. GOV.BR: 4 capítulos/4 atividades (serviços e navegação simulada conforme catálogo).
6. Apps seguros/Play Store: 4 capítulos/4 atividades (buscar/instalar com cautela, conferir permissões e proteção conforme catálogo).
Fonte da verdade para nomes exatos e passos: `data/modulos.json` e `public/static/js/training.js`.

## 5. UX, acessibilidade e Android simulado
- Inicialmente o foco é no idoso: tipografia legível, interface azul, alvos de toque grandes, frases curtas, redução de ruído visual, responsividade para notebooks, celulares e tablets.
- A home tem chamada principal, selo de confiança e simulador de celular com pré-teste.
- O sistema Android é apenas educativo, feito em HTML/CSS/JS: notificações e ajustes rápidos, Wi-Fi/Bluetooth/modo avião/brilho fictícios, gestos de voltar, aplicativos recentes, modo normal e ampliado. Não é sistema Android verdadeiro.
- A trilha se apoia em vídeos + prática; progresso e preferências de acessibilidade são modelados no backend.
- Revisões V104: cards mais legíveis, controles de ampliação do vídeo e preservação do enquadramento. Necessários testes reais no iPhone/Safari, Android, zoom e navegação por teclado/leitores de tela.

## 6. Narração Pix — decisão aprovada
O usuário recusou a narração com pronúncia de Portugal/estrangeira e aprovou a voz **Archie em português brasileiro**. Aula: `PIX > Chaves Pix > Entender as chaves Pix`, código `pix-key`, capítulo 2/3. Vídeo intacto visualmente: 17,875 segundos, H.264. O áudio aprovado foi incorporado como AAC, sem a narração antiga. **Não exibir botão extra de voz, não permitir seleção Portugal vs. Brasil**.

MP4 final aprovado:
https://d2ol7oe51mr4n9.cloudfront.net/user_3L7kVPrU6jkavZYl2V0lQ2eS9ko/5cb5c6b1-5c6b-4776-b950-b64a51c2b376.mp4

Em V104.6, `public/static/js/training.js` usa essa URL externa. O arquivo `public/static/videos/pix-key.mp4` **não está no ZIP** para evitar enviar a versão antiga. A melhoria recomendada é baixar o MP4 final e salvá-lo localmente no projeto com esse nome, atualizar a referência do vídeo e a entrada correspondente em catálogo/URLs se necessário, testar mídia e cache. Conferir licença/disponibilidade da mídia antes da publicação; **não trocar a voz ou refazer o vídeo sem aprovação**.

## 7. Banco de dados e segurança
Tabelas observadas em `banco/schema.sql`: `modulos`, `capitulos`, `atividades`, `usuarios`, `codigos_acesso`, `perfil_acessibilidade`, `progresso`. O D1 hospedado é banco distinto do SQLite local.
O login de demonstração expõe código na interface para fins educacionais; NÃO é método seguro de autenticação real. Utilizar dados fictícios em demos. Não rodar scripts de schema/migração na produção existente sem plano de backup, inspeção SQL e autorização.
Endpoints implementados no Worker incluem: `GET /api/saude`, `GET /api/estrutura`, `POST /api/conta`, `POST /api/login/codigo`, `POST /api/login/confirmar`, `GET/POST /api/progresso`, `GET/PATCH /api/perfil-acessibilidade`.

## 8. Histórico resumido
- V99–V101: evolução mobile, responsividade e design system; fluxo de acesso unificado.
- V102: organização do projeto, banco, scripts, testes e publicação GitHub.
- V103: Android simulado mais completo, notificações, painel rápido e gestos.
- V104: revisão solicitada pela mentoria (cards, layout de vídeos e idiomas da narração).
- V104.1–V104.5: revisões do Pix e tentativas de narração/controles; os botões de escolha de voz das versões intermediárias foram **removidos**.
- **V104.6:** versão local de referência atual; vídeo Pix único com a voz Archie brasileira incorporada; ainda não comprovadamente publicado no site ou no GitHub.

## 9. Próximos passos recomendados, nesta ordem
1. Abrir este pacote V104.6 no VS Code; executar testes; capturar `git status` (a pasta ZIP extraída pode não possuir `.git`).
2. Inventariar código, rotas, páginas, efeitos do PWA, módulos, vídeos e integração D1. Comparar V104.6 local com `main` do GitHub e com a versão publicada, sem alterar produção.
3. Tornar o MP4 Pix Archie local e estável, mantendo um único player e português brasileiro, sem introduzir narração europeia.
4. Auditar responsividade, zoom, acessibilidade, iPhone/Android, ambiente de pré-teste, navegação dos aplicativos simulados, vídeos e progressos.
5. Atualizar documentação (`README`), depois preparar branch e PR para sincronização com GitHub, mediante autorização.
6. Só depois de revisão, testes e backup do estado atual, propor deploy via Wrangler. Nunca assumir que deploy = migração D1.

## 10. Limitações e itens a confirmar
A V104.6 não foi implantada automaticamente na Cloudflare. Não há evidência de que o login fictício seja adequado para dados pessoais reais. Alguns vídeos de outras aulas também dependem de URLs remotas e requerem auditoria de estabilidade. A saída visual em dispositivo físico e a persistência real remota precisam de validação antes de uma demonstração definitiva.

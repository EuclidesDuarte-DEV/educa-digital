# Educa+ Digital — V102 (código organizado)

Protótipo educacional para praticar atividades digitais com segurança. Projeto pensado inicialmente para pessoas idosas, com celular Android simulado, pré-teste de Pix, vídeos e atividades. **Mantém a interface e as simulações da V102**, sem substituir seu HTML, CSS e JavaScript.

## Organização dos arquivos

```text
EDUCA_DIGITAL_V102_GITHUB_AVALIACAO/
├── app.py                       # Servidor Flask para demonstração local
├── requirements.txt             # Dependência Python
├── README.md                    # Guia de execução
├── banco/
│   ├── schema.sql               # Estrutura completa (nova instalação local)
│   └── migracao_d1.sql          # Migração opcional do D1 existente
├── data/
│   └── modulos.json             # Módulos, capítulos e atividades
├── public/                      # Mesma interface usada no Flask e na Cloudflare
│   ├── html/
│   │   └── index.html           # Página inicial e celular virtual
│   └── static/
│       ├── css/app.css          # Layout, componentes e responsividade
│       ├── js/                  # Interações, pré-teste e simuladores
│       ├── icons/               # Ícones dos aplicativos Android
│       ├── icons_pwa/           # Ícones de instalação
│       ├── img/                 # Logo e imagens
│       ├── videos/              # Vídeos das atividades
│       ├── manifest.webmanifest # Configuração PWA
│       └── sw.js                # Cache do aplicativo web
├── src/                         # API usada na Cloudflare
│   ├── worker.js
│   └── catalogo.js
├── tests/                       # Testes do banco, Flask e Worker
├── wrangler.toml                # Hospedagem e vínculo com o D1 existente
└── package.json                 # Scripts de teste/deploy Cloudflare
```

**Por que uma pasta `public/static`?** Todos os arquivos acessados pelo navegador seguem o endereço `/static/...` tanto no Flask quanto na Cloudflare. Isso evita manter cópias distintas de CSS, JS ou mídia. O HTML fica **somente** em `public/html/index.html`; a página `/` é servida pelo Flask ou pelo Worker.

## Abrir com `app.py` (Windows / VS Code)

1. Extraia o ZIP e abra a pasta do projeto no VS Code.
2. No terminal PowerShell, execute:

```powershell
py -3 -m pip install -r requirements.txt
py -3 app.py
```

3. Abra `http://127.0.0.1:5000` no navegador.

O arquivo do banco local será criado em `.local/educa_digital.sqlite3` na primeira execução. Não é necessário configurar Cloudflare para testar localmente.

## Rodar testes

```powershell
py -3 -m unittest discover -s tests -p "test_*.py" -v
npm.cmd test
```

Testes Flask precisam da dependência de `requirements.txt`. Para os testes do Worker, recomenda-se Node.js 22 ou superior devido ao SQLite do Node usado nos testes.

## Cloudflare (somente quando quiser atualizar o site)

```powershell
npm.cmd install
npm.cmd run deploy
```

O `wrangler.toml` mantém o Worker `educa-digital` e a ligação ao D1 existente. A rota `/` busca internamente `public/html/index.html` e **não muda o endereço do site**. O conteúdo estático conserva as URLs `/static/css`, `/static/js`, etc.

**Não rode `banco/schema.sql` novamente no D1 que já existe.** O arquivo `banco/migracao_d1.sql` é opcional e contém alterações de estrutura: use somente após realizar backup e conferir a versão do banco remoto. A hospedagem por Cloudflare e a demonstração local Flask usam bancos separados.

## Modelo de dados

Baseado no diagrama do projeto: **módulos → capítulos → atividades**, com **usuários, progresso, códigos de acesso e perfil de acessibilidade**. A V102 conserva o identificador de atividade no progresso para compatibilidade.

## Limites de segurança

O cadastro e os códigos de acesso são demonstrativos. O código de login retorna na própria API para a atividade educativa: **não use como autenticação real**. Não informe dados bancários, CPF, senhas ou números pessoais de participantes; use apenas dados fictícios nas avaliações.

---

**Dica para o avaliador:** abra `public/html/index.html` para estudar a estrutura semântica; `public/static/css/app.css` para analisar o design; `public/static/js/training.js` para explorar o simulador; `app.py` e `banco/schema.sql` para ver backend e modelo de dados.

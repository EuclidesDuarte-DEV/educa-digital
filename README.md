# V111.45 — atalho de acessibilidade responsivo na central do aluno

Para celular/tablet, **Acessibilidade** e **Ver guia novamente** ficam visíveis na parte superior da central após login; no computador continuam no rodapé. Leia `LEIA_PRIMEIRO_V11145.md`.

---

# V111.44 — Guia automático no primeiro cadastro/login

Após a primeira entrada na conta, a tela de aprendizagem oferece **6 passos guiados**, com destaque nos elementos reais, opção de voltar/pular e botão para rever. A conclusão é guardada localmente por conta. Leia `LEIA_PRIMEIRO_V11144.md`.

---

# Educa+ Digital — V111.42 (inicialização única da LIA)

Projeto de **educação e segurança digital** com interface web responsiva e celular Android simulado. Este pacote é uma **reorganização da V111.40**, sem alteração intencional nas funcionalidades, no banco de dados, no conteúdo dos treinos ou no código da LIA AI.

## Iniciar todos os servicos locais com um clique (Windows)

1. Abra **`INICIAR_EDUCA_COM_LIA.cmd`** na pasta principal (ou `npm.cmd run dev:lia` no terminal do VS Code).
2. O iniciador verifica serviços existentes, liga **Ollama** e o **motor Kokoro Python** *se já estiverem instalados* e sobe o site local Flask na porta **5015**.
3. Ao responder, abre automaticamente `http://127.0.0.1:5015`. Se algum serviço opcional não estiver configurado, exibe a pendência sem tentar instalar modelos grandes.
4. Mantenha o terminal aberto. Para desligar os processos iniciados por esta sessão, pressione `Ctrl+C`.

**Importante:** é um iniciador LOCAL para desenvolvimento/demonstração. O navegador **não pode iniciar programas Windows automaticamente ao visitar uma página**. No endereço público Cloudflare, o backend da LIA exige hospedagem própria, não pode depender do notebook. **Kokoro no navegador** já realiza pré-aquecimento ao iniciar o Modo Livre, quando o visitante tem os recursos necessários.

A pasta `LIGAR_LIA_EDUCA/` foi preservada apenas por compatibilidade com os scripts antigos; não é necessária no fluxo de um clique. O comando `npm.cmd run dev` continua a iniciar o Cloudflare Wrangler, em `localhost:8787`, **sem ligar automaticamente Ollama/Kokoro Python**; para a LIA local use o iniciador acima.

## Abrir no VS Code (Windows)

1. Extraia o ZIP e abra a pasta `EDUCA_DIGITAL_V111_41_PROJETO_ORGANIZADO` no VS Code.
2. No terminal PowerShell, execute:

```powershell
npm.cmd install
npm.cmd test
npm.cmd run dev
```

3. Abra a URL exibida pelo Wrangler (geralmente `http://localhost:8787`). O comando `predev` prepara o **D1 local** usando `banco/schema.sql` — não o D1 remoto.

> Para rodar é necessário ter Node.js instalado. Não execute `wrangler deploy` ou migrações remotas sem revisão e autorização. Nenhuma credencial está incluída no pacote.

## Funcionalidades principais

- Pré-teste, trilhas e atividades educativas interativas, com dados fictícios.
- Celular virtual, módulos de Pix, segurança, WhatsApp, ajustes, GOV.BR e aplicativos.
- Modo Livre com simulações de golpes via WhatsApp e videochamada com LIA AI.
- Acessibilidade: painel lateral com tamanho de texto, contraste e leitura em voz alta; tutorial inicial guiado.
- Integração com banco D1/SQLite e serviços Cloudflare Workers.
- Motor Kokoro opcional da LIA. Os recursos de voz neural podem exigir download de modelo, backend local e configurações/recursos externos. Não há garantia de voz neural rápida em todo computador.

## Organização das pastas

```text
EDUCA_DIGITAL_V111_41_PROJETO_ORGANIZADO/
├── banco/            # Esquema e migração (NÃO aplicar remotamente sem autorização)
├── data/             # Catálogo das atividades
├── public/           # Páginas HTML, CSS, JS, logo, vídeos, áudio e PWA
├── src/              # Cloudflare Worker e APIs
├── tests/            # Testes Node.js
├── testes_lia_educa/ # Testes Python do Modo Livre
├── lia_motor/        # Motor local opcional da LIA e seus arquivos de mídia
├── LIGAR_LIA_EDUCA/  # Comandos legados de inicialização da LIA local
├── deploy/           # Preparo opcional de infraestrutura Kokoro
├── scripts/windows/  # Utilitários antigos de diagnóstico/inicialização
├── docs/historico/   # Guias e relatórios das versões anteriores
├── docs/ESTRUTURA.md # Registro da limpeza e preservação
├── app.py            # Execução local alternativa em Flask
├── lia_educa_local.py
├── requirements.txt
├── package.json
├── wrangler.toml
└── README.md
```

## Manutenção e versionamento

- Código-fonte: `src/`, `public/`, `app.py`, `lia_motor/` e utilitários específicos.
- Testes: `npm.cmd test` (Node.js). Os testes Python são independentes e dependem de seus pacotes.
- Arquivos históricos não precisam ficar na raiz: foram movidos para `docs/historico/` **sem exclusão**.
- O repositório remoto `EuclidesDuarte-DEV/educa-digital` não foi alterado; **este ZIP não é um deploy**.
- Antes de migrar esta organização para o GitHub, verifique o `git status` e gere um commit/PR específico, preservando o trabalho existente.

**Status:** reorganizado localmente. Teste visual final no seu ambiente ainda recomendado antes de publicar.

## V111.43 — Guia de primeiros passos

O tour agora apresenta **Começar meu treino → Banco (pré-teste) → Acessibilidade**; pressione **Como usar** para rever. Detalhes em `docs/GUIA_VISUAL_V11143.md`. Não houve publicação no GitHub ou Cloudflare.

### V111.47 — Acesso simples e acessibilidade responsiva
- Campo inicial de telefone com DDD, com identificação de conta pré-existente e confirmação **demonstrativa**.
- Layout que aumenta textos sem `zoom` global, controles padronizados e atalhos de acessibilidade no celular.
- Guia com leitura em voz alta ativada por padrão em novas preferências, depois do primeiro toque permitido pelo navegador.
- Detalhes, testes e limitações em `LEIA_PRIMEIRO_V11147.md`.

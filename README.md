# Educa+ Digital

Plataforma de educação e inclusão digital voltada principalmente para pessoas idosas. O projeto ensina tecnologia por meio de explicações simples, prática guiada, atividades seguras e recursos de acessibilidade.

## Estrutura do projeto

```text
EDUCA_DIGITAL/
├── app.py                    # Rotas Flask e fluxo principal
├── backend/
│   ├── banco.py              # Conexão, criação e compatibilidade do banco
│   ├── aulas.py              # Conteúdo das trilhas, aulas e atividades
│   └── assistente.py         # Assistente Educa: texto, voz e IA
├── database/
│   ├── educa.db              # Banco SQLite usado localmente
│   ├── estrutura.sql         # Estrutura SQL do banco
│   └── migrar_para_neon.py   # Migração para PostgreSQL/Neon
├── templates/                # Telas HTML/Jinja
├── static/
│   ├── css/
│   │   ├── app.css           # Todo o visual padrão + páginas
│   │   └── acessibilidade.css# Temas e adaptações de acessibilidade
│   ├── js/
│   │   ├── app.js            # Comportamentos globais
│   │   ├── acessibilidade.js # Preferências de acessibilidade
│   │   ├── assistente.js     # Assistente Educa
│   │   ├── acesso.js         # Login, cadastro e recuperação
│   │   ├── estudos.js        # Tela de estudos
│   │   └── aula.js           # Aula interativa e simuladores
│   ├── img/                  # Logo, GIFs, fotos e ícones
│   └── video/                # Vídeo institucional
├── requirements.txt
└── render.yaml
```

## Regra simples para saber onde alterar

- **Mudou aparência comum?** `static/css/app.css`
- **Mudou modo sênior, contraste, cores ou leitura?** `static/css/acessibilidade.css`
- **Mudou uma tela?** procure primeiro em `templates/` e depois no JS correspondente.
- **Mudou aula, trilha ou atividade?** `backend/aulas.py`
- **Mudou cadastro, login ou progresso?** `app.py` + `backend/banco.py`
- **Mudou o assistente/voz/IA?** `backend/assistente.py` + `static/js/assistente.js`

## Por que existem 2 arquivos CSS?

O projeto foi reduzido para apenas dois CSS. `app.css` contém o Design System e o visual das páginas. `acessibilidade.css` fica separado de propósito e é carregado por último, pois precisa sobrescrever o tema normal quando o usuário ativa Modo Sênior, contraste, modo escuro ou outra configuração visual.

## Banco de dados

- Local: `database/educa.db` (SQLite).
- Produção: PostgreSQL/Neon quando `DATABASE_URL` estiver definida.
- Estrutura: `database/estrutura.sql`.

## Executar localmente

```bash
python -m pip install -r requirements.txt
python app.py
```

Acesse `http://127.0.0.1:5000`.

## Variáveis de ambiente

- `DATABASE_URL`
- `GROQ_API_KEY`
- `EDUCA_SECRET_KEY`

Nunca coloque chaves reais dentro do projeto ou do GitHub.

## Observações de manutenção

- Não criar um CSS novo para cada página. Antes, use as seções existentes de `app.css`.
- Não colocar estilos grandes diretamente dentro dos templates.
- JavaScript continua separado por responsabilidade porque isso deixa o código mais fácil de localizar sem carregar a lógica das aulas em todas as telas.
- Imagens, GIFs e vídeo existentes foram preservados.

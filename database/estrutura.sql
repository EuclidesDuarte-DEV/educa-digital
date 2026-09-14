-- Estrutura principal do banco de dados do Educa+ Digital.
-- Em produção, este esquema é usado no PostgreSQL do Neon.

CREATE TABLE IF NOT EXISTS usuarios (
    id BIGSERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha_hash TEXT NOT NULL,
    login_nome TEXT UNIQUE,
    telefone TEXT,
    recuperacao_hash TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_login_nome
    ON usuarios(login_nome)
    WHERE login_nome IS NOT NULL;

CREATE TABLE IF NOT EXISTS progresso_inicio (
    usuario_id BIGINT PRIMARY KEY
        REFERENCES usuarios(id) ON DELETE CASCADE,
    trilha_slug TEXT NOT NULL DEFAULT 'informatica-basica',
    aula_atual INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS progresso_aula_interativa (
    usuario_id BIGINT PRIMARY KEY
        REFERENCES usuarios(id) ON DELETE CASCADE,
    aula_slug TEXT NOT NULL,
    passo_atual INTEGER NOT NULL DEFAULT 1,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS aulas_concluidas (
    usuario_id BIGINT NOT NULL
        REFERENCES usuarios(id) ON DELETE CASCADE,
    aula_slug TEXT NOT NULL,
    concluida_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, aula_slug)
);

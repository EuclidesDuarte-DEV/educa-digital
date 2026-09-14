import os
import re
import secrets
import sqlite3
import unicodedata
from pathlib import Path



BASE_DIR = Path(__file__).resolve().parents[1]
BANCO = BASE_DIR / "database" / "educa.db"

# No Render, DATABASE_URL recebe a connection string do Neon.
# Sem DATABASE_URL, o projeto continua usando SQLite localmente.
DATABASE_URL = os.environ.get("DATABASE_URL", "").strip()
USAR_POSTGRES = bool(DATABASE_URL)


psycopg = None
dict_row = None

if USAR_POSTGRES:
    try:
        import psycopg as _psycopg
        from psycopg.rows import dict_row as _dict_row
    except ImportError as erro:
        raise RuntimeError(
            "Para usar o Neon/PostgreSQL, instale psycopg[binary]."
        ) from erro
    psycopg = _psycopg
    dict_row = _dict_row


def _sql_postgres(sql):
    """Adapta os placeholders compartilhados para o formato do PostgreSQL."""
    return sql.replace("?", "%s")


class ConexaoPostgres:
    def __init__(self):
        self._conexao = psycopg.connect(
            DATABASE_URL,
            row_factory=dict_row,
            prepare_threshold=None,
            connect_timeout=10,
        )

    def __enter__(self):
        self._conexao.__enter__()
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        return self._conexao.__exit__(exc_type, exc_value, traceback)

    def execute(self, sql, parametros=()):
        return self._conexao.execute(
            _sql_postgres(sql),
            parametros or (),
        )


def conectar_banco():
    if USAR_POSTGRES:
        return ConexaoPostgres()

    conexao = sqlite3.connect(BANCO)
    conexao.row_factory = sqlite3.Row
    conexao.execute("PRAGMA foreign_keys = ON")
    return conexao


def normalizar_login(valor):
    """Converte um nome em um identificador simples e fácil de digitar."""
    valor = unicodedata.normalize("NFKD", (valor or "").strip().lower())
    valor = "".join(c for c in valor if not unicodedata.combining(c))
    valor = re.sub(r"[^a-z0-9._-]+", ".", valor)
    valor = re.sub(r"[._-]{2,}", ".", valor).strip("._-")
    return valor[:32]


def normalizar_telefone(valor):
    """Mantém apenas os números do celular e aceita DDD brasileiro."""
    digitos = re.sub(r"\D", "", (valor or "").strip())
    # Aceita também +55/55 digitado antes do DDD.
    if digitos.startswith("55") and len(digitos) in (12, 13):
        digitos = digitos[2:]
    return digitos[:11]


def formatar_telefone(valor):
    digitos = normalizar_telefone(valor)
    if len(digitos) == 11:
        return f"({digitos[:2]}) {digitos[2:7]}-{digitos[7:]}"
    if len(digitos) == 10:
        return f"({digitos[:2]}) {digitos[2:6]}-{digitos[6:]}"
    return digitos


def sugestao_login(nome):
    partes = [normalizar_login(p) for p in (nome or "").split() if normalizar_login(p)]
    if not partes:
        return "aluno"
    if len(partes) == 1:
        return partes[0]
    return f"{partes[0]}.{partes[-1]}"[:32]


def login_disponivel(conexao, login_nome, ignorar_id=None):
    if ignorar_id is None:
        row = conexao.execute("SELECT id FROM usuarios WHERE login_nome = ?", (login_nome,)).fetchone()
    else:
        row = conexao.execute(
            "SELECT id FROM usuarios WHERE login_nome = ? AND id <> ?",
            (login_nome, ignorar_id),
        ).fetchone()
    return row is None


def criar_login_unico(conexao, nome, preferido="", usuario_id=None):
    base = normalizar_login(preferido) or sugestao_login(nome)
    if len(base) < 3:
        base = f"aluno{base}"
    candidato = base
    if login_disponivel(conexao, candidato, usuario_id):
        return candidato
    for _ in range(40):
        candidato = f"{base[:27]}.{secrets.randbelow(90) + 10}"
        if login_disponivel(conexao, candidato, usuario_id):
            return candidato
    return f"aluno.{secrets.token_hex(4)}"


def email_visivel(email):
    email = (email or "").strip()
    return "" if email.endswith("@sem-email.educa.local") else email



def tipo_banco():
    """Retorna o banco ativo no ambiente atual."""
    return "postgresql" if USAR_POSTGRES else "sqlite"


def criar_usuario(conexao, nome, login_nome, telefone, senha_hash):
    """Cria um usuário sem expor detalhes do banco à rota de cadastro."""
    email_interno = f"{login_nome}.{secrets.token_hex(5)}@sem-email.educa.local"

    if USAR_POSTGRES:
        cursor = conexao.execute(
            """
            INSERT INTO usuarios (
                nome, email, senha_hash, login_nome, telefone, recuperacao_hash
            )
            VALUES (?, ?, ?, ?, ?, NULL)
            RETURNING id
            """,
            (nome, email_interno, senha_hash, login_nome, telefone),
        )
        return cursor.fetchone()["id"]

    cursor = conexao.execute(
        """
        INSERT INTO usuarios (
            nome, email, senha_hash, login_nome, telefone, recuperacao_hash
        )
        VALUES (?, ?, ?, ?, ?, NULL)
        """,
        (nome, email_interno, senha_hash, login_nome, telefone),
    )
    return cursor.lastrowid


ERROS_INTEGRIDADE = (sqlite3.IntegrityError,)
if psycopg is not None:
    ERROS_INTEGRIDADE += (psycopg.IntegrityError,)


def criar_banco():
    if USAR_POSTGRES:
        with conectar_banco() as conexao:
            conexao.execute(
                """
                CREATE TABLE IF NOT EXISTS usuarios (
                    id BIGSERIAL PRIMARY KEY,
                    nome TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    senha_hash TEXT NOT NULL,
                    login_nome TEXT UNIQUE,
                    telefone TEXT,
                    recuperacao_hash TEXT
                )
                """
            )

            # Migrações idempotentes para versões antigas.
            conexao.execute(
                "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS login_nome TEXT"
            )
            conexao.execute(
                "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS recuperacao_hash TEXT"
            )
            conexao.execute(
                "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefone TEXT"
            )

            conexao.execute(
                """
                CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_login_nome
                ON usuarios(login_nome)
                WHERE login_nome IS NOT NULL
                """
            )

            antigos = conexao.execute(
                """
                SELECT id, nome, login_nome
                FROM usuarios
                WHERE login_nome IS NULL OR login_nome = ''
                """
            ).fetchall()

            for antigo in antigos:
                novo_login = criar_login_unico(
                    conexao,
                    antigo["nome"],
                    usuario_id=antigo["id"],
                )
                conexao.execute(
                    "UPDATE usuarios SET login_nome = ? WHERE id = ?",
                    (novo_login, antigo["id"]),
                )

            conexao.execute(
                """
                CREATE TABLE IF NOT EXISTS progresso_inicio (
                    usuario_id BIGINT PRIMARY KEY
                        REFERENCES usuarios(id) ON DELETE CASCADE,
                    trilha_slug TEXT NOT NULL DEFAULT 'informatica-basica',
                    aula_atual INTEGER NOT NULL DEFAULT 1
                )
                """
            )

            conexao.execute(
                """
                CREATE TABLE IF NOT EXISTS progresso_aula_interativa (
                    usuario_id BIGINT PRIMARY KEY
                        REFERENCES usuarios(id) ON DELETE CASCADE,
                    aula_slug TEXT NOT NULL,
                    passo_atual INTEGER NOT NULL DEFAULT 1,
                    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """
            )

            conexao.execute(
                """
                CREATE TABLE IF NOT EXISTS aulas_concluidas (
                    usuario_id BIGINT NOT NULL
                        REFERENCES usuarios(id) ON DELETE CASCADE,
                    aula_slug TEXT NOT NULL,
                    concluida_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (usuario_id, aula_slug)
                )
                """
            )

        return

    # SQLite continua disponível para desenvolvimento local.
    with conectar_banco() as conexao:
        conexao.execute(
            """
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                senha_hash TEXT NOT NULL,
                login_nome TEXT UNIQUE,
                telefone TEXT,
                recuperacao_hash TEXT
            )
            """
        )

        colunas_usuario = {
            row["name"]
            for row in conexao.execute(
                "PRAGMA table_info(usuarios)"
            ).fetchall()
        }

        if "login_nome" not in colunas_usuario:
            conexao.execute(
                "ALTER TABLE usuarios ADD COLUMN login_nome TEXT"
            )

        if "recuperacao_hash" not in colunas_usuario:
            conexao.execute(
                "ALTER TABLE usuarios ADD COLUMN recuperacao_hash TEXT"
            )

        if "telefone" not in colunas_usuario:
            conexao.execute(
                "ALTER TABLE usuarios ADD COLUMN telefone TEXT"
            )

        conexao.execute(
            """
            CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_login_nome
            ON usuarios(login_nome)
            WHERE login_nome IS NOT NULL
            """
        )

        antigos = conexao.execute(
            """
            SELECT id, nome, login_nome
            FROM usuarios
            WHERE login_nome IS NULL OR login_nome = ''
            """
        ).fetchall()

        for antigo in antigos:
            novo_login = criar_login_unico(
                conexao,
                antigo["nome"],
                usuario_id=antigo["id"],
            )
            conexao.execute(
                "UPDATE usuarios SET login_nome = ? WHERE id = ?",
                (novo_login, antigo["id"]),
            )

        conexao.execute(
            """
            CREATE TABLE IF NOT EXISTS progresso_inicio (
                usuario_id INTEGER PRIMARY KEY,
                trilha_slug TEXT NOT NULL DEFAULT 'informatica-basica',
                aula_atual INTEGER NOT NULL DEFAULT 1,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
            )
            """
        )

        conexao.execute(
            """
            CREATE TABLE IF NOT EXISTS progresso_aula_interativa (
                usuario_id INTEGER PRIMARY KEY,
                aula_slug TEXT NOT NULL,
                passo_atual INTEGER NOT NULL DEFAULT 1,
                atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
            )
            """
        )

        conexao.execute(
            """
            CREATE TABLE IF NOT EXISTS aulas_concluidas (
                usuario_id INTEGER NOT NULL,
                aula_slug TEXT NOT NULL,
                concluida_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (usuario_id, aula_slug),
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
            )
            """
        )

import os
import sqlite3
from pathlib import Path

import psycopg
from psycopg.rows import dict_row

BASE_DIR = Path(__file__).resolve().parent
SQLITE_PATH = BASE_DIR / "educa.db"
DATABASE_URL = os.environ.get("DATABASE_URL", "").strip()

if not DATABASE_URL:
    raise SystemExit("Defina DATABASE_URL antes de executar.")

if not SQLITE_PATH.exists():
    raise SystemExit(f"Não encontrei {SQLITE_PATH}")

src = sqlite3.connect(SQLITE_PATH)
src.row_factory = sqlite3.Row

dst = psycopg.connect(
    DATABASE_URL,
    row_factory=dict_row,
    prepare_threshold=None,
)

with dst:
    # Usuários
    for row in src.execute("SELECT * FROM usuarios").fetchall():
        dst.execute(
            """
            INSERT INTO usuarios
                (id, nome, email, senha_hash, login_nome, telefone, recuperacao_hash)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO UPDATE SET
                nome = EXCLUDED.nome,
                email = EXCLUDED.email,
                senha_hash = EXCLUDED.senha_hash,
                login_nome = EXCLUDED.login_nome,
                telefone = EXCLUDED.telefone,
                recuperacao_hash = EXCLUDED.recuperacao_hash
            """,
            (
                row["id"],
                row["nome"],
                row["email"],
                row["senha_hash"],
                row["login_nome"],
                row["telefone"],
                row["recuperacao_hash"],
            ),
        )

    # Ajusta a sequência do BIGSERIAL depois de inserir ids antigos.
    dst.execute(
        """
        SELECT setval(
            pg_get_serial_sequence('usuarios', 'id'),
            COALESCE((SELECT MAX(id) FROM usuarios), 1),
            true
        )
        """
    )

    for row in src.execute("SELECT * FROM progresso_inicio").fetchall():
        dst.execute(
            """
            INSERT INTO progresso_inicio (usuario_id, trilha_slug, aula_atual)
            VALUES (%s, %s, %s)
            ON CONFLICT (usuario_id) DO UPDATE SET
                trilha_slug = EXCLUDED.trilha_slug,
                aula_atual = EXCLUDED.aula_atual
            """,
            (row["usuario_id"], row["trilha_slug"], row["aula_atual"]),
        )

    for row in src.execute("SELECT * FROM progresso_aula_interativa").fetchall():
        dst.execute(
            """
            INSERT INTO progresso_aula_interativa
                (usuario_id, aula_slug, passo_atual, atualizado_em)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (usuario_id) DO UPDATE SET
                aula_slug = EXCLUDED.aula_slug,
                passo_atual = EXCLUDED.passo_atual,
                atualizado_em = EXCLUDED.atualizado_em
            """,
            (
                row["usuario_id"],
                row["aula_slug"],
                row["passo_atual"],
                row["atualizado_em"],
            ),
        )

    for row in src.execute("SELECT * FROM aulas_concluidas").fetchall():
        dst.execute(
            """
            INSERT INTO aulas_concluidas
                (usuario_id, aula_slug, concluida_em)
            VALUES (%s, %s, %s)
            ON CONFLICT (usuario_id, aula_slug) DO NOTHING
            """,
            (
                row["usuario_id"],
                row["aula_slug"],
                row["concluida_em"],
            ),
        )

src.close()
dst.close()

print("Migração concluída.")

"""Valida o modelo de banco utilizado pelo app.py e a migração do D1."""
from pathlib import Path
import json
import sqlite3
import unittest

ROOT = Path(__file__).resolve().parents[1]


class ModeloBancoTests(unittest.TestCase):
    def test_entidades_e_relacionamentos(self):
        db = sqlite3.connect(":memory:")
        db.executescript((ROOT / "banco" / "schema.sql").read_text(encoding="utf-8"))
        try:
            names = {row[0] for row in db.execute("SELECT name FROM sqlite_master WHERE type='table'")}
            required = {"modulos", "capitulos", "atividades", "usuarios", "progresso", "codigos_acesso", "perfil_acessibilidade"}
            self.assertTrue(required.issubset(names))
            self.assertEqual(db.execute("SELECT COUNT(*) FROM modulos").fetchone()[0], 6)
            self.assertEqual(db.execute("SELECT COUNT(*) FROM atividades").fetchone()[0], 22)
            self.assertEqual(db.execute("SELECT COUNT(*) FROM capitulos").fetchone()[0], 22)

            db.execute("INSERT INTO usuarios(nome,numero) VALUES (?,?)", ("Pessoa Teste", "65999990000"))
            db.execute("INSERT INTO progresso(usuario_id,atividade_codigo) VALUES (?,?)", (1, "pix-key"))
            self.assertIsNotNone(db.execute("SELECT atividade_id FROM progresso").fetchone()[0])
            self.assertEqual(db.execute("PRAGMA foreign_key_check").fetchall(), [])
        finally:
            db.close()

    def test_catalogo_json_compativel(self):
        data = json.loads((ROOT / "data" / "modulos.json").read_text(encoding="utf-8"))
        codes = [a["codigo"] for m in data for c in m["capitulos"] for a in c["atividades"]]
        self.assertEqual(len(codes), len(set(codes)))
        self.assertEqual(len(codes), 22)


if __name__ == "__main__":
    unittest.main()

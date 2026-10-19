"""Testes da API de demonstração Flask V102 (executar com unittest)."""
import tempfile
import unittest
from pathlib import Path
from app import app, ACTIVITY_CODES


class EducaFlaskTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        app.config.update(TESTING=True, EDUCA_DB_PATH=str(Path(self.temporary.name) / "testing.sqlite3"))
        self.client = app.test_client()
        self.phone = "65999999999"  # somente número fictício para teste

    def tearDown(self):
        self.temporary.cleanup()

    def test_home_and_static_assets(self):
        page = self.client.get("/")
        self.assertEqual(page.status_code, 200)
        self.assertIn(b"Educa+ Digital", page.data)
        self.assertTrue((Path(__file__).resolve().parents[1] / "public" / "html" / "index.html").exists())
        css = self.client.get("/static/css/app.css")
        self.assertEqual(css.status_code, 200)
        self.assertGreater(len(css.data), 10000)
        self.assertEqual(self.client.get("/treino").status_code, 302)

    def test_catalog(self):
        result = self.client.get("/api/estrutura")
        self.assertEqual(result.status_code, 200)
        self.assertTrue(result.json["ok"])
        self.assertTrue(ACTIVITY_CODES)

    def test_register_login_and_progress(self):
        request = {"name": "Pessoa Teste", "phone": self.phone}
        result = self.client.post("/api/conta", json=request)
        self.assertEqual(result.status_code, 201)
        self.assertFalse(result.json["existing"])
        result = self.client.post("/api/conta", json=request)
        self.assertEqual(result.status_code, 200)
        self.assertTrue(result.json["existing"])
        code_response = self.client.post("/api/login/codigo", json={"phone": self.phone})
        self.assertEqual(code_response.status_code, 200)
        code = code_response.json["demo_code"]
        self.assertEqual(len(code), 6)
        self.assertEqual(self.client.post("/api/login/confirmar", json={"phone": self.phone, "code": code}).status_code, 200)
        activity_code = next(iter(ACTIVITY_CODES))
        self.assertEqual(self.client.post("/api/progresso", json={"phone": self.phone, "activity_code": activity_code, "event": "attempt"}).json["tentativas"], 1)
        self.assertEqual(self.client.post("/api/progresso", json={"phone": self.phone, "activity_code": activity_code, "event": "complete"}).json["concluido"], 1)
        result = self.client.get("/api/progresso?phone=" + self.phone)
        self.assertEqual(result.status_code, 200)
        self.assertEqual(len(result.json["atividades"]), 1)

    def test_accessibility_and_bad_input(self):
        self.assertEqual(self.client.post("/api/conta", json={"name": "X", "phone": "abc"}).status_code, 400)
        self.client.post("/api/conta", json={"name": "Pessoa Teste", "phone": self.phone})
        self.assertEqual(self.client.patch("/api/perfil-acessibilidade", json={"phone": self.phone, "tamanho_fonte":"extra_grande", "alto_contraste": True}).status_code, 200)
        profile = self.client.get("/api/perfil-acessibilidade?phone=" + self.phone).json["perfil"]
        self.assertEqual(profile["tamanho_fonte"], "extra_grande")
        self.assertEqual(profile["alto_contraste"], 1)
        self.assertEqual(self.client.post("/api/progresso", json={"phone": self.phone, "activity_code": "inexistente"}).status_code, 404)


if __name__ == "__main__":
    unittest.main()

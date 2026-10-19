"""Educa+ Digital — aplicação local para apresentação com Flask e SQLite.

Serve os mesmos arquivos HTML, CSS e JavaScript publicados na Cloudflare.
O banco SQLite é independente do D1 remoto. API de DEMONSTRAÇÃO:
usa números fictícios, e o código de login é mostrado no navegador.
Não utilize como sistema de autenticação real ou produção.
"""
from __future__ import annotations

import json
import os
import re
import secrets
import sqlite3
import time
from pathlib import Path

from flask import Flask, g, jsonify, redirect, render_template, request
from werkzeug.exceptions import BadRequest, RequestEntityTooLarge

BASE_DIR = Path(__file__).resolve().parent
SCHEMA = (BASE_DIR / "banco" / "schema.sql").read_text(encoding="utf-8")
MODULOS = json.loads((BASE_DIR / "data" / "modulos.json").read_text(encoding="utf-8"))
ACTIVITY_CODES = {
    atividade["codigo"]
    for modulo in MODULOS
    for capitulo in modulo["capitulos"]
    for atividade in capitulo["atividades"]
}

# O Flask aponta para os arquivos V102 originais, sem recriar o layout.
app = Flask(
    __name__,
    template_folder=str(BASE_DIR / "public" / "html"),
    static_folder=str(BASE_DIR / "public" / "static"),
    static_url_path="/static",
)
app.json.ensure_ascii = False
app.config.update(
    MAX_CONTENT_LENGTH=8192,
    EDUCA_DB_PATH=os.environ.get("EDUCA_DB_PATH", str(BASE_DIR / ".local" / "educa_digital.sqlite3")),
    SEND_FILE_MAX_AGE_DEFAULT=0,
)


def db():
    """Abrir o SQLite local e criar as tabelas quando necessário."""
    if "sqlite" not in g:
        target = Path(app.config["EDUCA_DB_PATH"])
        target.parent.mkdir(parents=True, exist_ok=True)
        first_use = not target.exists()
        connection = sqlite3.connect(target, timeout=10)
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA foreign_keys = ON")
        if first_use:
            connection.executescript(SCHEMA)
            connection.commit()
        g.sqlite = connection
    return g.sqlite


@app.teardown_appcontext
def close_db(_error):
    connection = g.pop("sqlite", None)
    if connection is not None:
        connection.close()


def result(data, status=200):
    response = jsonify(data)
    response.status_code = status
    response.headers["Cache-Control"] = "no-store"
    response.headers["X-Content-Type-Options"] = "nosniff"
    return response


def fail(status, message):
    return result({"ok": False, "message": message}, status)


def digits(value):
    return re.sub(r"\D", "", str(value if value is not None else ""))


def valid_phone(phone):
    return len(phone) in (10, 11)


def read_body():
    value = request.get_json(force=True)
    if not isinstance(value, dict):
        raise BadRequest("É necessário enviar um objeto JSON.")
    return value


def one(sql, *params):
    row = db().execute(sql, params).fetchone()
    return dict(row) if row else None


def user_from_phone(phone):
    return one("SELECT id,nome,numero FROM usuarios WHERE numero=?", phone)


@app.errorhandler(BadRequest)
def bad_request(_exception):
    return fail(400, "JSON inválido.")


@app.errorhandler(RequestEntityTooLarge)
def too_large(_exception):
    return fail(413, "Dados enviados excedem o limite.")


@app.errorhandler(sqlite3.Error)
def sqlite_error(exception):
    app.logger.error("Falha ao acessar SQLite: %s", type(exception).__name__)
    return fail(500, "Falha temporária ao acessar o banco de dados.")


@app.get("/")
@app.get("/index.html")
def home():
    return render_template("index.html")


@app.get("/treino")
def treino():
    return redirect("/", code=302)


@app.get("/api/saude")
def saude():
    return result({"ok": True, "servico": "Educa+ Digital Flask local"})


@app.get("/api/estrutura")
def estrutura():
    return result({"ok": True, "modulos": MODULOS})


@app.post("/api/conta")
def conta():
    data = read_body()
    name = " ".join(str(data.get("name") or "").strip().split())[:80]
    phone = digits(data.get("phone"))
    if len(name) < 2:
        return fail(400, "Digite seu nome.")
    if not valid_phone(phone):
        return fail(400, "Digite um número de celular válido com DDD.")
    user = user_from_phone(phone)
    if user:
        db().execute("UPDATE usuarios SET ultimo_login=CURRENT_TIMESTAMP,atualizado_em=CURRENT_TIMESTAMP WHERE id=?", (user["id"],))
        db().commit()
        return result({"ok": True, "existing": True, "name": user["nome"], "phone": phone,
                       "message": f"Bem-vindo de volta, {user['nome'].split()[0]}! Seu progresso continua salvo."})
    db().execute("INSERT INTO usuarios(nome,numero,ultimo_login) VALUES(?,?,CURRENT_TIMESTAMP)", (name, phone))
    user = user_from_phone(phone)
    db().execute("INSERT OR IGNORE INTO perfil_acessibilidade(usuario_id) VALUES(?)", (user["id"],))
    db().commit()
    return result({"ok": True, "existing": False, "name": name, "phone": phone,
                   "message": f"Pronto, {name.split()[0]}! Seus treinos foram liberados e seu progresso poderá ser salvo."}, 201)


@app.post("/api/login/codigo")
def login_code():
    phone = digits(read_body().get("phone"))
    if not valid_phone(phone):
        return fail(400, "Digite seu celular com DDD.")
    user = user_from_phone(phone)
    if not user:
        return fail(404, "Não encontramos progresso salvo com esse celular.")
    code = f"{secrets.randbelow(1000000):06d}"
    db().execute("""INSERT INTO codigos_acesso(usuario_id,pin,expira_em) VALUES(?,?,?)
        ON CONFLICT(usuario_id) DO UPDATE SET pin=excluded.pin,expira_em=excluded.expira_em,
        criado_em=CURRENT_TIMESTAMP""", (user["id"], code, int(time.time()) + 600))
    db().commit()
    return result({"ok": True, "demo_code": code,
                   "message": "Código gerado para esta demonstração. Não é enviado por SMS."})


@app.post("/api/login/confirmar")
def confirm_login():
    data = read_body()
    phone, code = digits(data.get("phone")), digits(data.get("code"))
    if len(code) != 6:
        return fail(400, "Digite os 6 números do código.")
    user = user_from_phone(phone)
    if not user:
        return fail(400, "Esse código não confere. Tente novamente.")
    row = one("SELECT pin,expira_em FROM codigos_acesso WHERE usuario_id=?", user["id"])
    if not row or row["pin"] != code:
        return fail(400, "Esse código não confere. Tente novamente.")
    if row["expira_em"] < int(time.time()):
        db().execute("DELETE FROM codigos_acesso WHERE usuario_id=?", (user["id"],))
        db().commit()
        return fail(400, "Esse código expirou. Gere um novo.")
    db().execute("DELETE FROM codigos_acesso WHERE usuario_id=?", (user["id"],))
    db().execute("UPDATE usuarios SET ultimo_login=CURRENT_TIMESTAMP,atualizado_em=CURRENT_TIMESTAMP WHERE id=?", (user["id"],))
    db().commit()
    return result({"ok": True, "name": user["nome"], "phone": phone,
                   "message": "Tudo certo. Seu progresso foi encontrado."})


@app.route("/api/progresso", methods=["GET", "POST"])
def progresso():
    if request.method == "GET":
        phone = digits(request.args.get("phone"))
        if not valid_phone(phone):
            return fail(400, "Celular inválido.")
        user = user_from_phone(phone)
        if not user:
            return fail(404, "Usuário não encontrado.")
        rows = db().execute("""SELECT atividade_codigo,tentativas,concluido,data_conclusao,atualizado_em
            FROM progresso WHERE usuario_id=? ORDER BY atualizado_em DESC""", (user["id"],)).fetchall()
        return result({"ok": True, "atividades": [dict(row) for row in rows]})
    data = read_body()
    phone = digits(data.get("phone"))
    code = str(data.get("activity_code") or "").strip()
    event = str(data.get("event") or "complete").lower()
    if not valid_phone(phone) or not code:
        return fail(400, "Dados de progresso incompletos.")
    if event not in ("attempt", "complete"):
        return fail(400, "Evento de progresso inválido.")
    if code not in ACTIVITY_CODES:
        return fail(404, "Atividade não encontrada.")
    user = user_from_phone(phone)
    if not user:
        return fail(404, "Usuário não encontrado.")
    db().execute("INSERT OR IGNORE INTO progresso(usuario_id,atividade_codigo) VALUES(?,?)", (user["id"], code))
    if event == "attempt":
        db().execute("""UPDATE progresso SET tentativas=tentativas+1,atualizado_em=CURRENT_TIMESTAMP
            WHERE usuario_id=? AND atividade_codigo=?""", (user["id"], code))
    else:
        db().execute("""UPDATE progresso SET concluido=1,data_conclusao=COALESCE(data_conclusao,CURRENT_TIMESTAMP),
            atualizado_em=CURRENT_TIMESTAMP WHERE usuario_id=? AND atividade_codigo=?""", (user["id"], code))
    db().commit()
    saved = one("""SELECT tentativas,concluido,data_conclusao,atualizado_em FROM progresso
        WHERE usuario_id=? AND atividade_codigo=?""", user["id"], code)
    return result({"ok": True, "activity_code": code, **saved})


@app.route("/api/perfil-acessibilidade", methods=["GET", "PATCH"])
def acessibilidade():
    data = read_body() if request.method == "PATCH" else {}
    phone = digits(data.get("phone") if data else request.args.get("phone"))
    user = user_from_phone(phone)
    if not user:
        return fail(404, "Usuário não encontrado.")
    if request.method == "GET":
        row = one("""SELECT tamanho_fonte,alto_contraste,narracao_automatica
            FROM perfil_acessibilidade WHERE usuario_id=?""", user["id"])
        if row is None:
            db().execute("INSERT OR IGNORE INTO perfil_acessibilidade(usuario_id) VALUES(?)", (user["id"],))
            db().commit()
            row = one("SELECT tamanho_fonte,alto_contraste,narracao_automatica FROM perfil_acessibilidade WHERE usuario_id=?", user["id"])
        return result({"ok": True, "perfil": row})
    font = data.get("tamanho_fonte") if data.get("tamanho_fonte") in ("normal", "grande", "extra_grande") else "grande"
    contrast = int(bool(data.get("alto_contraste")))
    narration = int(bool(data.get("narracao_automatica")))
    db().execute("""INSERT INTO perfil_acessibilidade(usuario_id,tamanho_fonte,alto_contraste,narracao_automatica)
        VALUES(?,?,?,?) ON CONFLICT(usuario_id) DO UPDATE SET tamanho_fonte=excluded.tamanho_fonte,
        alto_contraste=excluded.alto_contraste,narracao_automatica=excluded.narracao_automatica,
        atualizado_em=CURRENT_TIMESTAMP""", (user["id"], font, contrast, narration))
    db().commit()
    return result({"ok": True})


@app.errorhandler(404)
def missing(_exception):
    if request.path.startswith("/api/"):
        return fail(404, "Recurso não encontrado.")
    return "Página não encontrada.", 404


if __name__ == "__main__":
    print("\nEduca+ Digital — http://127.0.0.1:5000\n")
    app.run(host="127.0.0.1", port=5000, debug=False)

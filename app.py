import os

from flask import (
    Flask,
    jsonify,
    flash,
    redirect,
    render_template,
    request,
    session,
    url_for,
)
from werkzeug.security import check_password_hash, generate_password_hash

from backend.banco import (
    ERROS_INTEGRIDADE,
    conectar_banco,
    criar_banco,
    criar_usuario,
    email_visivel,
    formatar_telefone,
    normalizar_login,
    normalizar_telefone,
    tipo_banco,
)
from backend.assistente import assistente_bp
from backend.aulas import (
    TRILHAS,
    AREAS_ESTUDO,
    buscar_area,
    trilhas_da_area,
    buscar_aula,
    buscar_trilha,
    localizar_aula,
    primeira_aula,
    proxima_aula,
)


app = Flask(__name__)
app.secret_key = os.environ.get("EDUCA_SECRET_KEY", "educa-digital-chave-local")
app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=bool(os.environ.get("RENDER") or os.environ.get("FORCE_HTTPS")),
)


criar_banco()


# -----------------------------------------------------------------------------
# SAÚDE DA APLICAÇÃO
# -----------------------------------------------------------------------------
@app.get("/health")
def health():
    try:
        with conectar_banco() as conexao:
            linha = conexao.execute("SELECT 1 AS ok").fetchone()

        return jsonify({
            "ok": bool(linha and linha["ok"] == 1),
            "database": tipo_banco(),
            "ai": "groq",
        })
    except Exception:
        app.logger.exception("Falha no health check")
        return jsonify({
            "ok": False,
            "database": "erro",
            "ai": "groq",
        }), 503


# -----------------------------------------------------------------------------
# PÁGINAS PÚBLICAS
# -----------------------------------------------------------------------------
@app.get("/")
def index():
    return render_template(
        "inicio.html",
        trilhas=TRILHAS,
    )


@app.get("/inicio-aluno")
def inicio_aluno():
    return redirect(url_for("estudos"))


# -----------------------------------------------------------------------------
# ESTUDOS E NAVEGAÇÃO DO ALUNO
# -----------------------------------------------------------------------------
@app.get("/estudos")
def estudos():
    if "usuario_id" not in session:
        flash("Entre ou crie sua conta para acessar as aulas.")
        return redirect(url_for("login"))

    nome_completo = session.get("usuario_nome", "Aluno").strip()
    primeiro_nome = nome_completo.split()[0] if nome_completo else "Aluno"
    usuario_id = session["usuario_id"]

    with conectar_banco() as conexao:
        atual = conexao.execute(
            """
            SELECT aula_slug, passo_atual
            FROM progresso_aula_interativa
            WHERE usuario_id = ?
            """,
            (usuario_id,),
        ).fetchone()

        # Migra automaticamente o progresso das versões anteriores.
        if not atual:
            antigo = conexao.execute(
                "SELECT trilha_slug, aula_atual FROM progresso_inicio WHERE usuario_id = ?",
                (usuario_id,),
            ).fetchone()
            if antigo:
                trilha_antiga = buscar_trilha(antigo["trilha_slug"])
                if trilha_antiga and trilha_antiga["aulas_lista"]:
                    indice = max(1, min(int(antigo["aula_atual"]), len(trilha_antiga["aulas_lista"])))
                    aula_migrada = trilha_antiga["aulas_lista"][indice - 1]
                    conexao.execute(
                        """
                        INSERT INTO progresso_aula_interativa (usuario_id, aula_slug, passo_atual)
                        VALUES (?, ?, 1)
                        """,
                        (usuario_id, aula_migrada["slug"]),
                    )
                    atual = {"aula_slug": aula_migrada["slug"], "passo_atual": 1}

    if atual:
        trilha_atual, aula_atual_dados = localizar_aula(atual["aula_slug"])
        if not aula_atual_dados:
            aula_atual_dados = primeira_aula()
            trilha_atual = buscar_trilha(aula_atual_dados["trilha_slug"])
        tem_progresso = True
        passo_atual = atual["passo_atual"]
    else:
        aula_atual_dados = primeira_aula()
        trilha_atual = buscar_trilha(aula_atual_dados["trilha_slug"])
        tem_progresso = False
        passo_atual = 1

    return render_template(
        "estudos.html",
        modo="inicio",
        primeiro_nome=primeiro_nome,
        trilha_atual=trilha_atual,
        aula_atual=aula_atual_dados["indice"],
        aula_atual_dados=aula_atual_dados,
        passo_atual=passo_atual,
        tem_progresso=tem_progresso,
    )




@app.get("/trilhas")
def trilhas():
    # Mantém links antigos funcionando.
    return redirect(url_for("estudos"))


@app.get("/continuar-aula")
def continuar_aula():
    if "usuario_id" not in session:
        return redirect(url_for("login"))

    usuario_id = session["usuario_id"]

    with conectar_banco() as conexao:
        progresso = conexao.execute(
            """
            SELECT aula_slug, passo_atual
            FROM progresso_aula_interativa
            WHERE usuario_id = ?
            """,
            (usuario_id,),
        ).fetchone()

        if progresso and buscar_aula(progresso["aula_slug"]):
            aula_slug = progresso["aula_slug"]
        else:
            antigo = conexao.execute(
                "SELECT trilha_slug, aula_atual FROM progresso_inicio WHERE usuario_id = ?",
                (usuario_id,),
            ).fetchone()
            aula = None
            if antigo:
                trilha_antiga = buscar_trilha(antigo["trilha_slug"])
                if trilha_antiga and trilha_antiga["aulas_lista"]:
                    indice = max(1, min(int(antigo["aula_atual"]), len(trilha_antiga["aulas_lista"])))
                    aula = trilha_antiga["aulas_lista"][indice - 1]
            if not aula:
                aula = primeira_aula()
            aula_slug = aula["slug"]
            conexao.execute(
                """
                INSERT INTO progresso_aula_interativa (usuario_id, aula_slug, passo_atual)
                VALUES (?, ?, 1)
                ON CONFLICT(usuario_id) DO UPDATE SET
                    aula_slug = excluded.aula_slug,
                    passo_atual = 1,
                    atualizado_em = CURRENT_TIMESTAMP
                """,
                (usuario_id, aula_slug),
            )

    return redirect(url_for("aula_interativa", aula_slug=aula_slug))


@app.get("/estudos/area/<area_slug>")
def estudos_area(area_slug):
    if "usuario_id" not in session:
        flash("Entre na sua conta para acessar seus estudos.")
        return redirect(url_for("login"))

    area = buscar_area(area_slug)
    if not area:
        flash("Área de estudo não encontrada.")
        return redirect(url_for("estudos"))

    usuario_id = session["usuario_id"]
    with conectar_banco() as conexao:
        concluidas = {
            row["aula_slug"]
            for row in conexao.execute(
                "SELECT aula_slug FROM aulas_concluidas WHERE usuario_id = ?",
                (usuario_id,),
            ).fetchall()
        }
        atual = conexao.execute(
            "SELECT aula_slug FROM progresso_aula_interativa WHERE usuario_id = ?",
            (usuario_id,),
        ).fetchone()

    aula_atual_slug = atual["aula_slug"] if atual else primeira_aula()["slug"]
    return render_template(
        "estudos.html",
        modo="area",
        area=area,
        trilhas=trilhas_da_area(area_slug),
        concluidas=concluidas,
        aula_atual_slug=aula_atual_slug,
    )


@app.get("/estudos/todos")
def estudos_catalogo():
    """Catálogo completo, mostrado só depois de o usuário escolher ver outros estudos."""
    if "usuario_id" not in session:
        flash("Entre na sua conta para acessar seus estudos.")
        return redirect(url_for("login"))

    usuario_id = session["usuario_id"]
    with conectar_banco() as conexao:
        concluidas = {
            row["aula_slug"]
            for row in conexao.execute(
                "SELECT aula_slug FROM aulas_concluidas WHERE usuario_id = ?",
                (usuario_id,),
            ).fetchall()
        }
        atual = conexao.execute(
            "SELECT aula_slug FROM progresso_aula_interativa WHERE usuario_id = ?",
            (usuario_id,),
        ).fetchone()

    aula_atual_slug = atual["aula_slug"] if atual else primeira_aula()["slug"]
    return render_template(
        "estudos.html",
        modo="catalogo",
        trilhas=TRILHAS,
        concluidas=concluidas,
        aula_atual_slug=aula_atual_slug,
    )


@app.get("/aulas")
def aulas():
    # Mantém o endereço antigo apontando para a área de estudos.
    return redirect(url_for("estudos"))


@app.get("/trilha/<slug>")
def trilha(slug):
    dados = buscar_trilha(slug)

    if not dados:
        flash("Trilha não encontrada.")
        return redirect(url_for("estudos"))

    if "usuario_id" not in session:
        flash("Entre na sua conta para começar.")
        return redirect(url_for("login"))

    usuario_id = session["usuario_id"]
    with conectar_banco() as conexao:
        concluidas = {
            row["aula_slug"]
            for row in conexao.execute(
                "SELECT aula_slug FROM aulas_concluidas WHERE usuario_id = ?",
                (usuario_id,),
            ).fetchall()
        }
        atual = conexao.execute(
            "SELECT aula_slug FROM progresso_aula_interativa WHERE usuario_id = ?",
            (usuario_id,),
        ).fetchone()

    return render_template(
        "estudos.html",
        modo="trilha",
        trilha=dados,
        concluidas=concluidas,
        aula_atual_slug=atual["aula_slug"] if atual else None,
    )


@app.get("/aula/<aula_slug>")
def aula_interativa(aula_slug):
    if "usuario_id" not in session:
        flash("Entre na sua conta para abrir a aula.")
        return redirect(url_for("login"))

    trilha_dados, aula = localizar_aula(aula_slug)
    if not aula:
        flash("Aula não encontrada.")
        return redirect(url_for("estudos"))

    reiniciar_aula = request.args.get("inicio", "").lower() in {"1", "true", "sim"}

    usuario_id = session["usuario_id"]
    with conectar_banco() as conexao:
        progresso = conexao.execute(
            """
            SELECT aula_slug, passo_atual
            FROM progresso_aula_interativa
            WHERE usuario_id = ?
            """,
            (usuario_id,),
        ).fetchone()

        if reiniciar_aula:
            passo_inicial = 1
            conexao.execute(
                """
                INSERT INTO progresso_aula_interativa (usuario_id, aula_slug, passo_atual)
                VALUES (?, ?, 1)
                ON CONFLICT(usuario_id) DO UPDATE SET
                    aula_slug = excluded.aula_slug,
                    passo_atual = 1,
                    atualizado_em = CURRENT_TIMESTAMP
                """,
                (usuario_id, aula_slug),
            )
        elif progresso and progresso["aula_slug"] == aula_slug:
            passo_inicial = progresso["passo_atual"]
        else:
            passo_inicial = 1
            conexao.execute(
                """
                INSERT INTO progresso_aula_interativa (usuario_id, aula_slug, passo_atual)
                VALUES (?, ?, 1)
                ON CONFLICT(usuario_id) DO UPDATE SET
                    aula_slug = excluded.aula_slug,
                    passo_atual = 1,
                    atualizado_em = CURRENT_TIMESTAMP
                """,
                (usuario_id, aula_slug),
            )

        # Mantém a tela inicial sincronizada com a aula atual.
        conexao.execute(
            """
            INSERT INTO progresso_inicio (usuario_id, trilha_slug, aula_atual)
            VALUES (?, ?, ?)
            ON CONFLICT(usuario_id) DO UPDATE SET
                trilha_slug = excluded.trilha_slug,
                aula_atual = excluded.aula_atual
            """,
            (usuario_id, trilha_dados["slug"], aula["indice"]),
        )

    max_passo = len(aula["passos"]) + 1
    passo_inicial = max(1, min(int(passo_inicial), max_passo))

    return render_template(
        "aula.html",
        trilha=trilha_dados,
        aula=aula,
        passo_inicial=passo_inicial,
    )


@app.post("/api/progresso-aula")
def api_progresso_aula():
    if "usuario_id" not in session:
        return {"ok": False, "erro": "login"}, 401

    dados = request.get_json(silent=True) or {}
    aula_slug = str(dados.get("aula_slug", ""))
    aula = buscar_aula(aula_slug)
    if not aula:
        return {"ok": False, "erro": "aula_invalida"}, 400

    try:
        passo = int(dados.get("passo", 1))
    except (TypeError, ValueError):
        passo = 1

    passo = max(1, min(passo, len(aula["passos"]) + 1))

    with conectar_banco() as conexao:
        conexao.execute(
            """
            INSERT INTO progresso_aula_interativa (usuario_id, aula_slug, passo_atual)
            VALUES (?, ?, ?)
            ON CONFLICT(usuario_id) DO UPDATE SET
                aula_slug = excluded.aula_slug,
                passo_atual = excluded.passo_atual,
                atualizado_em = CURRENT_TIMESTAMP
            """,
            (session["usuario_id"], aula_slug, passo),
        )

    return {"ok": True, "passo": passo}


@app.post("/api/concluir-aula")
def api_concluir_aula():
    if "usuario_id" not in session:
        return {"ok": False, "erro": "login"}, 401

    dados = request.get_json(silent=True) or {}
    aula_slug = str(dados.get("aula_slug", ""))
    trilha_dados, aula = localizar_aula(aula_slug)
    if not aula:
        return {"ok": False, "erro": "aula_invalida"}, 400

    seguinte = proxima_aula(aula_slug)
    usuario_id = session["usuario_id"]

    with conectar_banco() as conexao:
        conexao.execute(
            """
            INSERT INTO aulas_concluidas (usuario_id, aula_slug)
            VALUES (?, ?)
            ON CONFLICT (usuario_id, aula_slug) DO NOTHING
            """,
            (usuario_id, aula_slug),
        )

        if seguinte:
            prox_trilha = buscar_trilha(seguinte["trilha_slug"])
            conexao.execute(
                """
                INSERT INTO progresso_aula_interativa (usuario_id, aula_slug, passo_atual)
                VALUES (?, ?, 1)
                ON CONFLICT(usuario_id) DO UPDATE SET
                    aula_slug = excluded.aula_slug,
                    passo_atual = 1,
                    atualizado_em = CURRENT_TIMESTAMP
                """,
                (usuario_id, seguinte["slug"]),
            )
            conexao.execute(
                """
                INSERT INTO progresso_inicio (usuario_id, trilha_slug, aula_atual)
                VALUES (?, ?, ?)
                ON CONFLICT(usuario_id) DO UPDATE SET
                    trilha_slug = excluded.trilha_slug,
                    aula_atual = excluded.aula_atual
                """,
                (usuario_id, prox_trilha["slug"], seguinte["indice"]),
            )
            return {
                "ok": True,
                "fim": False,
                "proxima_url": url_for("aula_interativa", aula_slug=seguinte["slug"]),
                "proxima_titulo": seguinte["titulo"],
            }

        return {
            "ok": True,
            "fim": True,
            "proxima_url": url_for("estudos_catalogo"),
            "proxima_titulo": "Ver todas as aulas",
        }


# -----------------------------------------------------------------------------
# PÁGINAS INSTITUCIONAIS
# -----------------------------------------------------------------------------
@app.get("/como-funciona")
def como_funciona():
    return render_template(
        "institucional.html", modo="como_funciona"
    )


@app.get("/sobre")
def sobre():
    return render_template(
        "institucional.html", modo="sobre"
    )


# -----------------------------------------------------------------------------
# ACESSO E CONTA
# -----------------------------------------------------------------------------
@app.route(
    "/login",
    methods=["GET", "POST"],
)
def login():
    if "usuario_id" in session:
        return redirect(url_for("estudos"))

    if request.method == "POST":
        identificador_bruto = request.form.get("identificador", "").strip()
        identificador = normalizar_login(identificador_bruto)
        telefone = normalizar_telefone(identificador_bruto)
        email_digitado = identificador_bruto.lower()
        senha = request.form.get("senha", "")

        with conectar_banco() as conexao:
            usuario = conexao.execute(
                """
                SELECT id, nome, email, senha_hash, login_nome, telefone
                FROM usuarios
                WHERE telefone = ? OR login_nome = ? OR lower(email) = ?
                ORDER BY id
                LIMIT 1
                """,
                (telefone, identificador, email_digitado),
            ).fetchone()

        if usuario and check_password_hash(usuario["senha_hash"], senha):
            session["usuario_id"] = usuario["id"]
            session["usuario_nome"] = usuario["nome"]
            session["usuario_login"] = usuario["login_nome"] or identificador
            session["usuario_email"] = email_visivel(usuario["email"])
            session["usuario_telefone"] = usuario["telefone"] or ""
            flash("Bem-vindo(a)! Sua conta foi aberta com segurança.")
            return redirect(url_for("estudos"))

        flash("Celular ou senha incorretos. Confira os dados e tente novamente.")

    return render_template("acesso.html", modo="login")


@app.route(
    "/cadastro",
    methods=["GET", "POST"],
)
def cadastro():
    if "usuario_id" in session:
        return redirect(url_for("estudos"))

    if request.method == "POST":
        nome = request.form.get("nome", "").strip()
        telefone = normalizar_telefone(request.form.get("telefone", ""))
        senha = request.form.get("senha", "")

        if not nome:
            flash("Digite seu nome para continuar.")
            return render_template("acesso.html", modo="cadastro", etapa_cadastro=1)

        if len(nome) < 2:
            flash("Digite seu nome para podermos identificar sua conta.")
            return render_template("acesso.html", modo="cadastro", etapa_cadastro=1)

        if not telefone or len(telefone) not in (10, 11):
            flash("Digite seu celular com DDD. Exemplo: (65) 99999-9999.")
            return render_template("acesso.html", modo="cadastro", etapa_cadastro=2)

        if not senha or len(senha) < 8:
            flash("Para proteger sua conta, crie uma senha com pelo menos 8 caracteres.")
            return render_template("acesso.html", modo="cadastro", etapa_cadastro=3)

        # Para o usuário, o celular é o identificador de entrada.
        # O campo login_nome continua existindo apenas para manter compatibilidade
        # com contas antigas e com a estrutura atual do banco.
        login_nome = telefone

        with conectar_banco() as conexao:
            telefone_em_uso = conexao.execute(
                "SELECT id FROM usuarios WHERE telefone = ? LIMIT 1",
                (telefone,),
            ).fetchone()

            if telefone_em_uso:
                flash("Já existe uma conta com esse celular. Tente entrar ou recuperar sua conta.")
                return render_template("acesso.html", modo="cadastro", etapa_cadastro=2)

            try:
                usuario_id = criar_usuario(
                    conexao,
                    nome=nome,
                    login_nome=login_nome,
                    telefone=telefone,
                    senha_hash=generate_password_hash(senha),
                )
            except ERROS_INTEGRIDADE:
                flash("Não foi possível criar a conta com esse celular. Confira o número e tente novamente.")
                return render_template("acesso.html", modo="cadastro", etapa_cadastro=2)

        session["usuario_id"] = usuario_id
        session["usuario_nome"] = nome
        session["usuario_login"] = login_nome
        session["usuario_email"] = ""
        session["usuario_telefone"] = telefone
        session["conta_criada_agora"] = True

        return redirect(url_for("conta_pronta"))

    return render_template("acesso.html", modo="cadastro", etapa_cadastro=1)


@app.get("/conta-pronta")
def conta_pronta():
    if "usuario_id" not in session:
        return redirect(url_for("login"))

    # Esta confirmação aparece logo após o cadastro.
    if not session.pop("conta_criada_agora", False):
        return redirect(url_for("estudos"))

    return render_template(
        "acesso.html",
        modo="conta_pronta",
        nome=session.get("usuario_nome", "Aluno"),
        telefone=formatar_telefone(session.get("usuario_telefone", "")),
    )


@app.route("/recuperar-conta", methods=["GET", "POST"])
def recuperar_conta():
    if request.method == "POST":
        login_nome = normalizar_login(request.form.get("login_nome", ""))
        telefone = normalizar_telefone(request.form.get("telefone", ""))
        nova_senha = request.form.get("senha", "")
        confirmar = request.form.get("confirmar", "")

        if not login_nome or not telefone or not nova_senha or not confirmar:
            flash("Preencha seu nome para entrar, seu celular e as duas caixas da nova senha.")
            return render_template("acesso.html", modo="recuperar")

        if len(telefone) not in (10, 11):
            flash("Digite o celular com DDD que foi usado no cadastro.")
            return render_template("acesso.html", modo="recuperar")

        if len(nova_senha) < 8:
            flash("A nova senha precisa ter pelo menos 8 caracteres.")
            return render_template("acesso.html", modo="recuperar")

        if nova_senha != confirmar:
            flash("As duas senhas estão diferentes.")
            return render_template("acesso.html", modo="recuperar")

        with conectar_banco() as conexao:
            usuario = conexao.execute(
                """
                SELECT id
                FROM usuarios
                WHERE login_nome = ? AND telefone = ?
                """,
                (login_nome, telefone),
            ).fetchone()

            if usuario:
                conexao.execute(
                    "UPDATE usuarios SET senha_hash = ?, recuperacao_hash = NULL WHERE id = ?",
                    (generate_password_hash(nova_senha), usuario["id"]),
                )
                flash("Senha alterada. Agora entre com seu nome de acesso e a nova senha.")
                return redirect(url_for("login"))

        # Mensagem genérica para não revelar qual informação está cadastrada.
        flash("Não conseguimos confirmar esses dados. Confira seu nome para entrar e o celular cadastrado.")

    return render_template("acesso.html", modo="recuperar")


# -----------------------------------------------------------------------------
# PERFIL
# -----------------------------------------------------------------------------
@app.get("/perfil")
def perfil():
    if "usuario_id" not in session:
        return redirect(url_for("login"))

    usuario_id = session["usuario_id"]
    nome = session.get("usuario_nome", "Usuário")
    telefone = formatar_telefone(
        session.get("usuario_telefone") or session.get("usuario_login", "")
    )

    with conectar_banco() as conexao:
        progresso = conexao.execute(
            """
            SELECT aula_slug, passo_atual
            FROM progresso_aula_interativa
            WHERE usuario_id = ?
            """,
            (usuario_id,),
        ).fetchone()
        concluidas_row = conexao.execute(
            "SELECT COUNT(*) AS total FROM aulas_concluidas WHERE usuario_id = ?",
            (usuario_id,),
        ).fetchone()

    tem_progresso = bool(progresso and buscar_aula(progresso["aula_slug"]))
    aula_atual_perfil = (
        buscar_aula(progresso["aula_slug"])
        if tem_progresso
        else primeira_aula()
    )
    aulas_concluidas = int(concluidas_row["total"] if concluidas_row else 0)
    total_aulas = sum(len(trilha.get("aulas_lista", [])) for trilha in TRILHAS)

    return render_template(
        "perfil.html",
        nome=nome,
        telefone=telefone,
        aula_atual_perfil=aula_atual_perfil,
        tem_progresso=tem_progresso,
        aulas_concluidas=aulas_concluidas,
        total_aulas=total_aulas,
    )


@app.get("/sair")
def sair():
    session.clear()

    return redirect(
        url_for("index")
    )



# Assistente Educa (API de conversa/voz)
app.register_blueprint(assistente_bp)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True, threaded=True)

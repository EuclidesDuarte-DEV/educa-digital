import asyncio
import os
import re
import tempfile
import unicodedata
from pathlib import Path

import requests
from flask import Blueprint, after_this_request, current_app, jsonify, request, send_file, session

from backend.banco import conectar_banco
from backend.aulas import TRILHAS, localizar_aula


assistente_bp = Blueprint("assistente_educa", __name__)


# Assistente Educa: conversa, transcrição de voz e síntese de fala.

GROQ_BASE_URL = "https://api.groq.com/openai/v1"
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "").strip()
GROQ_MODEL = os.environ.get("GROQ_MODEL", "openai/gpt-oss-120b").strip() or "openai/gpt-oss-120b"
GROQ_MODEL_FALLBACK = os.environ.get("GROQ_MODEL_FALLBACK", "openai/gpt-oss-20b").strip() or "openai/gpt-oss-20b"
GROQ_WHISPER_MODEL = os.environ.get("GROQ_WHISPER_MODEL", "whisper-large-v3-turbo").strip() or "whisper-large-v3-turbo"


def _texto_limpo(valor):
    return re.sub(r"\s+", " ", str(valor or "")).strip()


def _normalizar_intencao(valor):
    valor = unicodedata.normalize("NFKD", _texto_limpo(valor).lower())
    valor = "".join(c for c in valor if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9 ]+", " ", valor)


def _groq_headers():
    if not GROQ_API_KEY:
        raise RuntimeError(
            "A chave da Groq ainda não foi configurada no ambiente do servidor."
        )
    return {
        "Authorization": f"Bearer {GROQ_API_KEY}",
    }


def _prompt_whisper(contexto=""):
    termos = [
        "Educa+ Digital", "Estudos", "aula", "atividade", "trilha",
        "WhatsApp", "zap", "Pix", "Wi-Fi", "celular", "computador",
        "login", "entrar", "cadastro", "perfil", "acessibilidade",
        "modo sênior", "continuar aula", "começar aula",
    ]

    extras = []
    vistos = set()

    for bloco in re.split(r"[|\n:;,]", str(contexto or "")):
        bloco = _texto_limpo(bloco)
        if 2 <= len(bloco) <= 45:
            chave = bloco.lower()
            if chave not in vistos:
                vistos.add(chave)
                extras.append(bloco)
        if len(extras) >= 14:
            break

    return (", ".join(termos + extras))[:800]


def _transcrever_audio_groq(caminho, contexto="", navegador=""):
    navegador = _texto_limpo(navegador)
    prompt = _prompt_whisper(contexto)

    try:
        with open(caminho, "rb") as arquivo_audio:
            resposta = requests.post(
                f"{GROQ_BASE_URL}/audio/transcriptions",
                headers=_groq_headers(),
                files={
                    "file": (
                        caminho.name,
                        arquivo_audio,
                        "application/octet-stream",
                    )
                },
                data={
                    "model": GROQ_WHISPER_MODEL,
                    "language": "pt",
                    "response_format": "json",
                    "temperature": "0",
                    "prompt": prompt,
                },
                timeout=(10, 60),
            )

        if resposta.ok:
            texto_groq = _texto_limpo(resposta.json().get("text"))
            if texto_groq:
                # Se o navegador captou uma frase claramente maior e o Groq só uma
                # palavra, prefere a transcrição mais útil.
                if (
                    navegador
                    and len(texto_groq.split()) <= 1
                    and len(navegador.split()) >= 2
                ):
                    return navegador, None, "navegador"

                return texto_groq, None, "groq-whisper"

        current_app.logger.error(
            "Groq Whisper HTTP %s: %s",
            resposta.status_code,
            resposta.text[:500],
        )

    except Exception:
        current_app.logger.exception("Falha ao transcrever com Groq Whisper")

    if navegador:
        return navegador, None, "navegador"

    return "", None, "nenhuma"


def _groq_reasoning_effort(mensagem):
    t = _normalizar_intencao(mensagem)

    if any(x in t for x in (
        "explique", "explica", "nao entendi", "por que",
        "porque", "como funciona", "passo a passo",
        "seguranca", "golpe", "fraude",
    )):
        return "medium"

    return "low"


def _groq_chat(mensagens, mensagem):
    opcoes = _opcoes_resposta(mensagem)

    payload_base = {
        "messages": mensagens,
        "temperature": opcoes.get("temperature", 0.35),
        "top_p": opcoes.get("top_p", 0.85),
        "max_completion_tokens": min(
            220,
            max(80, int(opcoes.get("num_predict", 120))),
        ),
        "reasoning_effort": _groq_reasoning_effort(mensagem),
        "reasoning_format": "hidden",
        "stream": False,
    }

    modelos = []
    for modelo in (GROQ_MODEL, GROQ_MODEL_FALLBACK):
        if modelo and modelo not in modelos:
            modelos.append(modelo)

    ultimo_erro = None

    for modelo in modelos:
        payload = dict(payload_base)
        payload["model"] = modelo

        try:
            resposta = requests.post(
                f"{GROQ_BASE_URL}/chat/completions",
                headers={
                    **_groq_headers(),
                    "Content-Type": "application/json",
                },
                json=payload,
                timeout=(10, 60),
            )

            if resposta.ok:
                dados = resposta.json()
                escolhas = dados.get("choices") or []
                if escolhas:
                    conteudo = _texto_limpo(
                        (escolhas[0].get("message") or {}).get("content")
                    )
                    if conteudo:
                        return conteudo, modelo

            ultimo_erro = (
                f"Groq HTTP {resposta.status_code}: "
                + resposta.text[:500]
            )

            # Tenta o modelo reserva em limite, indisponibilidade ou modelo não encontrado.
            if resposta.status_code not in (400, 404, 429, 500, 502, 503, 504):
                break

        except Exception as erro:
            ultimo_erro = f"{type(erro).__name__}: {erro}"
            current_app.logger.exception("Falha ao conversar com Groq")

    raise RuntimeError(ultimo_erro or "A Groq não retornou uma resposta.")


def _catalogo_educa():
    linhas = []
    try:
        for trilha in TRILHAS:
            nome = _texto_limpo(trilha.get("nome") or trilha.get("titulo") or "Trilha")
            if nome:
                linhas.append(f"TRILHA: {nome}")
            for aula in (trilha.get("aulas_lista") or []):
                titulo = _texto_limpo(aula.get("titulo") or "Aula")
                resumo = _texto_limpo(aula.get("resumo") or aula.get("descricao") or "")
                linha = f"AULA: {titulo}"
                if resumo:
                    linha += f" — {resumo[:180]}"
                linhas.append(linha)
                if len(linhas) >= 32:
                    break
            if len(linhas) >= 32:
                break
    except Exception:
        return "O Educa+ possui trilhas, aulas e atividades de tecnologia."
    return "\n".join(linhas)[:2400]


CATALOGO_EDUCA = _catalogo_educa()


def _snapshot_sessao():
    return {
        "usuario_id": session.get("usuario_id"),
        "usuario_nome": session.get("usuario_nome"),
        "usuario_login": session.get("usuario_login"),
    }


def _estado_aluno(snapshot):
    if not snapshot.get("usuario_id"):
        return "Usuário não está logado."
    partes = ["Usuário está logado."]
    nome = _texto_limpo(snapshot.get("usuario_nome"))
    if nome:
        partes.append(f"Nome: {nome}")
    usuario_id = snapshot.get("usuario_id")
    try:
        with conectar_banco() as conexao:
            atual = conexao.execute(
                "SELECT aula_slug, passo_atual FROM progresso_aula_interativa WHERE usuario_id = ?",
                (usuario_id,),
            ).fetchone()
        if atual:
            trilha, aula = localizar_aula(atual["aula_slug"])
            if aula:
                partes.append(f"Aula atual: {_texto_limpo(aula.get('titulo') or atual['aula_slug'])}")
            if trilha:
                partes.append(f"Trilha atual: {_texto_limpo(trilha.get('nome') or trilha.get('titulo') or '')}")
            partes.append(f"Passo atual: {atual['passo_atual']}")
    except Exception:
        current_app.logger.exception("Não foi possível ler o progresso do aluno")
    return " | ".join(p for p in partes if p)


PROMPT_EDUCA = """
Você é Educa, uma companheira digital do Educa+.

Converse em português brasileiro como uma pessoa de verdade.
Seu público inclui idosos, estudantes e iniciantes.

NÃO USE RESPOSTAS PRONTAS
Cada resposta deve ser criada para a fala atual da pessoa.
Use a conversa anterior e a tela atual.
Não responda como se estivesse lendo um roteiro.
Não comece sempre com "Certo", "Entendi" ou "Claro".
Varie naturalmente o jeito de responder.

CONVERSA DE VERDADE
- Lembre o assunto que vocês estavam conversando.
- Responda ao sentido da fala, não só às palavras.
- Se a pessoa fizer uma pergunta curta, continue o assunto anterior quando fizer sentido.
- Entenda referências como "isso", "esse", "aqui", "ali", "o outro" e "aquele botão".
- Se a pessoa disser "não foi isso", reconheça e tente entender o que ela quis dizer.
- Se disser "não entendi", explique de outra forma e use outro exemplo.
- Se houver duas interpretações realmente possíveis, faça uma pergunta curta.
- Não faça perguntas desnecessárias.
- Não repita a pergunta do usuário antes de responder.

TELA ATUAL
Você recebe TELA ATUAL CONFIRMADA em toda interação.
Essa é a verdade absoluta sobre onde a pessoa está agora.
Ela tem prioridade sobre qualquer tela antiga mencionada no histórico.

Ao ajudar no site:
- observe a tela atual;
- veja botões, links, avisos e campos disponíveis;
- considere qual campo ou botão está em foco;
- diga apenas ações que realmente existem na tela;
- nunca invente um botão;
- se perguntarem "o que faço agora?", escolha o próximo passo mais útil;
- se houver um erro visível, explique em palavras simples;
- se a tela mudar, acompanhe a nova tela imediatamente.

FORMULÁRIOS
Você recebe apenas se um campo está vazio ou preenchido.
Nunca recebe o conteúdo digitado.
Oriente um campo de cada vez quando necessário.
Se for senha, diga para digitar diretamente no campo.
Nunca peça para falar a senha em voz alta.

IDOSOS E INICIANTES
- Fale de adulto para adulto.
- Nunca infantilize.
- Use palavras conhecidas.
- Explique termos técnicos quando forem necessários.
- Dê um passo por vez quando a pessoa estiver aprendendo a usar o site.
- Se perceber confusão, simplifique a explicação.

ESTUDANTES
- Ajude com dúvidas das aulas.
- Explique conceitos e dê exemplos.
- Continue a conversa por várias mensagens quando necessário.
- Relacione a resposta ao conteúdo estudado quando houver contexto.

CONHECIMENTO GERAL
Você pode conversar sobre tecnologia, internet, aplicativos, estudos e dúvidas gerais.
Se não souber algo com segurança, diga isso naturalmente em vez de inventar.

SEGURANÇA
Nunca peça senha, PIN, CVV, token, código SMS ou código de autenticação.
Nunca peça esses dados em voz alta.
Se alguém estiver pedindo um dado secreto, avise a pessoa.
Não diga que cadastro, Pix, pagamento ou envio foi concluído sem confirmação real.

COMO ESCREVER PARA A VOZ
Tudo será falado em voz alta.
Use frases naturais.
Não use Markdown.
Não use asteriscos, hashtags, crases, listas cheias de símbolos, JSON, HTTP,
rotas internas, código ou nomes de erros técnicos.
Não fale como robô, FAQ, tutorial técnico ou central de atendimento.

Responda somente com o que a Educa deve falar.
""".strip()


def _termos_relevantes(texto):
    ignorar = {
        "para", "pra", "como", "onde", "qual", "quero", "uma", "uns", "umas",
        "isso", "esse", "essa", "aquele", "aquela", "estou", "voce", "voces",
        "aqui", "agora", "meu", "minha", "seu", "sua", "com", "sem", "que",
    }
    normal = _normalizar_intencao(texto)
    return {
        p for p in normal.split()
        if len(p) >= 3 and p not in ignorar
    }


def _conhecimento_relevante(mensagem, contexto):
    linhas = [l.strip() for l in CATALOGO_EDUCA.splitlines() if l.strip()]
    termos = _termos_relevantes(mensagem + " " + contexto[:700])

    pontuadas = []
    for linha in linhas:
        tokens = _termos_relevantes(linha)
        nota = len(termos & tokens)
        if nota:
            pontuadas.append((nota, linha))

    pontuadas.sort(key=lambda x: (-x[0], len(x[1])))
    escolhidas = [linha for _, linha in pontuadas[:7]]

    if not escolhidas:
        escolhidas = linhas[:5]

    return "\n".join(escolhidas)[:1050]



MAPA_SITE_EDUCA = """
Início: apresentação do Educa+ e acesso às principais áreas.
Estudos: área do aluno com progresso e aulas.
Trilhas: organização dos conteúdos por assunto.
Continuar aula: retoma a aula em andamento.
Todas as aulas: mostra as aulas disponíveis.
Aula: conteúdo passo a passo e atividades.
Cadastro: criação de conta.
Entrar: acesso à conta.
Recuperar conta: ajuda para criar uma nova senha com os dados cadastrados.
Perfil: informações básicas da conta.
Como funciona: explicação de uso do Educa+.
Sobre: informações sobre o projeto.
""".strip()


def _tipo_demanda(mensagem, contexto):
    t = _normalizar_intencao(mensagem)

    if any(x in t for x in (
        "onde clic", "onde aper", "me mostra", "mostra onde",
        "o que faco", "oque faco", "como entro", "como abro",
        "continuar aula", "abrir aula", "voltar", "ir para",
        "qual botao", "que botao",
    )):
        return "GUIA_DO_SITE"

    if any(x in t for x in (
        "senha", "cvv", "pin", "token", "codigo sms", "pix",
        "golpe", "fraude", "banco", "seguranca",
    )):
        return "SEGURANCA"

    if any(x in t for x in (
        "explique", "explica", "o que e", "oque e", "por que",
        "porque", "como funciona", "nao entendi", "não entendi",
        "me ensina", "exemplo",
    )):
        return "APRENDIZAGEM"

    return "CONVERSA"


def _instrucao_por_demanda(tipo):
    if tipo == "GUIA_DO_SITE":
        return (
            "A pessoa quer ajuda para usar o site. A TELA ATUAL CONFIRMADA tem prioridade "
            "absoluta sobre o histórico. Dê somente o próximo passo usando um botão, campo "
            "ou link que esteja realmente visível agora. Se houver campo em foco, considere-o. "
            "Não explique várias etapas de uma vez."
        )

    if tipo == "SEGURANCA":
        return (
            "A prioridade é segurança. Explique de modo simples, sem alarmismo. "
            "Nunca solicite segredo, senha ou código. Se houver risco de golpe, diga claramente."
        )

    if tipo == "APRENDIZAGEM":
        return (
            "A pessoa quer aprender. Explique em linguagem simples, dê um exemplo cotidiano "
            "e confira pelo contexto se é necessário continuar."
        )

    return (
        "Converse naturalmente e responda diretamente ao que a pessoa quis dizer. "
        "Evite linguagem técnica quando uma expressão comum resolver."
    )


def _montar_mensagens(mensagem, contexto, historico, estado):
    conhecimento = _conhecimento_relevante(mensagem, contexto)
    tipo = _tipo_demanda(mensagem, contexto)

    mensagens = [
        {"role": "system", "content": PROMPT_EDUCA},
        {
            "role": "system",
            "content": (
                "TIPO DE AJUDA: " + tipo + "\n"
                + _instrucao_por_demanda(tipo)
                + "\n\nMAPA RESUMIDO DO EDUCA+:\n"
                + MAPA_SITE_EDUCA
                + "\n\nCONHECIMENTO RELEVANTE DAS AULAS:\n"
                + (conhecimento or "Sem aula específica relacionada.")
                + "\n\nTELA ATUAL CONFIRMADA — IGNORE TELAS ANTIGAS DO HISTÓRICO:\n"
                + (_texto_limpo(contexto)[:1900] or "Sem contexto da tela.")
                + "\n\nESTADO DO ALUNO:\n"
                + (_texto_limpo(estado)[:560] or "Sem estado adicional.")
            ),
        },
    ]

    if isinstance(historico, list):
        for item in historico[-10:]:
            if not isinstance(item, dict):
                continue
            role = item.get("role")
            content = _texto_limpo(item.get("content"))[:460]
            if role in ("user", "assistant") and content:
                mensagens.append({"role": role, "content": content})

    mensagens.append({
        "role": "user",
        "content": _texto_limpo(mensagem)[:1000],
    })
    return mensagens


def _opcoes_resposta(mensagem):
    t = _normalizar_intencao(mensagem)

    seguranca = any(x in t for x in (
        "senha", "cvv", "pin", "token", "codigo sms",
        "codigo de verificacao", "pix", "golpe", "fraude", "banco",
    ))

    guia = any(x in t for x in (
        "onde clic", "onde aper", "qual botao", "que botao",
        "o que faco", "oque faco", "me ajuda aqui", "me guia",
        "como entro", "como abro",
    ))

    detalhada = (
        len(t) > 120
        or any(x in t for x in (
            "explique", "explica", "por que", "porque",
            "como funciona", "detalhe", "exemplo",
            "passo a passo", "diferenca", "nao entendi",
        ))
    )

    if seguranca:
        return {
            "temperature": 0.20,
            "top_p": 0.78,
            "num_predict": 115,
        }

    if guia:
        return {
            "temperature": 0.30,
            "top_p": 0.82,
            "num_predict": 115,
        }

    if detalhada:
        return {
            "temperature": 0.42,
            "top_p": 0.87,
            "num_predict": 145,
        }

    return {
        "temperature": 0.48,
        "top_p": 0.88,
        "num_predict": 115,
    }


def _acao_deterministica(mensagem):
    t = _normalizar_intencao(mensagem)
    quer_mostrar = any(x in t for x in (
        "onde clic", "onde aper", "me mostra", "mostra onde",
        "qual bot", "que bot", "onde fica",
    ))
    if "modo senior" in t:
        if any(x in t for x in ("desliga", "desativ", "tirar", "tira")):
            return "modo_senior_desligar", ""
        return "modo_senior_ligar", ""
    if "contraste" in t:
        if any(x in t for x in ("desliga", "desativ", "tirar", "tira")):
            return "alto_contraste_desligar", ""
        return "alto_contraste_ligar", ""
    if any(x in t for x in ("aumenta letra", "aumentar letra", "letra maior", "fonte maior")):
        return "aumentar_fonte", ""
    if any(x in t for x in ("diminui letra", "diminuir letra", "letra menor", "fonte menor")):
        return "diminuir_fonte", ""
    if "perfil" in t and any(x in t for x in ("abre", "abrir", "ir", "meu")):
        return "ir_perfil", ""
    if "cadast" in t and any(x in t for x in ("abre", "abrir", "ir", "criar", "conta")):
        return "ir_cadastro", ""
    if any(x in t for x in ("login", "entrar", "entra")):
        if quer_mostrar:
            return "destacar", "Entrar"
        if any(x in t for x in ("abre", "abrir", "ir", "quero")):
            return "ir_login", ""
    if any(x in t for x in ("estud", "minhas aula", "meus curso", "aulas")):
        if quer_mostrar:
            return "destacar", "Estudos"
        if any(x in t for x in ("abre", "abrir", "ir", "quero", "entrar")):
            return "ir_estudos", ""
    if any(x in t for x in ("inicio", "pagina inicial")) and any(x in t for x in ("abre", "abrir", "ir", "volta", "voltar")):
        return "ir_inicio", ""
    return "nenhuma", ""


def _verificar_groq():
    if not GROQ_API_KEY:
        raise RuntimeError(
            "Configure a variável de ambiente GROQ_API_KEY no serviço de hospedagem."
        )

    resposta = requests.get(
        f"{GROQ_BASE_URL}/models",
        headers=_groq_headers(),
        timeout=(5, 20),
    )

    if not resposta.ok:
        raise RuntimeError(
            resposta.text.strip()[:400]
            or f"Groq respondeu HTTP {resposta.status_code}."
        )

    return True


@assistente_bp.get("/api/assistente/local/status")
def assistente_status():
    try:
        _verificar_groq()

        return jsonify({
            "ok": True,
            "provider": "groq",
            "model": GROQ_MODEL,
            "model_installed": True,
            "whisper_installed": True,
            "whisper_model": GROQ_WHISPER_MODEL,
        })

    except Exception as erro:
        current_app.logger.exception("Falha no status da Groq")

        return jsonify({
            "ok": False,
            "error": (
                "A inteligência online da Educa não está configurada. "
                "Confira a variável de ambiente GROQ_API_KEY no serviço de hospedagem."
            ),
            "detail": str(erro)[:300],
        }), 503


@assistente_bp.post("/api/assistente/local/aquecer")
def assistente_aquecer():
    # Groq é serverless: não existe modelo local para carregar na RAM.
    # Evitamos uma requisição extra para não gastar o limite gratuito.
    if not GROQ_API_KEY:
        return jsonify({
            "ok": False,
            "error": "A chave GROQ_API_KEY ainda não foi configurada.",
        }), 503

    return jsonify({
        "ok": True,
        "provider": "groq",
        "model": GROQ_MODEL,
        "whisper": GROQ_WHISPER_MODEL,
    })


@assistente_bp.post("/api/assistente/local/transcrever")
def assistente_transcrever():
    arquivo = request.files.get("audio")

    if not arquivo:
        return jsonify({
            "ok": False,
            "error": "Nenhum áudio foi recebido.",
        }), 400

    contexto = _texto_limpo(request.form.get("contexto"))
    navegador = _texto_limpo(request.form.get("texto_navegador"))

    nome = (arquivo.filename or "").lower()
    sufixo = ".webm"

    if nome.endswith(".ogg"):
        sufixo = ".ogg"
    elif nome.endswith(".wav"):
        sufixo = ".wav"
    elif nome.endswith(".mp4") or nome.endswith(".m4a"):
        sufixo = ".m4a"

    caminho = None

    try:
        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=sufixo,
        ) as temp:
            caminho = Path(temp.name)
            arquivo.save(temp)

        texto, confianca, fonte = _transcrever_audio_groq(
            caminho,
            contexto=contexto,
            navegador=navegador,
        )

        if len(_texto_limpo(texto)) < 2:
            return jsonify({
                "ok": False,
                "error": "Não consegui reconhecer palavras suficientes.",
                "code": "sem_fala",
            }), 422

        return jsonify({
            "ok": True,
            "texto": _texto_limpo(texto),
            "confidence": confianca,
            "fonte": fonte,
        })

    except Exception as erro:
        current_app.logger.exception("Falha na transcrição online")

        return jsonify({
            "ok": False,
            "error": "A escuta da Educa teve uma falha.",
            "code": type(erro).__name__,
        }), 500

    finally:
        if caminho:
            try:
                caminho.unlink(missing_ok=True)
            except Exception:
                pass


@assistente_bp.post("/api/assistente/local/chat")
def assistente_chat():
    """
    Resposta curta para hospedagem com poucos recursos de processamento.

    A conta Free possui um único web worker. Por isso a conversa não mantém
    uma resposta HTTP aberta enquanto a voz neural faz outra requisição.
    A Groq gera a resposta inteira rapidamente; depois o navegador pede a voz.
    """
    dados = request.get_json(silent=True) or {}

    mensagem = _texto_limpo(dados.get("mensagem"))
    contexto = _texto_limpo(dados.get("contexto"))
    historico = dados.get("historico") or []

    if not mensagem:
        return jsonify({
            "ok": False,
            "error": "Mensagem vazia.",
        }), 400

    try:
        sessao_normal = _snapshot_sessao()
        estado_normal = _estado_aluno(sessao_normal)

        mensagens = _montar_mensagens(
            mensagem,
            contexto,
            historico,
            estado_normal,
        )

        acao, alvo = _acao_deterministica(mensagem)

        resposta, modelo_usado = _groq_chat(
            mensagens,
            mensagem,
        )

        return jsonify({
            "ok": True,
            "text": resposta,
            "action": acao,
            "target": alvo,
            "model": modelo_usado,
        })

    except Exception as erro:
        current_app.logger.exception("Falha da IA Educa via Groq")

        return jsonify({
            "ok": False,
            "error": "A Educa não conseguiu responder agora.",
            "code": type(erro).__name__,
        }), 503


# =========================================================
# VOZ NEURAL DA EDUCA
# Instalação: python -m pip install edge-tts
# =========================================================

VOZES_NEURAIS_EDUCA = {
    "francisca": {
        "id": "pt-BR-FranciscaNeural",
        "nome": "Francisca",
        "descricao": "voz feminina brasileira",
    },
    "antonio": {
        "id": "pt-BR-AntonioNeural",
        "nome": "Antonio",
        "descricao": "voz masculina brasileira",
    },
}


def _limpar_texto_tts(texto):
    texto = _texto_limpo(texto)
    texto = re.sub(r"https?://\S+", "um link", texto, flags=re.I)
    texto = re.sub(r"[`*_#<>{}\[\]|\\\\]+", " ", texto)
    texto = re.sub(r"\s+([,.;!?])", r"\1", texto)
    return _texto_limpo(texto)[:650]


@assistente_bp.get("/api/assistente/local/vozes")
def assistente_vozes():
    try:
        import edge_tts  # noqa: F401
        neural = True
    except ImportError:
        neural = False

    return jsonify({
        "ok": True,
        "neural": neural,
        "voices": [
            {
                "key": chave,
                "name": dados["nome"],
                "description": dados["descricao"],
            }
            for chave, dados in VOZES_NEURAIS_EDUCA.items()
        ],
    })


@assistente_bp.post("/api/assistente/local/voz")
def assistente_voz_neural():
    dados = request.get_json(silent=True) or {}

    texto = _limpar_texto_tts(dados.get("texto"))
    chave = _texto_limpo(dados.get("voz")).lower() or "francisca"

    if not texto:
        return jsonify({"ok": False, "error": "Texto vazio."}), 400

    if chave not in VOZES_NEURAIS_EDUCA:
        chave = "francisca"

    try:
        import edge_tts
    except ImportError:
        return jsonify({
            "ok": False,
            "code": "edge_tts_nao_instalado",
            "error": "A voz neural ainda não foi instalada.",
        }), 503

    try:
        velocidade = int(dados.get("velocidade", 0))
    except (TypeError, ValueError):
        velocidade = 0

    velocidade = max(-20, min(20, velocidade))
    rate = f"{velocidade:+d}%"

    caminho = None

    try:
        temp = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
        caminho = Path(temp.name)
        temp.close()

        voz = VOZES_NEURAIS_EDUCA[chave]["id"]

        async def gerar_audio():
            comunicador = edge_tts.Communicate(
                texto,
                voz,
                rate=rate,
                pitch="+0Hz",
            )
            await comunicador.save(str(caminho))

        asyncio.run(gerar_audio())

        @after_this_request
        def limpar_arquivo(resposta):
            try:
                caminho.unlink(missing_ok=True)
            except Exception:
                pass
            return resposta

        return send_file(
            caminho,
            mimetype="audio/mpeg",
            as_attachment=False,
            conditional=False,
            max_age=0,
        )

    except Exception as erro:
        current_app.logger.exception("Falha na voz neural da Educa")

        if caminho:
            try:
                caminho.unlink(missing_ok=True)
            except Exception:
                pass

        return jsonify({
            "ok": False,
            "code": type(erro).__name__,
            "error": "Não consegui gerar a voz neural agora.",
        }), 503

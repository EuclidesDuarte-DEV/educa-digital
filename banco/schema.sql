-- Educa+ Digital | banco SQLite (Flask) e D1 (Cloudflare)
-- Modelo de dados baseado no diagrama do projeto:
-- Módulo -> Capítulo -> Atividade -> Progresso <- Usuário
-- Usuário -> Código de acesso; Usuário -> Perfil de acessibilidade.
--
-- O catálogo é populado para disponibilizar as 22 atividades do protótipo.
-- A chave atividade_codigo permanece por compatibilidade com a V102 publicada.
-- A atividade_id relaciona o progresso à tabela de atividades.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS modulos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT NOT NULL UNIQUE,
    titulo TEXT NOT NULL,
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS capitulos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    modulo_id INTEGER NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
    codigo TEXT NOT NULL UNIQUE,
    titulo TEXT NOT NULL,
    ordem INTEGER NOT NULL,
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS atividades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    capitulo_id INTEGER NOT NULL REFERENCES capitulos(id) ON DELETE CASCADE,
    codigo TEXT NOT NULL UNIQUE,
    titulo TEXT NOT NULL,
    tipo TEXT NOT NULL,
    conteudo TEXT NOT NULL DEFAULT '{}',
    video_url TEXT,
    ordem INTEGER NOT NULL,
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    funcao TEXT NOT NULL DEFAULT 'aluno',
    nome TEXT NOT NULL,
    numero TEXT NOT NULL UNIQUE,
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ultimo_login TEXT
);

-- Relação 1:1 com Usuário: a chave primária é o próprio usuário_id.
CREATE TABLE IF NOT EXISTS codigos_acesso (
    usuario_id INTEGER PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
    pin TEXT NOT NULL,
    expira_em INTEGER NOT NULL,
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS perfil_acessibilidade (
    usuario_id INTEGER PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
    tamanho_fonte TEXT NOT NULL DEFAULT 'grande',
    alto_contraste INTEGER NOT NULL DEFAULT 0 CHECK (alto_contraste IN (0, 1)),
    narracao_automatica INTEGER NOT NULL DEFAULT 0 CHECK (narracao_automatica IN (0, 1)),
    atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS progresso (
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    atividade_codigo TEXT NOT NULL,
    atividade_id INTEGER REFERENCES atividades(id),
    tentativas INTEGER NOT NULL DEFAULT 0,
    concluido INTEGER NOT NULL DEFAULT 0 CHECK (concluido IN (0, 1)),
    data_conclusao TEXT,
    atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, atividade_codigo)
);

CREATE INDEX IF NOT EXISTS idx_capitulos_modulo ON capitulos(modulo_id);
CREATE INDEX IF NOT EXISTS idx_atividades_capitulo ON atividades(capitulo_id);
CREATE INDEX IF NOT EXISTS idx_progresso_atividade ON progresso(atividade_id);

-- Mantém a ligação à atividade mesmo quando a API antiga grava por código.
CREATE TRIGGER IF NOT EXISTS vincular_progresso_atividade
AFTER INSERT ON progresso
FOR EACH ROW
BEGIN
    UPDATE progresso
       SET atividade_id = (SELECT id FROM atividades WHERE codigo = NEW.atividade_codigo)
     WHERE usuario_id = NEW.usuario_id
       AND atividade_codigo = NEW.atividade_codigo;
END;

-- Conteúdo das trilhas preservado da V102.
INSERT OR IGNORE INTO modulos(codigo, titulo) VALUES ('pix', 'PIX');
INSERT OR IGNORE INTO capitulos(modulo_id, codigo, titulo, ordem) SELECT id, 'pix-primeiros-passos', 'Primeiros passos no Pix', 1 FROM modulos WHERE codigo='pix';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'pix-recipient', 'Encontrar o Pix no banco', 'video_pratica', '{"resumo":"Abra o banco, entre no Pix e confira o destinatário.","acao_frontend":"pix-recipient"}', '/static/videos/pix_seguranca.mp4', 1 FROM capitulos WHERE codigo='pix-primeiros-passos';
INSERT OR IGNORE INTO capitulos(modulo_id, codigo, titulo, ordem) SELECT id, 'pix-chaves', 'Chaves Pix', 2 FROM modulos WHERE codigo='pix';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'pix-key', 'Entender as chaves Pix', 'video_pratica', '{"resumo":"Veja CPF, celular, e-mail e chave aleatória.","acao_frontend":"pix-key"}', '/static/videos/pix-key.mp4?v=71', 1 FROM capitulos WHERE codigo='pix-chaves';
INSERT OR IGNORE INTO capitulos(modulo_id, codigo, titulo, ordem) SELECT id, 'pix-seguranca', 'Segurança no pagamento', 3 FROM modulos WHERE codigo='pix';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'pix-scam', 'Reconhecer pedido suspeito', 'video_pratica', '{"resumo":"Aprenda a parar diante de urgência e número novo.","acao_frontend":"pix-scam"}', 'https://d2ol7oe51mr4n9.cloudfront.net/user_3ITdvjP8F16LCyy9GylHD3JQeFs/a5a4b9cc-d596-4040-9a48-131c706b76d9.mp4', 1 FROM capitulos WHERE codigo='pix-seguranca';
INSERT OR IGNORE INTO modulos(codigo, titulo) VALUES ('security', 'Segurança');
INSERT OR IGNORE INTO capitulos(modulo_id, codigo, titulo, ordem) SELECT id, 'seg-falso-familiar', 'Golpe do falso familiar', 1 FROM modulos WHERE codigo='security';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'family', 'Golpe do falso filho', 'video_pratica', '{"resumo":"Aprenda a confirmar antes de fazer um Pix.","acao_frontend":"family"}', '/static/videos/family.mp4?v=71', 1 FROM capitulos WHERE codigo='seg-falso-familiar';
INSERT OR IGNORE INTO capitulos(modulo_id, codigo, titulo, ordem) SELECT id, 'seg-link-falso', 'Links e mensagens falsas', 2 FROM modulos WHERE codigo='security';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'bank', 'Link falso do banco', 'video_pratica', '{"resumo":"Veja como agir quando receber um link urgente.","acao_frontend":"bank"}', '/static/videos/bank.mp4?v=71', 1 FROM capitulos WHERE codigo='seg-link-falso';
INSERT OR IGNORE INTO capitulos(modulo_id, codigo, titulo, ordem) SELECT id, 'seg-codigos', 'Códigos de verificação', 3 FROM modulos WHERE codigo='security';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'code', 'Código por SMS', 'video_pratica', '{"resumo":"Saiba por que nunca compartilhar códigos.","acao_frontend":"code"}', '/static/videos/code.mp4?v=71', 1 FROM capitulos WHERE codigo='seg-codigos';
INSERT OR IGNORE INTO capitulos(modulo_id, codigo, titulo, ordem) SELECT id, 'seg-falsa-central', 'Falsa central bancária', 4 FROM modulos WHERE codigo='security';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'fake-bank-call', 'Falsa central bancária', 'video_pratica', '{"resumo":"Treine como agir quando alguém pede senha ou instalação de aplicativo.","acao_frontend":"fake-bank-call"}', '/static/videos/fake-bank-call.mp4?v=71', 1 FROM capitulos WHERE codigo='seg-falsa-central';
INSERT OR IGNORE INTO modulos(codigo, titulo) VALUES ('whatsapp', 'WhatsApp');
INSERT OR IGNORE INTO capitulos(modulo_id, codigo, titulo, ordem) SELECT id, 'wa-conversas', 'Conversas', 1 FROM modulos WHERE codigo='whatsapp';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'wa-list', 'Encontrar uma conversa', 'video_pratica', '{"resumo":"Aprenda a localizar uma pessoa na lista.","acao_frontend":"wa-list"}', '/static/videos/wa-list.mp4?v=71', 1 FROM capitulos WHERE codigo='wa-conversas';
INSERT OR IGNORE INTO capitulos(modulo_id, codigo, titulo, ordem) SELECT id, 'wa-mensagens', 'Mensagens', 2 FROM modulos WHERE codigo='whatsapp';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'wa-message', 'Enviar uma mensagem', 'video_pratica', '{"resumo":"Abra uma conversa e escreva uma mensagem.","acao_frontend":"wa-message"}', '/static/videos/wa-message.mp4?v=71', 1 FROM capitulos WHERE codigo='wa-mensagens';
INSERT OR IGNORE INTO capitulos(modulo_id, codigo, titulo, ordem) SELECT id, 'wa-chamadas', 'Chamadas', 3 FROM modulos WHERE codigo='whatsapp';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'wa-call', 'Fazer uma ligação', 'video_pratica', '{"resumo":"Conheça onde fica o botão de chamada.","acao_frontend":"wa-call"}', '/static/videos/wa-call.mp4?v=71', 1 FROM capitulos WHERE codigo='wa-chamadas';
INSERT OR IGNORE INTO capitulos(modulo_id, codigo, titulo, ordem) SELECT id, 'wa-codigo', 'Código de verificação', 4 FROM modulos WHERE codigo='whatsapp';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'wa-code-safety', 'Proteger código de verificação', 'video_pratica', '{"resumo":"Aprenda por que códigos nunca devem ser enviados por mensagem.","acao_frontend":"wa-code-safety"}', 'https://d2ol7oe51mr4n9.cloudfront.net/user_3ITdvjP8F16LCyy9GylHD3JQeFs/a5a4b9cc-d596-4040-9a48-131c706b76d9.mp4', 1 FROM capitulos WHERE codigo='wa-codigo';
INSERT OR IGNORE INTO modulos(codigo, titulo) VALUES ('settings', 'Ajustes');
INSERT OR IGNORE INTO capitulos(modulo_id, codigo, titulo, ordem) SELECT id, 'ajustes-fonte', 'Tamanho do texto', 1 FROM modulos WHERE codigo='settings';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'settings-font', 'Aumentar as letras', 'video_pratica', '{"resumo":"Deixe textos maiores e mais fáceis de ler.","acao_frontend":"settings-font"}', '/static/videos/settings-font.mp4?v=71', 1 FROM capitulos WHERE codigo='ajustes-fonte';
INSERT OR IGNORE INTO capitulos(modulo_id, codigo, titulo, ordem) SELECT id, 'ajustes-volume', 'Som e volume', 2 FROM modulos WHERE codigo='settings';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'settings-volume', 'Ajustar o volume', 'video_pratica', '{"resumo":"Aumente ou diminua o som do aparelho.","acao_frontend":"settings-volume"}', '/static/videos/settings-volume.mp4?v=71', 1 FROM capitulos WHERE codigo='ajustes-volume';
INSERT OR IGNORE INTO capitulos(modulo_id, codigo, titulo, ordem) SELECT id, 'ajustes-wifi', 'Wi-Fi', 3 FROM modulos WHERE codigo='settings';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'settings-wifi', 'Conectar ao Wi-Fi', 'video_pratica', '{"resumo":"Aprenda a escolher uma rede com segurança.","acao_frontend":"settings-wifi"}', '/static/videos/settings-wifi.mp4?v=71', 1 FROM capitulos WHERE codigo='ajustes-wifi';
INSERT OR IGNORE INTO modulos(codigo, titulo) VALUES ('govbr', 'GOV.BR');
INSERT OR IGNORE INTO capitulos(modulo_id, codigo, titulo, ordem) SELECT id, 'gov-acesso', 'Acesso seguro', 1 FROM modulos WHERE codigo='govbr';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'gov-login', 'Entrar com segurança', 'video_pratica', '{"resumo":"Reconheça o acesso oficial do GOV.BR.","acao_frontend":"gov-login"}', 'https://d2ol7oe51mr4n9.cloudfront.net/user_3ITdvjP8F16LCyy9GylHD3JQeFs/55e49222-b669-47d8-8363-0f6d12b11c96.mp4', 1 FROM capitulos WHERE codigo='gov-acesso';
INSERT OR IGNORE INTO capitulos(modulo_id, codigo, titulo, ordem) SELECT id, 'gov-servicos', 'Serviços públicos', 2 FROM modulos WHERE codigo='govbr';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'gov-service', 'Encontrar um serviço', 'video_pratica', '{"resumo":"Saiba onde procurar o que você precisa.","acao_frontend":"gov-service"}', '/static/videos/gov-service.mp4?v=71', 1 FROM capitulos WHERE codigo='gov-servicos';
INSERT OR IGNORE INTO capitulos(modulo_id, codigo, titulo, ordem) SELECT id, 'gov-sair', 'Encerrar sessão', 3 FROM modulos WHERE codigo='govbr';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'gov-logout', 'Sair da conta', 'video_pratica', '{"resumo":"Proteja seus dados depois de usar.","acao_frontend":"gov-logout"}', '/static/videos/gov-logout.mp4?v=71', 1 FROM capitulos WHERE codigo='gov-sair';
INSERT OR IGNORE INTO capitulos(modulo_id, codigo, titulo, ordem) SELECT id, 'gov-2fa-cap', 'Verificação em duas etapas', 4 FROM modulos WHERE codigo='govbr';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'gov-2fa', 'Verificação em duas etapas', 'video_pratica', '{"resumo":"Entenda onde o código é gerado e como protegê-lo.","acao_frontend":"gov-2fa"}', 'https://d2ol7oe51mr4n9.cloudfront.net/user_3ITdvjP8F16LCyy9GylHD3JQeFs/55e49222-b669-47d8-8363-0f6d12b11c96.mp4', 1 FROM capitulos WHERE codigo='gov-2fa-cap';
INSERT OR IGNORE INTO modulos(codigo, titulo) VALUES ('playstore', 'Apps seguros');
INSERT OR IGNORE INTO capitulos(modulo_id, codigo, titulo, ordem) SELECT id, 'apps-oficial', 'Encontrar um aplicativo oficial', 1 FROM modulos WHERE codigo='playstore';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'play-find', 'Encontrar um aplicativo oficial', 'video_pratica', '{"resumo":"Vídeo narrado de encontrar um aplicativo oficial.","acao_frontend":"play-find"}', '/static/videos/play-find.mp4?v=71', 1 FROM capitulos WHERE codigo='apps-oficial';
INSERT OR IGNORE INTO capitulos(modulo_id, codigo, titulo, ordem) SELECT id, 'apps-desenvolvedor', 'Conferir o desenvolvedor', 2 FROM modulos WHERE codigo='playstore';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'play-developer', 'Conferir o desenvolvedor', 'video_pratica', '{"resumo":"Vídeo narrado de conferir o desenvolvedor.","acao_frontend":"play-developer"}', '/static/videos/play-developer.mp4?v=71', 1 FROM capitulos WHERE codigo='apps-desenvolvedor';
INSERT OR IGNORE INTO capitulos(modulo_id, codigo, titulo, ordem) SELECT id, 'apps-play-protect', 'Usar o Play Protect', 3 FROM modulos WHERE codigo='playstore';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'play-protect', 'Usar o Play Protect', 'video_pratica', '{"resumo":"Vídeo narrado de usar o play protect.","acao_frontend":"play-protect"}', '/static/videos/play-protect.mp4?v=71', 1 FROM capitulos WHERE codigo='apps-play-protect';
INSERT OR IGNORE INTO capitulos(modulo_id, codigo, titulo, ordem) SELECT id, 'apps-permissoes', 'Revisar permissões dos aplicativos', 4 FROM modulos WHERE codigo='playstore';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'play-permissions', 'Revisar permissões dos aplicativos', 'video_pratica', '{"resumo":"Vídeo narrado de revisar permissões dos aplicativos.","acao_frontend":"play-permissions"}', '/static/videos/play-permissions.mp4?v=71', 1 FROM capitulos WHERE codigo='apps-permissoes';

-- Atividades guiadas de prevenção.
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'guided-pix-devolucao', 'Golpe do Pix errado', 'pratica_guiada', '{"resumo":"Confira o extrato e pratique uma devolução segura.","acao_frontend":"guided-pix-devolucao"}', NULL, 2 FROM capitulos WHERE codigo='pix-seguranca';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'guided-falso-sequestro', 'Ligação de falso sequestro', 'pratica_guiada', '{"resumo":"Pratique como confirmar se sua filha está segura.","acao_frontend":"guided-falso-sequestro"}', NULL, 2 FROM capitulos WHERE codigo='seg-falso-familiar';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'guided-link-dados', 'Link falso para roubar dados', 'pratica_guiada', '{"resumo":"Confira o endereço antes de informar seus dados.","acao_frontend":"guided-link-dados"}', NULL, 2 FROM capitulos WHERE codigo='seg-link-falso';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'guided-whatsapp-loja', 'Loja falsa no WhatsApp', 'pratica_guiada', '{"resumo":"Confira quem está vendendo antes de pagar.","acao_frontend":"guided-whatsapp-loja"}', NULL, 2 FROM capitulos WHERE codigo='wa-conversas';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'guided-whatsapp-voz', 'Áudio com voz conhecida', 'pratica_guiada', '{"resumo":"Confirme quem enviou um pedido antes de agir.","acao_frontend":"guided-whatsapp-voz"}', NULL, 2 FROM capitulos WHERE codigo='wa-chamadas';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'guided-gov-prova-vida', 'Falsa prova de vida', 'pratica_guiada', '{"resumo":"Consulte o benefício por um canal oficial.","acao_frontend":"guided-gov-prova-vida"}', NULL, 2 FROM capitulos WHERE codigo='gov-servicos';

-- Ampliação das atividades guiadas de prevenção.
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'guided-boleto-falso', 'Boleto falso de uma conta', 'pratica_guiada', '{"resumo":"Compare o beneficiário e obtenha a segunda via oficial.","acao_frontend":"guided-boleto-falso"}', NULL, 3 FROM capitulos WHERE codigo='pix-seguranca';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'guided-pix-qr-trocado', 'QR code Pix trocado', 'pratica_guiada', '{"resumo":"Confira a quem pertence o Pix antes de confirmar.","acao_frontend":"guided-pix-qr-trocado"}', NULL, 4 FROM capitulos WHERE codigo='pix-seguranca';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'guided-comprovante-falso', 'Comprovante de Pix falso', 'pratica_guiada', '{"resumo":"Confirme o dinheiro no extrato antes de entregar uma venda.","acao_frontend":"guided-comprovante-falso"}', NULL, 5 FROM capitulos WHERE codigo='pix-seguranca';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'guided-emprestimo-taxa', 'Empréstimo com taxa adiantada', 'pratica_guiada', '{"resumo":"Identifique uma cobrança falsa para liberar crédito.","acao_frontend":"guided-emprestimo-taxa"}', NULL, 6 FROM capitulos WHERE codigo='pix-seguranca';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'guided-cartao-compra', 'Compra desconhecida no cartão', 'pratica_guiada', '{"resumo":"Faça a contestação pelo canal oficial do banco.","acao_frontend":"guided-cartao-compra"}', NULL, 7 FROM capitulos WHERE codigo='pix-seguranca';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'guided-falso-motoboy', 'Falso motoboy do banco', 'pratica_guiada', '{"resumo":"Proteja cartão, senha e dados diante de uma suposta coleta.","acao_frontend":"guided-falso-motoboy"}', NULL, 8 FROM capitulos WHERE codigo='pix-seguranca';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'guided-pix-apos-golpe', 'Já fiz um Pix no golpe. E agora?', 'pratica_guiada', '{"resumo":"Aja rápido para contestar e guardar as provas.","acao_frontend":"guided-pix-apos-golpe"}', NULL, 9 FROM capitulos WHERE codigo='pix-seguranca';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'guided-qr-publico', 'QR code que pede seus dados', 'pratica_guiada', '{"resumo":"Reconheça quando o endereço aberto pede informações demais.","acao_frontend":"guided-qr-publico"}', NULL, 3 FROM capitulos WHERE codigo='seg-link-falso';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'guided-vaga-falsa', 'Vaga com taxa antecipada', 'pratica_guiada', '{"resumo":"Confira a vaga e o recrutador antes de pagar ou enviar documentos.","acao_frontend":"guided-vaga-falsa"}', NULL, 4 FROM capitulos WHERE codigo='seg-link-falso';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'guided-tarefa-paga', 'Tarefas que cobram para pagar', 'pratica_guiada', '{"resumo":"Identifique quando a promessa de renda vira pedido de depósito.","acao_frontend":"guided-tarefa-paga"}', NULL, 5 FROM capitulos WHERE codigo='seg-link-falso';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'guided-investimento-falso', 'Investimento com lucro garantido', 'pratica_guiada', '{"resumo":"Reconheça promessas que acompanham falsas corretoras e pirâmides.","acao_frontend":"guided-investimento-falso"}', NULL, 6 FROM capitulos WHERE codigo='seg-link-falso';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'guided-anuncio-loja-falsa', 'Anúncio de loja falsa', 'pratica_guiada', '{"resumo":"Vá ao site que você conhece antes de comprar uma oferta.","acao_frontend":"guided-anuncio-loja-falsa"}', NULL, 7 FROM capitulos WHERE codigo='seg-link-falso';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'guided-aluguel-falso', 'Aluguel de imóvel falso', 'pratica_guiada', '{"resumo":"Verifique o imóvel e o responsável antes de depositar.","acao_frontend":"guided-aluguel-falso"}', NULL, 8 FROM capitulos WHERE codigo='seg-link-falso';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'guided-leilao-falso', 'Leilão de veículo falso', 'pratica_guiada', '{"resumo":"Confira quem organiza o leilão e de quem é a conta.","acao_frontend":"guided-leilao-falso"}', NULL, 9 FROM capitulos WHERE codigo='seg-link-falso';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'guided-premio-falso', 'Prêmio que cobra taxa', 'pratica_guiada', '{"resumo":"Cheque promoções que você não lembra de ter disputado.","acao_frontend":"guided-premio-falso"}', NULL, 10 FROM capitulos WHERE codigo='seg-link-falso';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'guided-conta-em-meu-nome', 'Conta aberta no meu nome', 'pratica_guiada', '{"resumo":"Confira um vínculo bancário que você não reconhece.","acao_frontend":"guided-conta-em-meu-nome"}', NULL, 2 FROM capitulos WHERE codigo='seg-codigos';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'guided-suporte-remoto', 'Falso suporte remoto', 'pratica_guiada', '{"resumo":"Interrompa um pedido para controlar seu aparelho.","acao_frontend":"guided-suporte-remoto"}', NULL, 2 FROM capitulos WHERE codigo='seg-falsa-central';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'guided-celular-levado', 'Levaram meu celular', 'pratica_guiada', '{"resumo":"Proteja as contas sem esperar novas movimentações.","acao_frontend":"guided-celular-levado"}', NULL, 3 FROM capitulos WHERE codigo='seg-falsa-central';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'guided-whatsapp-falso-comprador', 'Comprador falso no marketplace', 'pratica_guiada', '{"resumo":"Confira a venda na plataforma antes de entregar.","acao_frontend":"guided-whatsapp-falso-comprador"}', NULL, 3 FROM capitulos WHERE codigo='wa-conversas';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'guided-whatsapp-advogado', 'Falso advogado no WhatsApp', 'pratica_guiada', '{"resumo":"Confira pagamentos ligados a um processo judicial.","acao_frontend":"guided-whatsapp-advogado"}', NULL, 4 FROM capitulos WHERE codigo='wa-conversas';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'guided-whatsapp-romance', 'Golpe do amor', 'pratica_guiada', '{"resumo":"Reconheça uma cobrança ligada a um relacionamento online.","acao_frontend":"guided-whatsapp-romance"}', NULL, 5 FROM capitulos WHERE codigo='wa-conversas';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'guided-whatsapp-chantagem', 'Ameaça de divulgar fotos íntimas', 'pratica_guiada', '{"resumo":"Procure ajuda e preserve provas diante de uma chantagem.","acao_frontend":"guided-whatsapp-chantagem"}', NULL, 6 FROM capitulos WHERE codigo='wa-conversas';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'guided-whatsapp-arquivo-falso', 'Arquivo que finge ser uma fatura', 'pratica_guiada', '{"resumo":"Confira anexos inesperados antes de instalar algo.","acao_frontend":"guided-whatsapp-arquivo-falso"}', NULL, 2 FROM capitulos WHERE codigo='wa-mensagens';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'guided-whatsapp-tela', 'Pediram para compartilhar minha tela', 'pratica_guiada', '{"resumo":"Proteja códigos e dados durante uma chamada.","acao_frontend":"guided-whatsapp-tela"}', NULL, 3 FROM capitulos WHERE codigo='wa-chamadas';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'guided-whatsapp-conta-invadida', 'Pedido vindo de uma conta invadida', 'pratica_guiada', '{"resumo":"Confirme o pedido mesmo quando vem de um contato salvo.","acao_frontend":"guided-whatsapp-conta-invadida"}', NULL, 2 FROM capitulos WHERE codigo='wa-codigo';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'guided-gov-multa-falsa', 'Multa ou suspensão de CNH por SMS', 'pratica_guiada', '{"resumo":"Confira se existe pendência no órgão de trânsito.","acao_frontend":"guided-gov-multa-falsa"}', NULL, 3 FROM capitulos WHERE codigo='gov-servicos';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'guided-gov-encomenda-taxada', 'Falsa taxa de encomenda', 'pratica_guiada', '{"resumo":"Confira a cobrança nos canais da transportadora.","acao_frontend":"guided-gov-encomenda-taxada"}', NULL, 4 FROM capitulos WHERE codigo='gov-servicos';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'guided-gov-inscricao-enem', 'Inscrição falsa no Enem', 'pratica_guiada', '{"resumo":"Localize a Página do Participante pelo canal do Inep.","acao_frontend":"guided-gov-inscricao-enem"}', NULL, 5 FROM capitulos WHERE codigo='gov-servicos';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'guided-gov-valores-receber', 'Falsa consulta de valores a receber', 'pratica_guiada', '{"resumo":"Consulte valores esquecidos pelo canal do Banco Central.","acao_frontend":"guided-gov-valores-receber"}', NULL, 6 FROM capitulos WHERE codigo='gov-servicos';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'guided-gov-das-falso', 'Boleto falso do MEI', 'pratica_guiada', '{"resumo":"Gere a guia do MEI no sistema oficial.","acao_frontend":"guided-gov-das-falso"}', NULL, 7 FROM capitulos WHERE codigo='gov-servicos';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'guided-gov-restituicao-falsa', 'Falsa restituição do Imposto de Renda', 'pratica_guiada', '{"resumo":"Consulte a restituição sem passar dados a desconhecidos.","acao_frontend":"guided-gov-restituicao-falsa"}', NULL, 8 FROM capitulos WHERE codigo='gov-servicos';
INSERT OR IGNORE INTO atividades(capitulo_id, codigo, titulo, tipo, conteudo, video_url, ordem) SELECT id, 'guided-gov-acesso-suspeito', 'Alerta de acesso à conta GOV.BR', 'pratica_guiada', '{"resumo":"Verifique e proteja a conta pelo aplicativo oficial.","acao_frontend":"guided-gov-acesso-suspeito"}', NULL, 2 FROM capitulos WHERE codigo='gov-2fa-cap';


# V112.66 — Login real por WhatsApp (preparação, não ativado)

A implantação do código e a ativação do envio são etapas diferentes. O login atual permanece demonstrativo até configurar e validar a Meta. Não ativar a flag antes dos testes e da autorização. Nunca colocar tokens no Git, HTML, logs ou chat.

## Configuração da Meta
1. Criar app em https://developers.facebook.com/apps/ com produto WhatsApp e conta comercial do projeto.
2. Vincular número remetente autorizado e obter Phone Number ID. Para produção, gerar token de usuário de sistema com permissão whatsapp_business_messaging, registrar número e configurar faturamento.
3. Criar template educa_codigo_acesso, categoria AUTHENTICATION, idioma pt_BR, botão COPY_CODE, aviso de segurança e expiração de 5 minutos. Aguardar aprovação.
4. Configurar no Worker oficial os segredos WHATSAPP_ACCESS_TOKEN e WHATSAPP_OTP_SECRET (32+ caracteres aleatórios, independente do token da Meta). Definir WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_AUTH_TEMPLATE, WHATSAPP_GRAPH_VERSION (versão suportada indicada no painel) e WHATSAPP_DAILY_LIMIT (padrão 100 tentativas de envio por dia UTC). Não replicar segredos no Preview.
5. Somente depois de validação controlada e autorização, definir WHATSAPP_AUTH_MODE=whatsapp no ambiente oficial. Sem credenciais completas, o login real retorna indisponibilidade, sem fallback demonstrativo.

## Testes de aceite antes da ativação
- Primeiro acesso e retorno com o mesmo número; PIN errado, expirado, reenvio e uso único.
- Sessões anteriores de demonstração não autorizam acesso real; progresso, perfil de acessibilidade e XP precisam da sessão verificada.
- Testar dois aparelhos, logout, sessão vencida, recuperação do XP, limite de tentativas e interface nativa Android/iOS.
- Confirmar recebimento em um número de teste autorizado, sem enviar a terceiros. A aceitação da API não comprova a entrega.
- Preview nunca envia mensagens reais. Testes usam um adaptador simulado. O Flask local permanece demonstrativo.
- Tabelas D1 aditivas; contas e progresso existentes preservados. Revisar privacidade, consentimento, limites e orçamento. Meta cobra pelas mensagens de autenticação entregues conforme tabela aplicável.

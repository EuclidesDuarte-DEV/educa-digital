/**
 * Módulos e atividades oferecidos pelo Educa+ Digital.
 * Mantenha este catálogo compatível com data/modulos.json e com schema.sql.
 */
export const MODULOS = [
  {
    "codigo": "pix",
    "titulo": "PIX",
    "ordem": 1,
    "capitulos": [
      {
        "codigo": "pix-primeiros-passos",
        "titulo": "Primeiros passos no Pix",
        "ordem": 1,
        "atividades": [
          {
            "codigo": "pix-recipient",
            "titulo": "Encontrar o Pix no banco",
            "tipo": "video_pratica",
            "conteudo": {
              "resumo": "Abra o banco, entre no Pix e confira o destinatário.",
              "acao_frontend": "pix-recipient"
            },
            "video_url": "/static/videos/pix_seguranca.mp4",
            "ordem": 1
          }
        ]
      },
      {
        "codigo": "pix-chaves",
        "titulo": "Chaves Pix",
        "ordem": 2,
        "atividades": [
          {
            "codigo": "pix-key",
            "titulo": "Entender as chaves Pix",
            "tipo": "video_pratica",
            "conteudo": {
              "resumo": "Veja CPF, celular, e-mail e chave aleatória.",
              "acao_frontend": "pix-key"
            },
            "video_url": "/static/videos/pix-key.mp4?v=71",
            "ordem": 1
          }
        ]
      },
      {
        "codigo": "pix-seguranca",
        "titulo": "Segurança no pagamento",
        "ordem": 3,
        "atividades": [
          {
            "codigo": "pix-scam",
            "titulo": "Reconhecer pedido suspeito",
            "tipo": "video_pratica",
            "conteudo": {
              "resumo": "Aprenda a parar diante de urgência e número novo.",
              "acao_frontend": "pix-scam"
            },
            "video_url": "https://d2ol7oe51mr4n9.cloudfront.net/user_3ITdvjP8F16LCyy9GylHD3JQeFs/a5a4b9cc-d596-4040-9a48-131c706b76d9.mp4",
            "ordem": 1
          },
          {
            "codigo": "guided-pix-devolucao",
            "titulo": "Golpe do Pix errado",
            "tipo": "pratica_guiada",
            "conteudo": {
              "resumo": "Confira o extrato e pratique uma devolução segura.",
              "acao_frontend": "guided-pix-devolucao"
            },
            "video_url": null,
            "ordem": 2
          },
          {
            "codigo": "guided-boleto-falso",
            "titulo": "Boleto falso de uma conta",
            "tipo": "pratica_guiada",
            "conteudo": {
              "resumo": "Compare o beneficiário e obtenha a segunda via oficial.",
              "acao_frontend": "guided-boleto-falso"
            },
            "video_url": null,
            "ordem": 3
          },
          {
            "codigo": "guided-pix-qr-trocado",
            "titulo": "QR code Pix trocado",
            "tipo": "pratica_guiada",
            "conteudo": {
              "resumo": "Confira a quem pertence o Pix antes de confirmar.",
              "acao_frontend": "guided-pix-qr-trocado"
            },
            "video_url": null,
            "ordem": 4
          },
          {
            "codigo": "guided-comprovante-falso",
            "titulo": "Comprovante de Pix falso",
            "tipo": "pratica_guiada",
            "conteudo": {
              "resumo": "Confirme o dinheiro no extrato antes de entregar uma venda.",
              "acao_frontend": "guided-comprovante-falso"
            },
            "video_url": null,
            "ordem": 5
          },
          {
            "codigo": "guided-emprestimo-taxa",
            "titulo": "Empréstimo com taxa adiantada",
            "tipo": "pratica_guiada",
            "conteudo": {
              "resumo": "Identifique uma cobrança falsa para liberar crédito.",
              "acao_frontend": "guided-emprestimo-taxa"
            },
            "video_url": null,
            "ordem": 6
          },
          {
            "codigo": "guided-cartao-compra",
            "titulo": "Compra desconhecida no cartão",
            "tipo": "pratica_guiada",
            "conteudo": {
              "resumo": "Faça a contestação pelo canal oficial do banco.",
              "acao_frontend": "guided-cartao-compra"
            },
            "video_url": null,
            "ordem": 7
          },
          {
            "codigo": "guided-falso-motoboy",
            "titulo": "Falso motoboy do banco",
            "tipo": "pratica_guiada",
            "conteudo": {
              "resumo": "Proteja cartão, senha e dados diante de uma suposta coleta.",
              "acao_frontend": "guided-falso-motoboy"
            },
            "video_url": null,
            "ordem": 8
          },
          {
            "codigo": "guided-pix-apos-golpe",
            "titulo": "Já fiz um Pix no golpe. E agora?",
            "tipo": "pratica_guiada",
            "conteudo": {
              "resumo": "Aja rápido para contestar e guardar as provas.",
              "acao_frontend": "guided-pix-apos-golpe"
            },
            "video_url": null,
            "ordem": 9
          }
        ]
      }
    ]
  },
  {
    "codigo": "security",
    "titulo": "Segurança",
    "ordem": 2,
    "capitulos": [
      {
        "codigo": "seg-falso-familiar",
        "titulo": "Golpe do falso familiar",
        "ordem": 1,
        "atividades": [
          {
            "codigo": "family",
            "titulo": "Golpe do falso filho",
            "tipo": "video_pratica",
            "conteudo": {
              "resumo": "Aprenda a confirmar antes de fazer um Pix.",
              "acao_frontend": "family"
            },
            "video_url": "/static/videos/family.mp4?v=71",
            "ordem": 1
          },
          {
            "codigo": "guided-falso-sequestro",
            "titulo": "Ligação de falso sequestro",
            "tipo": "pratica_guiada",
            "conteudo": {
              "resumo": "Pratique como confirmar se sua filha está segura.",
              "acao_frontend": "guided-falso-sequestro"
            },
            "video_url": null,
            "ordem": 2
          }
        ]
      },
      {
        "codigo": "seg-link-falso",
        "titulo": "Links e mensagens falsas",
        "ordem": 2,
        "atividades": [
          {
            "codigo": "bank",
            "titulo": "Link falso do banco",
            "tipo": "video_pratica",
            "conteudo": {
              "resumo": "Veja como agir quando receber um link urgente.",
              "acao_frontend": "bank"
            },
            "video_url": "/static/videos/bank.mp4?v=71",
            "ordem": 1
          },
          {
            "codigo": "guided-link-dados",
            "titulo": "Link falso para roubar dados",
            "tipo": "pratica_guiada",
            "conteudo": {
              "resumo": "Confira o endereço antes de informar seus dados.",
              "acao_frontend": "guided-link-dados"
            },
            "video_url": null,
            "ordem": 2
          },
          {
            "codigo": "guided-qr-publico",
            "titulo": "QR code que pede seus dados",
            "tipo": "pratica_guiada",
            "conteudo": {
              "resumo": "Reconheça quando o endereço aberto pede informações demais.",
              "acao_frontend": "guided-qr-publico"
            },
            "video_url": null,
            "ordem": 3
          },
          {
            "codigo": "guided-vaga-falsa",
            "titulo": "Vaga com taxa antecipada",
            "tipo": "pratica_guiada",
            "conteudo": {
              "resumo": "Confira a vaga e o recrutador antes de pagar ou enviar documentos.",
              "acao_frontend": "guided-vaga-falsa"
            },
            "video_url": null,
            "ordem": 4
          },
          {
            "codigo": "guided-tarefa-paga",
            "titulo": "Tarefas que cobram para pagar",
            "tipo": "pratica_guiada",
            "conteudo": {
              "resumo": "Identifique quando a promessa de renda vira pedido de depósito.",
              "acao_frontend": "guided-tarefa-paga"
            },
            "video_url": null,
            "ordem": 5
          },
          {
            "codigo": "guided-investimento-falso",
            "titulo": "Investimento com lucro garantido",
            "tipo": "pratica_guiada",
            "conteudo": {
              "resumo": "Reconheça promessas que acompanham falsas corretoras e pirâmides.",
              "acao_frontend": "guided-investimento-falso"
            },
            "video_url": null,
            "ordem": 6
          },
          {
            "codigo": "guided-anuncio-loja-falsa",
            "titulo": "Anúncio de loja falsa",
            "tipo": "pratica_guiada",
            "conteudo": {
              "resumo": "Vá ao site que você conhece antes de comprar uma oferta.",
              "acao_frontend": "guided-anuncio-loja-falsa"
            },
            "video_url": null,
            "ordem": 7
          },
          {
            "codigo": "guided-aluguel-falso",
            "titulo": "Aluguel de imóvel falso",
            "tipo": "pratica_guiada",
            "conteudo": {
              "resumo": "Verifique o imóvel e o responsável antes de depositar.",
              "acao_frontend": "guided-aluguel-falso"
            },
            "video_url": null,
            "ordem": 8
          },
          {
            "codigo": "guided-leilao-falso",
            "titulo": "Leilão de veículo falso",
            "tipo": "pratica_guiada",
            "conteudo": {
              "resumo": "Confira quem organiza o leilão e de quem é a conta.",
              "acao_frontend": "guided-leilao-falso"
            },
            "video_url": null,
            "ordem": 9
          },
          {
            "codigo": "guided-premio-falso",
            "titulo": "Prêmio que cobra taxa",
            "tipo": "pratica_guiada",
            "conteudo": {
              "resumo": "Cheque promoções que você não lembra de ter disputado.",
              "acao_frontend": "guided-premio-falso"
            },
            "video_url": null,
            "ordem": 10
          }
        ]
      },
      {
        "codigo": "seg-codigos",
        "titulo": "Códigos de verificação",
        "ordem": 3,
        "atividades": [
          {
            "codigo": "code",
            "titulo": "Código por SMS",
            "tipo": "video_pratica",
            "conteudo": {
              "resumo": "Saiba por que nunca compartilhar códigos.",
              "acao_frontend": "code"
            },
            "video_url": "/static/videos/code.mp4?v=71",
            "ordem": 1
          },
          {
            "codigo": "guided-conta-em-meu-nome",
            "titulo": "Conta aberta no meu nome",
            "tipo": "pratica_guiada",
            "conteudo": {
              "resumo": "Confira um vínculo bancário que você não reconhece.",
              "acao_frontend": "guided-conta-em-meu-nome"
            },
            "video_url": null,
            "ordem": 2
          }
        ]
      },
      {
        "codigo": "seg-falsa-central",
        "titulo": "Falsa central bancária",
        "ordem": 4,
        "atividades": [
          {
            "codigo": "fake-bank-call",
            "titulo": "Falsa central bancária",
            "tipo": "video_pratica",
            "conteudo": {
              "resumo": "Treine como agir quando alguém pede senha ou instalação de aplicativo.",
              "acao_frontend": "fake-bank-call"
            },
            "video_url": "/static/videos/fake-bank-call.mp4?v=71",
            "ordem": 1
          },
          {
            "codigo": "guided-suporte-remoto",
            "titulo": "Falso suporte remoto",
            "tipo": "pratica_guiada",
            "conteudo": {
              "resumo": "Interrompa um pedido para controlar seu aparelho.",
              "acao_frontend": "guided-suporte-remoto"
            },
            "video_url": null,
            "ordem": 2
          },
          {
            "codigo": "guided-celular-levado",
            "titulo": "Levaram meu celular",
            "tipo": "pratica_guiada",
            "conteudo": {
              "resumo": "Proteja as contas sem esperar novas movimentações.",
              "acao_frontend": "guided-celular-levado"
            },
            "video_url": null,
            "ordem": 3
          }
        ]
      }
    ]
  },
  {
    "codigo": "whatsapp",
    "titulo": "WhatsApp",
    "ordem": 3,
    "capitulos": [
      {
        "codigo": "wa-conversas",
        "titulo": "Conversas",
        "ordem": 1,
        "atividades": [
          {
            "codigo": "wa-list",
            "titulo": "Encontrar uma conversa",
            "tipo": "video_pratica",
            "conteudo": {
              "resumo": "Aprenda a localizar uma pessoa na lista.",
              "acao_frontend": "wa-list"
            },
            "video_url": "/static/videos/wa-list.mp4?v=71",
            "ordem": 1
          },
          {
            "codigo": "guided-whatsapp-loja",
            "titulo": "Loja falsa no WhatsApp",
            "tipo": "pratica_guiada",
            "conteudo": {
              "resumo": "Confira quem está vendendo antes de pagar.",
              "acao_frontend": "guided-whatsapp-loja"
            },
            "video_url": null,
            "ordem": 2
          },
          {
            "codigo": "guided-whatsapp-falso-comprador",
            "titulo": "Comprador falso no marketplace",
            "tipo": "pratica_guiada",
            "conteudo": {
              "resumo": "Confira a venda na plataforma antes de entregar.",
              "acao_frontend": "guided-whatsapp-falso-comprador"
            },
            "video_url": null,
            "ordem": 3
          },
          {
            "codigo": "guided-whatsapp-advogado",
            "titulo": "Falso advogado no WhatsApp",
            "tipo": "pratica_guiada",
            "conteudo": {
              "resumo": "Confira pagamentos ligados a um processo judicial.",
              "acao_frontend": "guided-whatsapp-advogado"
            },
            "video_url": null,
            "ordem": 4
          },
          {
            "codigo": "guided-whatsapp-romance",
            "titulo": "Golpe do amor",
            "tipo": "pratica_guiada",
            "conteudo": {
              "resumo": "Reconheça uma cobrança ligada a um relacionamento online.",
              "acao_frontend": "guided-whatsapp-romance"
            },
            "video_url": null,
            "ordem": 5
          },
          {
            "codigo": "guided-whatsapp-chantagem",
            "titulo": "Ameaça de divulgar fotos íntimas",
            "tipo": "pratica_guiada",
            "conteudo": {
              "resumo": "Procure ajuda e preserve provas diante de uma chantagem.",
              "acao_frontend": "guided-whatsapp-chantagem"
            },
            "video_url": null,
            "ordem": 6
          }
        ]
      },
      {
        "codigo": "wa-mensagens",
        "titulo": "Mensagens",
        "ordem": 2,
        "atividades": [
          {
            "codigo": "wa-message",
            "titulo": "Enviar uma mensagem",
            "tipo": "video_pratica",
            "conteudo": {
              "resumo": "Abra uma conversa e escreva uma mensagem.",
              "acao_frontend": "wa-message"
            },
            "video_url": "/static/videos/wa-message.mp4?v=71",
            "ordem": 1
          },
          {
            "codigo": "guided-whatsapp-arquivo-falso",
            "titulo": "Arquivo que finge ser uma fatura",
            "tipo": "pratica_guiada",
            "conteudo": {
              "resumo": "Confira anexos inesperados antes de instalar algo.",
              "acao_frontend": "guided-whatsapp-arquivo-falso"
            },
            "video_url": null,
            "ordem": 2
          }
        ]
      },
      {
        "codigo": "wa-chamadas",
        "titulo": "Chamadas",
        "ordem": 3,
        "atividades": [
          {
            "codigo": "wa-call",
            "titulo": "Fazer uma ligação",
            "tipo": "video_pratica",
            "conteudo": {
              "resumo": "Conheça onde fica o botão de chamada.",
              "acao_frontend": "wa-call"
            },
            "video_url": "/static/videos/wa-call.mp4?v=71",
            "ordem": 1
          },
          {
            "codigo": "guided-whatsapp-voz",
            "titulo": "Áudio com voz conhecida",
            "tipo": "pratica_guiada",
            "conteudo": {
              "resumo": "Confirme quem enviou um pedido antes de agir.",
              "acao_frontend": "guided-whatsapp-voz"
            },
            "video_url": null,
            "ordem": 2
          },
          {
            "codigo": "guided-whatsapp-tela",
            "titulo": "Pediram para compartilhar minha tela",
            "tipo": "pratica_guiada",
            "conteudo": {
              "resumo": "Proteja códigos e dados durante uma chamada.",
              "acao_frontend": "guided-whatsapp-tela"
            },
            "video_url": null,
            "ordem": 3
          }
        ]
      },
      {
        "codigo": "wa-codigo",
        "titulo": "Código de verificação",
        "ordem": 4,
        "atividades": [
          {
            "codigo": "wa-code-safety",
            "titulo": "Proteger código de verificação",
            "tipo": "video_pratica",
            "conteudo": {
              "resumo": "Aprenda por que códigos nunca devem ser enviados por mensagem.",
              "acao_frontend": "wa-code-safety"
            },
            "video_url": "https://d2ol7oe51mr4n9.cloudfront.net/user_3ITdvjP8F16LCyy9GylHD3JQeFs/a5a4b9cc-d596-4040-9a48-131c706b76d9.mp4",
            "ordem": 1
          },
          {
            "codigo": "guided-whatsapp-conta-invadida",
            "titulo": "Pedido vindo de uma conta invadida",
            "tipo": "pratica_guiada",
            "conteudo": {
              "resumo": "Confirme o pedido mesmo quando vem de um contato salvo.",
              "acao_frontend": "guided-whatsapp-conta-invadida"
            },
            "video_url": null,
            "ordem": 2
          }
        ]
      }
    ]
  },
  {
    "codigo": "settings",
    "titulo": "Ajustes",
    "ordem": 4,
    "capitulos": [
      {
        "codigo": "ajustes-fonte",
        "titulo": "Tamanho do texto",
        "ordem": 1,
        "atividades": [
          {
            "codigo": "settings-font",
            "titulo": "Aumentar as letras",
            "tipo": "video_pratica",
            "conteudo": {
              "resumo": "Deixe textos maiores e mais fáceis de ler.",
              "acao_frontend": "settings-font"
            },
            "video_url": "/static/videos/settings-font.mp4?v=71",
            "ordem": 1
          }
        ]
      },
      {
        "codigo": "ajustes-volume",
        "titulo": "Som e volume",
        "ordem": 2,
        "atividades": [
          {
            "codigo": "settings-volume",
            "titulo": "Ajustar o volume",
            "tipo": "video_pratica",
            "conteudo": {
              "resumo": "Aumente ou diminua o som do aparelho.",
              "acao_frontend": "settings-volume"
            },
            "video_url": "/static/videos/settings-volume.mp4?v=71",
            "ordem": 1
          }
        ]
      },
      {
        "codigo": "ajustes-wifi",
        "titulo": "Wi-Fi",
        "ordem": 3,
        "atividades": [
          {
            "codigo": "settings-wifi",
            "titulo": "Conectar ao Wi-Fi",
            "tipo": "video_pratica",
            "conteudo": {
              "resumo": "Aprenda a escolher uma rede com segurança.",
              "acao_frontend": "settings-wifi"
            },
            "video_url": "/static/videos/settings-wifi.mp4?v=71",
            "ordem": 1
          }
        ]
      }
    ]
  },
  {
    "codigo": "govbr",
    "titulo": "GOV.BR",
    "ordem": 5,
    "capitulos": [
      {
        "codigo": "gov-acesso",
        "titulo": "Acesso seguro",
        "ordem": 1,
        "atividades": [
          {
            "codigo": "gov-login",
            "titulo": "Entrar com segurança",
            "tipo": "video_pratica",
            "conteudo": {
              "resumo": "Reconheça o acesso oficial do GOV.BR.",
              "acao_frontend": "gov-login"
            },
            "video_url": "https://d2ol7oe51mr4n9.cloudfront.net/user_3ITdvjP8F16LCyy9GylHD3JQeFs/55e49222-b669-47d8-8363-0f6d12b11c96.mp4",
            "ordem": 1
          }
        ]
      },
      {
        "codigo": "gov-servicos",
        "titulo": "Serviços públicos",
        "ordem": 2,
        "atividades": [
          {
            "codigo": "gov-service",
            "titulo": "Encontrar um serviço",
            "tipo": "video_pratica",
            "conteudo": {
              "resumo": "Saiba onde procurar o que você precisa.",
              "acao_frontend": "gov-service"
            },
            "video_url": "/static/videos/gov-service.mp4?v=71",
            "ordem": 1
          },
          {
            "codigo": "guided-gov-prova-vida",
            "titulo": "Falsa prova de vida",
            "tipo": "pratica_guiada",
            "conteudo": {
              "resumo": "Consulte o benefício por um canal oficial.",
              "acao_frontend": "guided-gov-prova-vida"
            },
            "video_url": null,
            "ordem": 2
          },
          {
            "codigo": "guided-gov-multa-falsa",
            "titulo": "Multa ou suspensão de CNH por SMS",
            "tipo": "pratica_guiada",
            "conteudo": {
              "resumo": "Confira se existe pendência no órgão de trânsito.",
              "acao_frontend": "guided-gov-multa-falsa"
            },
            "video_url": null,
            "ordem": 3
          },
          {
            "codigo": "guided-gov-encomenda-taxada",
            "titulo": "Falsa taxa de encomenda",
            "tipo": "pratica_guiada",
            "conteudo": {
              "resumo": "Confira a cobrança nos canais da transportadora.",
              "acao_frontend": "guided-gov-encomenda-taxada"
            },
            "video_url": null,
            "ordem": 4
          },
          {
            "codigo": "guided-gov-inscricao-enem",
            "titulo": "Inscrição falsa no Enem",
            "tipo": "pratica_guiada",
            "conteudo": {
              "resumo": "Localize a Página do Participante pelo canal do Inep.",
              "acao_frontend": "guided-gov-inscricao-enem"
            },
            "video_url": null,
            "ordem": 5
          },
          {
            "codigo": "guided-gov-valores-receber",
            "titulo": "Falsa consulta de valores a receber",
            "tipo": "pratica_guiada",
            "conteudo": {
              "resumo": "Consulte valores esquecidos pelo canal do Banco Central.",
              "acao_frontend": "guided-gov-valores-receber"
            },
            "video_url": null,
            "ordem": 6
          },
          {
            "codigo": "guided-gov-das-falso",
            "titulo": "Boleto falso do MEI",
            "tipo": "pratica_guiada",
            "conteudo": {
              "resumo": "Gere a guia do MEI no sistema oficial.",
              "acao_frontend": "guided-gov-das-falso"
            },
            "video_url": null,
            "ordem": 7
          },
          {
            "codigo": "guided-gov-restituicao-falsa",
            "titulo": "Falsa restituição do Imposto de Renda",
            "tipo": "pratica_guiada",
            "conteudo": {
              "resumo": "Consulte a restituição sem passar dados a desconhecidos.",
              "acao_frontend": "guided-gov-restituicao-falsa"
            },
            "video_url": null,
            "ordem": 8
          }
        ]
      },
      {
        "codigo": "gov-sair",
        "titulo": "Encerrar sessão",
        "ordem": 3,
        "atividades": [
          {
            "codigo": "gov-logout",
            "titulo": "Sair da conta",
            "tipo": "video_pratica",
            "conteudo": {
              "resumo": "Proteja seus dados depois de usar.",
              "acao_frontend": "gov-logout"
            },
            "video_url": "/static/videos/gov-logout.mp4?v=71",
            "ordem": 1
          }
        ]
      },
      {
        "codigo": "gov-2fa-cap",
        "titulo": "Verificação em duas etapas",
        "ordem": 4,
        "atividades": [
          {
            "codigo": "gov-2fa",
            "titulo": "Verificação em duas etapas",
            "tipo": "video_pratica",
            "conteudo": {
              "resumo": "Entenda onde o código é gerado e como protegê-lo.",
              "acao_frontend": "gov-2fa"
            },
            "video_url": "https://d2ol7oe51mr4n9.cloudfront.net/user_3ITdvjP8F16LCyy9GylHD3JQeFs/55e49222-b669-47d8-8363-0f6d12b11c96.mp4",
            "ordem": 1
          },
          {
            "codigo": "guided-gov-acesso-suspeito",
            "titulo": "Alerta de acesso à conta GOV.BR",
            "tipo": "pratica_guiada",
            "conteudo": {
              "resumo": "Verifique e proteja a conta pelo aplicativo oficial.",
              "acao_frontend": "guided-gov-acesso-suspeito"
            },
            "video_url": null,
            "ordem": 2
          }
        ]
      }
    ]
  },
  {
    "codigo": "playstore",
    "titulo": "Apps seguros",
    "ordem": 6,
    "capitulos": [
      {
        "codigo": "apps-oficial",
        "titulo": "Encontrar um aplicativo oficial",
        "ordem": 1,
        "atividades": [
          {
            "codigo": "play-find",
            "titulo": "Encontrar um aplicativo oficial",
            "tipo": "video_pratica",
            "conteudo": {
              "resumo": "Vídeo narrado de encontrar um aplicativo oficial.",
              "acao_frontend": "play-find"
            },
            "video_url": "/static/videos/play-find.mp4?v=71",
            "ordem": 1
          }
        ]
      },
      {
        "codigo": "apps-desenvolvedor",
        "titulo": "Conferir o desenvolvedor",
        "ordem": 2,
        "atividades": [
          {
            "codigo": "play-developer",
            "titulo": "Conferir o desenvolvedor",
            "tipo": "video_pratica",
            "conteudo": {
              "resumo": "Vídeo narrado de conferir o desenvolvedor.",
              "acao_frontend": "play-developer"
            },
            "video_url": "/static/videos/play-developer.mp4?v=71",
            "ordem": 1
          }
        ]
      },
      {
        "codigo": "apps-play-protect",
        "titulo": "Usar o Play Protect",
        "ordem": 3,
        "atividades": [
          {
            "codigo": "play-protect",
            "titulo": "Usar o Play Protect",
            "tipo": "video_pratica",
            "conteudo": {
              "resumo": "Vídeo narrado de usar o play protect.",
              "acao_frontend": "play-protect"
            },
            "video_url": "/static/videos/play-protect.mp4?v=71",
            "ordem": 1
          }
        ]
      },
      {
        "codigo": "apps-permissoes",
        "titulo": "Revisar permissões dos aplicativos",
        "ordem": 4,
        "atividades": [
          {
            "codigo": "play-permissions",
            "titulo": "Revisar permissões dos aplicativos",
            "tipo": "video_pratica",
            "conteudo": {
              "resumo": "Vídeo narrado de revisar permissões dos aplicativos.",
              "acao_frontend": "play-permissions"
            },
            "video_url": "/static/videos/play-permissions.mp4?v=71",
            "ordem": 1
          }
        ]
      }
    ]
  }
];

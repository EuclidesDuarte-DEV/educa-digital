# Arquivo atualizado para o Educa+ Digital.
# Aulas guiadas primeiro, atividades depois.
# Conteúdo pensado para idosos, com prática no celular de treino.

TRILHAS = [{'slug': 'celular-sem-medo',
  'nome': 'Celular sem medo (Idosos)',
  'descricao': 'Aumentar as letras, ajustar o volume, ligar o Wi-Fi, usar o teclado e tirar fotos — tudo com calma.',
  'icone': '📶',
  'nivel': 'Iniciante',
  'aulas': 2,
  'conteudos': ['Aumentar as letras e o brilho da tela', 'Conectar no Wi-Fi de casa'],
  'aulas_lista': [{'slug': 'celular-sem-medo-aumentar-as-letras-e-o-brilho-da-tela',
                   'trilha_slug': 'celular-sem-medo',
                   'indice': 1,
                   'titulo': 'Aumentar as letras e o brilho da tela',
                   'resumo': 'Deixe a tela do celular fácil de enxergar mudando o tamanho das letras.',
                   'nivel': 'Iniciante',
                   'duracao': '7 minutos',
                   'passos': [{'numero': 1,
                               'instrucao': 'Toque em Ajustes (a engrenagem cinza).',
                               'narracao': 'Tudo o que muda no celular fica dentro de Ajustes. O desenho é uma '
                                           'engrenagem, parecida com uma roda dentada.',
                               'dica': 'Dica: Se não achar, arraste o dedo pela tela para ver mais ícones.',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Tela inicial</span></div>\n'
                                            '<div class="tela tela-inicial"><div class="item icone alvo"><span '
                                            'class="emoji">⚙️</span><span class="rot">Ajustes</span><span '
                                            'class="mao">👆</span><span class="balao">Toque aqui</span></div><div '
                                            'class="item icone"><span class="emoji">💬</span><span '
                                            'class="rot">WhatsApp</span></div><div class="item icone"><span '
                                            'class="emoji">📷</span><span class="rot">Câmera</span></div><div '
                                            'class="item icone"><span class="emoji">📞</span><span '
                                            'class="rot">Telefone</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'},
                              {'numero': 2,
                               'instrucao': 'Toque em Tela e brilho.',
                               'narracao': 'Dentro de Ajustes procure a opção Tela e brilho. É lá que mudamos o '
                                           'tamanho das letras.',
                               'dica': '',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Ajustes</span></div>\n'
                                            '<div class="tela aplicativo"><div class="item icone alvo"><span '
                                            'class="emoji">🔆</span><span class="rot">Tela e brilho</span><span '
                                            'class="mao">👆</span><span class="balao">Toque aqui</span></div><div '
                                            'class="item icone"><span class="emoji">🔊</span><span '
                                            'class="rot">Sons</span></div><div class="item icone"><span '
                                            'class="emoji">📶</span><span class="rot">Wi-Fi</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'},
                              {'numero': 3,
                               'instrucao': 'Toque em Tamanho do texto e escolha letras maiores.',
                               'narracao': 'Arraste para o lado direito para aumentar. Deixe do tamanho em que você lê '
                                           'sem apertar os olhos.',
                               'dica': 'Dica: Você pode voltar e mudar quantas vezes quiser. Nada estraga.',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Tela e brilho</span></div>\n'
                                            '<div class="tela aplicativo"><div class="item campo alvo"><span '
                                            'class="rot">Tamanho do texto AA</span><span class="mao">👆</span><span '
                                            'class="balao">Toque aqui</span></div><div class="item campo"><span '
                                            'class="rot">Brilho</span></div><div class="item botao"><span '
                                            'class="rot">Voltar</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'}],
                   'atividades': [{'numero': 1,
                                   'enunciado': '1. Onde ficam as opções para mudar o tamanho das letras?',
                                   'alternativas': [{'letra': 'A', 'texto': 'No WhatsApp'},
                                                    {'letra': 'B', 'texto': 'Em Ajustes'},
                                                    {'letra': 'C', 'texto': 'Na câmera'}],
                                   'correta': 'B',
                                   'explicacao': 'Ajustes (a engrenagem) guarda todas as configurações do celular.'},
                                  {'numero': 2,
                                   'enunciado': '2. Se as letras ficarem grandes demais, o que você faz?',
                                   'alternativas': [{'letra': 'A', 'texto': 'Nada, ficou assim para sempre'},
                                                    {'letra': 'B', 'texto': 'Volta em Ajustes e diminui de novo'},
                                                    {'letra': 'C', 'texto': 'Compra outro celular'}],
                                   'correta': 'B',
                                   'explicacao': 'Pode ajustar quantas vezes quiser, sem medo de estragar.'},
                                  {'numero': 3,
                                   'enunciado': '3. Para começar esta aula, em qual opção você toca primeiro?',
                                   'alternativas': [{'letra': 'A', 'texto': 'WhatsApp'},
                                                    {'letra': 'B', 'texto': 'Ajustes'},
                                                    {'letra': 'C', 'texto': 'Câmera'}],
                                   'correta': 'B',
                                   'explicacao': 'Isso mesmo. O primeiro passo mostrado na aula é toque em '
                                                 '“Ajustes”.'}]},
                  {'slug': 'celular-sem-medo-conectar-no-wi-fi-de-casa',
                   'trilha_slug': 'celular-sem-medo',
                   'indice': 2,
                   'titulo': 'Conectar no Wi-Fi de casa',
                   'resumo': 'Use a internet de casa e economize os dados do seu plano.',
                   'nivel': 'Iniciante',
                   'duracao': '8 minutos',
                   'passos': [{'numero': 1,
                               'instrucao': 'Toque em Ajustes.',
                               'narracao': 'Vamos ligar o Wi-Fi. Comece abrindo os Ajustes.',
                               'dica': '',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Tela inicial</span></div>\n'
                                            '<div class="tela tela-inicial"><div class="item icone alvo"><span '
                                            'class="emoji">⚙️</span><span class="rot">Ajustes</span><span '
                                            'class="mao">👆</span><span class="balao">Toque aqui</span></div><div '
                                            'class="item icone"><span class="emoji">🖼️</span><span '
                                            'class="rot">Fotos</span></div><div class="item icone"><span '
                                            'class="emoji">📞</span><span class="rot">Telefone</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'},
                              {'numero': 2,
                               'instrucao': 'Toque em Wi-Fi.',
                               'narracao': 'Wi-Fi é a internet sem fio da sua casa. Toque nessa opção para ver as '
                                           'redes por perto.',
                               'dica': '',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Ajustes</span></div>\n'
                                            '<div class="tela aplicativo"><div class="item icone alvo"><span '
                                            'class="emoji">📶</span><span class="rot">Wi-Fi</span><span '
                                            'class="mao">👆</span><span class="balao">Toque aqui</span></div><div '
                                            'class="item icone"><span class="emoji">🔵</span><span '
                                            'class="rot">Bluetooth</span></div><div class="item icone"><span '
                                            'class="emoji">🔊</span><span class="rot">Sons</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'},
                              {'numero': 3,
                               'instrucao': 'Toque no nome da rede da sua casa e digite a senha.',
                               'narracao': 'Escolha a rede da sua casa — o nome costuma estar embaixo do aparelho da '
                                           'internet. Depois digite a senha.',
                               'dica': 'Dica: Nunca use redes abertas de rua para acessar banco.',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Wi-Fi</span></div>\n'
                                            '<div class="tela aplicativo"><div class="item botao alvo"><span '
                                            'class="rot">CASA-FAMILIA 🔒</span><span class="mao">👆</span><span '
                                            'class="balao">Toque aqui</span></div><div class="item botao"><span '
                                            'class="rot">WIFI-GRATIS-RUA</span></div><div class="item botao"><span '
                                            'class="rot">Voltar</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'}],
                   'atividades': [{'numero': 1,
                                   'enunciado': '1. Para acessar o aplicativo do banco, qual rede é mais segura?',
                                   'alternativas': [{'letra': 'A', 'texto': 'Uma rede aberta e grátis da rua'},
                                                    {'letra': 'B', 'texto': 'O Wi-Fi da sua casa, com senha'}],
                                   'correta': 'B',
                                   'explicacao': 'Redes abertas podem ser usadas por golpistas. Use a sua rede com '
                                                 'senha ou os dados do celular.'},
                                  {'numero': 2,
                                   'enunciado': '2. Para começar esta aula, em qual opção você toca primeiro?',
                                   'alternativas': [{'letra': 'A', 'texto': 'Fotos'},
                                                    {'letra': 'B', 'texto': 'Ajustes'},
                                                    {'letra': 'C', 'texto': 'Telefone'}],
                                   'correta': 'B',
                                   'explicacao': 'Isso mesmo. O primeiro passo mostrado na aula é toque em “Ajustes”.'},
                                  {'numero': 3,
                                   'enunciado': '3. No fim da explicação, qual é a ação principal mostrada para você '
                                                'praticar?',
                                   'alternativas': [{'letra': 'A', 'texto': 'CASA-FAMILIA 🔒'},
                                                    {'letra': 'B', 'texto': 'WIFI-GRATIS-RUA'},
                                                    {'letra': 'C', 'texto': 'Voltar'}],
                                   'correta': 'A',
                                   'explicacao': 'Correto. Na parte final da aula, a prática mostra “CASA-FAMILIA 🔒” '
                                                 'como ação principal.'}]}],
  'total_atividades': 6},
 {'slug': 'whatsapp-para-idosos',
  'nome': 'WhatsApp na prática (Idosos)',
  'descricao': 'Enviar mensagens, áudios, fotos e fazer chamadas de vídeo para falar com a família.',
  'icone': '💬',
  'nivel': 'Iniciante',
  'aulas': 2,
  'conteudos': ['Gravar e enviar um áudio', 'Fazer uma chamada de vídeo'],
  'aulas_lista': [{'slug': 'whatsapp-para-idosos-gravar-e-enviar-um-audio',
                   'trilha_slug': 'whatsapp-para-idosos',
                   'indice': 1,
                   'titulo': 'Gravar e enviar um áudio',
                   'resumo': 'Quando escrever é difícil, mande sua voz — é rápido e simples.',
                   'nivel': 'Iniciante',
                   'duracao': '8 minutos',
                   'passos': [{'numero': 1,
                               'instrucao': 'Toque no WhatsApp.',
                               'narracao': 'Abra o WhatsApp tocando uma vez no ícone verde.',
                               'dica': '',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Tela inicial</span></div>\n'
                                            '<div class="tela tela-inicial"><div class="item icone alvo"><span '
                                            'class="emoji">💬</span><span class="rot">WhatsApp</span><span '
                                            'class="mao">👆</span><span class="balao">Toque aqui</span></div><div '
                                            'class="item icone"><span class="emoji">📷</span><span '
                                            'class="rot">Câmera</span></div><div class="item icone"><span '
                                            'class="emoji">⚙️</span><span class="rot">Ajustes</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'},
                              {'numero': 2,
                               'instrucao': 'Toque na conversa com quem você quer falar.',
                               'narracao': 'Escolha a pessoa na lista de conversas.',
                               'dica': '',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">WhatsApp — Conversas</span></div>\n'
                                            '<div class="tela aplicativo"><div class="item icone alvo"><span '
                                            'class="emoji">👦</span><span class="rot">João (neto)</span><span '
                                            'class="mao">👆</span><span class="balao">Toque aqui</span></div><div '
                                            'class="item icone"><span class="emoji">⛪</span><span class="rot">Grupo da '
                                            'igreja</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'},
                              {'numero': 3,
                               'instrucao': 'Segure o microfone, fale, e solte para enviar.',
                               'narracao': 'Segure o dedo no microfone enquanto fala. Quando terminar, solte: o áudio '
                                           'é enviado sozinho.',
                               'dica': 'Dica: Se errar, arraste o dedo para o lado antes de soltar para cancelar.',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Conversa com João</span></div>\n'
                                            '<div class="tela aplicativo"><div class="item campo"><span '
                                            'class="rot">Digite uma mensagem</span></div><div class="item botao '
                                            'alvo"><span class="rot">Microfone 🎤</span><span class="mao">👆</span><span '
                                            'class="balao">Toque aqui</span></div><div class="item botao"><span '
                                            'class="rot">Câmera 📷</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'}],
                   'atividades': [{'numero': 1,
                                   'enunciado': '1. Como se envia um áudio no WhatsApp?',
                                   'alternativas': [{'letra': 'A',
                                                     'texto': 'Segurando o microfone enquanto fala e soltando no fim'},
                                                    {'letra': 'B', 'texto': 'Tocando na câmera'},
                                                    {'letra': 'C', 'texto': 'Desligando o celular'}],
                                   'correta': 'A',
                                   'explicacao': 'Segurou, falou, soltou: o áudio vai embora na hora.'},
                                  {'numero': 2,
                                   'enunciado': '2. Para começar esta aula, em qual opção você toca primeiro?',
                                   'alternativas': [{'letra': 'A', 'texto': 'Câmera'},
                                                    {'letra': 'B', 'texto': 'WhatsApp'},
                                                    {'letra': 'C', 'texto': 'Ajustes'}],
                                   'correta': 'B',
                                   'explicacao': 'Isso mesmo. O primeiro passo mostrado na aula é toque em '
                                                 '“WhatsApp”.'},
                                  {'numero': 3,
                                   'enunciado': '3. No fim da explicação, qual é a ação principal mostrada para você '
                                                'praticar?',
                                   'alternativas': [{'letra': 'A', 'texto': 'Microfone 🎤'},
                                                    {'letra': 'B', 'texto': 'Digite uma mensagem'},
                                                    {'letra': 'C', 'texto': 'Câmera 📷'}],
                                   'correta': 'A',
                                   'explicacao': 'Correto. Na parte final da aula, a prática mostra “Microfone 🎤” como '
                                                 'ação principal.'}]},
                  {'slug': 'whatsapp-para-idosos-fazer-uma-chamada-de-video',
                   'trilha_slug': 'whatsapp-para-idosos',
                   'indice': 2,
                   'titulo': 'Fazer uma chamada de vídeo',
                   'resumo': 'Ver o rosto de quem você ama, mesmo de longe.',
                   'nivel': 'Iniciante',
                   'duracao': '7 minutos',
                   'passos': [{'numero': 1,
                               'instrucao': 'Abra a conversa da pessoa.',
                               'narracao': 'Primeiro entre na conversa de quem você quer ver.',
                               'dica': '',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">WhatsApp — Conversas</span></div>\n'
                                            '<div class="tela aplicativo"><div class="item icone alvo"><span '
                                            'class="emoji">👩</span><span class="rot">Maria (filha)</span><span '
                                            'class="mao">👆</span><span class="balao">Toque aqui</span></div><div '
                                            'class="item icone"><span class="emoji">👵</span><span class="rot">Vizinha '
                                            'Ana</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'},
                              {'numero': 2,
                               'instrucao': 'Toque na câmera de vídeo, no alto da tela.',
                               'narracao': 'No topo da conversa há dois desenhos: um telefone (só voz) e uma câmera '
                                           '(com imagem). Toque na câmera.',
                               'dica': '',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Conversa com Maria</span></div>\n'
                                            '<div class="tela aplicativo"><div class="item botao alvo"><span '
                                            'class="rot">Chamada de vídeo 📹</span><span class="mao">👆</span><span '
                                            'class="balao">Toque aqui</span></div><div class="item botao"><span '
                                            'class="rot">Chamada de voz 📞</span></div><div class="item campo"><span '
                                            'class="rot">Digite uma mensagem</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'},
                              {'numero': 3,
                               'instrucao': 'Para encerrar, toque no botão vermelho.',
                               'narracao': 'Quando terminar a conversa, toque no telefone vermelho para desligar.',
                               'dica': '',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Chamada de vídeo</span></div>\n'
                                            '<div class="tela aplicativo"><div class="item botao alvo"><span '
                                            'class="rot">Desligar 🔴</span><span class="mao">👆</span><span '
                                            'class="balao">Toque aqui</span></div><div class="item botao"><span '
                                            'class="rot">Virar câmera 🔄</span></div><div class="item botao"><span '
                                            'class="rot">Sem som 🔇</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'}],
                   'atividades': [{'numero': 1,
                                   'enunciado': '1. Qual desenho começa uma chamada com imagem?',
                                   'alternativas': [{'letra': 'A', 'texto': 'O telefone'},
                                                    {'letra': 'B', 'texto': 'A câmera de vídeo'},
                                                    {'letra': 'C', 'texto': 'A lupa'}],
                                   'correta': 'B',
                                   'explicacao': 'A câmera faz chamada de vídeo. O telefone é só voz.'},
                                  {'numero': 2,
                                   'enunciado': '2. Para começar esta aula, em qual opção você toca primeiro?',
                                   'alternativas': [{'letra': 'A', 'texto': 'Vizinha Ana'},
                                                    {'letra': 'B', 'texto': 'Maria (filha)'},
                                                    {'letra': 'C', 'texto': 'WhatsApp'}],
                                   'correta': 'B',
                                   'explicacao': 'Isso mesmo. O primeiro passo mostrado na aula é toque em “Maria '
                                                 '(filha)”.'},
                                  {'numero': 3,
                                   'enunciado': '3. No fim da explicação, qual é a ação principal mostrada para você '
                                                'praticar?',
                                   'alternativas': [{'letra': 'A', 'texto': 'Desligar 🔴'},
                                                    {'letra': 'B', 'texto': 'Virar câmera 🔄'},
                                                    {'letra': 'C', 'texto': 'Sem som 🔇'}],
                                   'correta': 'A',
                                   'explicacao': 'Correto. Na parte final da aula, a prática mostra “Desligar 🔴” como '
                                                 'ação principal.'}]}],
  'total_atividades': 6},
 {'slug': 'golpes-e-senhas',
  'nome': 'Golpes e senhas (Idosos)',
  'descricao': 'Falso funcionário do banco, código do WhatsApp, PIX urgente e promoções falsas: aprenda a não cair.',
  'icone': '🚨',
  'nivel': 'Iniciante',
  'aulas': 2,
  'conteudos': ['Nunca passe o código de 6 números', 'Falso funcionário do banco'],
  'aulas_lista': [{'slug': 'golpes-e-senhas-nunca-passe-o-codigo-de-6-numeros',
                   'trilha_slug': 'golpes-e-senhas',
                   'indice': 1,
                   'titulo': 'Nunca passe o código de 6 números',
                   'resumo': 'Assim os golpistas clonam o WhatsApp. Aprenda a reconhecer e recusar.',
                   'nivel': 'Iniciante',
                   'duracao': '9 minutos',
                   'passos': [{'numero': 1,
                               'instrucao': 'Toque em Não enviar o código.',
                               'narracao': 'Chegou uma mensagem pedindo o código de seis números que você recebeu por '
                                           'SMS. Isso é golpe, sempre. Nenhuma empresa pede esse código.',
                               'dica': 'Dica: Nem parente, nem banco, nem loja: ninguém precisa do seu código.',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Mensagem recebida</span></div>\n'
                                            '<div class="tela aplicativo"><div class="item botao"><span '
                                            'class="rot">Enviar o código</span></div><div class="item botao '
                                            'alvo"><span class="rot">Não enviar o código</span><span '
                                            'class="mao">👆</span><span class="balao">Toque aqui</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'},
                              {'numero': 2,
                               'instrucao': 'Toque em Bloquear e denunciar.',
                               'narracao': 'Depois de recusar, bloqueie o número para ele não insistir.',
                               'dica': '',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Número desconhecido</span></div>\n'
                                            '<div class="tela aplicativo"><div class="item botao"><span '
                                            'class="rot">Responder</span></div><div class="item botao alvo"><span '
                                            'class="rot">Bloquear e denunciar 🚫</span><span class="mao">👆</span><span '
                                            'class="balao">Toque aqui</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'},
                              {'numero': 3,
                               'instrucao': 'Toque em Ativar confirmação em duas etapas.',
                               'narracao': 'Nos Ajustes do WhatsApp, ative a confirmação em duas etapas. É uma senha '
                                           'extra que protege sua conta.',
                               'dica': '',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">WhatsApp — Privacidade</span></div>\n'
                                            '<div class="tela aplicativo"><div class="item botao alvo"><span '
                                            'class="rot">Confirmação em duas etapas 🔐</span><span '
                                            'class="mao">👆</span><span class="balao">Toque aqui</span></div><div '
                                            'class="item botao"><span class="rot">Foto do perfil</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'}],
                   'atividades': [{'numero': 1,
                                   'enunciado': '1. Alguém pede o código de 6 números que chegou no seu SMS. O que '
                                                'fazer?',
                                   'alternativas': [{'letra': 'A', 'texto': 'Enviar se for conhecido'},
                                                    {'letra': 'B', 'texto': 'Nunca enviar para ninguém'}],
                                   'correta': 'B',
                                   'explicacao': 'Esse código é a chave da sua conta. Enviá-lo é entregar o WhatsApp.'},
                                  {'numero': 2,
                                   'enunciado': '2. A confirmação em duas etapas serve para:',
                                   'alternativas': [{'letra': 'A', 'texto': 'Deixar o celular mais rápido'},
                                                    {'letra': 'B', 'texto': 'Colocar uma proteção a mais na sua conta'},
                                                    {'letra': 'C', 'texto': 'Aumentar as letras'}],
                                   'correta': 'B',
                                   'explicacao': 'É uma senha extra: mesmo com o código, o golpista não entra.'},
                                  {'numero': 3,
                                   'enunciado': '3. Para começar esta aula, em qual opção você toca primeiro?',
                                   'alternativas': [{'letra': 'A', 'texto': 'Enviar o código'},
                                                    {'letra': 'B', 'texto': 'Não enviar o código'},
                                                    {'letra': 'C', 'texto': 'WhatsApp'}],
                                   'correta': 'B',
                                   'explicacao': 'Isso mesmo. O primeiro passo mostrado na aula é toque em “Não enviar '
                                                 'o código”.'}]},
                  {'slug': 'golpes-e-senhas-falso-funcionario-do-banco',
                   'trilha_slug': 'golpes-e-senhas',
                   'indice': 2,
                   'titulo': 'Falso funcionário do banco',
                   'resumo': 'Ligou dizendo que sua conta foi invadida? Veja o que fazer.',
                   'nivel': 'Iniciante',
                   'duracao': '8 minutos',
                   'passos': [{'numero': 1,
                               'instrucao': 'Toque em Desligar a ligação.',
                               'narracao': 'A pessoa diz ser do banco e pede sua senha ou pede para você instalar um '
                                           'aplicativo. Banco nunca faz isso. Desligue.',
                               'dica': '',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Ligação recebida</span></div>\n'
                                            '<div class="tela aplicativo"><div class="item botao"><span '
                                            'class="rot">Informar minha senha</span></div><div class="item botao '
                                            'alvo"><span class="rot">Desligar a ligação 📵</span><span '
                                            'class="mao">👆</span><span class="balao">Toque aqui</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'},
                              {'numero': 2,
                               'instrucao': 'Toque em Ligar para o número do cartão.',
                               'narracao': 'Se ficou com dúvida, ligue você mesmo para o telefone que está atrás do '
                                           'seu cartão. Nunca no número que mandaram.',
                               'dica': '',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Confirmar com o banco</span></div>\n'
                                            '<div class="tela aplicativo"><div class="item botao"><span '
                                            'class="rot">Ligar para o número da mensagem</span></div><div class="item '
                                            'botao alvo"><span class="rot">Ligar para o número do cartão 💳</span><span '
                                            'class="mao">👆</span><span class="balao">Toque aqui</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'}],
                   'atividades': [{'numero': 1,
                                   'enunciado': '1. Um funcionário do banco pode pedir sua senha por telefone?',
                                   'alternativas': [{'letra': 'A', 'texto': 'Sim, se for urgente'},
                                                    {'letra': 'B', 'texto': 'Nunca'}],
                                   'correta': 'B',
                                   'explicacao': 'Banco nunca pede senha, código ou instalação de aplicativo por '
                                                 'telefone.'},
                                  {'numero': 2,
                                   'enunciado': '2. Para começar esta aula, em qual opção você toca primeiro?',
                                   'alternativas': [{'letra': 'A', 'texto': 'Informar minha senha'},
                                                    {'letra': 'B', 'texto': 'Desligar a ligação 📵'},
                                                    {'letra': 'C', 'texto': 'WhatsApp'}],
                                   'correta': 'B',
                                   'explicacao': 'Isso mesmo. O primeiro passo mostrado na aula é toque em “Desligar a '
                                                 'ligação 📵”.'},
                                  {'numero': 3,
                                   'enunciado': '3. No fim da explicação, qual é a ação principal mostrada para você '
                                                'praticar?',
                                   'alternativas': [{'letra': 'A', 'texto': 'Ligar para o número do cartão 💳'},
                                                    {'letra': 'B', 'texto': 'Ligar para o número da mensagem'},
                                                    {'letra': 'C', 'texto': 'Cancelar'}],
                                   'correta': 'A',
                                   'explicacao': 'Correto. Na parte final da aula, a prática mostra “Ligar para o '
                                                 'número do cartão 💳” como ação principal.'}]}],
  'total_atividades': 6},
 {'slug': 'pix-com-seguranca',
  'nome': 'PIX e banco no celular (Idosos)',
  'descricao': 'Ver o saldo, fazer PIX conferindo o nome do destinatário e guardar o comprovante.',
  'icone': '🏦',
  'nivel': 'Iniciante',
  'aulas': 1,
  'conteudos': ['Fazer um PIX conferindo o nome'],
  'aulas_lista': [{'slug': 'pix-com-seguranca-fazer-um-pix-conferindo-o-nome',
                   'trilha_slug': 'pix-com-seguranca',
                   'indice': 1,
                   'titulo': 'Fazer um PIX conferindo o nome',
                   'resumo': 'O passo mais importante: conferir para quem o dinheiro está indo.',
                   'nivel': 'Iniciante',
                   'duracao': '10 minutos',
                   'passos': [{'numero': 1,
                               'instrucao': 'Toque no aplicativo do banco.',
                               'narracao': 'Abra o aplicativo do seu banco e digite sua senha.',
                               'dica': '',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Tela inicial</span></div>\n'
                                            '<div class="tela tela-inicial"><div class="item icone alvo"><span '
                                            'class="emoji">🏦</span><span class="rot">Meu Banco</span><span '
                                            'class="mao">👆</span><span class="balao">Toque aqui</span></div><div '
                                            'class="item icone"><span class="emoji">💬</span><span '
                                            'class="rot">WhatsApp</span></div><div class="item icone"><span '
                                            'class="emoji">🖼️</span><span class="rot">Fotos</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'},
                              {'numero': 2,
                               'instrucao': 'Toque em PIX.',
                               'narracao': 'Dentro do aplicativo, procure o botão escrito PIX.',
                               'dica': '',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Meu Banco</span></div>\n'
                                            '<div class="tela aplicativo"><div class="item icone alvo"><span '
                                            'class="emoji">💸</span><span class="rot">PIX</span><span '
                                            'class="mao">👆</span><span class="balao">Toque aqui</span></div><div '
                                            'class="item icone"><span class="emoji">👁️</span><span '
                                            'class="rot">Saldo</span></div><div class="item icone"><span '
                                            'class="emoji">💳</span><span class="rot">Cartões</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'},
                              {'numero': 3,
                               'instrucao': 'Confira o nome do destinatário antes de confirmar.',
                               'narracao': 'Antes de confirmar, o aplicativo mostra o nome de quem vai receber. Se o '
                                           'nome não for de quem você espera, cancele.',
                               'dica': 'Dica: Nome diferente do combinado = golpe. Cancele sem medo.',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Confirmar PIX</span></div>\n'
                                            '<div class="tela aplicativo"><div class="item campo"><span '
                                            'class="rot">Recebedor: LOJA XPTO LTDA</span></div><div class="item botao '
                                            'alvo"><span class="rot">Conferir e cancelar ❌</span><span '
                                            'class="mao">👆</span><span class="balao">Toque aqui</span></div><div '
                                            'class="item botao"><span class="rot">Confirmar sem '
                                            'ler</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'}],
                   'atividades': [{'numero': 1,
                                   'enunciado': '1. Antes de confirmar um PIX você deve:',
                                   'alternativas': [{'letra': 'A',
                                                     'texto': 'Confirmar rápido para não perder a promoção'},
                                                    {'letra': 'B', 'texto': 'Ler o nome de quem vai receber'}],
                                   'correta': 'B',
                                   'explicacao': 'O nome do recebedor é a melhor forma de perceber um golpe a tempo.'},
                                  {'numero': 2,
                                   'enunciado': '2. Para começar esta aula, em qual opção você toca primeiro?',
                                   'alternativas': [{'letra': 'A', 'texto': 'WhatsApp'},
                                                    {'letra': 'B', 'texto': 'Meu Banco'},
                                                    {'letra': 'C', 'texto': 'Fotos'}],
                                   'correta': 'B',
                                   'explicacao': 'Isso mesmo. O primeiro passo mostrado na aula é toque em “Meu '
                                                 'Banco”.'},
                                  {'numero': 3,
                                   'enunciado': '3. No fim da explicação, qual é a ação principal mostrada para você '
                                                'praticar?',
                                   'alternativas': [{'letra': 'A', 'texto': 'Conferir e cancelar ❌'},
                                                    {'letra': 'B', 'texto': 'Recebedor: LOJA XPTO LTDA'},
                                                    {'letra': 'C', 'texto': 'Confirmar sem ler'}],
                                   'correta': 'A',
                                   'explicacao': 'Correto. Na parte final da aula, a prática mostra “Conferir e '
                                                 'cancelar ❌” como ação principal.'}]}],
  'total_atividades': 3},
 {'slug': 'internet-e-servicos',
  'nome': 'Pesquisar e usar serviços (Idosos)',
  'descricao': 'Pesquisar no Google, reconhecer sites confiáveis, usar o gov.br e comprar sem cair em loja falsa.',
  'icone': '🔎',
  'nivel': 'Iniciante',
  'aulas': 2,
  'conteudos': ['Pesquisar no Google e escolher um site confiável', 'Entrar no gov.br e no Meu INSS'],
  'aulas_lista': [{'slug': 'internet-e-servicos-pesquisar-no-google-e-escolher-um-site-confiavel',
                   'trilha_slug': 'internet-e-servicos',
                   'indice': 1,
                   'titulo': 'Pesquisar no Google e escolher um site confiável',
                   'resumo': 'Nem tudo que aparece primeiro é verdade. Aprenda a escolher.',
                   'nivel': 'Iniciante',
                   'duracao': '9 minutos',
                   'passos': [{'numero': 1,
                               'instrucao': 'Clique no campo de pesquisa e digite o que quer saber.',
                               'narracao': 'Escreva com palavras simples, como você falaria. Por exemplo: horário do '
                                           'posto de saúde.',
                               'dica': '',
                               'tela_html': '<div class="moldura computador">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Google</span></div>\n'
                                            '<div class="tela janela"><div class="item campo alvo"><span '
                                            'class="rot">Campo de pesquisa 🔎</span><span class="mao">👆</span><span '
                                            'class="balao">Clique aqui</span></div><div class="item botao"><span '
                                            'class="rot">X Fechar</span></div></div>\n'
                                            '</div>',
                               'tipo': 'computador'},
                              {'numero': 2,
                               'instrucao': 'Clique no resultado com endereço terminando em .gov.br.',
                               'narracao': 'Sites oficiais do governo terminam em ponto gov ponto br. Eles são os mais '
                                           'confiáveis para serviços públicos.',
                               'dica': 'Dica: Desconfie de endereços estranhos, com números ou palavras trocadas.',
                               'tela_html': '<div class="moldura computador">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Resultados da pesquisa</span></div>\n'
                                            '<div class="tela janela"><div class="item botao alvo"><span '
                                            'class="rot">saude.gov.br — oficial</span><span class="mao">👆</span><span '
                                            'class="balao">Clique aqui</span></div><div class="item botao"><span '
                                            'class="rot">postosaude-premio.xyz</span></div><div class="item '
                                            'botao"><span class="rot">Anúncio patrocinado</span></div></div>\n'
                                            '</div>',
                               'tipo': 'computador'}],
                   'atividades': [{'numero': 1,
                                   'enunciado': '1. Qual endereço é de um site oficial do governo?',
                                   'alternativas': [{'letra': 'A', 'texto': 'meuinss-premio.com'},
                                                    {'letra': 'B', 'texto': 'gov.br'},
                                                    {'letra': 'C', 'texto': 'inss-gratis.xyz'}],
                                   'correta': 'B',
                                   'explicacao': 'Sites oficiais do governo brasileiro terminam em gov.br.'},
                                  {'numero': 2,
                                   'enunciado': '2. Para começar esta aula, em qual opção você clica primeiro?',
                                   'alternativas': [{'letra': 'A', 'texto': 'X Fechar'},
                                                    {'letra': 'B', 'texto': 'Campo de pesquisa 🔎'},
                                                    {'letra': 'C', 'texto': 'WhatsApp'}],
                                   'correta': 'B',
                                   'explicacao': 'Isso mesmo. O primeiro passo mostrado na aula é clique em “Campo de '
                                                 'pesquisa 🔎”.'},
                                  {'numero': 3,
                                   'enunciado': '3. No fim da explicação, qual é a ação principal mostrada para você '
                                                'praticar?',
                                   'alternativas': [{'letra': 'A', 'texto': 'saude.gov.br — oficial'},
                                                    {'letra': 'B', 'texto': 'postosaude-premio.xyz'},
                                                    {'letra': 'C', 'texto': 'Anúncio patrocinado'}],
                                   'correta': 'A',
                                   'explicacao': 'Correto. Na parte final da aula, a prática mostra “saude.gov.br — '
                                                 'oficial” como ação principal.'}]},
                  {'slug': 'internet-e-servicos-entrar-no-gov-br-e-no-meu-inss',
                   'trilha_slug': 'internet-e-servicos',
                   'indice': 2,
                   'titulo': 'Entrar no gov.br e no Meu INSS',
                   'resumo': 'Acessar serviços públicos sem precisar sair de casa.',
                   'nivel': 'Iniciante',
                   'duracao': '10 minutos',
                   'passos': [{'numero': 1,
                               'instrucao': 'Toque no aplicativo gov.br.',
                               'narracao': 'O gov.br é a chave para vários serviços: INSS, Carteira de Trabalho, '
                                           'vacinas e mais.',
                               'dica': '',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Tela inicial</span></div>\n'
                                            '<div class="tela tela-inicial"><div class="item icone alvo"><span '
                                            'class="emoji">🇧🇷</span><span class="rot">gov.br</span><span '
                                            'class="mao">👆</span><span class="balao">Toque aqui</span></div><div '
                                            'class="item icone"><span class="emoji">🏦</span><span class="rot">Meu '
                                            'Banco</span></div><div class="item icone"><span '
                                            'class="emoji">📷</span><span class="rot">Câmera</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'},
                              {'numero': 2,
                               'instrucao': 'Toque no campo CPF e digite seus números.',
                               'narracao': 'Coloque o seu CPF, só os números, sem pontos.',
                               'dica': '',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">gov.br — Entrar</span></div>\n'
                                            '<div class="tela aplicativo"><div class="item campo alvo"><span '
                                            'class="rot">CPF</span><span class="mao">👆</span><span class="balao">Toque '
                                            'aqui</span></div><div class="item campo"><span '
                                            'class="rot">Senha</span></div><div class="item botao"><span '
                                            'class="rot">Entrar</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'},
                              {'numero': 3,
                               'instrucao': 'Toque em Meu INSS.',
                               'narracao': 'Depois de entrar, escolha o serviço que você precisa, como o Meu INSS.',
                               'dica': '',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">gov.br — Serviços</span></div>\n'
                                            '<div class="tela aplicativo"><div class="item icone alvo"><span '
                                            'class="emoji">👴</span><span class="rot">Meu INSS</span><span '
                                            'class="mao">👆</span><span class="balao">Toque aqui</span></div><div '
                                            'class="item icone"><span class="emoji">📘</span><span class="rot">Carteira '
                                            'de Trabalho</span></div><div class="item icone"><span '
                                            'class="emoji">💉</span><span class="rot">Vacinas</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'}],
                   'atividades': [{'numero': 1,
                                   'enunciado': '1. Para entrar no gov.br você usa:',
                                   'alternativas': [{'letra': 'A', 'texto': 'Seu CPF e uma senha'},
                                                    {'letra': 'B', 'texto': 'O número do vizinho'},
                                                    {'letra': 'C', 'texto': 'Só o nome'}],
                                   'correta': 'A',
                                   'explicacao': 'O CPF e a senha são seus. Nunca empreste para ninguém.'},
                                  {'numero': 2,
                                   'enunciado': '2. Para começar esta aula, em qual opção você toca primeiro?',
                                   'alternativas': [{'letra': 'A', 'texto': 'Meu Banco'},
                                                    {'letra': 'B', 'texto': 'gov.br'},
                                                    {'letra': 'C', 'texto': 'Câmera'}],
                                   'correta': 'B',
                                   'explicacao': 'Isso mesmo. O primeiro passo mostrado na aula é toque em “gov.br”.'},
                                  {'numero': 3,
                                   'enunciado': '3. No fim da explicação, qual é a ação principal mostrada para você '
                                                'praticar?',
                                   'alternativas': [{'letra': 'A', 'texto': 'Meu INSS'},
                                                    {'letra': 'B', 'texto': 'Carteira de Trabalho'},
                                                    {'letra': 'C', 'texto': 'Vacinas'}],
                                   'correta': 'A',
                                   'explicacao': 'Correto. Na parte final da aula, a prática mostra “Meu INSS” como '
                                                 'ação principal.'}]}],
  'total_atividades': 6},
 {'slug': 'saude-transporte-e-ia',
  'nome': 'Saúde, transporte e IA (Idosos)',
  'descricao': 'Marcar consulta, usar mapas e aplicativos de corrida, e conversar com a inteligência artificial com '
               'segurança.',
  'icone': '🤖',
  'nivel': 'Iniciante',
  'aulas': 2,
  'conteudos': ['Achar um endereço no mapa', 'Tirar dúvidas com a inteligência artificial'],
  'aulas_lista': [{'slug': 'saude-transporte-e-ia-achar-um-endereco-no-mapa',
                   'trilha_slug': 'saude-transporte-e-ia',
                   'indice': 1,
                   'titulo': 'Achar um endereço no mapa',
                   'resumo': 'Saber o caminho até a farmácia, o posto ou a casa dos filhos.',
                   'nivel': 'Iniciante',
                   'duracao': '8 minutos',
                   'passos': [{'numero': 1,
                               'instrucao': 'Toque no aplicativo Mapas.',
                               'narracao': 'O mapa mostra onde você está e como chegar aonde quiser.',
                               'dica': '',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Tela inicial</span></div>\n'
                                            '<div class="tela tela-inicial"><div class="item icone alvo"><span '
                                            'class="emoji">🗺️</span><span class="rot">Mapas</span><span '
                                            'class="mao">👆</span><span class="balao">Toque aqui</span></div><div '
                                            'class="item icone"><span class="emoji">📞</span><span '
                                            'class="rot">Telefone</span></div><div class="item icone"><span '
                                            'class="emoji">⚙️</span><span class="rot">Ajustes</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'},
                              {'numero': 2,
                               'instrucao': 'Toque na lupa e digite o lugar que você procura.',
                               'narracao': 'Escreva, por exemplo: farmácia perto de mim. Depois toque em pesquisar.',
                               'dica': '',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Mapas</span></div>\n'
                                            '<div class="tela aplicativo"><div class="item campo alvo"><span '
                                            'class="rot">Pesquisar lugar 🔎</span><span class="mao">👆</span><span '
                                            'class="balao">Toque aqui</span></div><div class="item botao"><span '
                                            'class="rot">Minha casa</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'},
                              {'numero': 3,
                               'instrucao': 'Toque em Como chegar.',
                               'narracao': 'O aplicativo mostra o caminho a pé, de carro ou de ônibus.',
                               'dica': '',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Farmácia Central</span></div>\n'
                                            '<div class="tela aplicativo"><div class="item botao alvo"><span '
                                            'class="rot">Como chegar 🧭</span><span class="mao">👆</span><span '
                                            'class="balao">Toque aqui</span></div><div class="item botao"><span '
                                            'class="rot">Ligar</span></div><div class="item botao"><span '
                                            'class="rot">Salvar</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'}],
                   'atividades': [{'numero': 1,
                                   'enunciado': '1. O que o botão Como chegar faz?',
                                   'alternativas': [{'letra': 'A', 'texto': 'Mostra o caminho até o lugar'},
                                                    {'letra': 'B', 'texto': 'Liga a televisão'},
                                                    {'letra': 'C', 'texto': 'Apaga o mapa'}],
                                   'correta': 'A',
                                   'explicacao': 'Ele monta a rota a pé, de carro ou de ônibus.'},
                                  {'numero': 2,
                                   'enunciado': '2. Para começar esta aula, em qual opção você toca primeiro?',
                                   'alternativas': [{'letra': 'A', 'texto': 'Telefone'},
                                                    {'letra': 'B', 'texto': 'Mapas'},
                                                    {'letra': 'C', 'texto': 'Ajustes'}],
                                   'correta': 'B',
                                   'explicacao': 'Isso mesmo. O primeiro passo mostrado na aula é toque em “Mapas”.'},
                                  {'numero': 3,
                                   'enunciado': '3. No fim da explicação, qual é a ação principal mostrada para você '
                                                'praticar?',
                                   'alternativas': [{'letra': 'A', 'texto': 'Como chegar 🧭'},
                                                    {'letra': 'B', 'texto': 'Ligar'},
                                                    {'letra': 'C', 'texto': 'Salvar'}],
                                   'correta': 'A',
                                   'explicacao': 'Correto. Na parte final da aula, a prática mostra “Como chegar 🧭” '
                                                 'como ação principal.'}]},
                  {'slug': 'saude-transporte-e-ia-tirar-duvidas-com-a-inteligencia-artificial',
                   'trilha_slug': 'saude-transporte-e-ia',
                   'indice': 2,
                   'titulo': 'Tirar dúvidas com a inteligência artificial',
                   'resumo': 'Como perguntar, e por que sempre conferir a resposta.',
                   'nivel': 'Iniciante',
                   'duracao': '9 minutos',
                   'passos': [{'numero': 1,
                               'instrucao': 'Toque no campo de escrever e faça sua pergunta.',
                               'narracao': 'A inteligência artificial responde perguntas em linguagem simples. Escreva '
                                           'como se estivesse falando com uma pessoa.',
                               'dica': 'Dica: Quanto mais detalhes você der, melhor a resposta.',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Assistente de IA</span></div>\n'
                                            '<div class="tela aplicativo"><div class="item campo alvo"><span '
                                            'class="rot">Escreva sua pergunta</span><span class="mao">👆</span><span '
                                            'class="balao">Toque aqui</span></div><div class="item botao"><span '
                                            'class="rot">Enviar ➤</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'},
                              {'numero': 2,
                               'instrucao': 'Toque em Conferir em site oficial.',
                               'narracao': 'A IA pode errar. Para assuntos de saúde, dinheiro e documentos, confirme '
                                           'sempre em um site oficial ou com um profissional.',
                               'dica': '',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Resposta da IA</span></div>\n'
                                            '<div class="tela aplicativo"><div class="item botao"><span '
                                            'class="rot">Aceitar sem conferir</span></div><div class="item botao '
                                            'alvo"><span class="rot">Conferir em site oficial ✅</span><span '
                                            'class="mao">👆</span><span class="balao">Toque aqui</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'}],
                   'atividades': [{'numero': 1,
                                   'enunciado': '1. A inteligência artificial pode errar?',
                                   'alternativas': [{'letra': 'A', 'texto': 'Não, ela sabe tudo'},
                                                    {'letra': 'B',
                                                     'texto': 'Sim, por isso conferimos informações importantes'}],
                                   'correta': 'B',
                                   'explicacao': 'Use a IA para aprender e tirar dúvidas, mas confirme saúde, dinheiro '
                                                 'e documentos em fontes oficiais.'},
                                  {'numero': 2,
                                   'enunciado': '2. Você deve contar sua senha para a IA?',
                                   'alternativas': [{'letra': 'A', 'texto': 'Sim, para ela ajudar melhor'},
                                                    {'letra': 'B', 'texto': 'Nunca'}],
                                   'correta': 'B',
                                   'explicacao': 'Senhas, códigos e dados do cartão não se escrevem em lugar nenhum.'},
                                  {'numero': 3,
                                   'enunciado': '3. Para começar esta aula, em qual opção você toca primeiro?',
                                   'alternativas': [{'letra': 'A', 'texto': 'Enviar ➤'},
                                                    {'letra': 'B', 'texto': 'Escreva sua pergunta'},
                                                    {'letra': 'C', 'texto': 'WhatsApp'}],
                                   'correta': 'B',
                                   'explicacao': 'Isso mesmo. O primeiro passo mostrado na aula é toque em “Escreva '
                                                 'sua pergunta”.'}]}],
  'total_atividades': 6},
 {'slug': 'fotos-e-lembrancas',
  'nome': 'Fotos e lembranças (Idosos)',
  'descricao': 'Tirar foto, ver as fotos guardadas e mandar para a família pelo WhatsApp, com o dedinho mostrando onde '
               'tocar.',
  'icone': '📸',
  'nivel': 'Iniciante',
  'aulas': 2,
  'conteudos': ['Tirar uma foto e ver depois', 'Mandar uma foto para a família no WhatsApp'],
  'aulas_lista': [{'slug': 'fotos-e-lembrancas-tirar-uma-foto-e-ver-depois',
                   'trilha_slug': 'fotos-e-lembrancas',
                   'indice': 1,
                   'titulo': 'Tirar uma foto e ver depois',
                   'resumo': 'Abra a câmera, tire a foto e encontre ela na Galeria.',
                   'nivel': 'Iniciante',
                   'duracao': '6 minutos',
                   'passos': [{'numero': 1,
                               'instrucao': 'Toque no ícone da Câmera.',
                               'narracao': 'A câmera tem o desenho de uma máquina fotográfica. É por ela que tiramos '
                                           'fotos.',
                               'dica': 'Dica: Segure o celular com as duas mãos para a foto não sair tremida.',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Tela inicial</span></div>\n'
                                            '<div class="tela tela-inicial"><div class="item icone alvo"><span '
                                            'class="emoji">📷</span><span class="rot">Câmera</span><span '
                                            'class="mao">👆</span><span class="balao">Toque aqui</span></div><div '
                                            'class="item icone"><span class="emoji">💬</span><span '
                                            'class="rot">WhatsApp</span></div><div class="item icone"><span '
                                            'class="emoji">🖼️</span><span class="rot">Galeria</span></div><div '
                                            'class="item icone"><span class="emoji">⚙️</span><span '
                                            'class="rot">Ajustes</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'},
                              {'numero': 2,
                               'instrucao': 'Toque no botão redondo grande para tirar a foto.',
                               'narracao': 'O botão redondo no meio, embaixo da tela, é o que tira a foto.',
                               'dica': '',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Câmera</span></div>\n'
                                            '<div class="tela aplicativo"><div class="item icone"><span '
                                            'class="emoji">🔄</span><span class="rot">Virar câmera</span></div><div '
                                            'class="item icone alvo"><span class="emoji">⚪</span><span '
                                            'class="rot">Tirar foto</span><span class="mao">👆</span><span '
                                            'class="balao">Toque aqui</span></div><div class="item icone"><span '
                                            'class="emoji">⚡</span><span class="rot">Flash</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'},
                              {'numero': 3,
                               'instrucao': 'Toque em Galeria para ver a foto que você tirou.',
                               'narracao': 'Todas as fotos ficam guardadas na Galeria. Nada se perde.',
                               'dica': '',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Tela inicial</span></div>\n'
                                            '<div class="tela tela-inicial"><div class="item icone alvo"><span '
                                            'class="emoji">🖼️</span><span class="rot">Galeria</span><span '
                                            'class="mao">👆</span><span class="balao">Toque aqui</span></div><div '
                                            'class="item icone"><span class="emoji">📷</span><span '
                                            'class="rot">Câmera</span></div><div class="item icone"><span '
                                            'class="emoji">📞</span><span class="rot">Telefone</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'}],
                   'atividades': [{'numero': 1,
                                   'enunciado': '1. Onde ficam guardadas as fotos que você tira?',
                                   'alternativas': [{'letra': 'A', 'texto': 'Na Galeria'},
                                                    {'letra': 'B', 'texto': 'No Telefone'},
                                                    {'letra': 'C', 'texto': 'Elas somem'}],
                                   'correta': 'A',
                                   'explicacao': 'A Galeria guarda todas as fotos e vídeos do celular.'},
                                  {'numero': 2,
                                   'enunciado': '2. Qual botão tira a foto?',
                                   'alternativas': [{'letra': 'A', 'texto': 'O botão redondo grande'},
                                                    {'letra': 'B', 'texto': 'O raio do flash'},
                                                    {'letra': 'C', 'texto': 'As setas de virar a câmera'}],
                                   'correta': 'A',
                                   'explicacao': 'O botão redondo no centro é o disparo da foto.'},
                                  {'numero': 3,
                                   'enunciado': '3. Para começar esta aula, em qual opção você toca primeiro?',
                                   'alternativas': [{'letra': 'A', 'texto': 'WhatsApp'},
                                                    {'letra': 'B', 'texto': 'Câmera'},
                                                    {'letra': 'C', 'texto': 'Galeria'}],
                                   'correta': 'B',
                                   'explicacao': 'Isso mesmo. O primeiro passo mostrado na aula é toque em '
                                                 '“Câmera”.'}]},
                  {'slug': 'fotos-e-lembrancas-mandar-uma-foto-para-a-familia-no-whatsapp',
                   'trilha_slug': 'fotos-e-lembrancas',
                   'indice': 2,
                   'titulo': 'Mandar uma foto para a família no WhatsApp',
                   'resumo': 'Escolha a conversa, toque no clipe e envie a foto.',
                   'nivel': 'Iniciante',
                   'duracao': '7 minutos',
                   'passos': [{'numero': 1,
                               'instrucao': 'Abra o WhatsApp.',
                               'narracao': 'O WhatsApp é o balãozinho verde com um telefone dentro.',
                               'dica': '',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Tela inicial</span></div>\n'
                                            '<div class="tela tela-inicial"><div class="item icone alvo"><span '
                                            'class="emoji">💬</span><span class="rot">WhatsApp</span><span '
                                            'class="mao">👆</span><span class="balao">Toque aqui</span></div><div '
                                            'class="item icone"><span class="emoji">🖼️</span><span '
                                            'class="rot">Galeria</span></div><div class="item icone"><span '
                                            'class="emoji">📷</span><span class="rot">Câmera</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'},
                              {'numero': 2,
                               'instrucao': 'Toque na conversa da sua filha.',
                               'narracao': 'Cada linha é uma conversa. Toque no nome da pessoa para abrir.',
                               'dica': '',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">WhatsApp</span></div>\n'
                                            '<div class="tela aplicativo"><div class="item icone alvo"><span '
                                            'class="emoji">👩</span><span class="rot">Maria (filha)</span><span '
                                            'class="mao">👆</span><span class="balao">Toque aqui</span></div><div '
                                            'class="item icone"><span class="emoji">👨\u200d👩\u200d👧</span><span '
                                            'class="rot">Grupo da família</span></div><div class="item icone"><span '
                                            'class="emoji">🧓</span><span class="rot">Vizinha Ana</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'},
                              {'numero': 3,
                               'instrucao': 'Toque no clipe de papel para anexar a foto.',
                               'narracao': 'O clipe serve para mandar fotos, vídeos e documentos.',
                               'dica': 'Dica: Se mandar a foto errada, é só apagar segurando o dedo em cima dela.',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Conversa com Maria</span></div>\n'
                                            '<div class="tela aplicativo"><div class="item campo"><span '
                                            'class="rot">Escrever mensagem</span></div><div class="item icone '
                                            'alvo"><span class="emoji">📎</span><span class="rot">Clipe '
                                            '(anexar)</span><span class="mao">👆</span><span class="balao">Toque '
                                            'aqui</span></div><div class="item icone"><span '
                                            'class="emoji">🎤</span><span class="rot">Microfone</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'},
                              {'numero': 4,
                               'instrucao': 'Escolha Galeria e depois toque em Enviar.',
                               'narracao': 'Escolha a foto e toque na setinha de enviar. Pronto, ela chegou.',
                               'dica': '',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Anexar</span></div>\n'
                                            '<div class="tela aplicativo"><div class="item icone alvo"><span '
                                            'class="emoji">🖼️</span><span class="rot">Galeria</span><span '
                                            'class="mao">👆</span><span class="balao">Toque aqui</span></div><div '
                                            'class="item icone"><span class="emoji">📄</span><span '
                                            'class="rot">Documento</span></div><div class="item icone"><span '
                                            'class="emoji">📍</span><span class="rot">Localização</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'}],
                   'atividades': [{'numero': 1,
                                   'enunciado': '1. Para mandar uma foto no WhatsApp você toca em qual desenho?',
                                   'alternativas': [{'letra': 'A', 'texto': 'No microfone'},
                                                    {'letra': 'B', 'texto': 'No clipe de papel'},
                                                    {'letra': 'C', 'texto': 'Na engrenagem'}],
                                   'correta': 'B',
                                   'explicacao': 'O clipe abre as opções de foto, vídeo e documento.'},
                                  {'numero': 2,
                                   'enunciado': '2. Mandou a foto errada. O que fazer?',
                                   'alternativas': [{'letra': 'A', 'texto': 'Nada, ficou assim'},
                                                    {'letra': 'B',
                                                     'texto': 'Segurar o dedo na foto e apagar a mensagem'},
                                                    {'letra': 'C', 'texto': 'Desligar o celular'}],
                                   'correta': 'B',
                                   'explicacao': 'Segurando o dedo na mensagem aparece a opção de apagar para todos.'},
                                  {'numero': 3,
                                   'enunciado': '3. Para começar esta aula, em qual opção você toca primeiro?',
                                   'alternativas': [{'letra': 'A', 'texto': 'Galeria'},
                                                    {'letra': 'B', 'texto': 'WhatsApp'},
                                                    {'letra': 'C', 'texto': 'Câmera'}],
                                   'correta': 'B',
                                   'explicacao': 'Isso mesmo. O primeiro passo mostrado na aula é toque em '
                                                 '“WhatsApp”.'}]}],
  'total_atividades': 6},
 {'slug': 'compras-e-remedios',
  'nome': 'Compras e remédios (Idosos)',
  'descricao': 'Comprar pela internet sem cair em golpe e usar aplicativos de farmácia e consultas com tranquilidade.',
  'icone': '🛒',
  'nivel': 'Iniciante',
  'aulas': 2,
  'conteudos': ['Comprar pela internet com segurança', 'Marcar uma consulta pelo aplicativo'],
  'aulas_lista': [{'slug': 'compras-e-remedios-comprar-pela-internet-com-seguranca',
                   'trilha_slug': 'compras-e-remedios',
                   'indice': 1,
                   'titulo': 'Comprar pela internet com segurança',
                   'resumo': 'Conferir o cadeado, o nome da loja e nunca pagar por links de mensagem.',
                   'nivel': 'Iniciante',
                   'duracao': '8 minutos',
                   'passos': [{'numero': 1,
                               'instrucao': 'Toque no site que tem o cadeado e o nome certo da loja.',
                               'narracao': 'Sites seguros mostram um cadeado ao lado do endereço. Desconfie de nomes '
                                           'estranhos ou cheios de letras trocadas.',
                               'dica': 'Dica: Promoção boa demais quase sempre é golpe.',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Resultados da busca</span></div>\n'
                                            '<div class="tela aplicativo"><div class="item botao alvo"><span '
                                            'class="rot">🔒 lojaconfiavel.com.br</span><span class="mao">👆</span><span '
                                            'class="balao">Toque aqui</span></div><div class="item botao"><span '
                                            'class="rot">loja-promo-barato.xyz</span></div><div class="item '
                                            'botao"><span class="rot">ofertaimperdivel-hoje.net</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'},
                              {'numero': 2,
                               'instrucao': 'Confira o valor total antes de pagar.',
                               'narracao': 'Antes de finalizar, veja o preço, o frete e o endereço de entrega.',
                               'dica': '',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Carrinho</span></div>\n'
                                            '<div class="tela aplicativo"><div class="item campo alvo"><span '
                                            'class="rot">Ver resumo do pedido</span><span class="mao">👆</span><span '
                                            'class="balao">Toque aqui</span></div><div class="item botao"><span '
                                            'class="rot">Continuar comprando</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'},
                              {'numero': 3,
                               'instrucao': 'Nunca envie foto do cartão. Toque em Pagar no próprio site.',
                               'narracao': 'O pagamento acontece dentro do site da loja. Ninguém sério pede foto do '
                                           'cartão pelo WhatsApp.',
                               'dica': '',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Pagamento</span></div>\n'
                                            '<div class="tela aplicativo"><div class="item botao alvo"><span '
                                            'class="rot">Pagar no site da loja</span><span class="mao">👆</span><span '
                                            'class="balao">Toque aqui</span></div><div class="item botao"><span '
                                            'class="rot">Mandar foto do cartão</span></div><div class="item '
                                            'botao"><span class="rot">Pagar por link recebido</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'}],
                   'atividades': [{'numero': 1,
                                   'enunciado': '1. O que indica um site mais seguro?',
                                   'alternativas': [{'letra': 'A', 'texto': 'O cadeado e o endereço correto'},
                                                    {'letra': 'B', 'texto': 'A cor do site'},
                                                    {'letra': 'C', 'texto': 'Muitas propagandas'}],
                                   'correta': 'A',
                                   'explicacao': 'Cadeado e endereço escrito corretamente são os primeiros sinais.'},
                                  {'numero': 2,
                                   'enunciado': '2. Alguém pede foto do seu cartão para concluir a compra. O que você '
                                                'faz?',
                                   'alternativas': [{'letra': 'A', 'texto': 'Mando logo'},
                                                    {'letra': 'B', 'texto': 'Não mando nunca'},
                                                    {'letra': 'C', 'texto': 'Mando só a frente'}],
                                   'correta': 'B',
                                   'explicacao': 'Loja nenhuma precisa de foto do seu cartão. Isso é golpe.'},
                                  {'numero': 3,
                                   'enunciado': '3. Para começar esta aula, em qual opção você toca primeiro?',
                                   'alternativas': [{'letra': 'A', 'texto': 'loja-promo-barato.xyz'},
                                                    {'letra': 'B', 'texto': '🔒 lojaconfiavel.com.br'},
                                                    {'letra': 'C', 'texto': 'ofertaimperdivel-hoje.net'}],
                                   'correta': 'B',
                                   'explicacao': 'Isso mesmo. O primeiro passo mostrado na aula é toque em “🔒 '
                                                 'lojaconfiavel.com.br”.'}]},
                  {'slug': 'compras-e-remedios-marcar-uma-consulta-pelo-aplicativo',
                   'trilha_slug': 'compras-e-remedios',
                   'indice': 2,
                   'titulo': 'Marcar uma consulta pelo aplicativo',
                   'resumo': 'Abrir o aplicativo de saúde, escolher a especialidade e confirmar o horário.',
                   'nivel': 'Iniciante',
                   'duracao': '7 minutos',
                   'passos': [{'numero': 1,
                               'instrucao': 'Abra o aplicativo de Saúde.',
                               'narracao': 'O aplicativo da sua clínica ou do posto fica na tela inicial.',
                               'dica': '',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Tela inicial</span></div>\n'
                                            '<div class="tela tela-inicial"><div class="item icone alvo"><span '
                                            'class="emoji">🏥</span><span class="rot">Saúde</span><span '
                                            'class="mao">👆</span><span class="balao">Toque aqui</span></div><div '
                                            'class="item icone"><span class="emoji">🏦</span><span '
                                            'class="rot">Banco</span></div><div class="item icone"><span '
                                            'class="emoji">💬</span><span class="rot">WhatsApp</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'},
                              {'numero': 2,
                               'instrucao': 'Toque em Agendar consulta.',
                               'narracao': 'Procure o botão grande escrito Agendar consulta.',
                               'dica': '',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Saúde</span></div>\n'
                                            '<div class="tela aplicativo"><div class="item icone alvo"><span '
                                            'class="emoji">📅</span><span class="rot">Agendar consulta</span><span '
                                            'class="mao">👆</span><span class="balao">Toque aqui</span></div><div '
                                            'class="item icone"><span class="emoji">🧪</span><span class="rot">Meus '
                                            'exames</span></div><div class="item icone"><span '
                                            'class="emoji">💊</span><span class="rot">Receitas</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'},
                              {'numero': 3,
                               'instrucao': 'Escolha o horário e confirme.',
                               'narracao': 'Depois de confirmar, anote o dia e a hora. O aplicativo também manda um '
                                           'lembrete.',
                               'dica': '',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Horários</span></div>\n'
                                            '<div class="tela aplicativo"><div class="item botao alvo"><span '
                                            'class="rot">Quarta, 9h — Confirmar</span><span class="mao">👆</span><span '
                                            'class="balao">Toque aqui</span></div><div class="item botao"><span '
                                            'class="rot">Quinta, 15h</span></div><div class="item botao"><span '
                                            'class="rot">Sexta, 11h</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'}],
                   'atividades': [{'numero': 1,
                                   'enunciado': '1. Depois de confirmar a consulta, o que é bom fazer?',
                                   'alternativas': [{'letra': 'A', 'texto': 'Anotar o dia e a hora'},
                                                    {'letra': 'B', 'texto': 'Apagar o aplicativo'},
                                                    {'letra': 'C', 'texto': 'Desligar o celular'}],
                                   'correta': 'A',
                                   'explicacao': 'Anotar ajuda a lembrar, mesmo com o aviso do aplicativo.'},
                                  {'numero': 2,
                                   'enunciado': '2. Precisou remarcar. É possível?',
                                   'alternativas': [{'letra': 'A', 'texto': 'Sim, no mesmo aplicativo'},
                                                    {'letra': 'B', 'texto': 'Não, nunca mais'}],
                                   'correta': 'A',
                                   'explicacao': 'Dá para cancelar e marcar outro horário quando quiser.'},
                                  {'numero': 3,
                                   'enunciado': '3. Para começar esta aula, em qual opção você toca primeiro?',
                                   'alternativas': [{'letra': 'A', 'texto': 'Banco'},
                                                    {'letra': 'B', 'texto': 'Saúde'},
                                                    {'letra': 'C', 'texto': 'WhatsApp'}],
                                   'correta': 'B',
                                   'explicacao': 'Isso mesmo. O primeiro passo mostrado na aula é toque em '
                                                 '“Saúde”.'}]}],
  'total_atividades': 6},
 {'slug': 'chamadas-e-contatos',
  'nome': 'Chamadas e contatos (Idosos)',
  'descricao': 'Salvar o número dos filhos, ligar sem errar e não atender número desconhecido de golpista.',
  'icone': '☎️',
  'nivel': 'Iniciante',
  'aulas': 2,
  'conteudos': ['Salvar o número de um filho na agenda', 'Ligação de número desconhecido: o que fazer'],
  'aulas_lista': [{'slug': 'chamadas-e-contatos-salvar-o-numero-de-um-filho-na-agenda',
                   'trilha_slug': 'chamadas-e-contatos',
                   'indice': 1,
                   'titulo': 'Salvar o número de um filho na agenda',
                   'resumo': 'Guarde o número com o nome certo para nunca mais procurar em papel.',
                   'nivel': 'Iniciante',
                   'duracao': '6 minutos',
                   'passos': [{'numero': 1,
                               'instrucao': 'Toque no Telefone (o fone verde).',
                               'narracao': 'O aplicativo Telefone serve para ligar e para guardar contatos.',
                               'dica': '',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Tela inicial</span></div>\n'
                                            '<div class="tela tela-inicial"><div class="item icone alvo"><span '
                                            'class="emoji">📞</span><span class="rot">Telefone</span><span '
                                            'class="mao">👆</span><span class="balao">Toque aqui</span></div><div '
                                            'class="item icone"><span class="emoji">💬</span><span '
                                            'class="rot">WhatsApp</span></div><div class="item icone"><span '
                                            'class="emoji">📷</span><span class="rot">Câmera</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'},
                              {'numero': 2,
                               'instrucao': 'Toque em Contatos e depois no sinal de mais.',
                               'narracao': 'O sinal de mais serve para criar um contato novo.',
                               'dica': 'Dica: Escreva o nome do jeito que você chama a pessoa: Filha Maria.',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Telefone</span></div>\n'
                                            '<div class="tela aplicativo"><div class="item icone alvo"><span '
                                            'class="emoji">➕</span><span class="rot">Contatos +</span><span '
                                            'class="mao">👆</span><span class="balao">Toque aqui</span></div><div '
                                            'class="item icone"><span class="emoji">🕒</span><span '
                                            'class="rot">Recentes</span></div><div class="item icone"><span '
                                            'class="emoji">🔢</span><span class="rot">Teclado</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'},
                              {'numero': 3,
                               'instrucao': 'Escreva o nome e o número e toque em Salvar.',
                               'narracao': 'Depois de salvar, é só tocar no nome para ligar.',
                               'dica': '',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Novo contato</span></div>\n'
                                            '<div class="tela aplicativo"><div class="item botao alvo"><span '
                                            'class="rot">Salvar contato</span><span class="mao">👆</span><span '
                                            'class="balao">Toque aqui</span></div><div class="item campo"><span '
                                            'class="rot">Nome</span></div><div class="item botao"><span '
                                            'class="rot">Cancelar</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'}],
                   'atividades': [{'numero': 1,
                                   'enunciado': '1. Para que serve salvar o contato?',
                                   'alternativas': [{'letra': 'A', 'texto': 'Para ligar tocando no nome'},
                                                    {'letra': 'B', 'texto': 'Para gastar memória'},
                                                    {'letra': 'C', 'texto': 'Não serve'}],
                                   'correta': 'A',
                                   'explicacao': 'Com o contato salvo você liga pelo nome, sem digitar o número.'},
                                  {'numero': 2,
                                   'enunciado': '2. Qual sinal cria um contato novo?',
                                   'alternativas': [{'letra': 'A', 'texto': 'O sinal de mais (+)'},
                                                    {'letra': 'B', 'texto': 'A lupa'},
                                                    {'letra': 'C', 'texto': 'A engrenagem'}],
                                   'correta': 'A',
                                   'explicacao': 'O + sempre significa adicionar algo novo.'},
                                  {'numero': 3,
                                   'enunciado': '3. Para começar esta aula, em qual opção você toca primeiro?',
                                   'alternativas': [{'letra': 'A', 'texto': 'WhatsApp'},
                                                    {'letra': 'B', 'texto': 'Telefone'},
                                                    {'letra': 'C', 'texto': 'Câmera'}],
                                   'correta': 'B',
                                   'explicacao': 'Isso mesmo. O primeiro passo mostrado na aula é toque em '
                                                 '“Telefone”.'}]},
                  {'slug': 'chamadas-e-contatos-ligacao-de-numero-desconhecido-o-que-fazer',
                   'trilha_slug': 'chamadas-e-contatos',
                   'indice': 2,
                   'titulo': 'Ligação de número desconhecido: o que fazer',
                   'resumo': 'Aprenda a desligar, bloquear e conferir com o banco pelo número oficial.',
                   'nivel': 'Iniciante',
                   'duracao': '6 minutos',
                   'passos': [{'numero': 1,
                               'instrucao': 'A ligação é de número desconhecido. Toque em Recusar.',
                               'narracao': 'Se você não conhece o número e a pessoa fala de dinheiro, pode desligar '
                                           'sem medo.',
                               'dica': 'Dica: Golpista tem pressa e mete medo. Pessoa honesta espera você conferir.',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Chamada recebida</span></div>\n'
                                            '<div class="tela aplicativo"><div class="item icone alvo"><span '
                                            'class="emoji">🔴</span><span class="rot">Recusar</span><span '
                                            'class="mao">👆</span><span class="balao">Toque aqui</span></div><div '
                                            'class="item icone"><span class="emoji">🟢</span><span '
                                            'class="rot">Atender</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'},
                              {'numero': 2,
                               'instrucao': 'Toque em Bloquear este número.',
                               'narracao': 'Bloqueando, esse número não consegue mais te ligar.',
                               'dica': '',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Recentes</span></div>\n'
                                            '<div class="tela aplicativo"><div class="item botao alvo"><span '
                                            'class="rot">Bloquear este número</span><span class="mao">👆</span><span '
                                            'class="balao">Toque aqui</span></div><div class="item botao"><span '
                                            'class="rot">Ligar de volta</span></div><div class="item botao"><span '
                                            'class="rot">Salvar contato</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'},
                              {'numero': 3,
                               'instrucao': 'Se falaram do banco, ligue para o número do cartão.',
                               'narracao': 'Confira sempre pelo telefone que está atrás do seu cartão, nunca pelo '
                                           'número que a pessoa passou.',
                               'dica': '',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Telefone</span></div>\n'
                                            '<div class="tela aplicativo"><div class="item botao alvo"><span '
                                            'class="rot">Ligar para o número do cartão</span><span '
                                            'class="mao">👆</span><span class="balao">Toque aqui</span></div><div '
                                            'class="item botao"><span class="rot">Ligar para o número que '
                                            'mandaram</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'}],
                   'atividades': [{'numero': 1,
                                   'enunciado': '1. Ligaram dizendo que sua conta foi invadida e pediram sua senha. O '
                                                'que fazer?',
                                   'alternativas': [{'letra': 'A', 'texto': 'Falar a senha'},
                                                    {'letra': 'B',
                                                     'texto': 'Desligar e ligar para o banco pelo número do cartão'}],
                                   'correta': 'B',
                                   'explicacao': 'Banco nenhum pede senha por telefone. Desligue e confirme pelo '
                                                 'número oficial.'},
                                  {'numero': 2,
                                   'enunciado': '2. Número desconhecido insistindo em ligar. O que dá para fazer?',
                                   'alternativas': [{'letra': 'A', 'texto': 'Bloquear o número'},
                                                    {'letra': 'B', 'texto': 'Trocar de celular'},
                                                    {'letra': 'C', 'texto': 'Atender sempre'}],
                                   'correta': 'A',
                                   'explicacao': 'Bloquear impede novas ligações desse número.'},
                                  {'numero': 3,
                                   'enunciado': '3. Para começar esta aula, em qual opção você toca primeiro?',
                                   'alternativas': [{'letra': 'A', 'texto': 'Atender'},
                                                    {'letra': 'B', 'texto': 'Recusar'},
                                                    {'letra': 'C', 'texto': 'WhatsApp'}],
                                   'correta': 'B',
                                   'explicacao': 'Isso mesmo. O primeiro passo mostrado na aula é toque em '
                                                 '“Recusar”.'}]}],
  'total_atividades': 6},
 {'slug': 'informatica-basica',
  'nome': 'Informática Básica',
  'descricao': 'O primeiro passo: entender o computador, o mouse, as janelas e como salvar seus arquivos.',
  'icone': '🖥️',
  'nivel': 'Iniciante',
  'aulas': 2,
  'conteudos': ['Conhecendo a área de trabalho', 'Escrever e salvar um arquivo'],
  'aulas_lista': [{'slug': 'informatica-basica-conhecendo-a-area-de-trabalho',
                   'trilha_slug': 'informatica-basica',
                   'indice': 1,
                   'titulo': 'Conhecendo a área de trabalho',
                   'resumo': 'Vamos ver juntos o que aparece na tela quando o computador liga e para que serve cada '
                             'ícone.',
                   'nivel': 'Iniciante',
                   'duracao': '8 minutos',
                   'passos': [{'numero': 1,
                               'instrucao': 'Clique no ícone da Lixeira para conhecer o primeiro atalho.',
                               'narracao': 'Esta é a área de trabalho. Os desenhos que você vê são chamados de ícones. '
                                           'Vamos começar clicando na Lixeira, que guarda o que você apaga.',
                               'dica': 'Dica: Um clique só. Se nada acontecer, tente clicar duas vezes bem rápido.',
                               'tela_html': '<div class="moldura computador">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Área de trabalho</span></div>\n'
                                            '<div class="tela area-de-trabalho"><div class="item icone alvo"><span '
                                            'class="emoji">🗑️</span><span class="rot">Lixeira</span><span '
                                            'class="mao">👆</span><span class="balao">Clique aqui</span></div><div '
                                            'class="item icone"><span class="emoji">📁</span><span class="rot">Meus '
                                            'Documentos</span></div><div class="item icone"><span '
                                            'class="emoji">🌐</span><span class="rot">Navegador</span></div><div '
                                            'class="item icone"><span class="emoji">🖼️</span><span '
                                            'class="rot">Fotos</span></div></div>\n'
                                            '</div>',
                               'tipo': 'computador'},
                              {'numero': 2,
                               'instrucao': 'Agora clique em Meus Documentos para abrir a pasta.',
                               'narracao': 'Muito bem! Pastas guardam seus arquivos, como uma gaveta guarda papéis. '
                                           'Clique em Meus Documentos.',
                               'dica': '',
                               'tela_html': '<div class="moldura computador">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Área de trabalho</span></div>\n'
                                            '<div class="tela area-de-trabalho"><div class="item icone"><span '
                                            'class="emoji">🗑️</span><span class="rot">Lixeira</span></div><div '
                                            'class="item icone alvo"><span class="emoji">📁</span><span '
                                            'class="rot">Meus Documentos</span><span class="mao">👆</span><span '
                                            'class="balao">Clique aqui</span></div><div class="item icone"><span '
                                            'class="emoji">🌐</span><span class="rot">Navegador</span></div><div '
                                            'class="item icone"><span class="emoji">🖼️</span><span '
                                            'class="rot">Fotos</span></div></div>\n'
                                            '</div>',
                               'tipo': 'computador'},
                              {'numero': 3,
                               'instrucao': 'Clique no X, no canto da janela, para fechar a pasta.',
                               'narracao': 'A pasta abriu em uma janela. Para fechar a janela, use o botão X no canto '
                                           'de cima, do lado direito.',
                               'dica': 'Dica: O X sempre fecha. O traço (–) só esconde a janela.',
                               'tela_html': '<div class="moldura computador">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Meus Documentos</span></div>\n'
                                            '<div class="tela janela"><div class="item botao"><span class="rot">– '
                                            'Minimizar</span></div><div class="item botao alvo"><span class="rot">X '
                                            'Fechar</span><span class="mao">👆</span><span class="balao">Clique '
                                            'aqui</span></div><div class="item icone"><span '
                                            'class="emoji">📄</span><span class="rot">Receitas.txt</span></div><div '
                                            'class="item icone"><span class="emoji">🖼️</span><span class="rot">Foto da '
                                            'família.jpg</span></div></div>\n'
                                            '</div>',
                               'tipo': 'computador'}],
                   'atividades': [{'numero': 1,
                                   'enunciado': '1. Como se chamam os desenhos que aparecem na área de trabalho?',
                                   'alternativas': [{'letra': 'A', 'texto': 'Ícones'},
                                                    {'letra': 'B', 'texto': 'Teclas'},
                                                    {'letra': 'C', 'texto': 'Janelas'}],
                                   'correta': 'A',
                                   'explicacao': 'Isso mesmo! São os ícones — atalhos que abrem programas e pastas.'},
                                  {'numero': 2,
                                   'enunciado': '2. Qual botão fecha uma janela?',
                                   'alternativas': [{'letra': 'A', 'texto': 'O traço (–)'},
                                                    {'letra': 'B', 'texto': 'O X'},
                                                    {'letra': 'C', 'texto': 'O quadradinho'}],
                                   'correta': 'B',
                                   'explicacao': 'O X fecha. O traço apenas esconde a janela na barra de baixo.'},
                                  {'numero': 3,
                                   'enunciado': '3. Para começar esta aula, em qual opção você clica primeiro?',
                                   'alternativas': [{'letra': 'A', 'texto': 'Meus Documentos'},
                                                    {'letra': 'B', 'texto': 'Lixeira'},
                                                    {'letra': 'C', 'texto': 'Navegador'}],
                                   'correta': 'B',
                                   'explicacao': 'Isso mesmo. O primeiro passo mostrado na aula é clique em '
                                                 '“Lixeira”.'}]},
                  {'slug': 'informatica-basica-escrever-e-salvar-um-arquivo',
                   'trilha_slug': 'informatica-basica',
                   'indice': 2,
                   'titulo': 'Escrever e salvar um arquivo',
                   'resumo': 'Escreva um texto simples e aprenda a guardar para não perder nada.',
                   'nivel': 'Iniciante',
                   'duracao': '10 minutos',
                   'passos': [{'numero': 1,
                               'instrucao': 'Clique no ícone Bloco de Notas para abrir o programa de escrever.',
                               'narracao': 'Vamos escrever um texto. Clique no Bloco de Notas, o programa mais simples '
                                           'para escrever.',
                               'dica': '',
                               'tela_html': '<div class="moldura computador">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Área de trabalho</span></div>\n'
                                            '<div class="tela area-de-trabalho"><div class="item icone alvo"><span '
                                            'class="emoji">📝</span><span class="rot">Bloco de Notas</span><span '
                                            'class="mao">👆</span><span class="balao">Clique aqui</span></div><div '
                                            'class="item icone"><span class="emoji">🌐</span><span '
                                            'class="rot">Navegador</span></div><div class="item icone"><span '
                                            'class="emoji">🗑️</span><span class="rot">Lixeira</span></div></div>\n'
                                            '</div>',
                               'tipo': 'computador'},
                              {'numero': 2,
                               'instrucao': 'Clique dentro da folha branca para começar a escrever.',
                               'narracao': 'Antes de digitar, clique na área branca. Assim o computador sabe onde '
                                           'colocar as letras.',
                               'dica': '',
                               'tela_html': '<div class="moldura computador">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Bloco de Notas</span></div>\n'
                                            '<div class="tela janela"><div class="item aba"><span '
                                            'class="rot">Arquivo</span></div><div class="item campo alvo"><span '
                                            'class="rot">Folha para escrever</span><span class="mao">👆</span><span '
                                            'class="balao">Clique aqui</span></div><div class="item botao"><span '
                                            'class="rot">X Fechar</span></div></div>\n'
                                            '</div>',
                               'tipo': 'computador'},
                              {'numero': 3,
                               'instrucao': 'Clique no menu Arquivo e depois em Salvar.',
                               'narracao': 'Para não perder o que escreveu, clique em Arquivo e escolha Salvar. Dê um '
                                           'nome fácil de lembrar.',
                               'dica': 'Dica: Salve sempre antes de fechar. Se fechar sem salvar, o texto se perde.',
                               'tela_html': '<div class="moldura computador">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Bloco de Notas</span></div>\n'
                                            '<div class="tela janela"><div class="item aba alvo"><span '
                                            'class="rot">Arquivo → Salvar</span><span class="mao">👆</span><span '
                                            'class="balao">Clique aqui</span></div><div class="item campo"><span '
                                            'class="rot">Meu primeiro texto</span></div><div class="item botao"><span '
                                            'class="rot">X Fechar</span></div></div>\n'
                                            '</div>',
                               'tipo': 'computador'}],
                   'atividades': [{'numero': 1,
                                   'enunciado': '1. O que acontece se você fechar sem salvar?',
                                   'alternativas': [{'letra': 'A', 'texto': 'O texto é guardado automaticamente'},
                                                    {'letra': 'B', 'texto': 'O texto pode se perder'},
                                                    {'letra': 'C', 'texto': 'O computador desliga'}],
                                   'correta': 'B',
                                   'explicacao': 'Por isso salvamos sempre antes de fechar a janela.'},
                                  {'numero': 2,
                                   'enunciado': '2. Para começar esta aula, em qual opção você clica primeiro?',
                                   'alternativas': [{'letra': 'A', 'texto': 'Navegador'},
                                                    {'letra': 'B', 'texto': 'Bloco de Notas'},
                                                    {'letra': 'C', 'texto': 'Lixeira'}],
                                   'correta': 'B',
                                   'explicacao': 'Isso mesmo. O primeiro passo mostrado na aula é clique em “Bloco de '
                                                 'Notas”.'},
                                  {'numero': 3,
                                   'enunciado': '3. No fim da explicação, qual é a ação principal mostrada para você '
                                                'praticar?',
                                   'alternativas': [{'letra': 'A', 'texto': 'Arquivo → Salvar'},
                                                    {'letra': 'B', 'texto': 'Meu primeiro texto'},
                                                    {'letra': 'C', 'texto': 'X Fechar'}],
                                   'correta': 'A',
                                   'explicacao': 'Correto. Na parte final da aula, a prática mostra “Arquivo → Salvar” '
                                                 'como ação principal.'}]}],
  'total_atividades': 6},
 {'slug': 'celular-no-dia-a-dia',
  'nome': 'Celular no dia a dia',
  'descricao': 'WhatsApp, ligações, câmera e aplicativos: usar o celular sem medo de errar.',
  'icone': '📱',
  'nivel': 'Iniciante',
  'aulas': 1,
  'conteudos': ['Enviar uma mensagem no WhatsApp'],
  'aulas_lista': [{'slug': 'celular-no-dia-a-dia-enviar-uma-mensagem-no-whatsapp',
                   'trilha_slug': 'celular-no-dia-a-dia',
                   'indice': 1,
                   'titulo': 'Enviar uma mensagem no WhatsApp',
                   'resumo': 'Passo a passo com a tela do celular: abrir o aplicativo, escolher a pessoa e enviar.',
                   'nivel': 'Iniciante',
                   'duracao': '9 minutos',
                   'passos': [{'numero': 1,
                               'instrucao': 'Toque no aplicativo WhatsApp.',
                               'narracao': 'Na tela inicial do celular, toque uma vez no ícone verde do WhatsApp.',
                               'dica': 'Dica: No celular, um toque leve já é suficiente.',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Tela inicial</span></div>\n'
                                            '<div class="tela tela-inicial"><div class="item icone alvo"><span '
                                            'class="emoji">💬</span><span class="rot">WhatsApp</span><span '
                                            'class="mao">👆</span><span class="balao">Toque aqui</span></div><div '
                                            'class="item icone"><span class="emoji">📷</span><span '
                                            'class="rot">Câmera</span></div><div class="item icone"><span '
                                            'class="emoji">📞</span><span class="rot">Telefone</span></div><div '
                                            'class="item icone"><span class="emoji">⚙️</span><span '
                                            'class="rot">Ajustes</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'},
                              {'numero': 2,
                               'instrucao': 'Toque no nome da pessoa com quem você quer falar.',
                               'narracao': 'Aqui aparecem suas conversas. Toque no nome de quem você quer conversar.',
                               'dica': '',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">WhatsApp — Conversas</span></div>\n'
                                            '<div class="tela aplicativo"><div class="item icone alvo"><span '
                                            'class="emoji">👩</span><span class="rot">Maria (filha)</span><span '
                                            'class="mao">👆</span><span class="balao">Toque aqui</span></div><div '
                                            'class="item icone"><span class="emoji">👨\u200d👩\u200d👧</span><span '
                                            'class="rot">Grupo da família</span></div><div class="item icone"><span '
                                            'class="emoji">🧑\u200d⚕️</span><span class="rot">Dr. '
                                            'Antônio</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'},
                              {'numero': 3,
                               'instrucao': 'Toque no campo de escrever e depois no botão de enviar.',
                               'narracao': 'Escreva sua mensagem no campo de baixo e toque na setinha para enviar. '
                                           'Pronto!',
                               'dica': '',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Conversa com Maria</span></div>\n'
                                            '<div class="tela aplicativo"><div class="item campo"><span '
                                            'class="rot">Digite uma mensagem</span></div><div class="item botao '
                                            'alvo"><span class="rot">Enviar ➤</span><span class="mao">👆</span><span '
                                            'class="balao">Toque aqui</span></div><div class="item botao"><span '
                                            'class="rot">Microfone 🎤</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'}],
                   'atividades': [{'numero': 1,
                                   'enunciado': '1. Para enviar a mensagem escrita, você toca em:',
                                   'alternativas': [{'letra': 'A', 'texto': 'No microfone'},
                                                    {'letra': 'B', 'texto': 'Na setinha de enviar'},
                                                    {'letra': 'C', 'texto': 'Na câmera'}],
                                   'correta': 'B',
                                   'explicacao': 'A setinha envia o texto. O microfone grava um áudio.'},
                                  {'numero': 2,
                                   'enunciado': '2. Para começar esta aula, em qual opção você toca primeiro?',
                                   'alternativas': [{'letra': 'A', 'texto': 'Câmera'},
                                                    {'letra': 'B', 'texto': 'WhatsApp'},
                                                    {'letra': 'C', 'texto': 'Telefone'}],
                                   'correta': 'B',
                                   'explicacao': 'Isso mesmo. O primeiro passo mostrado na aula é toque em '
                                                 '“WhatsApp”.'},
                                  {'numero': 3,
                                   'enunciado': '3. No fim da explicação, qual é a ação principal mostrada para você '
                                                'praticar?',
                                   'alternativas': [{'letra': 'A', 'texto': 'Enviar ➤'},
                                                    {'letra': 'B', 'texto': 'Digite uma mensagem'},
                                                    {'letra': 'C', 'texto': 'Microfone 🎤'}],
                                   'correta': 'A',
                                   'explicacao': 'Correto. Na parte final da aula, a prática mostra “Enviar ➤” como '
                                                 'ação principal.'}]}],
  'total_atividades': 3},
 {'slug': 'internet-e-seguranca',
  'nome': 'Internet e Segurança',
  'descricao': 'Saber onde você está entrando, reconhecer golpes e proteger seu dinheiro e seus dados.',
  'icone': '🛡️',
  'nivel': 'Iniciante',
  'aulas': 1,
  'conteudos': ['Reconhecer um golpe e não cair'],
  'aulas_lista': [{'slug': 'internet-e-seguranca-reconhecer-um-golpe-e-nao-cair',
                   'trilha_slug': 'internet-e-seguranca',
                   'indice': 1,
                   'titulo': 'Reconhecer um golpe e não cair',
                   'resumo': 'Mensagens de prêmio, links estranhos e pedidos de dinheiro: como identificar e o que '
                             'fazer.',
                   'nivel': 'Iniciante',
                   'duracao': '12 minutos',
                   'passos': [{'numero': 1,
                               'instrucao': 'Toque em Apagar mensagem — nunca no link do prêmio.',
                               'narracao': 'Chegou uma mensagem dizendo que você ganhou um prêmio. Isso é golpe. Nunca '
                                           'toque no link. Toque em apagar.',
                               'dica': 'Dica: Empresa séria não pede seus dados por link em mensagem.',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Mensagem suspeita</span></div>\n'
                                            '<div class="tela aplicativo"><div class="item botao"><span '
                                            'class="rot">Clique aqui e receba R$ 5.000</span></div><div class="item '
                                            'botao alvo"><span class="rot">Apagar mensagem 🗑️</span><span '
                                            'class="mao">👆</span><span class="balao">Toque aqui</span></div><div '
                                            'class="item botao"><span class="rot">Responder</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'},
                              {'numero': 2,
                               'instrucao': 'Clique no cadeado para conferir se o site é seguro.',
                               'narracao': 'No computador, olhe sempre o endereço do site. O cadeado mostra que a '
                                           'conexão é protegida. Clique nele para conferir.',
                               'dica': '',
                               'tela_html': '<div class="moldura computador">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Navegador</span></div>\n'
                                            '<div class="tela janela"><div class="item campo alvo"><span class="rot">🔒 '
                                            'https://meubanco.com.br</span><span class="mao">👆</span><span '
                                            'class="balao">Clique aqui</span></div><div class="item campo"><span '
                                            'class="rot">http://meu-banco-premio.xyz</span></div><div class="item '
                                            'botao"><span class="rot">X Fechar</span></div></div>\n'
                                            '</div>',
                               'tipo': 'computador'},
                              {'numero': 3,
                               'instrucao': 'Toque em Ligar para a pessoa e confirmar.',
                               'narracao': 'Se um parente pedir dinheiro por mensagem, ligue para o número que você já '
                                           'conhece e confirme antes de pagar.',
                               'dica': '',
                               'tela_html': '<div class="moldura celular">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Pedido de dinheiro</span></div>\n'
                                            '<div class="tela aplicativo"><div class="item botao"><span '
                                            'class="rot">Fazer PIX agora</span></div><div class="item botao '
                                            'alvo"><span class="rot">Ligar para a pessoa 📞</span><span '
                                            'class="mao">👆</span><span class="balao">Toque aqui</span></div></div>\n'
                                            '</div>',
                               'tipo': 'celular'}],
                   'atividades': [{'numero': 1,
                                   'enunciado': '1. Você recebe um link dizendo que ganhou um prêmio. O que fazer?',
                                   'alternativas': [{'letra': 'A', 'texto': 'Clicar para conferir'},
                                                    {'letra': 'B', 'texto': 'Apagar e não clicar'},
                                                    {'letra': 'C', 'texto': 'Encaminhar para a família'}],
                                   'correta': 'B',
                                   'explicacao': 'Apagar é o mais seguro. Links de prêmio quase sempre são golpe.'},
                                  {'numero': 2,
                                   'enunciado': '2. O cadeado no endereço do site significa que:',
                                   'alternativas': [{'letra': 'A', 'texto': 'A conexão com o site é protegida'},
                                                    {'letra': 'B', 'texto': 'O site é do governo'},
                                                    {'letra': 'C', 'texto': 'O site é gratuito'}],
                                   'correta': 'A',
                                   'explicacao': 'O cadeado indica conexão protegida. Mesmo assim, confira se o '
                                                 'endereço está escrito corretamente.'},
                                  {'numero': 3,
                                   'enunciado': '3. Para começar esta aula, em qual opção você toca primeiro?',
                                   'alternativas': [{'letra': 'A', 'texto': 'Clique aqui e receba R$ 5.000'},
                                                    {'letra': 'B', 'texto': 'Apagar mensagem 🗑️'},
                                                    {'letra': 'C', 'texto': 'Responder'}],
                                   'correta': 'B',
                                   'explicacao': 'Isso mesmo. O primeiro passo mostrado na aula é toque em “Apagar '
                                                 'mensagem 🗑️”.'}]}],
  'total_atividades': 3},
 {'slug': 'comunicacao-online',
  'nome': 'Comunicação Online',
  'descricao': 'E-mail e mensagens: se comunicar com a família, empresas e serviços pela internet.',
  'icone': '✉️',
  'nivel': 'Iniciante',
  'aulas': 2,
  'conteudos': ['Criar um e-mail', 'Mandar um e-mail'],
  'aulas_lista': [{'slug': 'comunicacao-online-criar-um-e-mail',
                   'trilha_slug': 'comunicacao-online',
                   'indice': 1,
                   'titulo': 'Criar um e-mail',
                   'resumo': 'Passo a passo para abrir uma conta de e-mail e começar a se comunicar pela internet.',
                   'nivel': 'Iniciante',
                   'duracao': '11 minutos',
                   'passos': [{'numero': 1,
                               'instrucao': 'Clique no ícone do Navegador.',
                               'narracao': 'Para criar um e-mail, primeiro abrimos o navegador, que é a janela para a '
                                           'internet.',
                               'dica': '',
                               'tela_html': '<div class="moldura computador">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Área de trabalho</span></div>\n'
                                            '<div class="tela area-de-trabalho"><div class="item icone alvo"><span '
                                            'class="emoji">🌐</span><span class="rot">Navegador</span><span '
                                            'class="mao">👆</span><span class="balao">Clique aqui</span></div><div '
                                            'class="item icone"><span class="emoji">📝</span><span class="rot">Bloco de '
                                            'Notas</span></div><div class="item icone"><span '
                                            'class="emoji">🗑️</span><span class="rot">Lixeira</span></div></div>\n'
                                            '</div>',
                               'tipo': 'computador'},
                              {'numero': 2,
                               'instrucao': 'Clique no campo de endereço e digite o site do e-mail.',
                               'narracao': 'Agora vamos acessar o site de e-mail. Clique na barra de endereço no topo '
                                           'e digite o site.',
                               'dica': '',
                               'tela_html': '<div class="moldura computador">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Navegador</span></div>\n'
                                            '<div class="tela janela"><div class="item campo alvo"><span '
                                            'class="rot">Endereço do site</span><span class="mao">👆</span><span '
                                            'class="balao">Clique aqui</span></div><div class="item botao"><span '
                                            'class="rot">Criar conta</span></div><div class="item botao"><span '
                                            'class="rot">X Fechar</span></div></div>\n'
                                            '</div>',
                               'tipo': 'computador'},
                              {'numero': 3,
                               'instrucao': 'Clique no botão Criar conta.',
                               'narracao': 'Na página do e-mail, clique em Criar conta. Depois siga as instruções na '
                                           'tela.',
                               'dica': 'Dica: Escolha um e-mail fácil e uma senha que só você sabe.',
                               'tela_html': '<div class="moldura computador">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Site de e-mail</span></div>\n'
                                            '<div class="tela janela"><div class="item campo"><span '
                                            'class="rot">Endereço do site</span></div><div class="item botao '
                                            'alvo"><span class="rot">Criar conta</span><span class="mao">👆</span><span '
                                            'class="balao">Clique aqui</span></div><div class="item botao"><span '
                                            'class="rot">Entrar</span></div></div>\n'
                                            '</div>',
                               'tipo': 'computador'}],
                   'atividades': [{'numero': 1,
                                   'enunciado': '1. Para criar um e-mail, qual programa você abre primeiro?',
                                   'alternativas': [{'letra': 'A', 'texto': 'O navegador'},
                                                    {'letra': 'B', 'texto': 'A lixeira'},
                                                    {'letra': 'C', 'texto': 'O bloco de notas'}],
                                   'correta': 'A',
                                   'explicacao': 'O navegador é a janela para a internet. Por ele acessamos o e-mail.'},
                                  {'numero': 2,
                                   'enunciado': '2. O que é importante na hora de criar a senha?',
                                   'alternativas': [{'letra': 'A', 'texto': 'Usar uma senha fácil de adivinhar'},
                                                    {'letra': 'B', 'texto': 'Escolher uma senha que só você sabe'},
                                                    {'letra': 'C', 'texto': 'Escrever a senha no papel na tela'}],
                                   'correta': 'B',
                                   'explicacao': 'A senha deve ser sua, segura e difícil de outras pessoas '
                                                 'descobrirem.'},
                                  {'numero': 3,
                                   'enunciado': '3. Para começar esta aula, em qual opção você clica primeiro?',
                                   'alternativas': [{'letra': 'A', 'texto': 'Bloco de Notas'},
                                                    {'letra': 'B', 'texto': 'Navegador'},
                                                    {'letra': 'C', 'texto': 'Lixeira'}],
                                   'correta': 'B',
                                   'explicacao': 'Isso mesmo. O primeiro passo mostrado na aula é clique em '
                                                 '“Navegador”.'}]},
                  {'slug': 'comunicacao-online-mandar-um-e-mail',
                   'trilha_slug': 'comunicacao-online',
                   'indice': 2,
                   'titulo': 'Mandar um e-mail',
                   'resumo': 'Aprenda a escrever, colocar o destinatário e enviar uma mensagem por e-mail.',
                   'nivel': 'Iniciante',
                   'duracao': '9 minutos',
                   'passos': [{'numero': 1,
                               'instrucao': 'Clique no botão Escrever.',
                               'narracao': 'Dentro do e-mail, para enviar uma mensagem nova, clique em Escrever.',
                               'dica': '',
                               'tela_html': '<div class="moldura computador">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Caixa de e-mail</span></div>\n'
                                            '<div class="tela janela"><div class="item botao alvo"><span '
                                            'class="rot">Escrever ✉️</span><span class="mao">👆</span><span '
                                            'class="balao">Clique aqui</span></div><div class="item aba"><span '
                                            'class="rot">Entrada</span></div><div class="item botao"><span '
                                            'class="rot">Sair</span></div></div>\n'
                                            '</div>',
                               'tipo': 'computador'},
                              {'numero': 2,
                               'instrucao': 'Clique no campo Para e digite o e-mail da pessoa.',
                               'narracao': 'No campo Para, coloque o endereço de e-mail de quem vai receber a '
                                           'mensagem.',
                               'dica': '',
                               'tela_html': '<div class="moldura computador">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Escrever e-mail</span></div>\n'
                                            '<div class="tela janela"><div class="item campo alvo"><span '
                                            'class="rot">Para</span><span class="mao">👆</span><span '
                                            'class="balao">Clique aqui</span></div><div class="item campo"><span '
                                            'class="rot">Assunto</span></div><div class="item campo"><span '
                                            'class="rot">Mensagem</span></div></div>\n'
                                            '</div>',
                               'tipo': 'computador'},
                              {'numero': 3,
                               'instrucao': 'Escreva a mensagem e clique em Enviar.',
                               'narracao': 'Escreva sua mensagem, coloque um assunto e, quando terminar, clique em '
                                           'Enviar.',
                               'dica': '',
                               'tela_html': '<div class="moldura computador">\n'
                                            '<div class="barra"><span class="pt"></span><span class="pt"></span><span '
                                            'class="pt"></span><span class="tit">Escrever e-mail</span></div>\n'
                                            '<div class="tela janela"><div class="item campo"><span '
                                            'class="rot">Para</span></div><div class="item campo"><span '
                                            'class="rot">Assunto</span></div><div class="item campo"><span '
                                            'class="rot">Mensagem</span></div><div class="item botao alvo"><span '
                                            'class="rot">Enviar</span><span class="mao">👆</span><span '
                                            'class="balao">Clique aqui</span></div></div>\n'
                                            '</div>',
                               'tipo': 'computador'}],
                   'atividades': [{'numero': 1,
                                   'enunciado': '1. Onde você coloca o endereço de quem vai receber o e-mail?',
                                   'alternativas': [{'letra': 'A', 'texto': 'No campo Assunto'},
                                                    {'letra': 'B', 'texto': 'No campo Para'},
                                                    {'letra': 'C', 'texto': 'Na Lixeira'}],
                                   'correta': 'B',
                                   'explicacao': 'O campo Para é o destinatário, ou seja, quem vai receber a '
                                                 'mensagem.'},
                                  {'numero': 2,
                                   'enunciado': '2. Para enviar o e-mail, você clica em:',
                                   'alternativas': [{'letra': 'A', 'texto': 'Sair'},
                                                    {'letra': 'B', 'texto': 'Escrever'},
                                                    {'letra': 'C', 'texto': 'Enviar'}],
                                   'correta': 'C',
                                   'explicacao': 'Depois de pronto, clique em Enviar para a mensagem chegar até a '
                                                 'pessoa.'},
                                  {'numero': 3,
                                   'enunciado': '3. Para começar esta aula, em qual opção você clica primeiro?',
                                   'alternativas': [{'letra': 'A', 'texto': 'Entrada'},
                                                    {'letra': 'B', 'texto': 'Escrever ✉️'},
                                                    {'letra': 'C', 'texto': 'Sair'}],
                                   'correta': 'B',
                                   'explicacao': 'Isso mesmo. O primeiro passo mostrado na aula é clique em “Escrever '
                                                 '✉️”.'}]}],
  'total_atividades': 6}]


# =========================================================
# NOVO CICLO EDUCA+ — áreas de aprendizagem e prática 60+
# =========================================================
# As novas atividades usam somente dados fictícios. O objetivo é permitir
# que o aluno pratique sem expor CPF, senha, código, conta bancária ou dinheiro real.

NOVAS_TRILHAS = [
    {
        "slug": "digitacao-sem-medo",
        "nome": "Digitação sem medo",
        "descricao": "Aprenda a escrever, apagar, corrigir, usar espaço, números e códigos no celular.",
        "icone": "⌨️",
        "nivel": "Iniciante",
        "aulas": 3,
        "conteudos": ["Conhecer o teclado", "Corrigir sem apagar tudo", "Números e códigos"],
        "aulas_lista": [
            {
                "slug": "digitacao-sem-medo-escrever-nome-e-usar-espaco",
                "trilha_slug": "digitacao-sem-medo",
                "indice": 1,
                "titulo": "Escrever seu nome e usar o espaço",
                "resumo": "Treine letras e o botão de espaço com calma, ouvindo a instrução sempre que quiser.",
                "nivel": "Iniciante",
                "duracao": "7 minutos",
                "aviso": "Aqui usamos palavras de treinamento. Você pode errar e tentar de novo quantas vezes quiser.",
                "passos": [
                    {
                        "numero": 1,
                        "instrucao": "Toque no campo para começar a escrever.",
                        "narracao": "Quando tocamos dentro de uma caixa de texto, o teclado aparece. Nada será enviado de verdade.",
                        "dica": "Procure a caixa branca com as palavras Digite aqui.",
                        "tela_html": '<div class="moldura celular"><div class="barra"><span class="tit">Treino de digitação</span></div><div class="tela aplicativo"><div class="item campo alvo"><span class="rot">Digite aqui</span><span class="mao">👆</span><span class="balao">Toque aqui</span></div><div class="item botao"><span class="rot">Continuar</span></div></div></div>',
                        "tipo": "celular",
                    },
                    {
                        "numero": 2,
                        "instrucao": "Encontre o botão de espaço.",
                        "narracao": "O espaço separa uma palavra da outra. Ele é o botão comprido na parte de baixo do teclado.",
                        "dica": "Procure o botão mais comprido na fileira de baixo.",
                        "tela_html": '<div class="moldura celular"><div class="barra"><span class="tit">Teclado de treino</span></div><div class="tela aplicativo"><div class="item botao"><span class="rot">A</span></div><div class="item botao"><span class="rot">M</span></div><div class="item botao alvo"><span class="rot">espaço</span><span class="mao">👆</span><span class="balao">Toque aqui</span></div><div class="item botao"><span class="rot">apagar</span></div></div></div>',
                        "tipo": "celular",
                    },
                ],
                "atividades": [
                    {"numero": 1, "tipo": "digitacao", "enunciado": "Digite a palavra MARIA.", "resposta": "MARIA", "aceitar": ["maria"], "dica": "Comece procurando a letra M. Depois A, R, I e A.", "explicacao": "Muito bem. Você digitou uma palavra inteira."},
                    {"numero": 2, "tipo": "digitacao", "enunciado": "Digite: BOM DIA", "resposta": "BOM DIA", "aceitar": ["bom dia"], "dica": "Depois de BOM, use o botão espaço antes de escrever DIA.", "explicacao": "Perfeito. Você usou o espaço para separar duas palavras."},
                    {"numero": 3, "enunciado": "Para separar duas palavras, qual botão usamos?", "alternativas": [{"letra": "A", "texto": "Espaço"}, {"letra": "B", "texto": "Apagar"}, {"letra": "C", "texto": "Volume"}], "correta": "A", "dica": "É o botão comprido que fica na parte de baixo do teclado.", "explicacao": "Isso mesmo. O espaço separa uma palavra da outra."},
                ],
            },
            {
                "slug": "digitacao-sem-medo-corrigir-sem-apagar-tudo",
                "trilha_slug": "digitacao-sem-medo",
                "indice": 2,
                "titulo": "Corrigir uma palavra sem apagar tudo",
                "resumo": "Aprenda a usar o apagar com calma quando uma letra sair errada.",
                "nivel": "Iniciante",
                "duracao": "7 minutos",
                "passos": [
                    {"numero": 1, "instrucao": "Toque no botão Apagar uma vez.", "narracao": "Quando erramos uma letra, não precisamos começar tudo de novo. O botão apagar remove uma parte de cada vez.", "dica": "O apagar costuma ficar no lado direito do teclado.", "tela_html": '<div class="moldura celular"><div class="barra"><span class="tit">MARIAA</span></div><div class="tela aplicativo"><div class="item botao"><span class="rot">espaço</span></div><div class="item botao alvo"><span class="rot">Apagar ⌫</span><span class="mao">👆</span><span class="balao">Toque uma vez</span></div></div></div>', "tipo": "celular"},
                    {"numero": 2, "instrucao": "Confira antes de continuar.", "narracao": "Depois de corrigir, leia a palavra novamente. Conferir evita enviar nomes, números ou mensagens erradas.", "dica": "Leia devagar antes de tocar em Continuar.", "tela_html": '<div class="moldura celular"><div class="barra"><span class="tit">Treino</span></div><div class="tela aplicativo"><div class="item campo"><span class="rot">MARIA</span></div><div class="item botao alvo"><span class="rot">Conferi. Continuar</span><span class="mao">👆</span><span class="balao">Toque aqui</span></div></div></div>', "tipo": "celular"},
                ],
                "atividades": [
                    {"numero": 1, "tipo": "digitacao", "enunciado": "A palavra correta é MARIA. Digite MARIA.", "resposta": "MARIA", "aceitar": ["maria"], "dica": "Digite devagar: M - A - R - I - A.", "explicacao": "Muito bem. Conferir a palavra ajuda a perceber erros."},
                    {"numero": 2, "enunciado": "Você escreveu JOÃOO. O que é melhor fazer?", "alternativas": [{"letra": "A", "texto": "Apagar só a letra extra"}, {"letra": "B", "texto": "Desligar o celular"}, {"letra": "C", "texto": "Enviar assim mesmo"}], "correta": "A", "dica": "Não precisa começar tudo novamente.", "explicacao": "Certo. Apague somente o que está sobrando e confira de novo."},
                    {"numero": 3, "enunciado": "Antes de enviar um nome ou número, o que ajuda?", "alternativas": [{"letra": "A", "texto": "Conferir o que foi digitado"}, {"letra": "B", "texto": "Apertar tudo rapidamente"}, {"letra": "C", "texto": "Pedir senha para outra pessoa"}], "correta": "A", "dica": "Leia uma vez antes de continuar.", "explicacao": "Exatamente. Conferir com calma evita muitos enganos."},
                ],
            },
            {
                "slug": "digitacao-sem-medo-numeros-e-codigos",
                "trilha_slug": "digitacao-sem-medo",
                "indice": 3,
                "titulo": "Digitar números e códigos",
                "resumo": "Treine teclado numérico, telefone e códigos fictícios sem usar seus dados reais.",
                "nivel": "Iniciante",
                "duracao": "8 minutos",
                "aviso": "Use apenas os números fictícios mostrados na aula. Nunca digite uma senha ou código real no treinamento.",
                "passos": [
                    {"numero": 1, "instrucao": "Toque em 123 para abrir os números.", "narracao": "Alguns teclados começam com letras. O botão 123 troca para o teclado de números.", "dica": "Procure 123 na parte de baixo do teclado.", "tela_html": '<div class="moldura celular"><div class="barra"><span class="tit">Teclado</span></div><div class="tela aplicativo"><div class="item botao alvo"><span class="rot">123</span><span class="mao">👆</span><span class="balao">Números</span></div><div class="item botao"><span class="rot">ABC</span></div></div></div>', "tipo": "celular"},
                    {"numero": 2, "instrucao": "Confira cada número antes de continuar.", "narracao": "Em CPF, telefone e códigos, um número errado pode impedir o acesso. Vá devagar e confira.", "dica": "Leia os números em pequenos grupos.", "tela_html": '<div class="moldura celular"><div class="barra"><span class="tit">Código de treino</span></div><div class="tela aplicativo"><div class="item campo"><span class="rot">482 193</span></div><div class="item botao alvo"><span class="rot">Conferir</span><span class="mao">👆</span><span class="balao">Toque aqui</span></div></div></div>', "tipo": "celular"},
                ],
                "atividades": [
                    {"numero": 1, "tipo": "digitacao", "comparacao": "numeros", "inputmode": "numeric", "enunciado": "Digite o código de treinamento: 482193", "resposta": "482193", "aceitar": ["482193", "482 193"], "dica": "Leia em dois grupos: 482 e 193.", "explicacao": "Muito bem. Você digitou e conferiu seis números."},
                    {"numero": 2, "tipo": "digitacao", "comparacao": "numeros", "inputmode": "numeric", "enunciado": "Digite o telefone fictício: (11) 98888-7777", "resposta": "11988887777", "aceitar": ["11988887777", "(11) 98888-7777"], "dica": "Comece pelo DDD 11 e depois digite o restante.", "explicacao": "Ótimo. Pontos, espaços e traços podem aparecer automaticamente em alguns aplicativos."},
                    {"numero": 3, "enunciado": "Se um desconhecido pedir um código que chegou por SMS, o que fazer?", "alternativas": [{"letra": "A", "texto": "Não compartilhar o código"}, {"letra": "B", "texto": "Enviar rapidamente"}, {"letra": "C", "texto": "Publicar nas redes sociais"}], "correta": "A", "dica": "Código de confirmação funciona como uma chave da sua conta.", "explicacao": "Correto. Códigos de confirmação não devem ser entregues a outras pessoas."},
                ],
            },
        ],
        "total_atividades": 9,
    },
    {
        "slug": "seguranca-na-pratica",
        "nome": "Proteja-se de golpes na prática",
        "descricao": "Treine situações reais: falso familiar, boleto, PIX, códigos, conta invadida e golpes com voz ou vídeo falso.",
        "icone": "🛡️",
        "nivel": "Iniciante",
        "aulas": 4,
        "conteudos": ["Pare e confirme", "Boleto falso", "PIX seguro", "Conta invadida"],
        "aulas_lista": [
            {
                "slug": "seguranca-na-pratica-pare-confira-confirme",
                "trilha_slug": "seguranca-na-pratica",
                "indice": 1,
                "titulo": "Pare, confira e confirme",
                "resumo": "Aprenda uma regra simples que ajuda contra vários golpes, inclusive mensagens com urgência.",
                "nivel": "Iniciante",
                "duracao": "8 minutos",
                "fonte_titulo": "Anatel — Parece real, mas pode ser golpe",
                "fonte_url": "https://www.gov.br/anatel/pt-br/assuntos/noticias/parece-real-mas-pode-ser-golpe",
                "passos": [
                    {"numero": 1, "instrucao": "Não toque em Fazer PIX.", "narracao": "Uma mensagem urgente pode tentar fazer você agir sem pensar. Primeiro pare. Não transfira dinheiro na pressa.", "dica": "Urgência e pressão são sinais para diminuir a velocidade.", "tela_html": '<div class="moldura celular"><div class="barra"><span class="tit">Mensagem</span></div><div class="tela aplicativo"><div class="item campo"><span class="rot">Mãe, troquei de número. Preciso de R$ 900 agora.</span></div><div class="item botao"><span class="rot">Fazer PIX</span></div><div class="item botao alvo"><span class="rot">Parar e confirmar</span><span class="mao">👆</span><span class="balao">Mais seguro</span></div></div></div>', "tipo": "celular"},
                    {"numero": 2, "instrucao": "Confirme por outro caminho.", "narracao": "Ligue para o número antigo ou fale com outra pessoa da família. Hoje até voz, foto e vídeo podem ser manipulados.", "dica": "Use um contato que você já conhecia antes da mensagem.", "tela_html": '<div class="moldura celular"><div class="barra"><span class="tit">Confirmar identidade</span></div><div class="tela aplicativo"><div class="item botao alvo"><span class="rot">Telefone conhecido</span><span class="mao">👆</span><span class="balao">Ligue aqui</span></div><div class="item botao"><span class="rot">Número novo da mensagem</span></div></div></div>', "tipo": "celular"},
                ],
                "atividades": [
                    {"numero": 1, "enunciado": "Uma mensagem diz que é seu filho, trocou de número e precisa de PIX urgente. O que fazer primeiro?", "alternativas": [{"letra": "A", "texto": "Fazer o PIX para ajudar"}, {"letra": "B", "texto": "Confirmar usando um contato que eu já conhecia"}, {"letra": "C", "texto": "Mandar minha senha"}], "correta": "B", "dica": "Não use o mesmo contato novo para confirmar a própria história.", "explicacao": "Isso. Pare e confirme por outro caminho antes de qualquer pagamento."},
                    {"numero": 2, "enunciado": "Uma voz muito parecida com a de um parente pede dinheiro. A voz parecida prova que é a pessoa?", "alternativas": [{"letra": "A", "texto": "Sim, voz não pode ser imitada"}, {"letra": "B", "texto": "Não. Voz e vídeo podem ser manipulados"}, {"letra": "C", "texto": "Sim, se falar meu nome"}], "correta": "B", "dica": "Tecnologias atuais conseguem imitar voz e rosto.", "explicacao": "Correto. Confirme por outro meio antes de agir."},
                    {"numero": 3, "enunciado": "Qual sequência é mais segura?", "alternativas": [{"letra": "A", "texto": "PARE → CONFIRA → CONFIRME → só depois aja"}, {"letra": "B", "texto": "PAGUE → depois pergunte"}, {"letra": "C", "texto": "CLIQUE → envie código → confirme"}], "correta": "A", "dica": "A melhor sequência começa diminuindo a pressa.", "explicacao": "Perfeito. Essa regra serve para muitos tipos de golpe."},
                ],
            },
            {
                "slug": "seguranca-na-pratica-boleto-falso",
                "trilha_slug": "seguranca-na-pratica",
                "indice": 2,
                "titulo": "Conferir um boleto antes de pagar",
                "resumo": "Treine como comparar beneficiário, valor e canal oficial antes de confirmar um pagamento.",
                "nivel": "Iniciante",
                "duracao": "9 minutos",
                "fonte_titulo": "Banco Central — Golpe do boleto falso",
                "fonte_url": "https://www.bcb.gov.br/meubc/faqs/p/vitima-pagou-um-boleto-e-caiu-em-um-golpe",
                "aviso": "Todos os nomes, valores e boletos desta atividade são fictícios.",
                "passos": [
                    {"numero": 1, "instrucao": "Confira quem vai receber.", "narracao": "Antes de pagar, veja o nome do beneficiário mostrado pelo banco. Ele precisa fazer sentido para a conta que você está pagando.", "dica": "Beneficiário é quem vai receber o dinheiro.", "tela_html": '<div class="moldura celular"><div class="barra"><span class="tit">Pagamento de boleto</span></div><div class="tela aplicativo"><div class="item campo"><span class="rot">Conta: Energia da Cidade</span></div><div class="item campo"><span class="rot">Beneficiário: Loja Digital XPTO Ltda.</span></div><div class="item botao"><span class="rot">Pagar</span></div><div class="item botao alvo"><span class="rot">Parar e conferir</span><span class="mao">👆</span><span class="balao">Nome estranho</span></div></div></div>', "tipo": "celular"},
                    {"numero": 2, "instrucao": "Procure o canal oficial da empresa.", "narracao": "Se houver diferença, não use um telefone estranho impresso no boleto. Procure o site ou aplicativo oficial da empresa para confirmar.", "dica": "Prefira o aplicativo ou site que você já conhece.", "tela_html": '<div class="moldura celular"><div class="barra"><span class="tit">Conferência</span></div><div class="tela aplicativo"><div class="item botao alvo"><span class="rot">Site oficial da empresa</span><span class="mao">👆</span><span class="balao">Mais seguro</span></div><div class="item botao"><span class="rot">Telefone desconhecido do boleto</span></div></div></div>', "tipo": "celular"},
                ],
                "atividades": [
                    {"numero": 1, "enunciado": "A conta deveria ser de energia, mas o banco mostra um beneficiário que você não reconhece. O que fazer?", "alternativas": [{"letra": "A", "texto": "Pagar mesmo assim"}, {"letra": "B", "texto": "Parar e confirmar no canal oficial da empresa"}, {"letra": "C", "texto": "Aumentar o valor"}], "correta": "B", "dica": "O nome de quem recebe é uma das informações mais importantes.", "explicacao": "Correto. Se os dados não fizerem sentido, não conclua o pagamento."},
                    {"numero": 2, "enunciado": "O boleto tem um telefone que você nunca viu. Qual contato é mais seguro para tirar dúvida?", "alternativas": [{"letra": "A", "texto": "O primeiro telefone do boleto"}, {"letra": "B", "texto": "Um contato encontrado no canal oficial da empresa"}, {"letra": "C", "texto": "Um número enviado por desconhecido"}], "correta": "B", "dica": "Confirme usando um caminho independente do documento suspeito.", "explicacao": "Isso. Use canais oficiais da empresa."},
                    {"numero": 3, "enunciado": "Se o documento tiver QR Code de PIX, o que continua sendo importante?", "alternativas": [{"letra": "A", "texto": "Conferir quem receberá antes de confirmar"}, {"letra": "B", "texto": "Pagar sem olhar"}, {"letra": "C", "texto": "Enviar senha para o vendedor"}], "correta": "A", "dica": "QR Code também pode direcionar um pagamento para outra pessoa.", "explicacao": "Muito bem. Confira o destinatário mesmo quando usar QR Code."},
                ],
            },
            {
                "slug": "seguranca-na-pratica-pix-sem-pressa",
                "trilha_slug": "seguranca-na-pratica",
                "indice": 3,
                "titulo": "PIX sem pressa: confira antes de confirmar",
                "resumo": "Aprenda a verificar nome, valor e contexto antes de tocar no último botão.",
                "nivel": "Iniciante",
                "duracao": "8 minutos",
                "fonte_titulo": "Banco Central — Segurança no Pix",
                "fonte_url": "https://www.bcb.gov.br/estabilidadefinanceira/pix-seguranca",
                "passos": [
                    {"numero": 1, "instrucao": "Compare o nome com a pessoa que você quer pagar.", "narracao": "Antes de confirmar, o banco mostra os dados do recebedor. Se o nome não for o esperado, pare.", "dica": "Não deixe a pressa decidir por você.", "tela_html": '<div class="moldura celular"><div class="barra"><span class="tit">Meu Banco — Treinamento</span></div><div class="tela aplicativo"><div class="item campo"><span class="rot">Você queria: Maria Souza</span></div><div class="item campo"><span class="rot">Vai receber: Carlos Comércio Ltda.</span></div><div class="item botao"><span class="rot">Confirmar PIX</span></div><div class="item botao alvo"><span class="rot">Cancelar e conferir</span><span class="mao">👆</span><span class="balao">Nome diferente</span></div></div></div>', "tipo": "celular"},
                    {"numero": 2, "instrucao": "Confira também o valor.", "narracao": "Olhe o valor inteiro antes da senha ou biometria. Dez reais e mil reais são situações muito diferentes.", "dica": "Leia o valor em voz alta se isso ajudar.", "tela_html": '<div class="moldura celular"><div class="barra"><span class="tit">Conferir PIX</span></div><div class="tela aplicativo"><div class="item campo"><span class="rot">Valor: R$ 1.000,00</span></div><div class="item botao alvo"><span class="rot">Voltar e corrigir</span><span class="mao">👆</span><span class="balao">Confira o valor</span></div></div></div>', "tipo": "celular"},
                ],
                "atividades": [
                    {"numero": 1, "enunciado": "Você queria pagar Maria, mas o banco mostra Carlos Comércio Ltda. O que fazer?", "alternativas": [{"letra": "A", "texto": "Confirmar porque já cheguei até aqui"}, {"letra": "B", "texto": "Cancelar e conferir a chave ou QR Code"}, {"letra": "C", "texto": "Dobrar o valor"}], "correta": "B", "dica": "O nome do recebedor não é o que você esperava.", "explicacao": "Correto. Pare quando os dados não baterem."},
                    {"numero": 2, "enunciado": "Um conhecido manda um comprovante dizendo que pagou você. Como confirmar?", "alternativas": [{"letra": "A", "texto": "Conferir no meu próprio banco se o dinheiro entrou"}, {"letra": "B", "texto": "Confiar só na imagem"}, {"letra": "C", "texto": "Mandar minha senha"}], "correta": "A", "dica": "Uma imagem de comprovante pode ser falsa ou editada.", "explicacao": "Isso. A confirmação deve ser feita no seu banco."},
                    {"numero": 3, "enunciado": "Quando alguém pressiona dizendo 'é agora ou você perde', qual atitude ajuda?", "alternativas": [{"letra": "A", "texto": "Agir ainda mais rápido"}, {"letra": "B", "texto": "Parar, conferir e confirmar"}, {"letra": "C", "texto": "Enviar código de SMS"}], "correta": "B", "dica": "A pressa é usada para diminuir o tempo de pensar.", "explicacao": "Perfeito. Segurança combina com calma."},
                ],
            },
            {
                "slug": "seguranca-na-pratica-conta-invadida-e-codigos",
                "trilha_slug": "seguranca-na-pratica",
                "indice": 4,
                "titulo": "Código de segurança e conta invadida",
                "resumo": "Saiba reconhecer pedidos perigosos e o que fazer quando uma conta parece ter sido acessada por outra pessoa.",
                "nivel": "Iniciante",
                "duracao": "9 minutos",
                "passos": [
                    {"numero": 1, "instrucao": "Não entregue o código recebido.", "narracao": "Códigos de confirmação ajudam a provar que o celular é seu. Um golpista pode pedir esse código para tentar entrar na sua conta.", "dica": "Mesmo que a pessoa diga ser de uma empresa, não entregue o código.", "tela_html": '<div class="moldura celular"><div class="barra"><span class="tit">SMS</span></div><div class="tela aplicativo"><div class="item campo"><span class="rot">Seu código é 482193. Não compartilhe.</span></div><div class="item botao"><span class="rot">Enviar código ao atendente</span></div><div class="item botao alvo"><span class="rot">Não compartilhar</span><span class="mao">👆</span><span class="balao">Proteja o código</span></div></div></div>', "tipo": "celular"},
                    {"numero": 2, "instrucao": "Use a recuperação oficial da conta.", "narracao": "Se a conta sair sozinha ou houver acesso desconhecido, abra o aplicativo ou site oficial. Troque a senha e revise os aparelhos conectados quando essa opção existir.", "dica": "Não aceite ajuda de perfis desconhecidos no Direct ou WhatsApp.", "tela_html": '<div class="moldura celular"><div class="barra"><span class="tit">Conta</span></div><div class="tela aplicativo"><div class="item botao alvo"><span class="rot">Recuperação oficial</span><span class="mao">👆</span><span class="balao">Use o app ou site oficial</span></div><div class="item botao"><span class="rot">Suporte desconhecido por mensagem</span></div></div></div>', "tipo": "celular"},
                ],
                "atividades": [
                    {"numero": 1, "enunciado": "Chegou um código que você não pediu e alguém ligou pedindo esse número. O que fazer?", "alternativas": [{"letra": "A", "texto": "Não informar o código"}, {"letra": "B", "texto": "Ditar o código devagar"}, {"letra": "C", "texto": "Publicar o código"}], "correta": "A", "dica": "Trate códigos de confirmação como uma chave temporária.", "explicacao": "Correto. Não compartilhe códigos de confirmação."},
                    {"numero": 2, "enunciado": "Seu Instagram publicou algo que você não colocou. Qual caminho é mais seguro?", "alternativas": [{"letra": "A", "texto": "Usar as opções oficiais de segurança e recuperação"}, {"letra": "B", "texto": "Pagar um desconhecido para recuperar"}, {"letra": "C", "texto": "Enviar senha pelo Direct"}], "correta": "A", "dica": "Use o próprio aplicativo ou site oficial.", "explicacao": "Isso. Recuperação deve começar pelos canais oficiais."},
                    {"numero": 3, "enunciado": "Depois de recuperar a conta, o que ajuda a proteger melhor?", "alternativas": [{"letra": "A", "texto": "Trocar a senha e ativar verificação em duas etapas quando disponível"}, {"letra": "B", "texto": "Usar a mesma senha em tudo"}, {"letra": "C", "texto": "Contar a senha para várias pessoas"}], "correta": "A", "dica": "Duas etapas criam uma camada a mais de proteção.", "explicacao": "Muito bem. Senha forte e duas etapas ajudam a proteger a conta."},
                ],
            },
        ],
        "total_atividades": 12,
    },
    {
        "slug": "govbr-na-pratica",
        "nome": "GOV.BR sem medo",
        "descricao": "Entre, recupere o acesso, entenda os níveis e aprenda a encontrar serviços com dados fictícios.",
        "icone": "🇧🇷",
        "nivel": "Iniciante",
        "aulas": 4,
        "conteudos": ["Entrar", "Recuperar senha", "Bronze, Prata e Ouro", "Encontrar serviços"],
        "aulas_lista": [
            {
                "slug": "govbr-na-pratica-reconhecer-site-e-entrar",
                "trilha_slug": "govbr-na-pratica",
                "indice": 1,
                "titulo": "Reconhecer o GOV.BR e começar a entrar",
                "resumo": "Aprenda a identificar o endereço gov.br e treine o campo de CPF sem usar seu CPF real.",
                "nivel": "Iniciante",
                "duracao": "9 minutos",
                "fonte_titulo": "GOV.BR — Portal oficial",
                "fonte_url": "https://www.gov.br/pt-br",
                "aviso": "Nunca digite CPF, senha ou código reais dentro do Educa+. O treinamento usa dados fictícios.",
                "passos": [
                    {"numero": 1, "instrucao": "Escolha o endereço oficial gov.br.", "narracao": "Antes de entrar, confira o endereço. Páginas parecidas podem tentar enganar você.", "dica": "Procure gov.br escrito corretamente.", "tela_html": '<div class="moldura celular"><div class="barra"><span class="tit">Navegador</span></div><div class="tela aplicativo"><div class="item botao alvo"><span class="rot">www.gov.br</span><span class="mao">👆</span><span class="balao">Endereço oficial</span></div><div class="item botao"><span class="rot">gov-premio-br.net</span></div><div class="item botao"><span class="rot">beneficio-gov-agora.com</span></div></div></div>', "tipo": "celular"},
                    {"numero": 2, "instrucao": "Toque no campo CPF.", "narracao": "No acesso à conta, primeiro aparece o campo de CPF. Nesta aula vamos usar um número fictício de treinamento.", "dica": "Procure a caixa escrita CPF.", "tela_html": '<div class="moldura celular"><div class="barra"><span class="tit">gov.br — Entrar</span></div><div class="tela aplicativo"><div class="item campo alvo"><span class="rot">CPF</span><span class="mao">👆</span><span class="balao">Toque aqui</span></div><div class="item botao"><span class="rot">Continuar</span></div></div></div>', "tipo": "celular"},
                ],
                "atividades": [
                    {"numero": 1, "enunciado": "Qual endereço é o portal oficial?", "alternativas": [{"letra": "A", "texto": "gov-premio-br.net"}, {"letra": "B", "texto": "www.gov.br"}, {"letra": "C", "texto": "govbeneficio-agora.com"}], "correta": "B", "dica": "O endereço oficial termina em gov.br.", "explicacao": "Isso. O portal oficial é gov.br."},
                    {"numero": 2, "tipo": "digitacao", "comparacao": "numeros", "inputmode": "numeric", "enunciado": "Treine a digitação com este CPF fictício: 000.000.000-00", "resposta": "00000000000", "aceitar": ["00000000000", "000.000.000-00"], "dica": "São onze zeros. Digite devagar e confira.", "explicacao": "Muito bem. Foi apenas um CPF fictício para praticar o teclado."},
                    {"numero": 3, "enunciado": "O Educa+ deve pedir seu CPF e senha reais para treinar?", "alternativas": [{"letra": "A", "texto": "Não. O treinamento deve usar dados fictícios"}, {"letra": "B", "texto": "Sim, sempre"}, {"letra": "C", "texto": "Só se alguém pedir por mensagem"}], "correta": "A", "dica": "Treinar não exige expor credenciais verdadeiras.", "explicacao": "Correto. Dados reais ficam fora das atividades de treinamento."},
                ],
            },
            {
                "slug": "govbr-na-pratica-recuperar-senha",
                "trilha_slug": "govbr-na-pratica",
                "indice": 2,
                "titulo": "Esqueci minha senha: recuperar o acesso",
                "resumo": "Treine o caminho oficial: CPF, continuar e a opção de recuperação da senha.",
                "nivel": "Iniciante",
                "duracao": "10 minutos",
                "fonte_titulo": "GOV.BR — Recuperar senha da conta",
                "fonte_url": "https://www.gov.br/governodigital/pt-br/acessibilidade-e-usuario/atendimento-gov.br/duvidas-na-conta-gov.br/recuperar-senha-da-conta-gov.br",
                "passos": [
                    {"numero": 1, "instrucao": "Depois do CPF, toque em Continuar.", "narracao": "O primeiro passo é informar o CPF na página oficial e tocar em Continuar.", "dica": "Antes, confirme que está no site ou aplicativo oficial.", "tela_html": '<div class="moldura celular"><div class="barra"><span class="tit">gov.br</span></div><div class="tela aplicativo"><div class="item campo"><span class="rot">CPF fictício: 000.000.000-00</span></div><div class="item botao alvo"><span class="rot">Continuar</span><span class="mao">👆</span><span class="balao">Toque aqui</span></div></div></div>', "tipo": "celular"},
                    {"numero": 2, "instrucao": "Toque em Esqueci minha senha.", "narracao": "Se você não lembra a senha, use a opção oficial de recuperação. O GOV.BR apresenta os métodos disponíveis para aquela conta.", "dica": "Não tente adivinhar a senha muitas vezes.", "tela_html": '<div class="moldura celular"><div class="barra"><span class="tit">Senha</span></div><div class="tela aplicativo"><div class="item campo"><span class="rot">Senha</span></div><div class="item botao alvo"><span class="rot">Esqueci minha senha</span><span class="mao">👆</span><span class="balao">Recuperar acesso</span></div></div></div>', "tipo": "celular"},
                    {"numero": 3, "instrucao": "Siga um método oficial apresentado para você.", "narracao": "Entre as opções podem aparecer reconhecimento facial ou bancos credenciados, conforme a conta e os métodos disponíveis.", "dica": "Leia a opção apresentada e siga somente dentro do fluxo oficial.", "tela_html": '<div class="moldura celular"><div class="barra"><span class="tit">Recuperar conta</span></div><div class="tela aplicativo"><div class="item botao alvo"><span class="rot">Reconhecimento facial</span><span class="mao">👆</span><span class="balao">Exemplo de método</span></div><div class="item botao"><span class="rot">Banco credenciado</span></div></div></div>', "tipo": "celular"},
                ],
                "atividades": [
                    {"numero": 1, "enunciado": "Você não lembra a senha. Qual opção deve procurar?", "alternativas": [{"letra": "A", "texto": "Esqueci minha senha"}, {"letra": "B", "texto": "Enviar senha para um desconhecido"}, {"letra": "C", "texto": "Fazer um PIX"}], "correta": "A", "dica": "A própria tela de acesso oferece o caminho de recuperação.", "explicacao": "Certo. Use a recuperação oficial da conta."},
                    {"numero": 2, "enunciado": "Na recuperação, o GOV.BR pode apresentar métodos diferentes para cada pessoa?", "alternativas": [{"letra": "A", "texto": "Sim, conforme as opções disponíveis para a conta"}, {"letra": "B", "texto": "Não, sempre é igual"}, {"letra": "C", "texto": "Só funciona por WhatsApp"}], "correta": "A", "dica": "Nem todo mundo possui as mesmas validações disponíveis.", "explicacao": "Isso. Siga as opções mostradas no processo oficial."},
                    {"numero": 3, "enunciado": "Uma pessoa no WhatsApp promete recuperar sua conta se você mandar a senha. O que fazer?", "alternativas": [{"letra": "A", "texto": "Não enviar e usar o canal oficial"}, {"letra": "B", "texto": "Enviar a senha"}, {"letra": "C", "texto": "Enviar também o código"}], "correta": "A", "dica": "Recuperação segura não começa entregando sua senha a desconhecidos.", "explicacao": "Perfeito. Use o aplicativo ou site oficial."},
                ],
            },
            {
                "slug": "govbr-na-pratica-niveis-e-seguranca",
                "trilha_slug": "govbr-na-pratica",
                "indice": 3,
                "titulo": "Bronze, Prata e Ouro sem confusão",
                "resumo": "Entenda os três níveis da conta e por que alguns serviços pedem uma validação mais forte.",
                "nivel": "Iniciante",
                "duracao": "8 minutos",
                "fonte_titulo": "GOV.BR — Níveis da conta",
                "fonte_url": "https://www.gov.br/governodigital/pt-br/identidade/conta-gov-br/niveis-da-conta-govbr",
                "passos": [
                    {"numero": 1, "instrucao": "Conheça os três níveis.", "narracao": "A conta GOV.BR possui três níveis: Bronze, Prata e Ouro. Eles refletem formas diferentes de validação e acesso a serviços.", "dica": "Você não precisa decorar tudo. Lembre que alguns serviços exigem nível maior.", "tela_html": '<div class="moldura celular"><div class="barra"><span class="tit">Níveis da conta</span></div><div class="tela aplicativo"><div class="item botao"><span class="rot">Bronze</span></div><div class="item botao alvo"><span class="rot">Prata</span><span class="mao">👆</span><span class="balao">Mais validação</span></div><div class="item botao"><span class="rot">Ouro</span></div></div></div>', "tipo": "celular"},
                    {"numero": 2, "instrucao": "Use o aplicativo oficial para aumentar o nível quando necessário.", "narracao": "O GOV.BR pode orientar formas de aumentar o nível, como validações disponíveis no aplicativo e bancos credenciados.", "dica": "Não pague alguém para aumentar seu nível.", "tela_html": '<div class="moldura celular"><div class="barra"><span class="tit">gov.br</span></div><div class="tela aplicativo"><div class="item botao alvo"><span class="rot">Aumentar nível</span><span class="mao">👆</span><span class="balao">No app oficial</span></div><div class="item botao"><span class="rot">Pagar desconhecido</span></div></div></div>', "tipo": "celular"},
                ],
                "atividades": [
                    {"numero": 1, "enunciado": "Quais são os três níveis da conta GOV.BR?", "alternativas": [{"letra": "A", "texto": "Bronze, Prata e Ouro"}, {"letra": "B", "texto": "Azul, Verde e Vermelho"}, {"letra": "C", "texto": "Pequeno, Médio e Grande"}], "correta": "A", "dica": "São nomes de metais.", "explicacao": "Isso. Bronze, Prata e Ouro."},
                    {"numero": 2, "enunciado": "Um serviço pede nível Prata ou Ouro e sua conta está Bronze. Isso significa que:", "alternativas": [{"letra": "A", "texto": "Pode ser necessário aumentar a validação da conta"}, {"letra": "B", "texto": "Sua conta foi roubada"}, {"letra": "C", "texto": "Você precisa pagar uma pessoa"}], "correta": "A", "dica": "Os níveis se relacionam ao grau de validação e aos serviços disponíveis.", "explicacao": "Correto. O próprio GOV.BR orienta formas de aumentar o nível."},
                    {"numero": 3, "enunciado": "Alguém cobra dinheiro dizendo que consegue transformar sua conta em Ouro. O que é mais seguro?", "alternativas": [{"letra": "A", "texto": "Usar somente os procedimentos oficiais do GOV.BR"}, {"letra": "B", "texto": "Pagar rapidamente"}, {"letra": "C", "texto": "Entregar senha e CPF"}], "correta": "A", "dica": "A validação é feita pelos caminhos oficiais.", "explicacao": "Muito bem. Não entregue credenciais a terceiros."},
                ],
            },
            {
                "slug": "govbr-na-pratica-encontrar-servicos",
                "trilha_slug": "govbr-na-pratica",
                "indice": 4,
                "titulo": "Encontrar serviços no portal",
                "resumo": "Treine como procurar aposentadoria, saúde, trabalho e outros serviços sem depender de outra pessoa.",
                "nivel": "Iniciante",
                "duracao": "8 minutos",
                "fonte_titulo": "GOV.BR — Serviços",
                "fonte_url": "https://www.gov.br/pt-br",
                "passos": [
                    {"numero": 1, "instrucao": "Use a busca para dizer o que você procura.", "narracao": "Você não precisa conhecer todas as páginas. Pode pesquisar pelo nome do serviço ou pelo assunto.", "dica": "Use palavras simples, como aposentadoria, saúde ou carteira de trabalho.", "tela_html": '<div class="moldura celular"><div class="barra"><span class="tit">gov.br</span></div><div class="tela aplicativo"><div class="item campo alvo"><span class="rot">O que você procura?</span><span class="mao">👆</span><span class="balao">Pesquise aqui</span></div><div class="item botao"><span class="rot">Serviços</span></div></div></div>', "tipo": "celular"},
                    {"numero": 2, "instrucao": "Escolha o resultado que combina com o que você precisa.", "narracao": "Leia o nome do serviço com calma. Se tiver dúvida, use a leitura por voz do Educa+ para treinar.", "dica": "Evite clicar só porque o primeiro resultado parece parecido.", "tela_html": '<div class="moldura celular"><div class="barra"><span class="tit">Resultados</span></div><div class="tela aplicativo"><div class="item botao alvo"><span class="rot">Meu INSS — serviço oficial</span><span class="mao">👆</span><span class="balao">Exemplo</span></div><div class="item botao"><span class="rot">Prêmio INSS agora</span></div></div></div>', "tipo": "celular"},
                ],
                "atividades": [
                    {"numero": 1, "tipo": "digitacao", "enunciado": "Digite o que você quer procurar: APOSENTADORIA", "resposta": "APOSENTADORIA", "aceitar": ["aposentadoria"], "dica": "Digite devagar. Você também pode ouvir a palavra novamente.", "explicacao": "Muito bem. Buscar pelo assunto é uma forma prática de encontrar serviços."},
                    {"numero": 2, "enunciado": "Você quer um serviço do INSS. Qual resultado parece mais confiável?", "alternativas": [{"letra": "A", "texto": "Meu INSS — serviço oficial"}, {"letra": "B", "texto": "Prêmio-INSS-grátis.net"}, {"letra": "C", "texto": "Link enviado por desconhecido"}], "correta": "A", "dica": "Prefira resultados oficiais e confirme o endereço.", "explicacao": "Correto. Serviços públicos devem ser acessados por canais oficiais."},
                    {"numero": 3, "enunciado": "Se você não encontrar de primeira, o que pode fazer?", "alternativas": [{"letra": "A", "texto": "Tentar uma busca simples pelo nome do serviço"}, {"letra": "B", "texto": "Enviar sua senha a alguém"}, {"letra": "C", "texto": "Desistir para sempre"}], "correta": "A", "dica": "Use palavras simples e específicas.", "explicacao": "Isso. Pesquisar de novo faz parte do aprendizado."},
                ],
            },
        ],
        "total_atividades": 12,
    },
    {
        "slug": "redes-sociais-seguras",
        "nome": "Instagram e redes sociais com segurança",
        "descricao": "Aprenda a usar contas sociais, reconhecer perfis falsos, links suspeitos e proteger o acesso.",
        "icone": "📸",
        "nivel": "Iniciante",
        "aulas": 3,
        "conteudos": ["Perfil falso", "Golpes no Direct", "Recuperar e proteger"],
        "aulas_lista": [
            {
                "slug": "redes-sociais-seguras-perfil-falso",
                "trilha_slug": "redes-sociais-seguras",
                "indice": 1,
                "titulo": "Reconhecer um perfil que merece desconfiança",
                "resumo": "Treine como observar nome, histórico e pedidos estranhos antes de confiar em um perfil.",
                "nivel": "Iniciante",
                "duracao": "8 minutos",
                "passos": [
                    {"numero": 1, "instrucao": "Não confie só na foto.", "narracao": "Uma foto conhecida pode ser copiada. Observe o nome, histórico da conta e o que a pessoa está pedindo.", "dica": "Se pedir dinheiro ou código, pare e confirme por outro caminho.", "tela_html": '<div class="moldura celular"><div class="barra"><span class="tit">Instagram — Treino</span></div><div class="tela aplicativo"><div class="item campo"><span class="rot">@maria_silva_novo_2026 — conta criada hoje</span></div><div class="item botao"><span class="rot">Enviar PIX</span></div><div class="item botao alvo"><span class="rot">Verificar antes</span><span class="mao">👆</span><span class="balao">Mais seguro</span></div></div></div>', "tipo": "celular"},
                    {"numero": 2, "instrucao": "Confirme com a pessoa por um contato conhecido.", "narracao": "Se um perfil novo diz ser alguém da família, confirme usando telefone ou contato antigo antes de ajudar.", "dica": "Não use somente o próprio perfil suspeito para confirmar.", "tela_html": '<div class="moldura celular"><div class="barra"><span class="tit">Confirmar</span></div><div class="tela aplicativo"><div class="item botao alvo"><span class="rot">Ligar para contato conhecido</span><span class="mao">👆</span><span class="balao">Confirme</span></div><div class="item botao"><span class="rot">Confiar só na foto</span></div></div></div>', "tipo": "celular"},
                ],
                "atividades": [
                    {"numero": 1, "enunciado": "Um perfil com foto da sua sobrinha foi criado hoje e pede dinheiro. O que fazer?", "alternativas": [{"letra": "A", "texto": "Confirmar com ela por um contato conhecido"}, {"letra": "B", "texto": "Pagar sem perguntar"}, {"letra": "C", "texto": "Enviar minha senha"}], "correta": "A", "dica": "Foto de perfil pode ser copiada.", "explicacao": "Correto. Confirme a identidade por outro caminho."},
                    {"numero": 2, "enunciado": "Ter a foto certa significa que o perfil é verdadeiro?", "alternativas": [{"letra": "A", "texto": "Não necessariamente"}, {"letra": "B", "texto": "Sim, sempre"}, {"letra": "C", "texto": "Só se pedir PIX"}], "correta": "A", "dica": "Fotos podem ser copiadas de contas públicas.", "explicacao": "Isso. Observe outros sinais e confirme quando houver pedido sensível."},
                    {"numero": 3, "enunciado": "Um perfil promete prêmio em troca de uma taxa. O que é mais seguro?", "alternativas": [{"letra": "A", "texto": "Desconfiar e não pagar na pressa"}, {"letra": "B", "texto": "Pagar para não perder"}, {"letra": "C", "texto": "Enviar documento pelo Direct"}], "correta": "A", "dica": "Promessa de vantagem com urgência é sinal de alerta.", "explicacao": "Muito bem. Pare e verifique antes de qualquer pagamento."},
                ],
            },
            {
                "slug": "redes-sociais-seguras-links-no-direct",
                "trilha_slug": "redes-sociais-seguras",
                "indice": 2,
                "titulo": "Links e mensagens no Direct",
                "resumo": "Aprenda a não entrar em páginas suspeitas que pedem senha, código ou pagamento.",
                "nivel": "Iniciante",
                "duracao": "7 minutos",
                "passos": [
                    {"numero": 1, "instrucao": "Pare antes de abrir um link inesperado.", "narracao": "Mensagens podem dizer que sua conta será bloqueada ou que você ganhou um prêmio. Não deixe a urgência decidir.", "dica": "Abra o aplicativo oficial por conta própria, sem usar o link da mensagem.", "tela_html": '<div class="moldura celular"><div class="barra"><span class="tit">Direct</span></div><div class="tela aplicativo"><div class="item campo"><span class="rot">Sua conta será bloqueada. Entre agora: instagrarn-suporte.net</span></div><div class="item botao"><span class="rot">Abrir link</span></div><div class="item botao alvo"><span class="rot">Não abrir. Conferir no app</span><span class="mao">👆</span><span class="balao">Mais seguro</span></div></div></div>', "tipo": "celular"},
                    {"numero": 2, "instrucao": "Nunca informe senha por mensagem.", "narracao": "Senha e códigos de verificação não devem ser enviados pelo Direct para pessoas que dizem ser suporte.", "dica": "Suporte desconhecido não precisa da sua senha.", "tela_html": '<div class="moldura celular"><div class="barra"><span class="tit">Mensagem</span></div><div class="tela aplicativo"><div class="item botao"><span class="rot">Enviar senha</span></div><div class="item botao alvo"><span class="rot">Não enviar dados</span><span class="mao">👆</span><span class="balao">Proteja sua conta</span></div></div></div>', "tipo": "celular"},
                ],
                "atividades": [
                    {"numero": 1, "enunciado": "Chegou um link dizendo que sua conta será bloqueada em 5 minutos. O que ajuda?", "alternativas": [{"letra": "A", "texto": "Não abrir o link e conferir diretamente no aplicativo oficial"}, {"letra": "B", "texto": "Digitar a senha no link"}, {"letra": "C", "texto": "Enviar o link para todo mundo"}], "correta": "A", "dica": "A urgência é justamente o que tenta fazer você agir sem conferir.", "explicacao": "Correto. Abra o aplicativo por conta própria e confira ali."},
                    {"numero": 2, "enunciado": "Um perfil de 'suporte' pede sua senha. O que fazer?", "alternativas": [{"letra": "A", "texto": "Não enviar a senha"}, {"letra": "B", "texto": "Enviar para resolver rápido"}, {"letra": "C", "texto": "Enviar também o código"}], "correta": "A", "dica": "Senha é uma informação secreta da sua conta.", "explicacao": "Isso. Não entregue senha ou códigos por mensagem."},
                    {"numero": 3, "enunciado": "Qual endereço parece escrito para imitar Instagram?", "alternativas": [{"letra": "A", "texto": "instagrarn-suporte.net"}, {"letra": "B", "texto": "Aplicativo oficial já instalado"}, {"letra": "C", "texto": "Configurações do próprio app"}], "correta": "A", "dica": "Veja que a palavra usa 'rn' para parecer a letra 'm'.", "explicacao": "Muito bem. Golpistas podem usar endereços parecidos para enganar."},
                ],
            },
            {
                "slug": "redes-sociais-seguras-recuperar-conta",
                "trilha_slug": "redes-sociais-seguras",
                "indice": 3,
                "titulo": "Recuperar e proteger uma conta",
                "resumo": "Treine o que fazer quando a conta apresenta atividade que você não reconhece.",
                "nivel": "Iniciante",
                "duracao": "8 minutos",
                "passos": [
                    {"numero": 1, "instrucao": "Use a recuperação do aplicativo ou site oficial.", "narracao": "Se sua conta sair sozinha, mudar e-mail ou publicar coisas estranhas, comece pelo canal oficial de recuperação.", "dica": "Não pague perfis desconhecidos que prometem recuperar conta.", "tela_html": '<div class="moldura celular"><div class="barra"><span class="tit">Conta</span></div><div class="tela aplicativo"><div class="item botao alvo"><span class="rot">Esqueci a senha / recuperar conta</span><span class="mao">👆</span><span class="balao">Canal oficial</span></div><div class="item botao"><span class="rot">Pagar recuperador por Direct</span></div></div></div>', "tipo": "celular"},
                    {"numero": 2, "instrucao": "Depois, reforce a segurança.", "narracao": "Troque a senha, não repita a mesma senha em várias contas e ative verificação em duas etapas quando disponível.", "dica": "Revise também dispositivos ou sessões conectadas quando o serviço oferecer essa opção.", "tela_html": '<div class="moldura celular"><div class="barra"><span class="tit">Segurança</span></div><div class="tela aplicativo"><div class="item botao alvo"><span class="rot">Verificação em duas etapas</span><span class="mao">👆</span><span class="balao">Proteção extra</span></div><div class="item botao"><span class="rot">Usar mesma senha em tudo</span></div></div></div>', "tipo": "celular"},
                ],
                "atividades": [
                    {"numero": 1, "enunciado": "Sua conta começou a publicar coisas que você não fez. Qual é um bom primeiro caminho?", "alternativas": [{"letra": "A", "texto": "Abrir a recuperação e segurança do serviço oficial"}, {"letra": "B", "texto": "Dar a senha a um desconhecido"}, {"letra": "C", "texto": "Ignorar para sempre"}], "correta": "A", "dica": "Comece por um canal que você sabe ser oficial.", "explicacao": "Certo. Use a recuperação oficial e proteja novamente a conta."},
                    {"numero": 2, "enunciado": "Depois de recuperar, qual prática ajuda?", "alternativas": [{"letra": "A", "texto": "Ativar duas etapas quando disponível"}, {"letra": "B", "texto": "Usar senha 1234 em tudo"}, {"letra": "C", "texto": "Compartilhar a senha"}], "correta": "A", "dica": "Uma segunda etapa torna mais difícil entrar só com a senha.", "explicacao": "Muito bem. Duas etapas são uma camada adicional de proteção."},
                    {"numero": 3, "enunciado": "É melhor usar a mesma senha em todas as contas?", "alternativas": [{"letra": "A", "texto": "Não"}, {"letra": "B", "texto": "Sim"}, {"letra": "C", "texto": "Só em bancos"}], "correta": "A", "dica": "Se uma senha vazar, repetir a mesma aumenta o risco em outras contas.", "explicacao": "Correto. Contas importantes devem ter senhas diferentes."},
                ],
            },
        ],
        "total_atividades": 9,
    },
    {
        "slug": "detran-teorica-acessivel",
        "nome": "Treino para a prova teórica de trânsito",
        "descricao": "Estude sinalização e segurança com perguntas faladas, dicas e treinos sem cronômetro.",
        "icone": "🚦",
        "nivel": "Iniciante",
        "aulas": 3,
        "conteudos": ["Como funciona a prova", "Placas e sinalização", "Treino teórico"],
        "aulas_lista": [
            {
                "slug": "detran-teorica-acessivel-como-funciona-prova",
                "trilha_slug": "detran-teorica-acessivel",
                "indice": 1,
                "titulo": "Como funciona a prova teórica",
                "resumo": "Conheça o formato atual do exame antes de começar a praticar.",
                "nivel": "Iniciante",
                "duracao": "7 minutos",
                "fonte_titulo": "CONTRAN — Resolução nº 1.020/2025",
                "fonte_url": "https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao10202025.pdf",
                "passos": [
                    {"numero": 1, "instrucao": "Conheça o formato sem pressa.", "narracao": "Pelas regras nacionais atuais, o exame teórico tem trinta questões. A aprovação exige pelo menos vinte acertos.", "dica": "Aqui no Educa+ você aprende primeiro sem cronômetro e com dicas.", "tela_html": '<div class="moldura computador"><div class="barra"><span class="tit">Treino teórico Educa+</span></div><div class="tela janela"><div class="item campo"><span class="rot">30 questões na prova</span></div><div class="item campo"><span class="rot">20 acertos para aprovação</span></div><div class="item botao alvo"><span class="rot">Treinar com calma</span><span class="mao">👆</span><span class="balao">Começar</span></div></div></div>', "tipo": "computador"},
                    {"numero": 2, "instrucao": "Use o modo Aprender antes do simulado.", "narracao": "No modo aprender, você pode ouvir a pergunta, pedir dica e repetir. O objetivo é entender, não decorar com medo.", "dica": "Você pode repetir quantas vezes quiser.", "tela_html": '<div class="moldura computador"><div class="barra"><span class="tit">Educa+ Trânsito</span></div><div class="tela janela"><div class="item botao alvo"><span class="rot">Aprender com dicas</span><span class="mao">👆</span><span class="balao">Primeiro</span></div><div class="item botao"><span class="rot">Treino de prova</span></div></div></div>', "tipo": "computador"},
                ],
                "atividades": [
                    {"numero": 1, "enunciado": "Quantas questões compõem o exame teórico nacional nas regras atuais?", "alternativas": [{"letra": "A", "texto": "30"}, {"letra": "B", "texto": "5"}, {"letra": "C", "texto": "100"}], "correta": "A", "dica": "São três dezenas.", "explicacao": "Correto. O exame teórico tem 30 questões."},
                    {"numero": 2, "enunciado": "Qual é o mínimo de acertos para aprovação?", "alternativas": [{"letra": "A", "texto": "20"}, {"letra": "B", "texto": "1"}, {"letra": "C", "texto": "30 obrigatoriamente"}], "correta": "A", "dica": "É dois terços de 30.", "explicacao": "Isso. O mínimo é 20 acertos."},
                    {"numero": 3, "enunciado": "No Educa+, ao errar durante o modo Aprender, o que acontece?", "alternativas": [{"letra": "A", "texto": "Você recebe dica e pode tentar novamente"}, {"letra": "B", "texto": "A aula fecha"}, {"letra": "C", "texto": "Você é reprovado"}], "correta": "A", "dica": "O treino foi feito para aprender sem medo.", "explicacao": "Perfeito. Aqui o erro vira uma nova explicação."},
                ],
            },
            {
                "slug": "detran-teorica-acessivel-placas-e-sinalizacao",
                "trilha_slug": "detran-teorica-acessivel",
                "indice": 2,
                "titulo": "Placas e sinalização: aprender pelo significado",
                "resumo": "Treine placas comuns e o comportamento seguro associado a elas.",
                "nivel": "Iniciante",
                "duracao": "10 minutos",
                "passos": [
                    {"numero": 1, "instrucao": "Associe a placa PARE à ação de parar.", "narracao": "A placa PARE exige parada. Mais importante que decorar o nome é entender a ação segura.", "dica": "PARE significa interromper o movimento antes de seguir com segurança.", "tela_html": '<div class="moldura computador"><div class="barra"><span class="tit">Sinalização</span></div><div class="tela janela"><div class="item botao alvo"><span class="rot">PARE — parar</span><span class="mao">👆</span><span class="balao">Ação correta</span></div><div class="item botao"><span class="rot">PARE — acelerar</span></div></div></div>', "tipo": "computador"},
                    {"numero": 2, "instrucao": "Observe a velocidade máxima indicada.", "narracao": "Quando há placa de velocidade máxima, o condutor deve respeitar o limite indicado e as condições da via.", "dica": "A placa informa um limite, não uma velocidade que você é obrigado a atingir.", "tela_html": '<div class="moldura computador"><div class="barra"><span class="tit">Velocidade</span></div><div class="tela janela"><div class="item campo"><span class="rot">Velocidade máxima: 40 km/h</span></div><div class="item botao alvo"><span class="rot">Respeitar o limite</span><span class="mao">👆</span><span class="balao">Segurança</span></div></div></div>', "tipo": "computador"},
                ],
                "atividades": [
                    {"numero": 1, "enunciado": "Ao encontrar uma placa PARE, qual atitude corresponde ao significado?", "alternativas": [{"letra": "A", "texto": "Parar antes de prosseguir com segurança"}, {"letra": "B", "texto": "Acelerar"}, {"letra": "C", "texto": "Ignorar"}], "correta": "A", "dica": "O próprio nome da placa indica a ação.", "explicacao": "Correto. PARE exige parada antes de prosseguir com segurança."},
                    {"numero": 2, "enunciado": "Uma placa indica velocidade máxima de 40 km/h. Isso quer dizer:", "alternativas": [{"letra": "A", "texto": "Não ultrapassar 40 km/h e dirigir conforme as condições da via"}, {"letra": "B", "texto": "Sempre dirigir exatamente a 40"}, {"letra": "C", "texto": "Acelerar acima de 40"}], "correta": "A", "dica": "Máxima é um limite superior.", "explicacao": "Isso. O limite deve ser respeitado e a velocidade também deve ser segura para a situação."},
                    {"numero": 3, "enunciado": "Durante o treino, você não lembra uma placa. O que pode fazer?", "alternativas": [{"letra": "A", "texto": "Ouvir a pergunta e pedir uma dica"}, {"letra": "B", "texto": "Chutar sempre"}, {"letra": "C", "texto": "Fechar a aula"}], "correta": "A", "dica": "O treino foi criado para explicar quantas vezes precisar.", "explicacao": "Muito bem. Use as dicas para aprender o significado."},
                ],
            },
            {
                "slug": "detran-teorica-acessivel-treino-seguranca",
                "trilha_slug": "detran-teorica-acessivel",
                "indice": 3,
                "titulo": "Treino teórico: decisões seguras",
                "resumo": "Pratique questões sobre comportamento seguro no trânsito com áudio e dicas.",
                "nivel": "Iniciante",
                "duracao": "10 minutos",
                "passos": [
                    {"numero": 1, "instrucao": "Leia a situação antes das alternativas.", "narracao": "Não tenha pressa. Primeiro entenda o que aconteceu. Depois compare as respostas.", "dica": "Você pode ouvir a pergunta mais de uma vez.", "tela_html": '<div class="moldura computador"><div class="barra"><span class="tit">Questão de treino</span></div><div class="tela janela"><div class="item campo"><span class="rot">Leia a situação</span></div><div class="item botao alvo"><span class="rot">Ouvir novamente</span><span class="mao">👆</span><span class="balao">Repita se precisar</span></div></div></div>', "tipo": "computador"},
                    {"numero": 2, "instrucao": "Procure a alternativa que reduz o risco.", "narracao": "Em muitas situações, direção segura envolve atenção, distância, redução de velocidade e respeito à sinalização.", "dica": "Desconfie de alternativas que incentivam pressa ou agressividade.", "tela_html": '<div class="moldura computador"><div class="barra"><span class="tit">Escolha segura</span></div><div class="tela janela"><div class="item botao alvo"><span class="rot">Reduzir o risco</span><span class="mao">👆</span><span class="balao">Pense em segurança</span></div><div class="item botao"><span class="rot">Aumentar a pressa</span></div></div></div>', "tipo": "computador"},
                ],
                "atividades": [
                    {"numero": 1, "enunciado": "Em chuva forte, qual atitude tende a ser mais segura?", "alternativas": [{"letra": "A", "texto": "Reduzir a velocidade e aumentar a atenção"}, {"letra": "B", "texto": "Acelerar para sair logo da chuva"}, {"letra": "C", "texto": "Dirigir olhando o celular"}], "correta": "A", "dica": "Chuva reduz visibilidade e aderência.", "explicacao": "Correto. Reduzir a velocidade e aumentar a atenção ajuda a lidar com a condição adversa."},
                    {"numero": 2, "enunciado": "Ao dirigir, chega uma mensagem no celular. Qual escolha é mais segura?", "alternativas": [{"letra": "A", "texto": "Não manusear o celular enquanto dirige"}, {"letra": "B", "texto": "Responder dirigindo"}, {"letra": "C", "texto": "Ler rapidamente"}], "correta": "A", "dica": "Tirar a atenção da via aumenta o risco.", "explicacao": "Isso. O celular não deve disputar sua atenção durante a condução."},
                    {"numero": 3, "enunciado": "Você não entendeu a pergunta de treino. O que fazer?", "alternativas": [{"letra": "A", "texto": "Ouvir novamente e pedir uma dica"}, {"letra": "B", "texto": "Desistir"}, {"letra": "C", "texto": "Escolher qualquer resposta sem ler"}], "correta": "A", "dica": "Aprender exige poder repetir.", "explicacao": "Perfeito. Repetir e pedir ajuda faz parte do estudo."},
                ],
            },
        ],
        "total_atividades": 9,
    },
]

TRILHAS.extend(NOVAS_TRILHAS)

# Três grandes áreas da página Estudos. Cada trilha possui uma área principal para
# facilitar a navegação sem impedir que segurança apareça também dentro de outras aulas.
AREAS_ESTUDO = [
    {
        "slug": "aprender-usar",
        "nome": "Aprenda a usar",
        "descricao": "Celular, digitação, WhatsApp, internet, fotos e ferramentas do dia a dia, passo a passo.",
        "chamada": "Aprender fazendo, no seu ritmo",
        "icone_img": "img/icones/phone.png",
        "trilhas": [
            "digitacao-sem-medo", "celular-sem-medo", "whatsapp-para-idosos",
            "fotos-e-lembrancas", "chamadas-e-contatos", "informatica-basica",
            "celular-no-dia-a-dia", "comunicacao-online",
        ],
    },
    {
        "slug": "proteger-se",
        "nome": "Proteja-se de golpes",
        "descricao": "PIX, boletos, mensagens, códigos, contas invadidas e golpes digitais: pratique antes de enfrentar uma situação real.",
        "chamada": "Pare, confira e confirme",
        "icone_img": "img/icones/security.png",
        "trilhas": [
            "seguranca-na-pratica", "golpes-e-senhas", "pix-com-seguranca",
            "internet-e-seguranca", "compras-e-remedios",
        ],
    },
    {
        "slug": "contas-servicos",
        "nome": "Contas e serviços",
        "descricao": "GOV.BR, redes sociais, INSS, saúde, mapas e trânsito com orientação simples e atividades guiadas.",
        "chamada": "Mais autonomia nos serviços digitais",
        "icone_img": "img/icones/simulador/govbr.svg",
        "trilhas": [
            "govbr-na-pratica", "redes-sociais-seguras", "internet-e-servicos",
            "saude-transporte-e-ia", "detran-teorica-acessivel",
        ],
    },
]

AREA_POR_SLUG = {area["slug"]: area for area in AREAS_ESTUDO}
AREA_POR_TRILHA = {
    trilha_slug: area["slug"]
    for area in AREAS_ESTUDO
    for trilha_slug in area["trilhas"]
}

for _trilha_area in TRILHAS:
    _trilha_area["area_slug"] = AREA_POR_TRILHA.get(_trilha_area["slug"], "aprender-usar")
    _trilha_area["area_nome"] = AREA_POR_SLUG[_trilha_area["area_slug"]]["nome"]
    _trilha_area["aulas"] = len(_trilha_area.get("aulas_lista", []))
    _trilha_area["total_atividades"] = sum(len(a.get("atividades", [])) for a in _trilha_area.get("aulas_lista", []))

ICONES_TRILHAS = {
    "digitacao-sem-medo": "img/icones/phone.png",
    "seguranca-na-pratica": "img/icones/security.png",
    "govbr-na-pratica": "img/icones/simulador/govbr.svg",
    "redes-sociais-seguras": "img/icones/simulador/instagram.svg",
    "detran-teorica-acessivel": "img/icones/lesson.png",
    "celular-sem-medo": "img/icones/phone.png",
    "whatsapp-para-idosos": "img/icones/simulador/whatsapp.svg",
    "golpes-e-senhas": "img/icones/security.png",
    "pix-com-seguranca": "img/icones/simulador/pix.svg",
    "internet-e-servicos": "img/icones/simulador/chrome.svg",
    "saude-transporte-e-ia": "img/icones/ai.png",
    "fotos-e-lembrancas": "img/icones/simulador/photos.svg",
    "compras-e-remedios": "img/icones/security.png",
    "chamadas-e-contatos": "img/icones/simulador/phone.svg",
    "informatica-basica": "img/icones/lesson.png",
    "celular-no-dia-a-dia": "img/icones/phone.png",
    "internet-e-seguranca": "img/icones/security.png",
    "comunicacao-online": "img/icones/simulador/messages.svg",
}

for _trilha in TRILHAS:
    _trilha["icone_img"] = ICONES_TRILHAS.get(_trilha["slug"], "img/icones/lesson.png")

TODAS_AULAS = {
    aula["slug"]: aula
    for trilha in TRILHAS
    for aula in trilha["aulas_lista"]
}

TRILHAS_POR_SLUG = {trilha["slug"]: trilha for trilha in TRILHAS}

def buscar_area(slug):
    return AREA_POR_SLUG.get(slug)

def trilhas_da_area(slug):
    area = buscar_area(slug)
    if not area:
        return []
    return [TRILHAS_POR_SLUG[trilha_slug] for trilha_slug in area["trilhas"] if trilha_slug in TRILHAS_POR_SLUG]

def buscar_trilha(slug):
    return TRILHAS_POR_SLUG.get(slug)

def buscar_aula(slug):
    return TODAS_AULAS.get(slug)

def localizar_aula(aula_slug):
    aula = buscar_aula(aula_slug)
    if not aula:
        return None, None
    trilha = buscar_trilha(aula["trilha_slug"])
    return trilha, aula

def primeira_aula():
    return TRILHAS[0]["aulas_lista"][0]

def proxima_aula(aula_slug):
    ordem = [a["slug"] for t in TRILHAS for a in t["aulas_lista"]]
    try:
        i = ordem.index(aula_slug)
    except ValueError:
        return None
    if i + 1 >= len(ordem):
        return None
    return TODAS_AULAS[ordem[i + 1]]

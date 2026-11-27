// V112.92 · Histórias fictícias de prevenção. Cada escolha insegura tem uma orientação própria.
window.EducaGuidedPrevention = [
  {
    code: "guided-suporte-remoto", topic: "security", chapter: "seg-falsa-central", group: "Contas e aparelho",
    title: "Falso suporte remoto", summary: "Interrompa um pedido para controlar seu aparelho.",
    story: "Ao navegar, aparece um aviso de que seu computador está em risco. A página recomenda ligar para um atendente, que oferece acesso remoto para corrigir o problema.",
    channel: "AVISO NO NAVEGADOR", evidence: "O alerta surgiu em uma página aberta e pede a instalação de um programa fora do canal de suporte que você conhece.",
    choices: [["Fechar a página e procurar suporte por conta própria"], ["Dar acesso ao atendente", "O acesso remoto pode dar controle do aparelho. Feche a página e procure o suporte que você já conhece."], ["Ditar a senha para ganhar tempo", "Senhas são pessoais. Use o suporte oficial sem revelar sua senha."]],
    signs: ["O aviso usa medo e pressa.", "O contato veio da própria página alarmista.", "O atendente quer controlar seu aparelho."],
    takeaway: "Feche a página e consulte o suporte oficial por um canal que você já conhece. Se chegou a dar acesso, encerre a sessão remota e procure suporte confiável."
  },
  {
    code: "guided-qr-publico", topic: "security", chapter: "seg-link-falso", group: "Contas e aparelho",
    title: "QR code que pede seus dados", summary: "Reconheça quando o endereço aberto pede informações demais.",
    story: "Você lê um QR code numa mesa para ver o cardápio. Em vez do menu, a página pede CPF, senha e dados do cartão.",
    channel: "PÁGINA SIMULADA", evidence: "Há um adesivo sobre o código da mesa, e a página que abriu exige dados para continuar.",
    choices: [["Preencher só o CPF", "Um cardápio não precisa do seu CPF. Feche a página e confirme o código com alguém do estabelecimento."], ["Fechar a página e pedir o cardápio no balcão"], ["Confiar porque o código estava na mesa", "Um adesivo pode trocar o destino do QR code. Confirme diretamente com o estabelecimento."]],
    signs: ["Há um adesivo diferente sobre o código.", "O cardápio não aparece.", "A página pede dados sem relação com a consulta."],
    takeaway: "Confira o destino do QR code e peça ao estabelecimento que confirme o endereço ou ofereça outro cardápio."
  },
  {
    code: "guided-celular-levado", topic: "security", chapter: "seg-falsa-central", group: "Contas e aparelho",
    title: "Levaram meu celular", summary: "Proteja as contas sem esperar novas movimentações.",
    story: "Seu celular foi furtado. Você consegue usar um aparelho de confiança e precisa agir antes que alguém acesse suas contas.",
    channel: "SITUAÇÃO DE TREINO", evidence: "Seu banco, e-mail e aplicativos de mensagens estavam ligados ao aparelho.",
    choices: [["Esperar aparecer uma compra", "Mesmo sem compra visível, o aparelho pode dar acesso às contas. Comece pelos canais oficiais e pelo bloqueio."], ["Usar um aparelho confiável para avisar banco e operadora e bloquear acessos"], ["Procurar ajuda num anúncio de recuperação", "Busque os canais oficiais. Serviços de recuperação anunciados podem pedir informações da sua conta."]],
    signs: ["O aparelho perdido tem contas conectadas.", "O número do chip pode receber códigos.", "Um novo alerta de acesso precisa ser tratado com rapidez."],
    takeaway: "Avise o banco e a operadora, bloqueie o aparelho pelo recurso oficial e revise os acessos de suas contas. Use o Celular Seguro se tiver acesso ao serviço e registre ocorrência."
  },
  {
    code: "guided-conta-em-meu-nome", topic: "security", chapter: "seg-codigos", group: "Contas e aparelho",
    title: "Conta aberta no meu nome", summary: "Confira um vínculo bancário que você não reconhece.",
    story: "Ao consultar seus relacionamentos bancários no Registrato, você encontra uma instituição onde nunca pediu para abrir conta.",
    channel: "RELATÓRIO SIMULADO", evidence: "Há um vínculo que você não reconhece. Um perfil em rede social oferece retirar o registro em troca de documento e taxa.",
    choices: [["Confirmar e contestar com a instituição pelo canal oficial"], ["Mandar meus documentos ao perfil que ofereceu ajuda", "Um perfil desconhecido pode usar seus documentos novamente. Contate a instituição que consta no relatório."], ["Pagar para apagar o vínculo", "A taxa não resolve a contestação. Fale diretamente com a instituição indicada."]],
    signs: ["O vínculo aparece numa instituição desconhecida.", "Um intermediário pede seus documentos.", "Há promessa de remover o vínculo por taxa."],
    takeaway: "Confira o relatório no Registrato e conteste o vínculo com a instituição responsável. Se houver fraude, guarde os protocolos e registre ocorrência."
  },
  {
    code: "guided-vaga-falsa", topic: "security", chapter: "seg-link-falso", group: "Emprego e renda",
    title: "Vaga com taxa antecipada", summary: "Confira a vaga e o recrutador antes de pagar ou enviar documentos.",
    story: "Você recebe uma mensagem dizendo que passou para uma vaga que não lembra de ter solicitado. Para garantir a contratação, pedem pagamento imediato por um curso.",
    channel: "MENSAGEM SIMULADA", evidence: "O anúncio usa a marca de uma empresa conhecida, mas o contato não aparece na página oficial de carreiras.",
    choices: [["Consultar a vaga na página oficial da empresa"], ["Pagar o curso para liberar a vaga", "Cobrar antes da contratação é sinal de alerta. Verifique a vaga e o recrutador por conta própria."], ["Mandar documento ao contato para confirmar", "Confirme a identidade do recrutador antes de compartilhar qualquer documento."]],
    signs: ["A vaga chega sem um processo seletivo verificável.", "A contratação depende de pagamento antecipado.", "O contato pressiona para decidir na hora."],
    takeaway: "Consulte a vaga e o recrutador por canais da própria empresa. Desconfie de cobrança para garantir contratação."
  },
  {
    code: "guided-tarefa-paga", topic: "security", chapter: "seg-link-falso", group: "Emprego e renda",
    title: "Tarefas que cobram para pagar", summary: "Identifique quando a promessa de renda vira pedido de depósito.",
    story: "Um grupo oferece pagamentos por pequenas tarefas na internet. Depois das primeiras atividades, diz que você precisa depositar para sacar o saldo.",
    channel: "GRUPO SIMULADO", evidence: "O saldo aparece só na conversa, e o saque depende de um valor novo.",
    choices: [["Depositar uma vez para testar", "O depósito pode virar a primeira de várias cobranças. Saia do grupo e guarde a conversa."], ["Parar e sair sem depositar"], ["Confiar nas imagens de outros participantes", "Imagens e depoimentos do próprio grupo não confirmam o pagamento. Não faça novos envios."]],
    signs: ["Ganhos fáceis vêm com pedido de adiantamento.", "A regra muda na hora de sacar.", "A única prova vem do mesmo grupo."],
    takeaway: "Interrompa o contato quando pedirem dinheiro para liberar pagamento. Se já transferiu, procure seu banco pelo aplicativo oficial."
  },
  {
    code: "guided-investimento-falso", topic: "security", chapter: "seg-link-falso", group: "Emprego e renda",
    title: "Investimento com lucro garantido", summary: "Reconheça promessas que acompanham falsas corretoras e pirâmides.",
    story: "Você vê uma oferta de investimento com lucro alto e garantido em poucos dias. O grupo ainda promete bônus se você convidar outras pessoas.",
    channel: "ANÚNCIO SIMULADO", evidence: "A empresa não tem cadastro apresentado de forma verificável. O único meio de seguir é pagar conforme indica o grupo.",
    choices: [["Conferir a oferta e os registros nos canais oficiais antes de investir"], ["Testar porque o lucro foi garantido", "Promessa de retorno alto e garantido merece desconfiança. Verifique se a oferta e o intermediário são legítimos."], ["Indicar familiares para ganhar o bônus", "Recrutar pessoas para sustentar retornos pode ser sinal de pirâmide. Não repasse a oferta."]],
    signs: ["Há promessa de retorno alto e rápido.", "O grupo trata o risco como inexistente.", "Os ganhos dependem de trazer novos participantes."],
    takeaway: "Consulte os alertas e registros da CVM pelo canal oficial quando se tratar de investimento sob sua supervisão. Se a oferta não puder ser confirmada, não transfira."
  },
  {
    code: "guided-anuncio-loja-falsa", topic: "security", chapter: "seg-link-falso", group: "Compras e anúncios",
    title: "Anúncio de loja falsa", summary: "Vá ao site que você conhece antes de comprar uma oferta.",
    story: "Uma promoção patrocinada oferece um celular pela metade do preço. A página aberta imita uma loja conhecida e só aceita pagamento imediato.",
    channel: "ANÚNCIO SIMULADO", evidence: "O endereço não é o que você usa para comprar nessa loja. A promoção não aparece no app oficial.",
    choices: [["Pagar antes que a oferta acabe", "Pressa e preço muito baixo merecem atenção. Consulte a oferta dentro do app oficial."], ["Abrir o app oficial e procurar o produto"], ["Confiar porque aparece como patrocinado", "Uma plataforma pode exibir anúncios falsos. Confira o endereço e a oferta por outra fonte."]],
    signs: ["O preço é muito abaixo do normal.", "O endereço é diferente do conhecido.", "O desconto existe só na página do anúncio."],
    takeaway: "Entre na loja pelo endereço que você já conhece e procure o produto. Confira quem vende e quem recebe antes de pagar."
  },
  {
    code: "guided-aluguel-falso", topic: "security", chapter: "seg-link-falso", group: "Compras e anúncios",
    title: "Aluguel de imóvel falso", summary: "Verifique o imóvel e o responsável antes de depositar.",
    story: "Você encontra uma casa para alugar mais barata que as demais. O anunciante pede um sinal antes de permitir a visita.",
    channel: "ANÚNCIO SIMULADO", evidence: "As fotos são bonitas, mas o responsável não comprova a ligação com o imóvel nem confirma uma visita.",
    choices: [["Fazer um sinal pequeno para reservar", "Mesmo um adiantamento pequeno pode ser perdido. Confirme se o imóvel e o responsável são legítimos."], ["Verificar o responsável e o imóvel antes de pagar"], ["Confiar nas fotos do anúncio", "Fotos podem ter vindo de outro anúncio. Peça uma visita por um canal verificável."]],
    signs: ["Pedem dinheiro antes da verificação.", "Há recusa ou dificuldade para permitir visita.", "A identidade do responsável não é confirmada."],
    takeaway: "Confira se o imóvel existe, verifique quem está autorizado a alugá-lo e leia o contrato antes de pagar."
  },
  {
    code: "guided-leilao-falso", topic: "security", chapter: "seg-link-falso", group: "Compras e anúncios",
    title: "Leilão de veículo falso", summary: "Confira quem organiza o leilão e de quem é a conta.",
    story: "Um site anuncia um leilão com carros baratos. A pessoa que atende pelo chat pede um pagamento para reservar o direito de dar lance.",
    channel: "ANÚNCIO SIMULADO", evidence: "Não há edital encontrado por fonte independente, e o pagamento aparece em nome inesperado.",
    choices: [["Procurar o edital e confirmar o leiloeiro antes de pagar"], ["Pagar para não perder o lote", "Confirme a existência do evento e o responsável. A urgência não torna o leilão legítimo."], ["Confiar no selo do site", "Selos e marcas podem ser copiados. Consulte do lado de fora do site anunciado."]],
    signs: ["Ofertas muito abaixo do mercado.", "Edital e organizador sem confirmação independente.", "Cobrança antecipada para uma conta inesperada."],
    takeaway: "Procure o leilão por um canal oficial e verifique o leiloeiro na Junta Comercial competente. Compare o recebedor com o edital antes de qualquer pagamento."
  },
  {
    code: "guided-premio-falso", topic: "security", chapter: "seg-link-falso", group: "Compras e anúncios",
    title: "Prêmio que cobra taxa", summary: "Cheque promoções que você não lembra de ter disputado.",
    story: "Uma mensagem diz que você ganhou um prêmio num sorteio. Antes de entregar, o contato pede uma taxa de transporte e uma foto do documento.",
    channel: "MENSAGEM SIMULADA", evidence: "Você não lembra de se inscrever, e só há notícia do prêmio na mensagem recebida.",
    choices: [["Verificar a promoção no canal oficial antes de responder"], ["Pagar a taxa para receber", "A cobrança inesperada pode ser o próprio golpe. Procure o regulamento da promoção por conta própria."], ["Mandar o documento para conferir", "Compartilhar documento com um desconhecido pode expor seus dados. Confirme quem organiza a promoção."]],
    signs: ["O prêmio chegou de surpresa.", "O contato pede dinheiro para liberar o prêmio.", "Os documentos são pedidos antes de confirmação oficial."],
    takeaway: "Consulte o regulamento e o organizador por um contato oficial. Se não encontrar a promoção, encerre a conversa."
  },
  {
    code: "guided-boleto-falso", topic: "pix", chapter: "pix-seguranca", group: "Conferir pagamentos",
    title: "Boleto falso de uma conta", summary: "Compare o beneficiário e obtenha a segunda via oficial.",
    story: "Chega um boleto de energia com aparência familiar. Na tela de confirmação do banco, o nome de quem recebe é diferente do que você esperava.",
    channel: "BANCO SIMULADO", evidence: "A tela mostra valor familiar, mas um recebedor diferente. O boleto veio de uma mensagem inesperada.",
    choices: [["Parar e gerar a segunda via pelo app da empresa"], ["Pagar porque o valor parece correto", "O valor pode ser copiado de uma conta real. Confira o beneficiário no banco e use a segunda via oficial."], ["Pagar porque o boleto tem o logo", "O logo pode ser copiado. O nome exibido pelo banco ajuda a verificar quem vai receber."]],
    signs: ["O boleto veio por um contato inesperado.", "O recebedor diverge da cobrança esperada.", "A aparência do documento é a única confirmação."],
    takeaway: "Obtenha a segunda via no canal oficial e confira o beneficiário e o valor na tela do banco antes de pagar."
  },
  {
    code: "guided-pix-qr-trocado", topic: "pix", chapter: "pix-seguranca", group: "Conferir pagamentos",
    title: "QR code Pix trocado", summary: "Confira a quem pertence o Pix antes de confirmar.",
    story: "No caixa de uma loja, você lê o QR code Pix exposto no balcão. O nome de quem recebe no seu banco não corresponde à compra.",
    channel: "BANCO SIMULADO", evidence: "O QR code carregou um Pix. O nome apresentado pelo banco é diferente do indicado pela loja.",
    choices: [["Confirmar para liberar a fila", "Interrompa o pagamento. Conferir o nome protege você mesmo quando há pressa."], ["Pedir outro código no caixa e conferir o recebedor"], ["Pagar porque o código estava no balcão", "Um código exposto pode ter sido trocado. Confirme com a pessoa responsável pelo caixa."]],
    signs: ["O recebedor é diferente do esperado.", "O código estava exposto ao público.", "A pressa pode fazer você pular a conferência."],
    takeaway: "Antes de confirmar, verifique o nome de quem recebe e o valor. Se houver diferença, cancele e peça um código confirmado pela loja."
  },
  {
    code: "guided-comprovante-falso", topic: "pix", chapter: "pix-seguranca", group: "Conferir pagamentos",
    title: "Comprovante de Pix falso", summary: "Confirme o dinheiro no extrato antes de entregar uma venda.",
    story: "Você vende um aparelho usado. O comprador mostra uma imagem de comprovante e quer levar o produto. Seu extrato ainda não mostra o recebimento.",
    channel: "COMPROVANTE SIMULADO", evidence: "A imagem pode ser de um agendamento ou de outro pagamento. O valor não apareceu no extrato.",
    choices: [["Entregar porque vi o comprovante", "Uma imagem não confirma que você recebeu. Confira o crédito no app do seu banco."], ["Conferir no extrato e aguardar o crédito"], ["Confiar porque a imagem diz agendado", "Um agendamento não é um pagamento já concluído. Confira o crédito antes de entregar."]],
    signs: ["O pagamento é mostrado só numa imagem.", "O comprador pressiona pela entrega.", "O crédito não está no extrato."],
    takeaway: "Entregue o produto depois de confirmar o dinheiro recebido no extrato da sua conta."
  },
  {
    code: "guided-emprestimo-taxa", topic: "pix", chapter: "pix-seguranca", group: "Cobranças e cartões",
    title: "Empréstimo com taxa adiantada", summary: "Identifique uma cobrança falsa para liberar crédito.",
    story: "Uma oferta promete crédito mesmo para quem está com dívidas. Para receber, pedem um Pix antecipado para pagar uma taxa.",
    channel: "OFERTA SIMULADA", evidence: "A proposta veio de um contato desconhecido. Diz que a taxa precisa ser paga antes de liberar o dinheiro.",
    choices: [["Verificar a instituição e recusar o Pix antecipado"], ["Pagar a taxa porque depois recebo mais", "A taxa antecipada é um sinal clássico de fraude. Confirme a instituição e a proposta pelo canal oficial."], ["Pedir que o contato mande mais comprovantes", "Comprovantes do mesmo contato não confirmam a oferta. Procure a instituição por conta própria."]],
    signs: ["Pedem dinheiro antes de conceder o crédito.", "O contato promete um empréstimo fácil e imediato.", "A conta indicada não foi confirmada pela instituição."],
    takeaway: "Consulte as instituições autorizadas no Banco Central e procure o canal oficial. Recuse transferência antecipada para liberar empréstimo."
  },
  {
    code: "guided-cartao-compra", topic: "pix", chapter: "pix-seguranca", group: "Cobranças e cartões",
    title: "Compra desconhecida no cartão", summary: "Faça a contestação pelo canal oficial do banco.",
    story: "Chega um SMS sobre uma compra que você não reconhece, com um número para ligar. Ao abrir o app oficial do seu banco, você vê uma movimentação que não fez.",
    channel: "FATURA SIMULADA", evidence: "A compra existe no extrato, mas o contato para cancelar veio de um SMS inesperado.",
    choices: [["Ligar para o telefone do SMS", "Use os contatos do aplicativo ou do seu cartão. O número do SMS pode ser de uma falsa central."], ["Usar o app do banco para bloquear e contestar a compra"], ["Esperar o fechamento da fatura", "Comunique a compra ao banco quanto antes para proteger seu cartão e contestar a cobrança."]],
    signs: ["A compra é desconhecida.", "O SMS tenta direcionar para um contato próprio.", "A confirmação segura está no aplicativo do banco."],
    takeaway: "Bloqueie o cartão se houver risco e conteste imediatamente a compra pelos canais do banco. Guarde o protocolo e acompanhe o caso."
  },
  {
    code: "guided-falso-motoboy", topic: "pix", chapter: "pix-seguranca", group: "Cobranças e cartões",
    title: "Falso motoboy do banco", summary: "Proteja cartão, senha e dados diante de uma suposta coleta.",
    story: "Alguém liga dizendo que houve fraude e que um motoboy vai buscar seu cartão. A pessoa pede que você confirme a senha.",
    channel: "LIGAÇÃO SIMULADA", evidence: "A chamada veio de um número que você não reconhece. A coleta do cartão foi proposta durante essa ligação.",
    choices: [["Entregar o cartão porque ele já está bloqueado", "O cartão continua sendo um dado sensível. Confirme com seu banco pelo canal oficial."], ["Desligar, guardar o cartão e contatar o banco diretamente"], ["Confirmar só parte da senha", "Mesmo parte da senha é informação pessoal. Proteja o cartão e procure o banco."]],
    signs: ["A pessoa pede a senha do cartão.", "O contato oferece buscar o cartão em casa.", "A ligação tenta impedir que você confirme com o banco."],
    takeaway: "Interrompa a ligação e fale com seu banco pelo app ou número oficial. Guarde o cartão e use o bloqueio disponível no aplicativo se necessário."
  },
  {
    code: "guided-pix-apos-golpe", topic: "pix", chapter: "pix-seguranca", group: "Depois de um golpe",
    title: "Já fiz um Pix no golpe. E agora?", summary: "Aja rápido para contestar e guardar as provas.",
    story: "Depois de enviar um Pix, você confirma que o contato que pediu dinheiro era falso. Um perfil desconhecido promete recuperar tudo se você pagar outra taxa.",
    channel: "SITUAÇÃO DE TREINO", evidence: "Você tem o comprovante e a conversa. A promessa de recuperar o dinheiro veio de fora do seu banco.",
    choices: [["Contatar meu banco agora e pedir a contestação do Pix"], ["Pagar o perfil que promete recuperar tudo", "Use seu banco. Uma promessa de devolução garantida por taxa pode ser outro golpe."], ["Apagar a conversa antes de falar com alguém", "A conversa e o comprovante podem ajudar na análise. Guarde esse material e procure o banco logo."]],
    signs: ["O Pix foi enviado após uma fraude.", "Um terceiro pede dinheiro para recuperar o valor.", "Comprovante e conversa ajudam a comprovar o ocorrido."],
    takeaway: "Procure seu banco rapidamente e peça a contestação pelo MED, quando aplicável. Guarde o comprovante e as mensagens e registre ocorrência. A devolução depende da análise e da disponibilidade de saldo."
  },
  {
    code: "guided-whatsapp-conta-invadida", topic: "whatsapp", chapter: "wa-codigo", group: "Contas e mensagens",
    title: "Pedido vindo de uma conta invadida", summary: "Confirme o pedido mesmo quando vem de um contato salvo.",
    story: "Da conversa habitual de uma amiga, chega um pedido de dinheiro que ela nunca fez antes. O texto tem um jeito diferente do que você está acostumado.",
    channel: "CONVERSA SIMULADA", evidence: "O nome e a foto são iguais aos de sempre. A conta pode estar sendo usada por outra pessoa.",
    choices: [["Pagar porque é o número salvo", "Uma conta pode ser invadida. Confirme a identidade por outro canal antes de pagar."], ["Falar com minha amiga por um canal que ela já usa, fora dessa conversa"], ["Pedir um endereço de Pix na mesma conversa", "A pessoa que escreveu continuaria controlando a resposta. Confirme com sua amiga por um canal independente."]],
    signs: ["O pedido é fora do costume.", "O tom mudou e há urgência.", "Nome, foto e número não garantem quem está com a conta."],
    takeaway: "Confirme por telefone, pessoalmente ou por outro canal que sua amiga já usa. Se a conta estiver invadida, avise a dona do perfil por outro meio."
  },
  {
    code: "guided-whatsapp-arquivo-falso", topic: "whatsapp", chapter: "wa-mensagens", group: "Contas e mensagens",
    title: "Arquivo que finge ser uma fatura", summary: "Confira anexos inesperados antes de instalar algo.",
    story: "Um contato desconhecido envia uma suposta fatura pelo WhatsApp. Ao tocar no anexo de treino, aparece um pedido para instalar um aplicativo.",
    channel: "ANEXO SIMULADO", evidence: "Aparece um pedido de instalação, embora você só esperasse ler um documento.",
    choices: [["Fechar sem instalar e consultar a fatura no app oficial"], ["Instalar para abrir a fatura", "Uma fatura não exige instalar um aplicativo enviado por mensagem. Busque o documento pelo canal oficial."], ["Encaminhar o arquivo a familiares", "Encaminhar pode espalhar o risco. Avise sem repassar o anexo."]],
    signs: ["A cobrança veio de um número desconhecido.", "Um suposto documento pede instalação.", "A fatura pode ser conferida por um canal independente."],
    takeaway: "Evite abrir anexos inesperados ou instalar aplicativos enviados por mensagem. Consulte a fatura no serviço oficial."
  },
  {
    code: "guided-whatsapp-tela", topic: "whatsapp", chapter: "wa-chamadas", group: "Contas e mensagens",
    title: "Pediram para compartilhar minha tela", summary: "Proteja códigos e dados durante uma chamada.",
    story: "Numa chamada, uma pessoa diz que está prestando suporte e pede para ver sua tela enquanto você abre o banco e os SMS.",
    channel: "CHAMADA SIMULADA", evidence: "A pessoa quer acompanhar a tela de confirmação e pede que você abra aplicativos com informações privadas.",
    choices: [["Compartilhar só por alguns segundos", "Mesmo por pouco tempo, SMS e dados podem ficar visíveis. Encerre a chamada e procure o suporte oficial."], ["Encerrar a chamada e procurar o suporte oficial"], ["Ler o código para evitar mostrar a tela", "O código também é pessoal quando lido em voz alta. Mantenha-o com você."]],
    signs: ["A solicitação de suporte não veio do canal que você abriu.", "A pessoa quer ver códigos e informações privadas.", "Há pressão para compartilhar sem parar para conferir."],
    takeaway: "Encerre pedidos de compartilhamento que exponham contas, códigos ou senhas. Confirme o atendimento por um canal oficial que você procurou."
  },
  {
    code: "guided-whatsapp-falso-comprador", topic: "whatsapp", chapter: "wa-conversas", group: "Compras e cobranças",
    title: "Comprador falso no marketplace", summary: "Confira a venda na plataforma antes de entregar.",
    story: "Uma pessoa interessada na sua venda leva a conversa para o WhatsApp. Um suposto suporte diz que você deve pagar uma taxa para liberar o dinheiro da venda.",
    channel: "CONVERSA SIMULADA", evidence: "Na conta da plataforma, a venda ainda não está confirmada. A taxa foi pedida só pelo WhatsApp.",
    choices: [["Verificar a venda e o pagamento dentro da plataforma"], ["Pagar a taxa para receber o saldo", "A taxa foi pedida fora da plataforma. Consulte seu painel de vendas e o suporte oficial."], ["Entregar porque o comprador enviou uma imagem", "Uma imagem não prova que a plataforma recebeu nem liberou o pagamento. Confira no seu painel."]],
    signs: ["O contato tenta tirar a negociação da plataforma.", "A confirmação só aparece como imagem ou mensagem.", "Pedem taxa para liberar dinheiro."],
    takeaway: "Confirme a venda, o envio e o pagamento no painel da própria plataforma. Use o suporte acessado por dentro do app."
  },
  {
    code: "guided-whatsapp-advogado", topic: "whatsapp", chapter: "wa-conversas", group: "Compras e cobranças",
    title: "Falso advogado no WhatsApp", summary: "Confira pagamentos ligados a um processo judicial.",
    story: "Um número novo usa a foto do seu advogado e afirma que o dinheiro de um processo foi liberado. Para receber, pede um Pix antes.",
    channel: "CONVERSA SIMULADA", evidence: "A pessoa sabe detalhes do processo, mas o pedido de dinheiro veio de um número que você nunca usou para falar com o escritório.",
    choices: [["Pagar porque a pessoa conhece o processo", "Detalhes do processo não provam a identidade. Confirme com seu advogado pelo contato que já possui."], ["Confirmar com o escritório pelo número antigo ou pessoalmente"], ["Mandar meus dados bancários para adiantar", "Espere confirmar com seu advogado. Não adiante dados por um número desconhecido."]],
    signs: ["A mensagem vem de um contato novo.", "O recebimento depende de uma taxa urgente.", "A foto e os detalhes do processo são usados como prova de identidade."],
    takeaway: "Fale com seu advogado pelo contato conhecido antes de pagar ou enviar dados. Se necessário, use os canais oficiais da OAB para verificar o profissional."
  },
  {
    code: "guided-whatsapp-romance", topic: "whatsapp", chapter: "wa-conversas", group: "Relacionamentos e ameaças",
    title: "Golpe do amor", summary: "Reconheça uma cobrança ligada a um relacionamento online.",
    story: "Uma pessoa com quem você conversa há semanas diz que enviou um presente. Um segundo número cobra uma taxa para liberar a entrega.",
    channel: "CONVERSA SIMULADA", evidence: "A entrega não aparece por um canal oficial. A pessoa insiste em manter o assunto em segredo.",
    choices: [["Parar a cobrança e conversar com alguém de confiança"], ["Pagar a taxa porque já conheço a pessoa", "A confiança construída na conversa não comprova a entrega. Verifique por canais oficiais antes de agir."], ["Enviar documento para receber o presente", "A solicitação pode expor seus dados. Não envie documento ao contato da cobrança."]],
    signs: ["Uma dívida inesperada aparece dentro do relacionamento.", "O contato pede segredo ou decisão rápida.", "A entrega e a cobrança não têm confirmação independente."],
    takeaway: "Pause, converse com alguém de confiança e consulte qualquer entrega pelo canal oficial. Se a cobrança for fraude, preserve as mensagens e procure ajuda."
  },
  {
    code: "guided-whatsapp-chantagem", topic: "whatsapp", chapter: "wa-conversas", group: "Relacionamentos e ameaças",
    title: "Ameaça de divulgar fotos íntimas", summary: "Procure ajuda e preserve provas diante de uma chantagem.",
    story: "Uma pessoa ameaça divulgar fotos privadas se você não fizer um pagamento. Você fica com medo e precisa decidir como pedir ajuda.",
    channel: "SITUAÇÃO DE TREINO", evidence: "A mensagem exige dinheiro e tenta impedir que você conte a alguém.",
    choices: [["Pagar para tentar encerrar a ameaça", "O pagamento não garante que a ameaça pare. Procure ajuda de uma pessoa de confiança e da polícia."], ["Guardar os registros da ameaça e buscar ajuda de confiança e da polícia"], ["Apagar a conversa imediatamente", "Preserve registros da ameaça, como o contato e as mensagens, para conseguir pedir ajuda."]],
    signs: ["A pessoa ameaça expor material privado.", "Ela condiciona o silêncio a um pagamento.", "A ordem de manter segredo tenta isolar você."],
    takeaway: "Você pode pedir ajuda. Guarde os registros da ameaça sem redistribuir imagens, denuncie o perfil e procure a polícia. Se for menor de idade, fale com um adulto de confiança."
  },
  {
    code: "guided-gov-multa-falsa", topic: "govbr", chapter: "gov-servicos", group: "Veículos, encomendas e inscrições",
    title: "Multa ou suspensão de CNH por SMS", summary: "Confira se existe pendência no órgão de trânsito.",
    story: "Um SMS diz que sua CNH será suspensa se uma multa não for paga hoje. A mensagem oferece um link para emitir cobrança.",
    channel: "SMS SIMULADO", evidence: "O aviso contém seu nome, mas a cobrança só aparece no link enviado pelo número desconhecido.",
    choices: [["Pagar antes do prazo informado no SMS", "Dados corretos na mensagem não provam a cobrança. Consulte o órgão de trânsito pelos canais oficiais."], ["Consultar a pendência diretamente no app ou no órgão responsável"], ["Informar meu CPF no link para conferir", "Abra o serviço de trânsito por conta própria. Um link inesperado pode capturar seus dados."]],
    signs: ["A mensagem ameaça suspender o documento no mesmo dia.", "O pagamento começa em um link desconhecido.", "Nome e dados pessoais podem ser usados para parecer oficial."],
    takeaway: "Consulte a notificação diretamente no aplicativo oficial, no Detran ou no órgão de trânsito responsável. Gere a cobrança a partir do serviço oficial."
  },
  {
    code: "guided-gov-encomenda-taxada", topic: "govbr", chapter: "gov-servicos", group: "Veículos, encomendas e inscrições",
    title: "Falsa taxa de encomenda", summary: "Confira a cobrança nos canais da transportadora.",
    story: "Você comprou um produto importado. Chega um SMS dizendo que a encomenda será devolvida se você não pagar uma taxa hoje.",
    channel: "SMS SIMULADO", evidence: "A mensagem pede pagamento imediato. A loja e o rastreio oficial ainda não mostram a cobrança.",
    choices: [["Consultar o rastreio e as cobranças no canal oficial da transportadora"], ["Pagar a taxa pelo link da mensagem", "Abra o canal oficial da transportadora. Um link inesperado pode direcionar seu pagamento para outra pessoa."], ["Mandar dados do cartão ao número do SMS", "Seu cartão é pessoal. Confirme se a cobrança existe pelos canais da transportadora."]],
    signs: ["A cobrança chega por um canal que você não confirmou.", "Há ameaça de perder o pacote imediatamente.", "O valor não aparece no rastreio oficial."],
    takeaway: "Use o rastreio oficial. Se a encomenda for dos Correios, confira a cobrança em Minhas Importações, acessado pelo site ou aplicativo oficial."
  },
  {
    code: "guided-gov-inscricao-enem", topic: "govbr", chapter: "gov-servicos", group: "Veículos, encomendas e inscrições",
    title: "Inscrição falsa no Enem", summary: "Localize a Página do Participante pelo canal do Inep.",
    story: "Um anúncio aparece nos resultados de busca e oferece inscrição no Enem. Ele pede informações pessoais e pagamento imediato.",
    channel: "PÁGINA SIMULADA", evidence: "A página não foi aberta pelo canal do Inep e apresenta a cobrança antes de você acessar a Página do Participante.",
    choices: [["Usar porque foi o primeiro resultado da busca", "A posição na busca não garante que a página seja oficial. Comece pelo canal do Inep."], ["Abrir a Página do Participante pelo site oficial do Inep"], ["Pagar para travar minha vaga", "A inscrição e o pagamento, quando exigido, devem ser consultados na Página do Participante oficial."]],
    signs: ["O resultado patrocinado tenta imitar a página oficial.", "A cobrança aparece antes da confirmação no portal do Inep.", "O anúncio pede dados pessoais com pressa."],
    takeaway: "Acesse a Página do Participante a partir do site do Inep. Confira ali a inscrição, os prazos e eventual taxa."
  },
  {
    code: "guided-gov-valores-receber", topic: "govbr", chapter: "gov-servicos", group: "Benefícios e tributos",
    title: "Falsa consulta de valores a receber", summary: "Consulte valores esquecidos pelo canal do Banco Central.",
    story: "Uma mensagem diz que você tem dinheiro esquecido e oferece um saque imediato se fizer um pagamento adiantado.",
    channel: "MENSAGEM SIMULADA", evidence: "O contato manda um link e chama a taxa de etapa obrigatória para liberar a consulta.",
    choices: [["Consultar o serviço no site oficial do Banco Central"], ["Pagar a taxa porque o saldo é maior", "O Sistema Valores a Receber é gratuito. Procure o serviço diretamente no Banco Central."], ["Entregar meus dados ao intermediário", "Use o serviço oficial por conta própria. O intermediário não precisa receber seus dados."]],
    signs: ["Prometem dinheiro inesperado.", "Pedem taxa para consultar ou receber.", "O atendimento começa por uma mensagem de terceiro."],
    takeaway: "Consulte o Sistema Valores a Receber diretamente no Banco Central. O serviço é gratuito."
  },
  {
    code: "guided-gov-das-falso", topic: "govbr", chapter: "gov-servicos", group: "Benefícios e tributos",
    title: "Boleto falso do MEI", summary: "Gere a guia do MEI no sistema oficial.",
    story: "Você recebe um e-mail dizendo que seu MEI será cancelado se não pagar uma guia anexa. Você não solicitou aquela guia.",
    channel: "E-MAIL SIMULADO", evidence: "O e-mail cobra com urgência e oferece um pagamento que você não gerou pelo serviço oficial.",
    choices: [["Pagar por medo de cancelamento", "A ameaça tenta apressar sua decisão. Consulte a situação do MEI e gere sua guia pelo serviço oficial."], ["Abrir o Portal do Empreendedor ou o app oficial MEI e gerar o DAS"], ["Confiar porque o e-mail sabe meu CNPJ", "O CNPJ pode ser conhecido por outras pessoas. Ele não confirma a guia."]],
    signs: ["A guia vem por e-mail inesperado.", "O texto ameaça cancelar o MEI.", "A cobrança não foi gerada no ambiente oficial."],
    takeaway: "Confira o que está em aberto no Portal do Empreendedor ou no aplicativo oficial MEI. Gere ali a guia que precisar pagar."
  },
  {
    code: "guided-gov-restituicao-falsa", topic: "govbr", chapter: "gov-servicos", group: "Benefícios e tributos",
    title: "Falsa restituição do Imposto de Renda", summary: "Consulte a restituição sem passar dados a desconhecidos.",
    story: "Você recebe uma mensagem que promete adiantar a restituição. Para liberar, o contato pede seus dados bancários e uma taxa.",
    channel: "MENSAGEM SIMULADA", evidence: "A oferta veio de um contato inesperado e promete alterar o prazo oficial mediante pagamento.",
    choices: [["Consultar a restituição pelo canal oficial da Receita Federal"], ["Pagar a taxa para receber antes", "Confirme a restituição diretamente na Receita. Um terceiro não precisa cobrar para acelerar o pagamento."], ["Enviar meus dados bancários pela mensagem", "Informe dados somente se necessário dentro do serviço que você abriu por conta própria."]],
    signs: ["Prometem adiantar o pagamento.", "Pedem taxa ou dados por mensagem.", "O contato não foi consultado num canal oficial."],
    takeaway: "Consulte a situação pelo serviço oficial da Receita Federal. Trate cobrança inesperada para antecipar restituição como alerta."
  },
  {
    code: "guided-gov-acesso-suspeito", topic: "govbr", chapter: "gov-2fa-cap", group: "Proteção da conta",
    title: "Alerta de acesso à conta GOV.BR", summary: "Verifique e proteja a conta pelo aplicativo oficial.",
    story: "Chega um aviso de acesso que você não reconhece. No mesmo dia, alguém diz ser do suporte e pede o código de segurança que apareceu no seu aparelho.",
    channel: "ALERTA SIMULADO", evidence: "Você não tentou entrar quando recebeu o código. O pedido veio de um contato externo.",
    choices: [["Passar o código para a pessoa cancelar o acesso", "O código é pessoal. Verifique a conta por um canal oficial e nunca o compartilhe."], ["Abrir o app oficial GOV.BR, revisar a conta e proteger o acesso"], ["Aprovar o acesso para o aviso sumir", "Só aprove solicitações que você iniciou. Verifique a atividade pelo aplicativo oficial."]],
    signs: ["O código chegou sem você iniciar o acesso.", "Uma pessoa tenta obter o código fora do aplicativo.", "Há um acesso ou solicitação que você não reconhece."],
    takeaway: "Abra o app GOV.BR por conta própria. Se suspeitar de acesso indevido, altere a senha, revise dispositivos e use a verificação em duas etapas. Procure o suporte oficial se perdeu o acesso."
  },
];

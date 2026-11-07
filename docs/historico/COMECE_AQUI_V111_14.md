# Educa+ Digital V111.14 — videochamada estilo WhatsApp (interface limpa)

Esta versão parte da V111.13 integral e **muda a aparência da videochamada dentro do celular simulado**, sem alterar a API do Cloudflare Worker, banco D1, roteiro, motor MuseTalk/Kokoro nem arquivos das outras atividades.

- Vídeo da personagem em primeiro plano, com cabeçalho central compacto identificando claramente **simulação com IA** (não há alegação falsa de criptografia ponta a ponta).
- Prévia da própria câmera sobreposta, perto do canto inferior direito; a câmera local só liga após escolha do usuário.
- Barra flutuante com cinco botões redondos: **Mais, Câmera, Som, Microfone, Encerrar**. Enquanto a chamada está tocando aparece **Atender**; controles não aplicáveis ficam ocultos.
- **Mais** abre uma caixa flutuante de opções secundárias (identidade, Pix fictício, repetir, voz e diagnóstico). Caixa fechada por padrão.
- **Mensagem** abre o teclado quando necessário, no canto superior direito.
- Legendas escondidas por padrão para preservar o rosto, podem ser ativadas em **Mais → Ativar legendas**.
- Botão superior de expandir tenta usar tela cheia real do navegador, quando suportada.
- Os controles de microfone, câmera e som mudam visualmente conforme o estado; o botão de som pausa/retoma a voz do navegador quando aplicável e silencia mídias HTML.
- Os rótulos completos continuam disponíveis em leitores de tela e nos títulos dos botões.

## Execução local

No PowerShell, nesta pasta: `npm.cmd install`, `npm.cmd test` e `npm.cmd run dev`.

Teste a videochamada tanto com a câmera desligada quanto ligada (após conceder permissão), a legenda, o teclado e o menu. Nesta etapa **não houve deploy automático na Cloudflare**. Atualize a hospedagem somente após conferir esta versão. Não é necessário migrar o D1.

**Limitação existente:** sem GPU MuseTalk, os clipes ilustrativos da Lia não fazem sincronização perfeita por fonema. Essa mudança é de interface, não cria uma nova renderização neural.

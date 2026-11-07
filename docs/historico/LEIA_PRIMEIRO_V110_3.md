# Educa+ Digital V110.3 — Lia com voz contínua e expressão facial aprimorada

## O que esta versão entrega

- **Videochamada com a Lia fictícia** no Android original, preservando o selo de simulação educativa.
- **Movimento labial mais coordenado**: usa início/fim da fala (`speechSynthesis`) e, quando o navegador oferece, limites de palavras (`onboundary`) para escolher entre oito posições de boca. Na ausência de eventos de palavra, estima a duração dos trechos.
- **Pausas, movimentos discretos e piscadas**: expressões de urgência/acolhimento derivadas do texto, respiração sutil e piscadas breves. Para quem prefere movimento reduzido, a animação é desativada.
- **Conversa por voz com menos cliques**: depois de tocar em **Conversar** e autorizar o microfone, o navegador escuta uma fala, envia a transcrição para a IA do Worker, reproduz a resposta em voz pt-BR e volta a escutar. Para parar, toque novamente em **Desativar**, encerre ou saia da página.
- **Interrupção da Lia**: durante a fala dela, tocar em **Conversar** cancela a voz e inicia a escuta. As respostas podem continuar digitadas livremente no mesmo campo.
- **Privacidade**: câmera opcional e local; microfone só após ação/permissão; ambos são desligados ao encerrar. A IA recebe apenas o texto do participante e o histórico limitado que o Modo Livre já utiliza.
- **Preservado**: pré-teste, 22 atividades, WhatsApp original, banco/Pix fictício, outras simulações, banco D1 e estrutura do projeto.

## Iniciar no Windows (VS Code)

1. Extraia esta pasta completa e abra **EDUCA_DIGITAL_V110_3_LIA_VOZ_NATURAL** no VS Code.
2. Abra o PowerShell e execute:

   ```powershell
   npm.cmd install
   npm.cmd test
   npm.cmd run dev
   ```

3. Abra `http://127.0.0.1:8787`. O comando `npm.cmd run dev` inicializa apenas as tabelas do D1 **local**; não modifica o banco remoto.
4. Conclua o pré-teste e entre no **Modo Livre**. A videochamada fictícia pode surgir automaticamente ou pelo botão de vídeo do WhatsApp simulado.
5. Atenda. Na chamada, toque em **Conversar** para autorizar/ativar o microfone. Após sua fala, espere a resposta da IA. Toque de novo para desligar a escuta contínua.
6. Se seu navegador não fornecer reconhecimento de voz ou uma voz em pt-BR, use o campo de texto. Teste de preferência no Chrome/Edge atualizados em HTTPS ou localhost.

## Limites técnicos importantes

- **Não é lip-sync neural fonema a fonema**: a Web Speech API não fornece áudio PCM/visemas fonêmicos de modo portátil. Os movimentos usam tempo e limites de palavras, podendo divergir da pronúncia em algumas vozes/dispositivos. Para lip-sync fotorrealista perfeito, é necessário um SDK de avatar em tempo real com áudio e timestamps alinhados.
- **Não é conversa full-duplex/WebRTC**: trata-se de diálogo por turnos, com escuta automática entre respostas após permissão, não áudio simultâneo sem latência.
- **Voz e reconhecimento** dependem dos recursos e permissões do navegador, e alguns serviços de reconhecimento podem processar áudio externamente.
- **IA real** depende da disponibilidade do Workers AI na Cloudflare e dos limites do plano; testes unitários e do navegador simulam resposta, não validam uma chamada à conta de produção.
- Não foram modificados GitHub, hospedagem pública ou D1 de produção. Não publique sem testar em dispositivo real.

## Testes efetuados nesta entrega

- `npm test`: 30 testes de Node aprovados (incluindo os módulos anteriores e novos testes de voz e animação).
- Chromium isolado com voz e microfone simulados: atendeu, falou, escutou uma resposta, recebeu outra fala, desativou no encerramento e não apresentou erro JavaScript.
- Ainda falta validar voz pt-BR real, ruído/eco, câmera/microfone físicos e latência do Workers AI em um dispositivo real.

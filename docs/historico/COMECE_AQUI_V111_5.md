# Educa+ Digital V111.5 — Lia foto-realista, com vídeos gerados para cada resposta

**Esta versão corrige a tela mostrada na foto enviada:** a chamada no celular virtual **não usa mais a cabeça 3D/cartunesca**. Agora usa exatamente a identidade visual do vídeo do Lovable enviado pelo autor. O modelo 3D antigo continua arquivado em arquivos de laboratório, mas **não é carregado na videochamada principal**.

## O caminho da conversa

1. O visitante atende a chamada e vê o **rosto realista da Lia**.
2. O visitante fala (quando o navegador permite reconhecimento de voz) ou digita.
3. A IA já configurada no **Cloudflare Workers AI** recebe o texto e responde pelo caminho `/api/modo-livre/conversar`.
4. **Quando o motor da equipe está ativo e autorizado**, Kokoro (`pf_dora`, português brasileiro) gera um WAV com *exatamente* o texto da resposta.
5. **MuseTalk 1.5** usa **esse mesmo WAV** e o vídeo da Lia do Lovable (`lia_motor/assets/lia-lovable-movimento.mp4`) para produzir um **MP4 novo, com boca sincronizada com a fala**.
6. O MP4 gerado é entregue ao navegador via gateway HTTPS da Cloudflare, com áudio e vídeo unidos. Quando termina, a chamada aguarda a próxima fala.

**Isto é processamento por turnos, não uma transmissão de vídeo neural WebRTC com latência zero.** O tempo de espera depende da GPU, do tamanho da resposta e do carregamento do modelo. O código implementa o fluxo; **não foi possível executar o MuseTalk com GPU para verificar o sincronismo final neste ambiente**.

## O que muda na aparência

- A interface do Modo Livre (`/`, cenário de videochamada) usa a foto e o MP4 original do avatar de **aparência humana**, não o 3D antigo.
- A rota `/lia-ao-vivo.html` (antes 3D) agora redireciona para `/lia-realista.html`, sem deixar o usuário cair na demonstração errada.
- Sem GPU, o site avisa quando a voz é **somente áudio** e mostra a foto parada. Não apresenta animação de boca falsa nem reproduz os 6 segundos pré-gravados como se fossem uma resposta inédita.
- Texto, microfone (dependente do navegador), câmera local opcional, botões de encerrar e a IA do Modo Livre foram preservados.

## Teste inicial

No Windows com Node.js instalado, dentro da pasta extraída:

```powershell
npm.cmd install
npm.cmd test
npm.cmd run dev
```

Abra a URL indicada pelo Wrangler. A rota **`/lia-realista.html`** é o teste direto mais fácil para ver o rosto correto. No Modo Livre da página principal, complete o pré-teste e entre na atividade de videochamada. O modelo antigo não deve ser exibido.

O servidor Flask também mostra as telas (`python app.py`), **mas a resposta por IA requer o Cloudflare Worker**. Não se deve testar uma página estática offline e esperar que a IA ou a renderização de MP4 funcionem.

## Ativação do MuseTalk no computador com GPU

São necessárias **duas instalações locais separadas** (uma pode usar a mesma instalação Python, se compatível):

- **Kokoro TTS** e seus requisitos, listados em `lia_motor/requirements.txt`.
- **MuseTalk 1.5 oficial**, pesos de modelo V15, FFmpeg no PATH e uma GPU CUDA com memória adequada. Consulte: https://github.com/TMElyralab/MuseTalk . No projeto, `LIA_MUSETALK_DIR` deve apontar para o clone oficial completo; `LIA_MUSETALK_PYTHON` aponta para o interpretador Python do ambiente de MuseTalk.

Configure o token (não o compartilhe) com `CONFIGURAR_LIA_LOCAL_WINDOWS.ps1` e, depois, ligue o serviço em uma máquina com GPU:

```powershell
.\INICIAR_MOTOR_LIA_WINDOWS.ps1 -MuseTalkDir 'C:\IA\MuseTalk' -MuseTalkPython 'C:\IA\MuseTalk\.venv\Scripts\python.exe'
```

O motor FastAPI roda em `127.0.0.1:8900` por padrão. Se for usado remotamente, precisa de **túnel HTTPS autenticado** (por exemplo, Cloudflare Tunnel). Não abra a porta Python diretamente para a internet. O Worker tem que receber as variáveis privadas `LIA_ENABLED=true`, `LIA_BACKEND_URL` (HTTPS do túnel), `LIA_BACKEND_TOKEN` (secret) e `LIA_STAFF_CODE` (secret). O token do Python `LIA_API_TOKEN` deve ser igual ao `LIA_BACKEND_TOKEN`; nunca coloque esses valores no HTML ou no ZIP. A página principal oferece **Ativar sincronia neural (equipe)** para informar apenas o código temporário da equipe.

Ao testar, a chamada deve mostrar **"Kokoro está criando..." → "MuseTalk gerando..." → "Reproduzindo a resposta..."**, e tocar um MP4 *novo*, diferente para cada resposta. Se a GPU/modelos estiverem indisponíveis, haverá aviso de fallback, não vídeo sincronizado.

**Cloudflare Workers e D1 não executam os pesos CUDA do MuseTalk.** É possível evitar a taxa por minuto da Simli, mas, para atendimento público 24h com renderização contínua, alguém precisa disponibilizar e custear/operar uma GPU (ou manter um computador próprio ligado). Não há garantia de vídeo neural 24h gratuitamente.

## Segurança e preservação

- **Não publicado em produção.** `npm run deploy` só deve ser usado após conferir a diferença e testar; nenhum deploy ou migração D1 foi realizado nesta entrega.
- Não executar migrações D1 remotas para ativar esse recurso: o banco e as 22 atividades existentes permanecem intactos.
- A câmera do visitante fica **local no aparelho**; não é enviada ao servidor de geração de vídeo.
- A Lia é **personagem fictícia**, identificada como IA em simulação de golpes. Não usar para imitar uma pessoa real sem consentimento ou enganar alguém fora desse contexto educativo.
- O ZIP do Lovable não incluía seu gerador original de avatar. A imagem e o clipe enviados são usados apenas como fontes visuais para a alternativa própria MuseTalk.

## Verificações desta entrega

- `node --test tests/*.test.js`: **45 passaram** (sujeito à disponibilidade das dependências externas em produção).
- `python -m unittest discover -s lia_motor -p 'test_*.py' -v`: **8 passaram** (utilizam simulador de inferência em alguns testes, não GPU real).
- A navegação gráfica do Chromium local foi bloqueada pelo ambiente de execução. Isso não comprova que a interface esteja visualmente perfeita nos aparelhos dos usuários.

# Educa+ Digital V111.16 — voz mais natural da Lia (sem Simli)

## Mudanças
- **Fala expressiva**: opção de motor **Chatterbox Multilingual V3**, com áudio de referência sintético, já existente no projeto, para manter um timbre feminino coerente. É **opcional**; vem desligado para não baixar modelos grandes sem autorização do operador.
- **Kokoro melhorado**: as frases são separadas para respirar, Pix e valores monetários são pronunciados em português brasileiro, velocidade varia sutilmente por trecho, com pausas curtas naturais e transição suave entre blocos de áudio.
- **Controles**: na videochamada, menu `••• > Jeito de falar da Lia`: Natural, Calma, Clara. O estilo enviado é validado no Worker e no motor local. Também se aplica à voz feminina do navegador como contingência.
- **Menos silêncio**: se o MuseTalk ainda não tiver produzido MP4 após aproximadamente 14 s de tentativa de renderização, a Lia utiliza o WAV neural pronto e os movimentos ilustrativos, evitando que o usuário espere minutos.
- **Mesmo WAV para o MuseTalk**: quando o vídeo fica pronto em tempo hábil, o mesmo áudio que gerou a voz alimenta a animação labial. O sistema distingue claramente gestos ilustrativos de sincronização labial neural.
- **Avatar fictício** e identidade de simulação mantidos. O Cloudflare Worker, D1, aulas e pré-teste não foram substituídos.

## Ativação A — Kokoro, sem modelos grandes adicionais

Siga `COMECE_AQUI_V110_7.md` para instalar o motor privado; mantenha `LIA_TTS_ENGINE=kokoro` (padrão). A voz feminina `pf_dora` é a usada na versão leve. O ajuste de ritmo e pausas já entra em vigor.

## Ativação B — Chatterbox Multilingual V3 para voz mais expressiva

Pré-requisitos: PC ligado (preferencialmente GPU NVIDIA com VRAM adequada), Python 3.11, internet para **download inicial dos pesos**, e ambiente virtual exclusivo. A versão geral V3 suporta português (`language_id='pt'`); a identidade sonora é guiada pelo WAV de referência **fictício** incluído em `lia_motor/assets/lia_voz_referencia_demo.wav`. O modelo dedicado pt-BR também existe, mas **não** é instalado por este pacote. Não copie a voz de uma pessoa real sem autorização explícita.

No PowerShell, na raiz do projeto (se for primeira execução):

```powershell
py -3.11 -m venv lia_motor\.venv
.\lia_motor\.venv\Scripts\python.exe -m pip install --upgrade pip
.\lia_motor\.venv\Scripts\python.exe -m pip install -r lia_motor\requirements.txt
.\lia_motor\.venv\Scripts\python.exe -m pip install chatterbox-tts
.\CONFIGURAR_LIA_LOCAL_WINDOWS.ps1  # somente se os segredos ainda NÃO existirem
.\INICIAR_LIA_VOZ_HUMANA_WINDOWS.ps1
```

Ao final, teste **GET** `/health` do motor local com `Authorization: Bearer <token privado>` e verifique `voice_engine: chatterbox`. O carregamento inicial do modelo é feito quando for solicitada a primeira fala, e poderá baixar muitos GB. A fala de verdade precisa ser ouvida e avaliada nesse computador: os testes automatizados deste pacote não executam o modelo pesado.

O script sobe o serviço em `127.0.0.1:8900`. Se quiser MuseTalk, instale primeiro e configure `LIA_MUSETALK_DIR`; então execute `INICIAR_LIA_VOZ_HUMANA_WINDOWS.ps1 -ComMuseTalk`.

**Cloudflare em produção**: Workers hospedam o site, não o modelo de áudio ou vídeo. Configure um gateway HTTPS privado (ex.: Cloudflare Tunnel), `LIA_BACKEND_URL`, `LIA_BACKEND_TOKEN`, `LIA_STAFF_CODE` e `LIA_ENABLED=true` no Worker. O navegador acessa o motor somente por `/api/avatar/*`, e o uso neural ainda requer o código privado de teste em `••• > Verificar avatar com IA`. Sem isso, usa voz do navegador.

## Testes e honestidade de validação

- Os testes locais da API/normalização e do frontend **não exigem GPU nem baixam modelos**.
- O áudio do Kokoro e Chatterbox V3 **não foi ouvido nem avaliado manualmente nesta versão**, porque os pesos do modelo não vêm no ZIP. O resultado humanizado deve ser validado por audição com o motor realmente instalado.
- A chamada permanece *por turnos*, não uma ligação full-duplex sem atrasos.
- Sem serviço Simli e sem cobrança contratual por minuto, mas com custos possíveis de energia, máquina e internet. Um computador desligado não consegue servir voz ao seu site.

## Comandos de validação

```powershell
npm test
cd lia_motor
python -m unittest discover -p "test_*.py" -q
```

## Fontes oficiais

- Kokoro: https://github.com/hexgrad/kokoro
- Chatterbox TTS: https://github.com/resemble-ai/chatterbox
- MuseuTalk: https://github.com/TMElyralab/MuseTalk

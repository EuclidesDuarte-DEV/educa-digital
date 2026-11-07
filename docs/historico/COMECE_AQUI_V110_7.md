# Educa+ Digital — V110.7 completa (a partir da V110.5 enviada)

## Alterações efetivamente feitas

- **Protótipo completo preservado**: páginas, estilos, materiais, vídeos, pré-teste, Pix fictício, IA do Modo Livre, D1 e configurações do Worker.
- **Simli excluída da execução**: não existe importação de `simli-client`, endpoint de token ou secret da Simli na nova integração. O SDK e o serviço Azure de voz foram retirados da execução.
- **Lia, personagem fictícia**: o rosto já existente foi preparado para MuseTalk; incluído `lia_motor/assets/lia_idle.mp4` com piscadas suaves (video-base, sem áudio). A legenda da interface permanece identificada como **SIMULAÇÃO COM IA · PERSONAGEM FICTÍCIA**.
- **Mesma IA conversacional**: mantém o modelo vinculado ao Worker da Cloudflare, com roteiro de *golpe de treinamento*, Pix de treino e proibição de credenciais, códigos e contas reais. O resultado da IA dirige o Kokoro e o MuseTalk quando disponíveis.
- **Kokoro**: backend FastAPI com voz feminina `pf_dora` em português brasileiro, gerando WAV mono 24 kHz sob demanda.
- **MuseTalk 1.5 opcional**: backend chama o `scripts.inference` oficial com o vídeo de referência e o **mesmo WAV** da voz; retorna MP4 contendo áudio e vídeo sincronizados. Depende de instalação à parte do repositório/pesos/modelos, ffmpeg e GPU.
- **Cloudflare**: rotas seguras `/api/avatar/health`, `/api/avatar/speak`, `/api/avatar/render`, `/api/avatar/media/...` como gateway, sem expor o token do backend ao navegador.
- **Fallback**: se Kokoro/MuseTalk estiverem indisponíveis, a chamada mantém o diálogo da IA pelo Worker com voz do próprio navegador (quando houver pt-BR). Se o Kokoro funcionar sem GPU, há áudio Kokoro com animação labial **aproximada**, não neural.

## 1. Testar o site sem modelos de IA instalados

No PowerShell, na pasta raiz do ZIP descompactado:

```powershell
npm install
npm test
npm run dev
```

Acesse a URL mostrada pelo Wrangler. A chamada continuará funcionando na forma disponível no navegador. **Nenhum serviço remoto de voz/vídeo foi habilitado por padrão.** Não há migração D1 necessária.

## 2. Ligar a voz Kokoro no SEU computador

Instale Python compatível com o projeto Kokoro, FFmpeg e eSpeak-ng (a versão necessária pode variar por sistema). Abra um segundo terminal no diretório `lia_motor` e execute:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
# Gere um segredo aleatório privado com 32+ caracteres e salve em variável de ambiente.
$env:LIA_API_TOKEN = "COLOQUE_AQUI_UM_TOKEN_ALEATORIO_DE_PELO_MENOS_20_CARACTERES"
uvicorn server:app --host 127.0.0.1 --port 8900
```

A primeira síntese poderá baixar pesos de terceiros licenciados; sem rede e sem dependências instaladas, o modelo real não rodará. O aplicativo **não contém** os pesos do Kokoro ou do MuseTalk.

Teste local: `GET http://127.0.0.1:8900/health` exige `Authorization: Bearer <seu token>`. A documentação interativa de FastAPI pode ficar disponível em `/docs` localmente; não exponha sem proteção.

## 3. Conectar o Worker ao motor local

Na raiz do projeto, no arquivo **`.dev.vars` local** (não o coloque no Git ou no ZIP), adicione:

```ini
LIA_ENABLED=true
LIA_BACKEND_URL=http://127.0.0.1:8900
LIA_BACKEND_TOKEN=COLOQUE_O_MESMO_TOKEN_ALEATORIO_FORTE
LIA_STAFF_CODE=COLOQUE_OUTRO_CODIGO_EXCLUSIVO_DA_EQUIPE_COM_MAIS_DE_8_CARACTERES
```

Execute o Worker e o motor no mesmo computador. Após atender a chamada, digite o código de teste da equipe. O código **não é** a senha do protótipo.

Para Cloudflare **publicado**, `127.0.0.1` não aponta para o seu PC. O backend deve receber um **endereço HTTPS estável**, por exemplo via túnel Cloudflare apontando para o backend privado ou infraestrutura própria equivalente. Configure `LIA_BACKEND_URL`, `LIA_BACKEND_TOKEN` e `LIA_STAFF_CODE` como secrets privados do Worker (com `npx wrangler secret put NOME_DO_SECRET`). Configure `LIA_ENABLED=true` como variável do Worker. Evite publicar a interface FastAPI diretamente sem autenticação, TLS, rate limiting e restrição de origem. O PC precisa permanecer ligado e com acesso para servir requisições.

A hospedagem do front-end na Cloudflare **não executa MuseTalk GPU**; o processamento continua no servidor separado.

## 4. Habilitar MuseTalk 1.5 (para vídeo labial real)

Instale o repositório oficial com suas dependências, pesos e modelos, observando os requisitos de CUDA/VRAM em https://github.com/TMElyralab/MuseTalk. Confirme que o diretório contém, entre outros:

- `models/musetalkV15/unet.pth`
- `models/musetalkV15/musetalk.json`
- `models/whisper/` e as demais dependências/modelos definidos pelos mantenedores.

No mesmo terminal do motor, antes do `uvicorn`:

```powershell
$env:LIA_MUSETALK_DIR = "C:\caminho\para\MuseTalk"
$env:LIA_MUSETALK_ENABLED = "true"
$env:LIA_MUSETALK_FP16 = "true" # somente se sua GPU suportar
uvicorn server:app --host 127.0.0.1 --port 8900
```

O backend constrói um YAML para cada chamada e executa `python -m scripts.inference` no diretório MuseTalk (modelo v15, 25fps), usando **`lia_motor/assets/lia_idle.mp4`** e a voz WAV gerada pelo Kokoro. O arquivo resultante é reproduzido na videochamada, sem áudio duplicado. Em respostas demoradas (mais de 15 segundos no navegador), a interface dá prioridade à fala WAV e usa movimento labial aproximado para não deixar a pessoa esperando indefinidamente.

**Importante:** trata-se de renderização **por turno de conversa**, não de vídeo fotorrealista contínuo full-duplex sem latência. A infraestrutura GPU pode ter custos de eletricidade/servidor, ainda que não exista cobrança da Simli por minuto. MuseTalk e Kokoro não vêm com os pesos no ZIP por seu volume e condições de licença/distribuição.

## 5. Verificação

```powershell
npm test
python -m unittest lia_motor.test_server
```

É possível rodar os testes da API sem baixar modelos; verificam controle de acesso e geração simulada de WAV. Para testar o modelo **real**, é necessário executar o backend com Kokoro instalado e chamar `/v1/lia/speak` com autenticação. Para validar sincronização neural, habilite MuseTalk e assista à chamada no navegador. Não declare vídeo neural como funcionando antes desse teste em GPU.

## Segurança e ética

A Lia não é alguém real. Este é um simulador de **reconhecimento de golpes** e não deve ser implantado com rosto/voz de terceiros sem consentimento. Não solicite códigos SMS, contas, senhas, CPF ou transferências reais. A webcam do aprendiz, se ligada, continua local no navegador. O backend armazena somente arquivos temporários WAV/MP4 (expiram após 15 minutos), e o servidor não persiste transcrições no disco.

Não execute uma implantação em produção com um único código compartilhado entre alunos; nessa hipótese, adote autenticação real, proteção de borda, quotas persistentes e gestão de capacidade.

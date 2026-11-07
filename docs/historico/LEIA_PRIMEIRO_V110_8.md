# V110.8 — Avatar neural de verdade (quando houver GPU)

## O que foi corrigido

A V110.7 ainda usava a foto com bocas alternadas/piscadas quando o motor neural estava desligado. **Na V110.8 isso não aparece mais durante a chamada atendida**: ou MuseTalk gera um vídeo MP4 com novos pixels na região facial a partir do WAV, ou a chamada mostra que o vídeo IA está indisponível e deixa a voz/texto funcionar. Não há fingimento de vídeo neural.

O prazo artificial de 15 segundos que cancelava o resultado foi removido. Agora renderização é **assíncrona**: Worker envia `/api/avatar/render`, motor local devolve `queued`, o navegador verifica `/api/avatar/render-status/:id`, e, quando o MP4 fica pronto, ele é reproduzido com a trilha WAV sincronizada. A espera pode ser longa em uma GPU lenta.

## Teste visual imediato (sem GPU)

Abra PowerShell na raiz e execute:

```powershell
npm.cmd install
npm.cmd test
npm.cmd run dev
```

No site, durante a chamada, aparecerá **"Aguardando vídeo da IA"** no lugar da foto com boca/olhos mexendo, enquanto o motor não estiver configurado. Isso é intencional; **não** é a experiência final.

## Verifique seu computador

Execute:

```powershell
.\DIAGNOSTICO_AVATAR_WINDOWS.ps1
```

Para renderizar com MuseTalk 1.5, é necessário instalar **uma GPU NVIDIA compatível com CUDA**, dependências do modelo e pesos (não incluídos no ZIP). O site Cloudflare **não** executa CUDA. Use preferencialmente o MuseTalk em `C:\IA\MuseTalk` (evite espaços no caminho: o script FFmpeg do MuseTalk tem chamadas de shell sensíveis a espaços). O código aberto está em https://github.com/TMElyralab/MuseTalk.

### Preparar MuseTalk (uma vez, no próprio PC)

1. Instale NVIDIA drivers, Git, Conda ou Miniconda, FFmpeg e Python 3.10 para o ambiente MuseTalk.
2. Consulte o README oficial do MuseTalk para as versões compatíveis de PyTorch/CUDA, MMDetection/MMCV e outras dependências; os pacotes precisam ser instalados no ambiente adequado. Sugestão do mantenedor:

```powershell
# Em PowerShell com conda configurado:
conda create -n MuseTalk python=3.10 -y
conda activate MuseTalk
# Instale o PyTorch com CUDA para sua GPU, de acordo com instrucoes OFICIAIS
# em https://github.com/TMElyralab/MuseTalk#installation
New-Item -ItemType Directory -Force -Path C:\IA | Out-Null
cd C:\IA
# Caso ainda nao tenha o checkout:
git clone https://github.com/TMElyralab/MuseTalk.git
cd MuseTalk
pip install -r requirements.txt
# Instale tambem pacotes MMLab, conforme README oficial.
.\download_weights.bat
```

3. Configure uma venv Python compatível com Kokoro no diretório `lia_motor` e instale `pip install -r requirements.txt` a partir do arquivo `lia_motor/requirements.txt`. Separe a venv Kokoro e o ambiente MuseTalk se houver conflito de dependências.
4. Volte para a raiz e execute `CONFIGURAR_LIA_LOCAL_WINDOWS.ps1`. Guarde o código de teste exibido. Não publique `.dev.vars` ou `lia_motor/.motor.vars.local`.
5. Execute o motor em um **segundo terminal**, com a venv de Kokoro ativada:

```powershell
.\INICIAR_MOTOR_LIA_WINDOWS.ps1 -MuseTalkDir 'C:\IA\MuseTalk' -MuseTalkPython 'C:\Users\SEU_USUARIO\miniconda3\envs\MuseTalk\python.exe'
```

6. Na raiz, execute `npm.cmd run dev`; abra a chamada e insira o código de teste, que ativará o motor local. Verifique o `GET /api/avatar/health` no navegador: `enabled=true` indica que o backend está acessível; `video_enabled=true` indica modelo e GPU detectados, mas **ainda não garante que a inferência funcione**.
7. Verifique o vídeo produzido com uma conversa curta. O MP4 aparecerá somente após renderização **real** na GPU. Em caso de falha, leia a saída do terminal Python.

### Cloudflare publicado

O site hospedado não consegue buscar `http://127.0.0.1:8900` no seu computador. Para conectar uma instalação pública, configure HTTPS estável e autenticado, por exemplo túnel Cloudflare até um PC de sua confiança, e faça a configuração de `LIA_BACKEND_URL`, `LIA_BACKEND_TOKEN`, `LIA_STAFF_CODE` como secrets do Worker. O PC precisa estar ligado. Não configure backend público sem limites robustos de requisição/tempo, autenticação e TLS. Segredos e código da equipe não são apropriados para uso por alunos em produção.

## Limites honestos

- O MuseTalk 1.5 gera **movimento labial neural** e modifica pixels do rosto, mas não torna automaticamente realistas as expressões de olhos e o movimento de cabeça do vídeo base. O `lia_idle.mp4` atual é um vídeo curto derivado da imagem fictícia; para corpo/cabeça mais naturais, será necessário um vídeo-base melhor e/ou outro motor de animação, também com processamento.
- A implementação atual é **por resposta**, não streaming contínuo bilateral. Em GPU lenta pode levar minutos por frase. Para conversa natural de baixa latência, será necessário motor persistente/streaming e GPU potente.
- Não há pagamentos à Simli, nem cobrança de uso do MuseTalk/Kokoro neste código. Há exigências de computador, energia e possível hospedagem; Cloudflare Workers AI existente também pode possuir limites de uso/custos conforme seu plano.
- Apenas personagem **fictícia e rotulada como simulação educativa**; não reproduza rosto/voz de pessoa real sem consentimento. Não solicite Pix real, dados bancários ou códigos verdadeiros.

## Verificação automatizada

```powershell
npm.cmd test
python -m unittest lia_motor.test_server
```

Os testes verificam código, não fazem download de pesos nem renderizam vídeos neurais. O teste definitivo depende de GPU e modelos funcionando.

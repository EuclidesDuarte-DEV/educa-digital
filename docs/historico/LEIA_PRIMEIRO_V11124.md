# Educa+ Digital V111.24 — videochamada da LIA otimizada

**Evolução direta do ZIP V111.23.** A estrutura do Educa+, os módulos, vídeos,
pré-teste, banco de dados e fluxo WhatsApp → videochamada → ligação foram mantidos.
A LIA independente **não** foi copiada nem modificada.

## Como iniciar (Windows)
1. Extraia este ZIP em **uma pasta nova** para preservar sua V111.23 anterior.
2. A partir dessa pasta, execute `LIGAR_LIA_EDUCA\00_LIGAR_TUDO.cmd`.
3. Verifique `ollama list` para confirmar `qwen3:1.7b` (ou defina `LIA_EDUCA_MODELO`).
4. Abra `http://127.0.0.1:5015`. Conclua o pré-teste e entre no Modo Livre.
5. **WhatsApp primeiro; videochamada em seguida.** Ao receber, atenda.
6. Comece por texto e depois habilite o microfone no botão correspondente.
7. Confira `GET http://127.0.0.1:5015/api/avatar/health` para o diagnóstico de voz.

Ollama é pré-aquecido com uma requisição local assíncrona quando a chamada chega.
A geração Kokoro `pf_dora` tem espera de até 18 s no navegador antes de tentar
voz feminina pt-BR local do próprio navegador. Não é promessa de resposta em
18 s, pois a inteligência artificial e o reconhecimento têm latências próprias.

## O que mudou
- **Ollama:** pré-aquecimento de modelo sob demanda, sem bloquear a chamada;
  respostas mais curtas para reduzir o processamento; descarte de raciocínio
  interno incompleto que modelos locais podem produzir.
- **Kokoro:** a saída de fonemas IPA reais agora gera metas de visemas, limitadas
  em tamanho e temporizadas **aproximadamente por duração de cada trecho de WAV**.
  O proxy expõe apenas forma e instante, nunca o token do motor.
- **Interface:** dados de visemas acompanham a reprodução do WAV quando Web Audio
  está disponível. A alternância visual original dos vídeos é mantida. Se a
  síntese atrasar ou o navegador bloquear o áudio, há fallback e mensagem clara.
- **Preservação:** nenhuma migração de banco, alteração no Worker Cloudflare ou
  substituição dos vídeos originais foi feita.

## Limites para validação presencial
As metas de visemas NÃO constituem sincronização precisa dos lábios: os limites
internos dos fonemas são estimados. Os clipes de vídeo existentes foram gerados
antes da fala atual e não podem movimentar cada fonema corretamente. **MuseTalk
funcionando com a voz gerada** é a opção de sincronismo de vídeo neural existente.
Os arquivos `public/static/img/lips/*.webp` retratam uma personagem diferente
dos MP4s usados pela videochamada, portanto não foram sobrepostos à LIA atual.

A qualidade feminina de `pf_dora`, piscadas e expressões, movimento labial
neural, captador real de áudio, iPhone/Safari e Android devem ser testados em
hardware real. Kokoro/Ollama/MuseTalk não estão instalados neste ambiente de
validação; testes com substitutos não equivalem à reprodução audiovisual real.

## Testes automatizados
- `npm test` — testes Node de funcionalidade e regressão.
- `py -3.11 -m unittest discover -s testes_lia_educa` — rotas Flask, **precisa de Flask**.
- `cd lia_motor` e `py -3.11 -m unittest test_server test_voice_natural test_phoneme_visemes test_motion_source test_female_reference` — motor (com FastAPI, NumPy etc.; modelos de IA simulados em teste).

Nunca use chaves Pix reais; a simulação continua sem transferências financeiras.
Mantenha servidor Flask e Kokoro restritos a `127.0.0.1`. Publicar está fora
do escopo desta versão. Para backend online, são necessários HTTPS,
autenticação, autorização, rate limits, monitoramento e tratamento de dados.

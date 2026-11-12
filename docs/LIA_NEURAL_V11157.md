# LIA V111.57 — redes neurais, voz e segurança da simulação

## O que gera as respostas
- **Padrão no Cloudflare Worker:** `@cf/google/gemma-4-26b-a4b-it` (Gemma 4 26B A4B, arquitetura Mixture-of-Experts).
- **Modo opcional**, somente com `LIA_AI_MODEL=inteligente`: `@cf/meta/llama-3.3-70b-instruct-fp8-fast`. Não habilitar sem revisar limites e custos.
- **Modelo anterior:** `@cf/meta/llama-3.1-8b-instruct-fp8`, programado pela Cloudflare para descontinuação em 20/11/2026. Não é mais o padrão.
- Nenhum modelo foi treinado do zero ou teve seus pesos alterados. As melhorias desta versão são mudança do motor, estado de conversa, prompts e interpretação da saída.

## O que gera a voz
- **Rede TTS:** `onnx-community/Kokoro-82M-v1.0-ONNX`, voz feminina brasileira `pf_dora`.
- **Fonetização de texto:** eSpeak NG (Spellophone pt-br) antes do Kokoro.
- **Qualidade:** valores como R$ 350 passam a ser pronunciados por extenso; velocidade padrão natural 1.00, pausada 0.94 e clara 0.98; microfade de 3 ms nas bordas de cada WAV reduz estalos sem alterar a identidade vocal.
- **Execução:** Kokoro ONNX WASM no navegador por padrão, com WebGPU opcional. O primeiro acesso pode baixar modelo grande. Não há promessa de velocidade em todos os iPhones/Android.
- **Distribuição do modelo:** a Cloudflare encaminha em streaming apenas `config.json`, `tokenizer_config.json`, `tokenizer.json`, os ONNX permitidos e `voices/pf_dora.bin` pelo endpoint público `/api/lia-model/`. Não há proxy geral de URLs nem alterações no banco. A disponibilidade do modelo externo continua necessária.
- **Alternativa:** voz feminina pt-BR do dispositivo, somente quando identificada; legendas legíveis se nenhuma voz iniciar.

## O que move o rosto
- O rosto atualmente usa vídeos de escuta/fala pregravados com transição e gestos dirigidos pelo nível real do áudio; isso é **aproximação**, não sincronismo fonema-a-fonema.
- MuseTalk e backend neural de vídeo continuam opcionais e não foram habilitados em produção nesta atualização.

## Regras da atividade
- Exibe claramente “SIMULAÇÃO COM IA · PERSONAGEM FICTÍCIA”.
- A LIA participa da dramatização de pedido de **empréstimo fictício de R$ 350** somente dentro do banco simulado.
- Respeita recusa, suspeita e pedido de confirmação. Não exige ou recebe CPF, senhas, códigos, número de telefone, chaves Pix, links ou transações reais.
- Cenários existentes, pré-teste, ordem WhatsApp → vídeo → ligação, acessibilidade e D1 oficial/preview são preservados.

## Custos e validação
- Workers AI tem cota gratuita de inferência, mas não é ilimitado; se exceder o limite, respostas poderão falhar.
- Nenhum contêiner pago, GPU na nuvem, migração D1 ou segredo novo foi ativado.
- Testes automatizados conferem configuração e respostas simuladas; naturalidade da voz, funcionamento do microfone, latência real e movimentos faciais precisam de teste auditivo/visual em iPhone, Android e desktop.

Fontes de referência:
- https://developers.cloudflare.com/workers-ai/models/gemma-4-26b-a4b-it/
- https://developers.cloudflare.com/changelog/product/workers-ai/
- https://developers.cloudflare.com/workers-ai/platform/pricing/

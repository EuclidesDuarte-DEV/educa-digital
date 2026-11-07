# Educa+ Digital V111.28 — teste experimental de Kokoro `pf_dora` no navegador

## Status real

- A V111.27 existente foi preservada como base, com WhatsApp, videochamada, ligação, trilhas, banco D1 e Cloudflare Worker.
- O **caminho alternativo gratuito** adiciona síntese Kokoro `pf_dora` no navegador em um Web Worker, com fonetização `pt-br` por eSpeak NG / Spellophone. Não usa Ollama nem serviços de voz pagos.
- A biblioteca oficial kokoro-js não suporta `pf_dora` diretamente no método `generate()`. Por isso este protótipo usa sua API de modelo ONNX de nível inferior, `tts.model(...)`, com `pf_dora.bin` e fonemas `pt-br`. A implementação **não pôde ser validada em um navegador online nesta sessão**; dependa de testes de fala reais antes de liberar em produção.
- Os modelos são baixados do Hugging Face na primeira execução. A biblioteca e os dados eSpeak são baixados de CDNs. Precisa de internet, memória e suporte WASM/WebGPU. Não é garantia de latência baixa em celulares.
- A boca no vídeo existente segue **cues fonéticos de tempo ESTIMADO e energia do áudio**. Isto **não é MuseTalk**, nem deformação neural do rosto do MP4. Para lipsync neural quadro a quadro no retrato filmado é necessária GPU ou um modelo móvel diferente.
- Se o motor falhar, é apresentada a causa e o código pode recorrer à voz feminina acessível do navegador. Nunca identifica este fallback como `pf_dora`.

## Como testar sem instalar aplicativos

1. Extraia a pasta, abra no VS Code. Use o Node/npm e o Wrangler que já funcionam no computador.
2. `npm.cmd test` e `npx.cmd wrangler deploy --dry-run` na pasta principal.
3. **Antes de `npm.cmd run deploy`**, confirme no `wrangler.toml` que `main = "src/worker.js"` e não existe `[[containers]]`. A V111.28 já remove essa configuração paga.
4. Primeiro use um servidor de desenvolvimento local do Educa+ no navegador. Abra o Modo Livre e atenda à chamada. Aguarde o download e o aquecimento do modelo. Veja o console DevTools para erros de CORS/importação/memória.
5. Em navegador sem WebGPU, WASM pode ser muito lento. Em caso de falha, **não** considere a voz oficial ativada.
6. Teste em Chrome desktop e celular. Apenas depois de ouvir a verdadeira voz `pf_dora` e medir duração/compatibilidade, publique no Worker gratuito sem bloco Containers.

## Licenças de terceiros

- Kokoro ONNX: Apache-2.0 (modelo); kokoro-js: Apache-2.0; Transformers.js: Apache-2.0.
- Spellophone / eSpeak NG: GPL-3.0-or-later. Avaliar consequências de distribuição/licença antes de colocar em produção.

Esta é uma integração experimental testável, não uma afirmação de implantação bem-sucedida na Cloudflare ou sincronização labial neural exata.

## Página para testar apenas a voz, antes da videochamada

Depois de implantar a V111.28, acesse `/testar-voz-lia.html` no mesmo domínio do Educa+ Digital. Clique em **Preparar modelo pf_dora** e depois **Gerar voz e ouvir**. Se não conseguir ouvir a frase na voz brasileira, NÃO considere a ativação concluída; registre o erro mostrado na tela. Esta rota é uma ferramenta diagnóstica, não substitui o Modo Livre.

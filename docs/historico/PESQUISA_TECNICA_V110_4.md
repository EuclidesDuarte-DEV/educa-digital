# Pesquisa técnica — Educa+ Digital V110.4

**Data da revisão:** 25/10/2026  · **Objetivo:** melhorar a sincronia da boca da Lia com cada emissão de fala no Modo Livre, mantendo português brasileiro, acessibilidade, baixo custo e proteção de dados.

## Diagnóstico da V110.3

O sistema anterior usa Web Speech (`SpeechSynthesisUtterance`) e o evento `onboundary` de palavras. Esse evento NÃO descreve fonemas nem a amplitude do áudio. O código infere posições labiais por letras e mede o tempo estimado. Por isso uma boca pode mexer durante silêncio ou ficar em forma errada ao pronunciar uma sílaba. Os 8 retratos ainda são sprites estáticos; a animação não equivale a vídeo neural.

## Pesquisa de tecnologias oficiais

| Opção | Dados labiais reais? | pt-BR | Rosto fotorrealista em movimento | Integração à arquitetura Worker | Avaliação |
|---|---|---|---|---|---|
| **Azure Speech SDK** | 22 IDs de visema com deslocamento do áudio, via `visemeReceived` | Sim, viseme ID em pt-BR; documentação de idiomas cita também blend shapes, confirmar suporte por voz | Não; nós renderizamos o rosto | Token temporário emitido pelo Worker; fala no navegador | **Recomendado na V110.4:** áudio e visemas da mesma síntese |
| **Amazon Polly** | Marcas por visema/tempo em JSON + saída de áudio da mesma voz | Sim, tabela pt-BR | Não | Worker exigiria assinatura de requisições AWS SigV4 | Boa segunda opção para falas assíncronas |
| **Simli** | Vídeo neural gerado a partir de áudio em fluxo | Depende da voz/TTS que enviarmos | Sim, serviço de avatar externo | Exige conta, integração WebRTC e verificação de políticas/cotas | Melhor candidato futuro para **rosto realmente fotorrealista** |
| **Tavus CVI** | Pipeline conversacional de vídeo + voz | Multilíngue; testar acento pt-BR específico | Sim, rostos de catálogo ou replicas autorizadas | Exige conta e API própria | Alternativa de ponta-a-ponta, com custos/limites |
| **Web Speech API** | Limites de palavras variáveis conforme navegador; sem visemas | Depende das vozes instaladas | Não | Já opera localmente | Fallback, sem precisão fonêmica |
| **Rhubarb e outros offline** | Alinhamento por áudio, principalmente para clipes gravados | Varia por idioma/modelo | Não | Precisa de serviço de processamento | Útil para vídeos pré-processados, não primeira escolha para chamadas dinâmicas |

### Fontes oficiais

1. Microsoft: [Get facial position with viseme](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-speech-synthesis-viseme) — 22 visemas, áudio `AudioOffset`, interfaces JS.
2. Microsoft: [Language and Voice Support](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts) — locale `pt-BR` e saída de viseme ID.
3. Microsoft: [JavaScript speech synthesis](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-speech-synthesis) — `SpeechSynthesizer` com `audioConfig=null` entrega áudio sem reproduzi-lo automaticamente.
4. Microsoft: [Speech REST access token](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/rest-text-to-speech) — acesso temporário e necessidade de renovação.
5. Microsoft: [Speech pricing](https://azure.microsoft.com/pricing/details/speech/) — franquia F0 para voz neural; verificar cota específica antes de ativar.
6. AWS: [Speech marks output](https://docs.aws.amazon.com/polly/latest/dg/output.html) e [Portuguese Brazil phoneme table](https://docs.aws.amazon.com/polly/latest/dg/ph-table-portuguese-br.html).
7. Simli: [Real-time avatar](https://www.simli.com/) — streaming de vídeo por áudio e planos divulgados (podem mudar).
8. Tavus: [Conversational video API and pricing](https://www.tavus.io/pricing).
9. Cloudflare: [Realtime AI audio](https://developers.cloudflare.com/realtime/sfu/examples/ai-audio/) — exemplo experimental com SFU, Worker e WebSocket.

## Arquitetura implementada na V110.4

```text
Usuário (voz/texto)
          ↓
Reconhecimento navegador em pt-BR / teclado
          ↓
Cloudflare Workers AI (conversa da personagem, já existente)
          ↓
Azure Speech SDK (opcional; pt-BR-FranciscaNeural)
          ├── áudio WAV → elemento de áudio do navegador
          └── 22 visemas + tempo → controlador de boca
                    ↓
   animação usando audio.currentTime, nunca relógio estimado
          ↓
Lia com fala + legenda e 8 famílias de sprites (retrato fictício)
```

**Princípio:** a referência para a boca é a posição de reprodução efetiva do áudio. Os eventos do sintetizador são *visemas reais*, não aproximados por letras. Entretanto, nossa geometria facial ainda tem apenas 8 posições; isso limita o realismo visual.

## Implementação e garantia

- Adicionado `public/static/js/azure-viseme.js` com carga sob demanda do SDK oficial e modo reversível.
- Endpoint `GET /api/avatar/speech-token` no Worker usa chave Azure somente no servidor, retorna token temporário. DESATIVADO POR PADRÃO.
- Mapeamento de visema IDs 0..21 para 8 famílias e animação pelo `audio.currentTime`.
- Mantém escuta opcional, pausa durante a fala, legenda, teclado, encerramento e fechamento de câmera.
- Se não configurado, o fluxo volta ao `SpeechSynthesisUtterance` existente; mostra estado aproximado.
- Sem pedir webcam para falar. Não ativa microfone sem ação da pessoa.

## Limites / próximos passos

1. **Não foi testado com voz Azure real.** Falta habilitar um recurso Speech do projeto. Um token simulado e testes de código não são equivalentes a uma execução online.
2. **Não é vídeo neural humano.** As 8 poses desenhadas continuam discretas e a foto tem limitações visuais. Para boca e expressão fotorrealistas é necessária conexão com serviço neural de avatar, com conta e cobrança possíveis.
3. **Tokens e custos:** a rota pública temporária tem mitigação simples por IP/instância, mas a demo NÃO tem autenticação robusta. Exigir limite global Cloudflare e controles antes de expor a serviço pago.
4. **Voz pt-BR:** testar a voz feminina padrão proposta com falantes brasileiros antes de publicação.
5. **Medições alvo para UX (não medições executadas):** tempo até início da resposta, atraso de renderização da boca contra a reprodução, interrupção da Lia, erro de microfone, mobilidade Safari/Chrome; gravar métricas anônimas somente com consentimento.
6. **Acessibilidade e transparência:** manter o selo 'SIMULAÇÃO EDUCATIVA', legenda sincronizada, botão Encerrar, opção de digitação e suporte a redução de movimentos.

## Ativação prática

Consulte `CONFIGURAR_VOZ_NEURAL_V110_4.md`. Sem isso não há sincronismo fonêmico real; os testes não substituem a autorização, a configuração e a verificação de custos.

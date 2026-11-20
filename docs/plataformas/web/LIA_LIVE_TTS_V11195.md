# V111.95 — LIA Web com voz neural feminina ao vivo, sem MP3

A proposta anterior de MP3 fixo (PR #50) foi cancelada sem merge. A LIA deve gerar a voz para cada resposta via Kokoro pf_dora no navegador; sem gravação prévia e sem serviço pago por caractere.

O Web Worker inicia aquecimento assim que o usuário entra no Modo Livre, durante o WhatsApp e antes da videochamada. A primeira frase curta é sintetizada e pode ser armazenada no cache local pelo próprio modelo; demais frases e respostas livres também são geradas pelo modelo na hora. O pré-cache não é um arquivo MP3 fixo distribuído pelo servidor.

No Safari iOS, o AudioContext é desbloqueado pelo toque em Atender. Se a reprodução do WAV dinâmico via Audio falhar por política de autoplay, há uma tentativa de reprodução via AudioContext já desbloqueado. Sem voz feminina pt-BR instalada, o modelo Kokoro continua a síntese em vez de desistir após nove segundos. As legendas ficam disponíveis e a pessoa pode acompanhar a conversa enquanto o motor prepara a fala.

Alterações de voz condicionadas ao canal Web; Android e iOS nativos preservados. O TTS pago não é utilizado na chamada. Não há migração D1.

Limites: no iPhone, o primeiro download do modelo Kokoro e a inferência podem ser demorados, principalmente em aparelhos antigos. Não é tecnicamente possível garantir latência zero ou voz indistinguível de uma pessoa real com TTS gratuito executado inteiramente no navegador. Conversação na nuvem não equivale a GPU TTS continuamente aquecida na nuvem.

Testar Node, CI, síntese real em Chromium e Safari iPhone manualmente.

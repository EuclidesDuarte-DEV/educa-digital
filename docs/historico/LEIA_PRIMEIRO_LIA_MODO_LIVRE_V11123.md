# Educa+ Digital V111.23 — LIA avançada na videochamada do Modo Livre

## O que foi implementado
- Base do **Educa+ Digital V111.21** preservada. Não há um novo chat flutuante nem portal comercial da LIA.
- A **videochamada original do Modo Livre** usa respostas reais do Ollama via Flask local (`qwen3:1.7b` por padrão), com contexto das últimas mensagens e personagem fictícia Lia.
- Respostas curtas em português brasileiro para menor latência. A interface mantém o fluxo WhatsApp → videochamada → ligação.
- O **motor Kokoro `pf_dora`** da videochamada é aproveitado localmente na porta `8900`, por proxy de servidor; o token não é enviado ao navegador.
- Ao detectar a voz local ativa, a videochamada liga automaticamente o motor neural, sem pedir código na tela. A primeira síntese curta acontece no aquecimento do servidor.
- **Aparência da LIA atual:** `LIGAR_LIA_EDUCA/04_COPIAR_APENAS_AVATAR.cmd` importa apenas as mídias visuais compatíveis da pasta `LIA_AI_INDEPENDENTE_V1_0` mediante backup. A LIA original permanece intocada.
- Se a voz real falhar, há fallback para a voz feminina pt-BR do navegador (quando disponível). Sem MuseTalk, os movimentos de lábios são aproximados e os clipes ilustrativos continuam.
- `GET /api/lia-modo-livre/status` retorna diagnóstico (não contém chaves).

## Como ligar no Windows
1. Extraia **esse ZIP em pasta nova**. Não misture com o Educa+ antigo nem com a LIA independente.
2. Certifique-se de que o Ollama e o modelo estão instalados: `ollama list` deve mostrar `qwen3:1.7b`. Para usar um modelo maior opcional (se couber na RAM): defina `LIA_EDUCA_MODELO=qwen3:4b-instruct` antes de iniciar o site.
3. Execute **`LIGAR_LIA_EDUCA/00_LIGAR_TUDO.cmd`**. Isto abre Ollama (caso inativo), Kokoro e site Educa local em janelas separadas. Na primeira vez, o Flask pode precisar instalar dependências.
4. Abra `http://127.0.0.1:5015`, entre no **Modo Livre** e avance até a **videochamada**. Responda por microfone ou texto.
5. Se os vídeos de fala estiverem diferentes da LIA independente mais recente, use **`04_COPIAR_APENAS_AVATAR.cmd`** com a LIA desligada e confira novamente.

## Importante para publicação na Cloudflare
**A Cloudflare não consegue acessar `127.0.0.1` de visitantes.** O Worker antigo continua usando Cloudflare Workers AI; esta implementação aprimora o **servidor Flask local**. Para levar o mesmo motor à nuvem, é necessário backend remoto seguro com autenticação, HTTPS, limites e proteção de dados (não basta publicar o ZIP).

## Limites honestos
- Ollama e Kokoro precisam estar instalados e acessíveis. O script reutiliza um ambiente virtual da LIA original, mas não remove nem modifica nada nele.
- O modo avançado ainda não garante reconhecimento de fala perfeito em todo iPhone/Android, nem sincronização labial exata em tempo real: a transição de clipes é aproximada sem MuseTalk.
- ComfyUI não é necessário para a **videochamada do Modo Livre**; deixá-lo desligado ajuda a economizar memória.
- A simulação inclui pedidos exclusivamente fictícios de Pix. Não recolhe senhas, códigos SMS, documentos nem dinheiro real.
- Se for público, precisa de revisão de segurança e testes em dispositivos reais antes de implantar.

## Testes
Use `py -3.11 -m unittest discover -s testes_lia_educa` e `npm test` se Node estiver disponível. São testes locais com respostas simuladas, não uma certificação da voz no notebook.

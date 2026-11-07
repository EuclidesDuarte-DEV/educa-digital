# Educa+ Digital V111.20 — Lia: voz feminina com prosódia mais contínua

**Base:** V111.19 do projeto completo. **Escopo:** exclusivamente a síntese de voz e os testes/diagnósticos associados. Não foi realizado deploy, alteração de D1, atualização do banco nem troca de vídeos.

## Melhorias técnicas

- **Menos voz picotada:** respostas curtas com várias frases são enviadas juntas ao Kokoro `pf_dora`, para que o próprio modelo produza a continuidade de entonação. Textos longos são divididos em limites de frase, preferindo pausas coerentes. Antes, toda frase era processada separadamente, mesmo em mensagens curtas.
- **Velocidade estável:** eliminada a modulação cíclica artificial de velocidade entre trechos. Os modos `natural` (1,00), `calma` (0,95) e `clara` (0,98) permanecem disponíveis.
- **Pausas sem duplicação:** ao unir trechos, o motor considera os silêncios que o modelo já colocou nas bordas. Evita acrescentar mais 140 a 160 ms quando já existe pausa suficiente. Mantém os fades curtos para evitar cliques e não modifica artificialmente o tom.
- **Leitura pt-BR:** melhorias em valores monetários, incluindo centavos e números maiores, e porcentagens simples.
- **Teste de voz:** `TESTAR_VOZ_LIA_WINDOWS.ps1` ganhou `-Estilo` e `-Texto`. O WAV de saída inclui o estilo no nome, permitindo comparar gravações sem sobrescrever.

## Atualizar SEM reinstalar o Python (patch recomendado)

Se você já executou a **V111.19** e o ambiente virtual `lia_motor\.venv` está funcionando, **use o `PATCH_V111_20_LIA_PROSODIA_NATURAL.zip`**:

1. No VS Code, pare o motor Lia com `Ctrl+C`.
2. Extraia **o conteúdo interno** do patch diretamente dentro da pasta `EDUCA_DIGITAL_V111_19_LIA_CONVERSA_NATURAL`, aceitando substituir os arquivos de código existentes.
3. **Não exclua** `.venv`, `.dev.vars`, `lia_motor\.motor.vars.local` nem nenhum arquivo de dados. O patch não contém credenciais nem arquivos do banco.
4. Inicie novamente:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\INICIAR_LIA_VOZ_HUMANA_WINDOWS.ps1
```

Em **outro** terminal na mesma pasta, teste com duas entonações:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\TESTAR_VOZ_LIA_WINDOWS.ps1 -Voz feminina -Estilo natural -PreCarregar
powershell -NoProfile -ExecutionPolicy Bypass -File .\TESTAR_VOZ_LIA_WINDOWS.ps1 -Voz feminina -Estilo calma
```

Os arquivos devem ser `teste_lia_feminina_natural.wav` e `teste_lia_feminina_calma.wav`. Ouça as duas amostras e escolha o estilo que soa melhor. Para testar com uma mensagem sua:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\TESTAR_VOZ_LIA_WINDOWS.ps1 -Voz feminina -Estilo natural -Texto 'Oi! Que bom falar com você. Como posso ajudar hoje?'
```

## Instalar o ZIP completo numa pasta nova

Se preferir a versão completa, extraia `EDUCA_DIGITAL_V111_20_LIA_VOZ_NATURAL_COMPLETO.zip` numa nova pasta e abra a pasta que contém `app.py`. O ambiente `.venv` **não acompanha o ZIP**. Se a nova pasta não tiver o ambiente virtual, instale como antes:

```powershell
py -3.11 -m venv .\lia_motor\.venv
.\lia_motor\.venv\Scripts\python.exe -m pip install --upgrade pip
.\lia_motor\.venv\Scripts\python.exe -m pip install -r .\lia_motor\requirements.txt
powershell -NoProfile -ExecutionPolicy Bypass -File .\CONFIGURAR_LIA_LOCAL_WINDOWS.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File .\INICIAR_LIA_VOZ_HUMANA_WINDOWS.ps1
```

## Se ainda soar robótica

**Confira primeiro a origem da voz.** O áudio `.wav` de `TESTAR_VOZ_LIA_WINDOWS.ps1` vem de Kokoro `pf_dora`. Já a videochamada web pode usar uma voz do **navegador** como alternativa quando o gateway neural não está autorizado ou acessível. O patch não melhora as vozes nativas do Chrome/Windows: na videochamada, acesse **Verificar avatar com IA** e autorize o motor da equipe, se o Worker conseguir acessar o servidor local. Um motor `127.0.0.1` no notebook não é automaticamente acessível à Cloudflare pública.

**Para mudar efetivamente o timbre**, não apenas as pausas: Chatterbox expressivo aceita uma **referência feminina real e consentida em PT-BR**, com gravação limpa de ~8–15 segundos (sem música, eco ou vozes sobrepostas):

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\INICIAR_LIA_VOZ_HUMANA_WINDOWS.ps1 -Expressiva -ReferenciaFeminina 'C:\CAMINHO\voz_feminina_autorizada.wav'
```

Para esse modo, o pacote `chatterbox-tts` e os respectivos pesos precisam estar instalados; o script não instala por conta própria. Uma amostra gerada por outro sintetizador pode reproduzir artefatos e **não equivale a uma gravação humana**. Não use a voz identificável de ninguém sem consentimento. Compare modelos ouvindo os WAVs no seu notebook.

## Verificações feitas nesta entrega

- Python: **23/23 testes locais** (incluindo correções de valor/porcentagem, ausência de pausas duplicadas e integridade das respostas).
- JavaScript: **85/85 testes**.
- Sem teste auditivo real com os pesos do Kokoro/Chatterbox neste ambiente, nem teste de microfone/GPU/MuseTalk no notebook. O realismo perceptivo não pode ser garantido sem ouvir e comparar.

## O que permanece intacto

Fluxo educacional, pré-teste, WhatsApp, videochamada, personagens fictícios, esquema e dados D1, site em Cloudflare, trilhas, 22 atividades e arquivos de vídeo. Não foi feito deploy nem sincronização no GitHub.

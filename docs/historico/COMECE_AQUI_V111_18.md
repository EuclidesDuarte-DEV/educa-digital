# Educa+ Digital V111.18 — voz feminina realista da Lia

## Por que a Lia estava com voz de homem?

A V111.17 usava `lia_motor/assets/lia_voz_referencia_demo.wav` como
**referência de timbre** para o Chatterbox, e essa referência tinha tom grave
(mediana acústica de aproximadamente 128 Hz). Isso não determina o gênero de
uma voz por si só, mas é compatível com o problema relatado. Ajustar apenas
pitch não substituiria a identidade vocal aprendida pelo motor.

Nesta atualização o **modo inicial da videochamada é a voz feminina Kokoro
`pf_dora`**. O modo **Chatterbox expressivo** usa uma **nova referência feminina
PT-BR**: o script `gerar_referencia_feminina.py` a sintetiza com `pf_dora`
na primeira inicialização. A amostra antiga grave foi renomeada como LEGADO
para evitar que seja usada sem querer. Caso tenha uma gravação feminina
**autorizada**, também pode usar uma referência própria, de boa qualidade,
sem ruído e entre 5 e 15 segundos; não utilize voz de terceiros sem consentimento.

## Aplique o PATCH sem reinstalar nada (melhor para este notebook)

1. Mantenha um backup da pasta V111.17. Pare o servidor local da Lia com Ctrl+C.
2. Baixe `PATCH_V111_18_LIA_VOZ_FEMININA.zip`.
3. Abra o terminal PowerShell **dentro da pasta V111.17**, aquela que já tem
   `lia_motor/.venv` e os arquivos `.vars` locais.
4. Extraia o PATCH nessa pasta, **substituindo os arquivos de código**. Pelo PowerShell:

```powershell
Expand-Archive -LiteralPath "$HOME\Downloads\PATCH_V111_18_LIA_VOZ_FEMININA.zip" -DestinationPath . -Force
```

O patch **não** contém `.venv`, `.dev.vars` ou `.motor.vars.local`; não
modifica suas credenciais nem suas dependências instaladas.

## Inicie de novo

No terminal da pasta V111.17 com o patch aplicado:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\INICIAR_LIA_VOZ_HUMANA_WINDOWS.ps1
```

No primeiro início o projeto prepara a amostra feminina `pf_dora`; pode baixar
modelos Kokoro. Depois inicia o servidor local na porta 8900.

No **segundo terminal**, teste PRIMEIRO a voz feminina garantida:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\TESTAR_VOZ_LIA_WINDOWS.ps1 -Voz feminina
```

Para comparar o Chatterbox expressivo com a nova referência feminina:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\TESTAR_VOZ_LIA_WINDOWS.ps1 -Voz expressiva -PreCarregar
```

O primeiro gera `teste_lia_feminina.wav`; o segundo gera
`teste_lia_expressiva.wav`. Ambos abrem o áudio no Windows.
O timbre do Chatterbox ainda pode variar; a confirmação é **ouvindo**.

### Se a referência feminina não for gerada

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\PREPARAR_VOZ_FEMININA_LIA_WINDOWS.ps1
```

Se o Chatterbox continuar pesado no notebook, inicie apenas Kokoro:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\INICIAR_LIA_VOZ_HUMANA_WINDOWS.ps1 -SomenteKokoro
```

## Para a videochamada

Abra `••• > Voz da Lia`: `Feminina brasileira · Dora` (padrão) ou
`Feminina expressiva · Chatterbox`. O código do Worker e o JavaScript
agora encaminham essa opção à API privada. A versão em Cloudflare **não foi
publicada automaticamente**: atualize o Worker/deploy e seu gateway HTTPs
somente após testar localmente. Não publique tokens de `.vars`.

A boca e os vídeos de fala continuam com crossfade. Synchronização fonética
precisa do MuseTalk com GPU configurada, e não é garantida pelos clipes.
O exercício permanece identificado como uma simulação com personagem fictícia.

## Testes

- 82 testes JS aprovados (incluindo seleção/autorização da voz).
- 18 testes Python aprovados (geração de referência simulada, sem baixar modelos).
- A qualidade acústica real da nova voz **precisa ser escutada no notebook**.

# Educa+ Digital V111.11 — Voz feminina da Lia

## Correção realizada

A V111.10 escolhia a primeira voz `pt-BR` que o navegador devolvia, podendo selecionar uma voz masculina. Nesta versão:

- A Lia só escolhe automaticamente vozes brasileiras com nomes femininos identificados (Francisca, Maria, Luciana etc.). Não usa voz masculina ou a primeira voz indiscriminadamente.
- Há um botão **Escolher voz feminina** na chamada do Modo Livre, na visualização realista e na página de teste. Escolha e ouça a prévia antes de salvar uma voz desconhecida.
- No navegador sem voz feminina, a interface avisa em vez de usar uma voz masculina.
- O motor Kokoro `pf_dora` (voz feminina neural pt-BR) continua sendo a opção recomendada para voz mais natural e consistente em todos os aparelhos. O MuseTalk recebe o mesmo áudio Kokoro para sincronizar a boca quando instalado.
- O restante do Modo Livre e a sequência WhatsApp → videochamada → ligação telefônica não foram modificados.

## Testar no Windows / VS Code

```powershell
npm.cmd install
npm.cmd test
npm.cmd run dev
```

Na página do Modo Livre, finalize a conversa de WhatsApp, atenda a videochamada e use **Escolher voz feminina** para ouvir uma prévia. Também é possível abrir `/teste-lia-voz-video.html`.

**Importante:** o navegador apenas oferece as vozes instaladas/disponíveis no equipamento. Não é possível garantir uma voz neural realista apenas alterando `pitch` e `rate`. Para voz neural feminina padronizada, instale o Kokoro em `lia_motor` e habilite o gateway privado como explicado em `COMECE_AQUI_V110_7.md`. Sem o motor, a qualidade varia por máquina. A versão já contém o código do Kokoro, mas não distribui os pesos do modelo.

**Cloudflare:** editar arquivos locais e iniciar `wrangler dev` não publica o site; o deploy continua independente. Não recrie o banco D1 nem informe senhas/códigos pessoais na simulação.

# Educa+ Digital V111.34 — Tutorial guiado e acessibilidade sob demanda

Atualização da V111.33. Não altera a LIA, Kokoro, rotas, banco ou atividades.

## Novo fluxo

- Primeira visita neste navegador: tutorial curto com foco real no ícone **Banco** (pré-teste) e no **ícone de acessibilidade**.
- Fundo escurecido e somente o alvo destacado. A pessoa pode ir para o próximo passo, tocar diretamente no alvo ou pular o guia.
- Clicar no Banco inicia o pré-teste normal. Clicar no ícone de acessibilidade abre as opções.
- O painel de acessibilidade **não** abre sozinho; abre apenas por toque.
- As preferências de tamanho do texto, cores e leitura em voz alta continuam aplicadas imediatamente e salvas no navegador.
- O botão **Como usar (?)** no cabeçalho permite repetir o tutorial, sem limpar preferências.
- Mantida a seta original do pré-teste após a conclusão do tutorial.

## Como testar

No terminal do VS Code, na pasta extraída:

```powershell
npm.cmd install
npm.cmd run dev
```

Abra o endereço mostrado no terminal (normalmente http://localhost:8787). Caso o guia não abra após um teste anterior, clique no ícone **? Como usar** no cabeçalho. Para verificar a primeira visita, use uma janela anônima.

**Observação:** as preferências são salvas no armazenamento local do navegador, não em uma avaliação clínica de visão. O modo de cores reforça o contraste; não diagnostica nem corrige todos os tipos de daltonismo.

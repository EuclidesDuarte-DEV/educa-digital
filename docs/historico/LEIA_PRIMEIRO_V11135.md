# Educa+ Digital V111.35 — Acessibilidade visível no celular

## Correção
A acessibilidade na V111.34 ficava somente no cabeçalho externo, que é ocultado no modo imersivo. Na V111.35, o botão aparece no canto direito do título da tela **O que você quer aprender hoje?** dentro do celular simulado, e há um atalho discreto para as demais telas do treino quando o cabeçalho não está disponível.

O botão abre as mesmas preferências: tamanho do texto, contraste e leitura em voz alta; continua opcional e salva as preferências localmente. A versão preserva as atividades, a navegação, o modo livre, a LIA AI e o Kokoro.

## Rodar localmente
Abra esta pasta no VS Code e execute `npm.cmd install` e `npm.cmd run dev`. Abra o endereço indicado no terminal (em geral http://localhost:8787). Faça login ou pré-teste e veja o botão **Acessibilidade** ao lado do título da central de aprendizagem.

A versão é um pacote para testes locais. Nenhum deploy Cloudflare foi executado.

# Educa+ Digital V110.1 — correção preventiva do D1 local

Esta atualização NÃO modifica o site publicado, nem os dados do Cloudflare D1 de produção. A V110 (videochamada com IA, pré-teste, WhatsApp original e 22 atividades) foi preservada. A única mudança funcional é a inicialização automática do banco **local** quando o servidor Wrangler é iniciado pelo comando correto.

## Iniciar no VS Code / PowerShell

1. Abra esta pasta, onde fica o `package.json` e `wrangler.toml`.
2. Execute `npm.cmd install` (apenas quando as dependências ainda não estiverem presentes).
3. Execute **`npm.cmd run dev`**, em vez de `npx.cmd wrangler dev`.
4. Abra o endereço que o Wrangler mostrar, geralmente `http://127.0.0.1:8787`.

O comando `npm run dev` executa automaticamente `npm run db:init:local` antes do servidor, criando as tabelas ausentes (incluindo `usuarios`) e o catálogo de 22 atividades. A inicialização utiliza **somente** `--local`. O SQL usa `CREATE TABLE IF NOT EXISTS` e `INSERT OR IGNORE`, portanto pode ser executado novamente sem apagar o cadastro já existente **nessa mesma pasta**.

### Alternativa de um clique no Windows

Dê dois cliques em `INICIAR_V110_WINDOWS.cmd`, que instala dependências se necessário e executa o mesmo procedimento. Confirme que o arquivo veio do pacote do projeto antes de executá-lo.

### Se o Wrangler já estiver rodando

Pressione `Ctrl+C`, depois execute `npm.cmd run dev` e tente o cadastro novamente. Não rode o servidor Flask e o Worker na mesma porta (eles usam portas distintas).

### Conferir apenas o banco local

```
npm.cmd run db:check:local
```

A consulta deve retornar a tabela `usuarios`. Para inicializar manualmente, caso precise:

```
npm.cmd run db:init:local
```

### Limites e segurança

- **Nunca execute `--remote` com `banco/schema.sql`.** Isso não faz parte da configuração da V110.1.
- Cada diretório extraído possui seu **próprio** banco de desenvolvimento `.wrangler`, não copiando os cadastros de versões anteriores.
- O comando `npx.cmd wrangler dev` executado diretamente **não dispara** a rotina `predev` do npm. Prefira `npm.cmd run dev`.
- O Workers AI (`env.AI`) pode usar recursos remotos e consumir franquia/créditos mesmo durante desenvolvimento. O script de inicialização do banco não faz chamadas à IA.
- A inicialização do banco não valida respostas reais do modelo nem o áudio/vídeo do avatar.

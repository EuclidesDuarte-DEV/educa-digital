# Educa+ Digital V111.39 — Correção da posição de acessibilidade

Base: V111.38. Atualização apenas da interface; sem mexer nas atividades, LIA ou Kokoro.

- **Página principal**: botão no topo/cabeçalho, à esquerda de **Como usar**; não acompanha nem fica do lado do celular.
- **Celular ampliado**: botão externo no canto superior direito logo abaixo de **Sair da tela cheia**.
- **Formulários/diálogos**: botão é ocultado enquanto o cadastro ou outra janela estiver aberta, evitando sobreposição.
- **Ao sair do modo ampliado**: botão volta ao cabeçalho automaticamente.
- **Responsividade**: em telas estreitas permanece um ícone de toque, sem quebrar o cabeçalho.

Teste local: `npm.cmd install` (caso ainda não instalado), `npm.cmd run dev`, abrir a URL local apresentada (geralmente `http://localhost:8787`). Faça `Ctrl+Shift+R` para limpar o cache caso veja a versão antiga. Versão não publicada em Cloudflare.

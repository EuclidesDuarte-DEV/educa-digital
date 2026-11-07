# Educa+ Digital V111.38 — Acessibilidade alinhada à tela cheia

Base: V111.37. Alteração pontual de posição do botão externo de acessibilidade.

- **Página principal:** posição mantida ao lado externo do celular, sem alterações no layout principal.
- **Celular em tela cheia:** atalho de acessibilidade exibido no canto superior direito, logo abaixo do botão **Sair da tela cheia**, sem sobrepor esse controle e sem entrar na interface do Android simulado.
- **Ao sair da tela cheia:** atalho retorna automaticamente para a posição original da página principal.
- O painel de acessibilidade, as preferências salvas, o tutorial de primeiros passos, atividades e a LIA/Kokoro foram preservados.

Execução local: `npm.cmd install` (se necessário), `npm.cmd run dev` e abrir `http://localhost:8787` ou a URL exibida no terminal. Não publicado na Cloudflare.

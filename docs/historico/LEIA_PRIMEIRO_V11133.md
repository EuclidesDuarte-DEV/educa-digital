# Educa+ Digital V111.33 — Preferências de acessibilidade

Base: **V111.32 — LIA Voz Rápida Kokoro**. Todas as trilhas, atividades, Modo Livre, voz Kokoro e avatar foram preservados.

## Alteração solicitada

Ao entrar pela primeira vez, aparece um **pop-up opcional** com três preferências (não é questionário nem diagnóstico):

- **Letras maiores**: tamanho padrão, grande ou muito grande. A interface se adapta imediatamente.
- **Cores com mais contraste**: reforça contornos, diferenças e legibilidade; não simula daltonismo.
- **Ler textos em voz alta**: ativa o botão **Ouvir esta tela**, acionado voluntariamente. Disponível também para texto selecionado. Usa a voz pt-BR fornecida pelo navegador, sem alterar a voz oficial Kokoro `pf_dora` da LIA.

Escolhas são salvas **neste navegador/dispositivo** (localStorage), sem coleta de informações sobre saúde e sem cadastro. Há uma entrada **Acessibilidade** no cabeçalho e outra em **Ajustes → Acessibilidade → Personalizar o Educa+**, além do botão em tela cheia. `Agora não` permite seguir sem ajustes.

## Iniciar no Windows + VS Code

1. Extraia o ZIP completo e abra a pasta no VS Code.
2. Execute `npm.cmd install` (somente na primeira instalação neste PC).
3. Execute `npm.cmd run dev`. O script prepara o D1 local antes de subir o Worker.
4. Abra a URL local exibida pelo terminal (normalmente `http://localhost:8787`).
5. Limpe apenas o armazenamento `educa-accessibility-v1` no navegador, se desejar rever o pop-up como visitante novo.

Não houve publicação automática na Cloudflare/GitHub. A V111.33 deve ser testada no navegador antes da publicação.

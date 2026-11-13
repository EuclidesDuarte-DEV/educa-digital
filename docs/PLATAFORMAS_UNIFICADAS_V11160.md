# Educa+ Digital — três plataformas, uma Cloudflare (V111.60)

## Decisão de arquitetura

A interface Web, o APK Android e o app iOS Swift **compartilham o backend** Cloudflare Workers, o banco D1 de produção e a LIA AI. O mesmo código de atividades, pré-teste, IA e voz que está em `public/static/js` é servido pela Cloudflare e atualizado sem recompilar os aplicativos.

As diferenças intencionais ficam isoladas nos três diretórios:
- **Só Web:** `public/static/channels/web/`, ou páginas exclusivamente web.
- **Só Android:** `public/static/channels/android/` e `android-app/`.
- **Só iOS:** `public/static/channels/ios/` e `ios-app/`.

O site normal usa o canal **web**. O APK Android usa `/?app=1&platform=android`. O Swift do iPhone usa `/?app=1&platform=ios`. O atalho PWA em tela inicial usa Android/iOS detectado pelo navegador quando não há parâmetro. Os canais são **opções de apresentação**, não um controle de autorização e não isolam a conta/banco.

## Regras de pedidos de atualização

| Seu pedido | Como é aplicado | Quais versões mudam |
| --- | --- | --- |
| "Atualize o Educa+" ou "Melhore a IA" | **[all]**. Altera recursos compartilhados | Web + Android + iPhone |
| "Mude só no site web" | **[web]**. Apenas `channels/web` ou páginas exclusivas da Web | Só Web |
| "Mude só no Android" | **[android]**. Apenas `channels/android` ou código Android | Só Android |
| "Mude só no iPhone/iOS" | **[ios]**. Apenas `channels/ios` ou código Swift iOS | Só iOS |
| "Mude apenas Android e iPhone" | **[mobile]**. Apenas arquivos específicos dos dois apps | Android + iOS; Web intacta |

Revisões devem ter título como `[web] Alterar cabeçalho apenas do site` ou `[all] Melhorar IA para todos`. Sem indicação de plataforma, o padrão é `[all]`. A checagem CI `Verificar escopo Web Android iOS` bloqueia mudanças em arquivos compartilhados quando o título indicar só uma plataforma. O teste **não substitui a revisão humana** e não impede diretamente alguém de editar a branch `main` se não houver regra de proteção habilitada no GitHub.

### Atenção à separação

Um arquivo como `src/free-chat.js`, `public/html/index.html` ou `public/static/js/training.js` é **compartilhado**. Alterá-lo muda todas as experiências que o utilizam. Para um ajuste solicitado só em uma plataforma, use os arquivos de `channels/<plataforma>` ou a embalagem nativa; se for impossível isolar a mudança, explique a dependência antes de alterar.

O cliente carrega **um único** `overrides.css` e **um único** `overrides.js` do seu canal, depois dos módulos compartilhados. O backend central é o mesmo. O carregador é `public/static/js/platform-channel-v11160.js`. O arquivo `/static/release-channels.json` é informativo, não consulta o banco nem faz atualizações de binários.

### Atualizações automáticas: o que realmente muda

- **Frontend/API compartilhada:** a publicação da Cloudflare atualiza Web, Android WebView e iOS WKWebView/PWA na próxima navegação online (respeitando cache e novas recargas). Não precisa republicar APK/IPA.
- **Estilo/comportamento só Web:** editar `channels/web` atualiza apenas a interface Web.
- **Estilo/comportamento só Android ou iOS:** editar seu canal atualiza só aquela interface no próximo carregamento online.
- **Mudança em código nativo Java/Swift ou permissões:** precisa gerar e **instalar uma nova versão assinada** do APK ou IPA. O GitHub Actions reconstrói somente o binário da plataforma alterada; ele não instala o arquivo no aparelho. O IPA atual é **não assinado**; distribuição TestFlight/App Store exige credenciais Apple. APK debug pode exigir reinstalação.

Quando houver mudança **nativa comum** às duas plataformas (por exemplo, permissões em ambos os shells), atualize os dois diretórios explicitamente com `[mobile]`. Melhorias de lógica compartilhada normalmente chegam às três pelo servidor Cloudflare.

## Verificar

`node --test tests/platform-channels-v11160.test.js`

`node scripts/validar-escopo-plataformas.mjs --scope web --files public/static/channels/web/overrides.css`

`node scripts/validar-escopo-plataformas.mjs --scope ios --files ios-app/EducaDigital/EducaDigitalApp.swift`

`node scripts/validar-escopo-plataformas.mjs --scope android --files public/static/js/training.js` deve falhar intencionalmente.

Para auditar PRs, o workflow `plataformas-escopo-v11160.yml` extrai a etiqueta do título e confere cada arquivo alterado. Não usa banco D1, não instala nada no usuário e não faz migrações.

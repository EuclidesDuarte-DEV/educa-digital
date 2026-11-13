# Educa+ Digital — TestFlight com atualizacao automatica (iOS)

O Educa+ pode distribuir novas versoes **nativas** pelo TestFlight da Apple. A rotina `.github/workflows/ios-testflight.yml` envia um IPA **assinado de verdade**, quando as credenciais Apple estao presentes no GitHub Actions. O workflow atual de IPA *sem assinatura* continua separado e nao instala no iPhone.

**Status inicial:** a rotina de distribuicao esta preparada, mas nenhuma conta Apple, certificado, perfil ou chave foi adicionado pelo repositorio. **Sem isso, nao existe instalacao por TestFlight.** O primeiro job mostra os nomes de secrets faltantes e o segundo job fica ignorado. Nunca coloque certificados, senhas ou a chave .p8 em arquivos versionados, issues ou mensagens de chat.

## 1. Preparar a conta Apple (uma vez)

- Inscreva-se e mantenha ativo o **Apple Developer Program**. Uma Apple Account comum gratuita nao habilita a distribuicao TestFlight.
- No portal Apple Developer, crie dois **App IDs explicitos**, sem wildcard: `com.educamaisdigital.educa` (app iPhone) e `com.educamaisdigital.educa.callerid` (extensao de identificacao de chamadas).
- Registre o **App Group** `group.com.educamaisdigital.educa` e habilite a capacidade App Groups nos dois App IDs. Essa configuracao e essencial para compartilhar a lista privada de numeros suspeitos.
- No [App Store Connect](https://appstoreconnect.apple.com/), crie o registro do aplicativo **Educa+ Digital** com o Bundle ID do app, `com.educamaisdigital.educa`. Configure os dados exigidos pela Apple.
- Crie ou use um certificado **Apple Distribution** com chave privada e exporte em **.p12 protegido por senha** a partir do Mac que o gerou. O .cer sozinho nao inclui a chave privada.
- Gere **dois provisioning profiles App Store Connect**, um para cada App ID, incluindo o App Group, ambos associados ao certificado de distribuicao. Baixe os dois `.mobileprovision`.
- Em App Store Connect → **Usuários e Acesso → Integrações → API do App Store Connect**, o titular deve solicitar acesso, caso necessario. Gere uma chave de API com permissao suficiente para enviar builds; guarde o arquivo `AuthKey_<KEY_ID>.p8`, o **Key ID** e o **Issuer ID**. A Apple so permite baixar a chave privada uma vez.

## 2. Cadastrar os 8 GitHub Actions secrets (uma vez)

Abra [Settings → Secrets and variables → Actions do repositório](https://github.com/EuclidesDuarte-DEV/educa-digital/settings/secrets/actions) e use **New repository secret** para cada entrada:

| Nome exato do secret | Valor |
| --- | --- |
| `IOS_APPLE_TEAM_ID` | Team ID Apple Developer, 10 caracteres |
| `IOS_APPLE_DISTRIBUTION_P12_BASE64` | Conteudo do arquivo .p12 em Base64 |
| `IOS_APPLE_DISTRIBUTION_P12_PASSWORD` | Senha de exportacao do certificado .p12 |
| `IOS_APPSTORE_PROFILE_BASE64` | Provisioning profile App Store Connect do app, Base64 |
| `IOS_CALLERID_PROFILE_BASE64` | Provisioning profile App Store Connect da extensao CallKit, Base64 |
| `IOS_ASC_KEY_ID` | Key ID da API do App Store Connect |
| `IOS_ASC_ISSUER_ID` | Issuer ID (UUID) da API do App Store Connect |
| `IOS_ASC_PRIVATE_KEY_BASE64` | Conteudo do arquivo .p8 em Base64 |

Para converter arquivos no Windows PowerShell, por exemplo, **no seu computador**, sem colar a chave em chats:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\Caminho\certificado.p12"))
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\Caminho\app.mobileprovision"))
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\Caminho\callerid.mobileprovision"))
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\Caminho\AuthKey_SEUKEYID.p8"))
```

Para converter no Mac: `base64 -i arquivo.p12 | tr -d '\n'` (repita para cada arquivo).

**Seguranca:** adicione os valores apenas na interface privada de Actions secrets. A rotina decodifica esses arquivos apenas no runner temporario, usa um keychain temporario e os apaga ao terminar. Nunca publique IPA assinado, chave .p8, .p12 ou provisioning profiles como artefatos publicos do GitHub.

## 3. Primeira publicacao no TestFlight

1. Abra [GitHub Actions — Educa+ iOS TestFlight](https://github.com/EuclidesDuarte-DEV/educa-digital/actions/workflows/ios-testflight.yml).
2. Clique em **Run workflow**, escolha `main` e execute. Se faltarem secrets, a verificacao explicara quais, e nenhum upload sera tentado.
3. Com as credenciais, a Action usa **macOS 26 / Xcode 26+**, gera icones e projeto XcodeGen, valida os dois perfis e App Groups, instala o certificado, cria o arquivo `.xcarchive`, exporta IPA com **assinatura Apple Distribution**, valida e envia pelo `xcrun altool` autenticado com a chave API.
4. Depois que o App Store Connect processar o build, em **TestFlight → Internal Testing** crie um grupo, marque **distribuicao automatica** e convide sua Apple Account como testador interno elegivel.
5. No iPhone, instale o aplicativo oficial **TestFlight** da App Store, aceite o convite recebido e instale o Educa+ pelo TestFlight.
6. Dentro do TestFlight, abra o app Educa+ e ative **Automatic Updates**. Isso atualiza o app quando a Apple disponibilizar o proximo build para o grupo.

Testadores externos podem precisar de uma revisao beta da Apple, alem do convite. Builds beta normalmente expiram apos **90 dias**, portanto TestFlight nao substitui publicacao definitiva na App Store.

## 4. Atualizacoes futuras

Depois da primeira configuracao, **qualquer push em `main` que altere `ios-app/**`, `public/static/channels/ios/**`, `public/static/icons_pwa/**` ou o workflow de TestFlight** aciona a compilacao/assinatura/envio automaticamente, sem baixar ZIP ou IPA. Um numero de build monotono (`GITHUB_RUN_NUMBER * 100 + GITHUB_RUN_ATTEMPT`) evita repetir o numero de build assinado.

**Mudancas apenas na Web/Cloudflare** ja sao carregadas pelo WKWebView do app quando ele usa o site oficial, sem precisar criar outro IPA. Ajustes nativos de permissoes, interface SwiftUI ou CallKit exigem novo build TestFlight. Android nao entra no fluxo.

A Apple **pode demorar para processar** o build, reprovar o upload por metadados/assinatura ou exigir revisao para distribuicao externa; portanto nao e possivel prometer que um push atualize imediatamente o aparelho. Ative atualizacoes automaticas dentro do TestFlight e use um grupo configurado para distribuicao automatica.

## 5. Verificar e resolver erros

- Job `Conferir configuracao de distribuicao Apple` exibiu secrets faltantes: configure a conta Apple e tente de novo.
- `Perfil ... nao inclui o App Group`: recrie os **dois** perfis App Store Connect com o grupo associado aos dois App IDs.
- Falha de `Apple Distribution`, arquivo `.p12` ou assinatura: exporte certificado com a chave privada, confira senha e Team ID.
- Erro API 401: confira Key ID, Issuer ID, chave .p8 e acesso a API.
- Erro por App Store Connect nao reconhecer Bundle ID: registre o app `com.educamaisdigital.educa` na equipe correta.
- Upload aceito, mas app nao aparece: acompanhe processamento na pagina do aplicativo em App Store Connect e verifique o grupo interno.
- Atualizacoes nao chegam: verifique a distribuicao automatica do grupo e a chave Automatic Updates do TestFlight no iPhone.

## Fontes oficiais

- [Apple — TestFlight overview](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/)
- [Apple — Add internal testers](https://developer.apple.com/help/app-store-connect/test-a-beta-version/add-internal-testers)
- [Apple — Upload builds](https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds/)
- [Apple — Provisioning profile App Store Connect](https://developer.apple.com/help/account/provisioning-profiles/create-an-app-store-provisioning-profile)
- [Apple — App Store Connect API](https://developer.apple.com/help/app-store-connect/get-started/app-store-connect-api)
- [Apple — TestFlight automatic updates](https://beta.itunes.apple.com/)

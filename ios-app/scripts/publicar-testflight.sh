#!/usr/bin/env bash
# Distribuicao iOS/TestFlight: usa somente credenciais do GitHub Actions Secrets.
# Nunca habilitar eco de comandos; nenhum segredo e gravado no repositorio ou artefato publico.
set -euo pipefail
umask 077

: "${RUNNER_TEMP:?GitHub Actions RUNNER_TEMP ausente}"
: "${GITHUB_RUN_NUMBER:?GITHUB_RUN_NUMBER ausente}"
: "${GITHUB_RUN_ATTEMPT:?GITHUB_RUN_ATTEMPT ausente}"
for nome in IOS_APPLE_TEAM_ID IOS_APPLE_DISTRIBUTION_P12_BASE64 IOS_APPLE_DISTRIBUTION_P12_PASSWORD IOS_APPSTORE_PROFILE_BASE64 IOS_CALLERID_PROFILE_BASE64 IOS_ASC_KEY_ID IOS_ASC_ISSUER_ID IOS_ASC_PRIVATE_KEY_BASE64; do
  if [[ -z "$(printenv "$nome")" ]]; then
    echo "::error::Secret obrigatorio ausente: $nome"
    exit 1
  fi
done
if [[ ! "$IOS_ASC_KEY_ID" =~ ^[A-Za-z0-9]{10}$ ]]; then
  echo "::error::IOS_ASC_KEY_ID invalido"
  exit 1
fi

TEMP_DIR="$(mktemp -d "$RUNNER_TEMP/educa-testflight.XXXXXXXX")"
KEYCHAIN_PATH="$TEMP_DIR/educa-build.keychain-db"
KEY_PATH="$HOME/.appstoreconnect/private_keys/AuthKey_$IOS_ASC_KEY_ID.p8"
PROFILE_DIR="$HOME/Library/MobileDevice/Provisioning Profiles"
APP_UUID=""
EXT_UUID=""

cleanup() {
  set +e
  [[ -n "$APP_UUID" ]] && rm -f "$PROFILE_DIR/$APP_UUID.mobileprovision"
  [[ -n "$EXT_UUID" ]] && rm -f "$PROFILE_DIR/$EXT_UUID.mobileprovision"
  rm -f "$KEY_PATH"
  security delete-keychain "$KEYCHAIN_PATH" >/dev/null 2>&1 || true
  rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

printf '%s' "$IOS_APPLE_DISTRIBUTION_P12_BASE64" | base64 -D > "$TEMP_DIR/distribution.p12"
printf '%s' "$IOS_APPSTORE_PROFILE_BASE64" | base64 -D > "$TEMP_DIR/educa-app.mobileprovision"
printf '%s' "$IOS_CALLERID_PROFILE_BASE64" | base64 -D > "$TEMP_DIR/educa-callerid.mobileprovision"
mkdir -p "$(dirname "$KEY_PATH")" "$PROFILE_DIR"
printf '%s' "$IOS_ASC_PRIVATE_KEY_BASE64" | base64 -D > "$KEY_PATH"
chmod 600 "$KEY_PATH"
if ! grep -q 'BEGIN PRIVATE KEY' "$KEY_PATH"; then
  echo "::error::A chave API privada App Store Connect nao possui formato .p8 valido"
  exit 1
fi

security cms -D -i "$TEMP_DIR/educa-app.mobileprovision" > "$TEMP_DIR/app-profile.plist"
security cms -D -i "$TEMP_DIR/educa-callerid.mobileprovision" > "$TEMP_DIR/extension-profile.plist"

python3 ios-app/scripts/prepare_testflight_config.py \
  --project ios-app/project.yml \
  --app-profile "$TEMP_DIR/app-profile.plist" \
  --extension-profile "$TEMP_DIR/extension-profile.plist" \
  --team "$IOS_APPLE_TEAM_ID" \
  --run-number "$GITHUB_RUN_NUMBER" \
  --run-attempt "$GITHUB_RUN_ATTEMPT" \
  --export-options "$TEMP_DIR/ExportOptions.plist"

APP_UUID="$(/usr/libexec/PlistBuddy -c 'Print :UUID' "$TEMP_DIR/app-profile.plist")"
EXT_UUID="$(/usr/libexec/PlistBuddy -c 'Print :UUID' "$TEMP_DIR/extension-profile.plist")"
cp "$TEMP_DIR/educa-app.mobileprovision" "$PROFILE_DIR/$APP_UUID.mobileprovision"
cp "$TEMP_DIR/educa-callerid.mobileprovision" "$PROFILE_DIR/$EXT_UUID.mobileprovision"

KEYCHAIN_PASSWORD="$(openssl rand -hex 24)"
security create-keychain -p "$KEYCHAIN_PASSWORD" "$KEYCHAIN_PATH"
security set-keychain-settings -lut 21600 "$KEYCHAIN_PATH"
security unlock-keychain -p "$KEYCHAIN_PASSWORD" "$KEYCHAIN_PATH"
security default-keychain -s "$KEYCHAIN_PATH"
security import "$TEMP_DIR/distribution.p12" -k "$KEYCHAIN_PATH" \
  -P "$IOS_APPLE_DISTRIBUTION_P12_PASSWORD" -T /usr/bin/codesign -T /usr/bin/security
security set-key-partition-list -S apple-tool:,apple: -s -k "$KEYCHAIN_PASSWORD" "$KEYCHAIN_PATH"
security find-identity -p codesigning -v "$KEYCHAIN_PATH"

bash ios-app/scripts/preparar-icone.sh
xcodegen generate --spec ios-app/project.yml --project ios-app

# App e extensao recebem os perfis explicitos corretos.
echo "Compilando Educa+ e extensao CallerID com assinatura de distribuicao Apple..."
xcodebuild -project ios-app/EducaDigitalIOS.xcodeproj \
  -scheme EducaDigital -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath "$TEMP_DIR/EducaDigital.xcarchive" \
  DEVELOPMENT_TEAM="$IOS_APPLE_TEAM_ID" CODE_SIGN_STYLE=Manual \
  archive > "$TEMP_DIR/archive.log" 2>&1 || {
    tail -n 130 "$TEMP_DIR/archive.log"
    echo "::error::Falha na compilacao/assinatura da Apple. Verifique certificado, perfis, Bundle IDs e App Groups."
    exit 1
  }

xcodebuild -exportArchive \
  -archivePath "$TEMP_DIR/EducaDigital.xcarchive" \
  -exportOptionsPlist "$TEMP_DIR/ExportOptions.plist" \
  -exportPath "$TEMP_DIR/export" > "$TEMP_DIR/export.log" 2>&1 || {
    tail -n 130 "$TEMP_DIR/export.log"
    echo "::error::Falha ao exportar IPA assinado do Educa+."
    exit 1
  }
IPA="$(find "$TEMP_DIR/export" -maxdepth 2 -type f -name '*.ipa' -print -quit)"
if [[ -z "$IPA" || ! -s "$IPA" ]]; then
  echo "::error::A Apple nao gerou IPA assinado"
  exit 1
fi

echo "Validando o IPA assinado no App Store Connect..."
xcrun altool --validate-app -f "$IPA" -t ios \
  --apiKey "$IOS_ASC_KEY_ID" --apiIssuer "$IOS_ASC_ISSUER_ID"

echo "Enviando nova versao assinada ao TestFlight..."
xcrun altool --upload-app -f "$IPA" -t ios \
  --apiKey "$IOS_ASC_KEY_ID" --apiIssuer "$IOS_ASC_ISSUER_ID"

{
  echo "### Educa+ Digital enviado ao App Store Connect"
  echo "- Arquivo iOS assinado e enviado com sucesso."
  echo "- Inclui app e extensao de identificacao de chamadas CallKit."
  echo "- A Apple pode levar algum tempo para processar o build antes de exibi-lo no TestFlight."
  echo "- Atualizacao automatica depende de um grupo de testes ativo e do TestFlight com Automatic Updates habilitado."
} >> "$GITHUB_STEP_SUMMARY"

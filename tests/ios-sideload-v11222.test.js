import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const project=read('ios-app/project-sideload.yml');
const workflow=read('.github/workflows/ios-sideload-v11222.yml');
const app=read('ios-app/EducaDigital/EducaDigitalApp.swift');
const webview=read('ios-app/EducaDigital/CloudflareTrainingWebView.swift');
const standard=read('ios-app/project.yml');
const guide=read('ios-app/INSTALAR_NO_IPHONE_WINDOWS_V11222.md');
test('IPA pessoal compila somente SwiftUI WebView e AppIcon, sem extensao',()=>{
  for(const filename of ['EducaDigital/EducaDigitalApp.swift','EducaDigital/CloudflareTrainingWebView.swift','EducaDigital/Assets.xcassets'])assert.ok(project.includes(filename),filename);
  assert.match(project,/com\.educamaisdigital\.educa\.personal/);
  assert.match(project,/CFBundleShortVersionString: "112\.22"/);
  assert.match(project,/UIStatusBarHidden: false/);
  const config=project.split('\n').filter(line=>!line.trim().startsWith('#')).join('\n');
  assert.doesNotMatch(config,/CallerIDExtension|CallProtectionView|RealCallEventBridge|SpamNumberStore|entitlements|com\.apple\.security\.application-groups/);
});
test('Projeto de distribuicao nativo original fica intacto',()=>{
  assert.match(standard,/CallerIDExtension:/);
  assert.match(standard,/com\.apple\.security\.application-groups/);
  assert.doesNotMatch(app,/showingCallProtection|CallProtectionView\(\)/);
});
test('UI compartilha Home Web e usa permissoes seguras iOS',()=>{
  assert.match(webview,/\/html\/\?app=1&platform=ios&experience=web/);
  assert.match(webview,/requestMediaCapturePermissionFor/);
  assert.match(webview,/trusted \? \.prompt : \.deny/);
  assert.match(app,/\.preferredColorScheme\(\.light\)/);
});
test('CI gera IPA sem extensao, sem assinatura nem credenciais Apple',()=>{
  assert.match(workflow,/runs-on: macos-15/);
  assert.match(workflow,/xcodegen generate --spec ios-app\/project-sideload\.yml/);
  assert.match(workflow,/CODE_SIGNING_ALLOWED=NO build/);
  assert.match(workflow,/iphoneos/);
  assert.match(workflow,/\.appex\/" in f/);
  assert.match(workflow,/SEM-ASSINATURA\.ipa/);
  assert.doesNotMatch(workflow,/secrets\.IOS_APPLE|IOS_APPLE_DISTRIBUTION_P12_BASE64/);
});
test('Guia de instalacao informa Sideloadly, Windows e restricoes',()=>{
  for(const word of ['Sideloadly','Windows','7 dias','Modo de Desenvolvedor','Safari','SEM-ASSINATURA'])assert.ok(guide.includes(word),word);
  assert.match(guide,/não estão assinados|não estão assinado|não está assinado|nenhum arquivo.*assinado/i);
  assert.match(guide,/não inclui a extensão nativa/);
});

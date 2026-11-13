import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = file => readFileSync(file, 'utf8');
const view = read('ios-app/EducaDigital/CallProtectionView.swift');
const web = read('ios-app/EducaDigital/CloudflareTrainingWebView.swift');
const yaml = read('ios-app/project.yml');
const app = read('ios-app/EducaDigital/EducaDigitalApp.swift');
const callKit = read('ios-app/CallerIDExtension/CallDirectoryProvider.swift');
const guide = read('ios-app/PROTECAO_CHAMADAS_V11168.md');

test('[ios] a versão 111.68 mantém extensão nativa e não altera o host', () => {
  assert.match(yaml, /CFBundleShortVersionString: "111\.68"/);
  assert.match(yaml, /com\.apple\.callkit\.call-directory/);
  assert.match(app, /CallProtectionView\(\)/);
  assert.match(web, /educa-digital\.educamaisdigital\.workers\.dev/);
  assert.match(callKit, /addIdentificationEntry\(/);
});

test('[ios] solicita permissão por gesto do usuário sem confundir com CallKit', () => {
  assert.match(view, /import UserNotifications/);
  assert.match(view, /getNotificationSettings/);
  assert.match(view, /requestAuthorization\(options: \[\.alert, \.sound\]\)/);
  assert.match(view, /Button\("Permitir notificações"\)/);
  assert.match(view, /func openNotificationSettings\(/);
  assert.match(view, /func checkNotificationPermissions\(/);
  assert.match(view, /func sendTestNotification\(/);
  assert.match(view, /UNTimeIntervalNotificationTrigger\(timeInterval: 8, repeats: false\)/);
  assert.match(view, /Educa\+ — aviso de demonstração/);
  assert.match(view, /NÃO uma chamada detectada/);
  assert.match(view, /permissão não identifica números desconhecidos/);
});

test('[ios] alerta visual fictício removido da WKWebView', () => {
  assert.doesNotMatch(web, /simulatedCallerWarning|educa-ios-training-caller-warning|Possível spam — número não identificado/);
  assert.match(view, /tela de chamada do próprio iPhone/);
  assert.match(view, /não exibe mais o aviso de spam/);
});

test('[ios] explicita limitações e exige app assinado para funcionar', () => {
  assert.match(guide, /Notificações \(UserNotifications\)/);
  assert.match(guide, /Live Caller ID Lookup/);
  assert.match(guide, /app nativo iOS assinado/);
  assert.match(guide, /não pode ser marcado automaticamente/);
  assert.match(guide, /Android ou à versão Web/);
  assert.doesNotMatch(callKit, /URLSession|UNUserNotificationCenter|addBlockingEntry\(/);
});

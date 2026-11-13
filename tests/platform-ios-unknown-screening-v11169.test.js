import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read = name => readFileSync(name, 'utf8');
const view = read('ios-app/EducaDigital/CallProtectionView.swift');
const extension = read('ios-app/CallerIDExtension/CallDirectoryProvider.swift');
const project = read('ios-app/project.yml');
const webview = read('ios-app/EducaDigital/CloudflareTrainingWebView.swift');
const guide = read('ios-app/PROTECAO_CHAMADAS_V11169.md');

test('[ios] mensagem solicitada é exibida no painel e usada no aviso de demonstração', () => {
  assert.match(view, /static let title = "Educa\+ Digital — Atenção"/);
  assert.match(view, /static let body = "Número desconhecido\. Tenha cuidado com possíveis tentativas de golpe\. Nunca compartilhe senhas ou códigos\."/);
  assert.match(view, /Text\(UnknownCallerSafetyMessage\.body\)/);
  assert.match(view, /SIMULAÇÃO —/);
  assert.match(view, /content\.body = UnknownCallerSafetyMessage\.body/);
  assert.match(view, /nenhuma ligação real foi identificada/);
});

test('[ios] triagem de não salvos é orientação da configuração nativa do iOS', () => {
  assert.match(view, /Section\("Proteger ligações de números não salvos"\)/);
  assert.match(view, /operatingSystemVersion\.majorVersion >= 26/);
  assert.match(view, /Filtrar Números Desconhecidos/);
  assert.match(view, /Perguntar Motivo da Ligação/);
  assert.match(view, /Silenciar Desconhecidos/);
  assert.match(view, /support\.apple\.com\/pt-br\/111106/);
  assert.match(view, /nenhum aplicativo pode ativá-la por você/);
  assert.match(view, /não permite mostrá-la automaticamente/);
});

test('[ios] nenhuma interceptação de telefonia real ou notificação falsamente disparada por chamada', () => {
  assert.doesNotMatch(view, /CXCallObserver|CXProvider\.reportNewIncomingCall|didReceiveIncomingPush|CNContactStore/);
  assert.doesNotMatch(extension, /UNUserNotificationCenter|addBlockingEntry\(|URLSession/);
  assert.match(extension, /SpamNumberStore\.read\(\)/);
  assert.match(extension, /addIdentificationEntry/);
  assert.doesNotMatch(webview, /simulatedCallerWarning/);
});

test('[ios] versão, escopo e explicação de limitações técnicas', () => {
  assert.equal((project.match(/CFBundleShortVersionString: "111\.71"/g) || []).length, 2);
  assert.match(guide, /NÃO é disparada automaticamente por toda ligação não salva/);
  assert.match(guide, /Live Caller ID Lookup/);
  assert.match(guide, /Android, Web, Cloudflare Workers, D1 e motor LIA não foram modificados/);
});

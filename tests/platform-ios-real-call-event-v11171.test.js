import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read = path => readFileSync(path, 'utf8');
const event = read('ios-app/EducaDigital/RealCallEventBridge.swift');
const app = read('ios-app/EducaDigital/EducaDigitalApp.swift');
const panel = read('ios-app/EducaDigital/CallProtectionView.swift');
const project = read('ios-app/project.yml');
const doc = read('ios-app/REAL_CALL_EVENT_TRIGGER_V11171.md');
const pwa = read('public/static/channels/ios/overrides.js');

test('[ios] observador de chamada nativa so funciona quando autorizado e ativo',()=>{
  assert.match(event, /class RealCallEventBridge: NSObject, ObservableObject, CXCallObserverDelegate/);
  assert.match(event, /private let callObserver = CXCallObserver\(\)/);
  assert.match(event, /func activateIfNeeded\(\)/);
  assert.match(event, /guard enabled, !observing else/);
  assert.match(event, /setDelegate\(self, queue: \.main\)/);
  assert.match(event, /func callObserver\(_ callObserver: CXCallObserver, callChanged call: CXCall\)/);
  assert.match(event, /guard !call\.isOutgoing, !call\.hasConnected else/);
  assert.match(event, /if call\.hasEnded/);
  assert.match(event, /notifiedCalls\.insert\(call\.uuid\)/);
  assert.match(event, /func setEnabled\(_ requested: Bool\)/);
  assert.match(event, /setDelegate\(nil, queue: nil\)/);
});

test('[ios] apenas ligacao real observada pode solicitar aviso e texto nao afirma numero nao salvo',()=>{
  assert.match(event, /UNUserNotificationCenter\.current\(\)\.getNotificationSettings/);
  assert.match(event, /permission == \.authorized/);
  assert.match(event, /UNNotificationRequest\(/);
  assert.match(event, /trigger: nil/);
  assert.match(event, /content\.title = "Educa\+ Digital — Atenção"/);
  assert.match(event, /Ligação recebida\. Se o número for desconhecido, tenha cuidado/);
  assert.match(event, /Nunca compartilhe senhas ou códigos/);
  assert.doesNotMatch(event, /CNContactStore|AVAudioRecorder|URLSession|PushKit|reportNewIncomingCall/);
  assert.doesNotMatch(event, /UnknownCallerSafetyMessage\.body/);
});

test('[ios] botao nativo de consentimento, sem injetar alerta no PWA',()=>{
  assert.match(app, /@StateObject private var realCallActivity = RealCallEventBridge\(\)/);
  assert.match(app, /realCallActivity\.activateIfNeeded\(\)/);
  assert.match(app, /\.environmentObject\(realCallActivity\)/);
  assert.match(panel, /@EnvironmentObject private var realCallActivity/);
  assert.match(panel, /Section\("Acionador próprio de chamada real \(experimental\)"\)/);
  assert.match(panel, /Toggle\("Avisar sobre atividade de ligação no iPhone"/);
  assert.match(panel, /realCallActivity\.setEnabled\(\$0\)/);
  assert.match(panel, /não sabe se está salvo nos contatos/);
  assert.match(panel, /Não é possível prometer funcionamento com o app fechado/);
  assert.doesNotMatch(pwa, /CXCallObserver|RealCallEventBridge/);
});

test('[ios] incrementa dois targets e documenta que não funciona em segundo plano',()=>{
  assert.equal((project.match(/CFBundleShortVersionString: "111\.71"/g) || []).length,2);
  assert.match(doc, /Nao disponibiliza numero do chamador/);
  assert.match(doc, /nao e gatilho garantido com app encerrado/i);
  assert.match(doc, /NAO funciona no PWA\/Safari/i);
  assert.match(doc, /validado fisicamente com uma chamada real/);
});

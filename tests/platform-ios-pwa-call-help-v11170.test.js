import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const js = readFileSync('public/static/channels/ios/overrides.js','utf8');
const css = readFileSync('public/static/channels/ios/overrides.css','utf8');

test('[ios] o aviso solicitado aparece como orientacao, nao como detecção de ligacao', () => {
  assert.match(js,/Educa\+ Digital — Atenção/);
  assert.match(js,/Número desconhecido\. Tenha cuidado com possíveis tentativas de golpe\. Nunca compartilhe senhas ou códigos\./);
  assert.match(js,/Não é uma notificação disparada por uma chamada real/);
  assert.match(js,/não pode exibir este texto automaticamente ao receber uma chamada/);
  assert.match(js,/Filtrar Números Desconhecidos/);
  assert.match(js,/Perguntar Motivo da Ligação/);
  assert.match(js,/support\.apple\.com\/pt-br\/guide\/iphone/);
  assert.doesNotMatch(js,/requestPermission\(|PushManager|callDetected|incomingCall|PhoneNumberEvent/);
});

test('[ios] o painel e acessivel e fica fora do simulador de celular', () => {
  assert.match(js,/document\.body/);
  assert.doesNotMatch(js,/#phoneScreen|freeCallView|innerHTML\s*=.*phoneScreen/);
  assert.match(js,/document\.createElement\('dialog'\)/);
  assert.match(js,/aria-labelledby/);
  assert.match(js,/showModal\(\)/);
  assert.match(js,/dialog\.close\(\)/);
  assert.match(js,/launcher\.focus\(\)/);
  assert.match(css,/env\(safe-area-inset-top/);
  assert.match(css,/max-height:calc\(100dvh - 32px\)/);
  assert.match(css,/:focus-visible/);
});

test('[ios] a camada roda somente para iPhone, sem duplicar painel no shell nativo', () => {
  for(const platform of ['web','android']){
    let created = 0;
    const root = {dataset:{educaPlatform:platform}};
    vm.runInNewContext(js,{
      document:{documentElement:root,createElement(){created++; return {};}},
      window:{},
      navigator:{},
      console
    },{timeout:1000});
    assert.equal(created,0);
  }
  assert.match(js,/dataset\.educaPlatform !== 'ios'/);
  assert.match(js,/window\.webkit\?\.messageHandlers\?\.educaIOS/);
  assert.match(js,/navigator\.standalone/);
  assert.match(js,/display-mode: standalone/);
});

test('[ios] a instalacao permanece pelo PWA e nao reivindica acesso ao CallKit',()=>{
  const manifest = JSON.parse(readFileSync('public/static/manifest.webmanifest','utf8'));
  assert.equal(manifest.display,'standalone');
  assert.match(manifest.start_url,/app=1/);
  assert.match(js,/O Educa\+ Web atualiza pela Cloudflare sem reinstalar/);
  assert.doesNotMatch(js,/CallKit|CXCallDirectoryManager|UNUserNotificationCenter/);
});

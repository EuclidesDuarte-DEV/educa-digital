import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const js=readFileSync('public/static/channels/ios/overrides.js','utf8');
const css=readFileSync('public/static/channels/ios/overrides.css','utf8');
const app=readFileSync('ios-app/EducaDigital/EducaDigitalApp.swift','utf8');

test('[ios] V112.22 tira botão e painel flutuantes de ligações do PWA e shell',()=>{
 assert.match(js,/floatingCallProtection:false/);
 assert.doesNotMatch(js,/createElement\(['"]button|createElement\(['"]dialog|showModal|innerHTML|launcher/);
 assert.doesNotMatch(css,/educa-ios-safety-launcher|educa-ios-safety-dialog/);
 assert.doesNotMatch(app,/showingCallProtection|shield\.lefthalf\.filled|CallProtectionView\(\)/);
});

test('[ios] canal preserva metadados sem invadir a tela do simulador',()=>{
 for(const [render,native,expected] of [
  ['web',undefined,false],['android',undefined,false],
  ['ios',undefined,true],['web','ios',true]
 ]) {
  let created=0;
  const root={dataset:{educaPlatform:render,educaNativePlatform:native}};
  const context={document:{documentElement:root,createElement(){created++;return {}}},window:{},console};
  vm.runInNewContext(js,context,{timeout:1000});
  assert.equal(created,0);
  assert.equal(Boolean(context.window.EducaIOSChannel),expected);
 }
 assert.doesNotMatch(js,/CallKit|CXCallDirectoryManager|UNUserNotificationCenter|fetch\(/);
});

test('[ios] PWA instala com tela inicial Web e permissões de chamadas não são fingidas',()=>{
 const manifest=JSON.parse(readFileSync('public/static/manifest.webmanifest','utf8'));
 assert.equal(manifest.display,'standalone');
 assert.match(manifest.start_url,/\/html\/\?experience=web/);
 assert.match(js,/callEventAccess:false/);
 assert.match(css,/data-educa-native-platform="ios"/);
});

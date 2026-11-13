import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
import {allowedFile,classify,scopeFromTitle,validate} from '../scripts/validar-escopo-plataformas.mjs';

const read=p=>readFileSync(p,'utf8');

test('escopo default é todos, scoped rejeita ativos compartilhados',()=>{
 assert.equal(scopeFromTitle('Melhorar LIA'), 'all');
 assert.equal(scopeFromTitle('[ios] Melhorar a navegação'), 'ios');
 assert.equal(scopeFromTitle('[web] Ajustar cabeçalho'), 'web');
 assert.equal(scopeFromTitle('[MOBILE] Mudar os apps'), 'mobile');
 assert.equal(classify('public/static/channels/android/overrides.css'),'android');
 assert.equal(classify('public/static/channels/ios/overrides.css'),'ios');
 assert.equal(classify('public/static/channels/web/overrides.js'),'web');
 assert.equal(classify('src/free-chat.js'),'shared');
 assert.equal(classify('public/static/js/training.js'),'shared');
 assert.equal(allowedFile('public/static/js/training.js','android'),false);
 assert.equal(allowedFile('ios-app/EducaDigital/EducaDigitalApp.swift','ios'),true);
 assert.equal(allowedFile('ios-app/EducaDigital/EducaDigitalApp.swift','mobile'),true);
 assert.equal(allowedFile('android-app/app/build.gradle','mobile'),true);
 assert.equal(allowedFile('android-app/app/build.gradle','web'),false);
 assert.equal(validate(['public/static/channels/web/overrides.css'],'web').ok,true);
 assert.equal(validate(['public/static/channels/web/overrides.css','public/static/js/training.js'],'web').ok,false);
 assert.equal(validate(['public/static/channels/web/overrides.css','ios-app/project.yml'],'all').ok,true);
 assert.equal(validate(['public/static/channels/web/overrides.css'],'garbage').ok,false);
});

test('Web, Android e iOS carregam somente seu canal',()=>{
 const loader=read('public/static/js/platform-channel-v11160.js');
 const run=({query='',ua='Mozilla/5.0',mobile=false,platform='Win32',touch=0})=>{
   const scripts=[],styles=[];
   const cl={contains:()=>mobile,add(){}};
   const root={classList:cl,dataset:{}};
   const ctx={
     location:{search:query},
     navigator:{userAgent:ua,platform,maxTouchPoints:touch},
     document:{documentElement:root,head:{appendChild(node){if(node.rel==='stylesheet')styles.push(node.href);else scripts.push(node.src);}},createElement(){return {}}},
     URLSearchParams,fetch:()=>{},window:{},console
   };
   vm.runInNewContext(loader,ctx,{timeout:1000});
   return {platform:root.dataset.educaPlatform,styles,scripts,info:ctx.window.EducaReleaseChannel};
 };
 for(const [options,expected] of [
   [{query:'',mobile:false},'web'],
   [{query:'?app=1&platform=ios',mobile:true,ua:'iPhone'},'ios'],
   [{query:'?app=1&platform=android',mobile:true,ua:'Android'},'android'],
   [{query:'?app=1',mobile:true,ua:'Mozilla/5.0 (iPhone)'},'ios'],
   [{query:'?app=1',mobile:true,ua:'Mozilla/5.0 (Linux; Android 15)'},'android'],
   [{query:'?platform=android',mobile:false,ua:'Android'},'web'],
   [{query:'?app=1&platform=ios',mobile:true,ua:'Mobile EducaNativeAndroid/1.0'},'android'],
 ]) {
   const result=run(options);
   assert.equal(result.platform,expected,JSON.stringify(options));
   assert.deepEqual([...result.styles],['/static/channels/'+expected+'/overrides.css?v=11160']);
   assert.deepEqual([...result.scripts],['/static/channels/'+expected+'/overrides.js?v=11160']);
   assert.equal(result.info.platform,expected);
 }
});

test('três canais reais e clientes nativos utilizam rotas específicas',()=>{
 for(const platform of ['web','android','ios']){
  assert.ok(existsSync('public/static/channels/'+platform+'/overrides.css'));
  assert.ok(existsSync('public/static/channels/'+platform+'/overrides.js'));
 }
 const html=read('public/html/index.html');
 assert.match(html,/platform-channel-v11160\.js\?v=11160/);
 assert.match(html,/educa-mobile-app/);
 assert.match(read('android-app/app/src/main/java/com/educamaisdigital/educa/MainActivity.java'),/\?app=1&platform=android/);
 assert.match(read('ios-app/EducaDigital/CloudflareTrainingWebView.swift'),/\?app=1&platform=ios/);
 const versions=JSON.parse(read('public/static/release-channels.json'));
 assert.equal(versions.channels.ios.native,'111.59');
 assert.equal(versions.channels.android.native,'111.58');
 assert.equal(versions.rules.server_shared,true);
});

test('build binário Android só é chamado por arquivos Android; iOS só por iOS',()=>{
 const android=read('.github/workflows/android-apk-v11158.yml');
 const ios=read('.github/workflows/ios-native-v11159.yml');
 assert.match(android,/public\/static\/channels\/android\/\*\*/);
 assert.doesNotMatch(android,/public\/static\/channels\/ios\/\*\*/);
 assert.match(ios,/public\/static\/channels\/ios\/\*\*/);
 assert.doesNotMatch(ios,/public\/static\/channels\/android\/\*\*/);
});

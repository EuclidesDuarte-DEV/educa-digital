import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const read=path=>readFileSync(path,'utf8');
const css=read('public/static/channels/web/overrides.css');
const sharedChat=read('public/static/js/free-mode.js');
const channel=read('public/static/js/platform-channel-v11160.js');
const html=read('public/html/index.html');

test('[web] V111.89 — controles da videochamada ficam acima da barra de gestos no desktop',()=>{
  assert.match(css,/V111\.89 — SOMENTE WEB/);
  const scope=/@media \(min-width:701px\)\{([\s\S]*?)\n\}/.exec(css);
  assert.ok(scope,'regra limitada a computadores com viewport a partir de 701px');
  assert.match(scope[1],/html\[data-educa-platform="web"\]/);
  assert.match(scope[1],/body\.lia-call-visible #phoneHardware #freeVideoView:not\(:fullscreen\) \.v110-video-bottom/);
  assert.match(scope[1],/bottom:max\(34px,calc\(27px \+ env\(safe-area-inset-bottom,0px\)\)\) !important/);
  assert.match(scope[1],/\.v110-selfie/);
  assert.match(scope[1],/bottom:clamp\(120px,36cqw,148px\)/);
  assert.match(scope[1],/\.v110-video-toolbar/);
  assert.doesNotMatch(scope[1],/body:not\(\.lia-call-visible\)/);
  assert.doesNotMatch(scope[1],/\.android-view:not\(#freeVideoView\)/);
});

test('[web] V111.89 — timeout do chat admite inferência lenta; nativos preservados',()=>{
  assert.match(sharedChat,/educaPlatform==='web'\?32000:17000/);
  assert.match(sharedChat,/responseTimer=setTimeout\(\(\)=>\{timedOut=true;abort.abort\(\);\},responseTimeoutMs\)/);
  assert.match(sharedChat,/clearTimeout\(responseTimer\)/);
  assert.match(sharedChat,/state\.scenario\?\.id!==current/);
  assert.match(sharedChat,/state\.request===abort/);
});

test('[web] V111.89 — versão nova de CSS/JS só para o canal web',()=>{
  const captures=[];
  function run(userAgent,expected,installed=false){
    const document={
      documentElement:{
        classList:{contains:()=>installed,add:()=>{}},
        dataset:{},
      },
      head:{appendChild:x=>captures.push(x)},
      createElement:tag=>({tagName:tag})
    };
    const navigator={userAgent,platform:'Win32',maxTouchPoints:0};
    const context={document,location:{search:''},navigator,URLSearchParams,
      window:{},fetch:()=>{}};
    vm.runInNewContext(channel,context);
    assert.equal(document.documentElement.dataset.educaPlatform,expected);
    assert.ok(captures[captures.length-2].href.includes('/'+expected+'/overrides.css?v='+
      (expected==='web'?'11189':'11160')));
  }
  run('Mozilla Windows Desktop','web');
  run('EducaNativeAndroid/1.0 Android','android',true);
  run('Mozilla iPhone OS Safari','ios',true);
  assert.match(html,/free-mode\.js\?v=11189&patch=11189/);
});

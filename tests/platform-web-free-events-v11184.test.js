import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const src=readFileSync('public/static/channels/web/free-events-v11184.js','utf8');
const loader=readFileSync('public/static/channels/web/overrides.js','utf8');

function setup(platform='web'){
  const state={now:0,active:true,view:'home',noticeHidden:true,calls:0,interval:null,observers:[],pagehide:null,dialog:false};
  const phone={
    dataset:{get currentView(){return state.view;}},
    classList:{contains:()=>state.active},
    querySelector:()=>state.dialog?{}:null
  };
  const notice={get hidden(){return state.noticeHidden;}};
  class FakeMutationObserver{
    constructor(fn){this.fn=fn;state.observers.push(this);}
    observe(){}
  }
  const document={
    documentElement:{dataset:{educaPlatform:platform}},
    get hidden(){return false;},
    getElementById:id=>id==='phoneScreen'?phone:id==='freeEventNotice'?notice:null
  };
  const window={
    EducaFreeMode:{isActive:()=>state.active,triggerEvent:()=>{state.calls++;state.noticeHidden=false;}},
    addEventListener:(name,cb)=>{if(name==='pagehide')state.pagehide=cb;}
  };
  const FakeDate={now:()=>state.now};
  vm.runInNewContext(src,{document,window,Date:FakeDate,MutationObserver:FakeMutationObserver,
    setInterval:fn=>{state.interval=fn;return 1;},
    clearInterval:()=>{state.interval=null;},
    Object,Boolean
  },{timeout:2000});
  const tick=delta=>{state.now+=delta;state.interval?.();};
  const notify=()=>{for(const o of state.observers)o.fn();};
  return {state,window,tick,notify};
}
test('[web] V111.84 — novos contatos quando está ocioso, sem poluir telas',()=>{
  const ui=setup();
  assert.equal(ui.window.EducaWebEvents.version,'11184');
  ui.tick(15000);
  assert.equal(ui.state.calls,0);
  ui.tick(10000);
  assert.equal(ui.state.calls,1);
  ui.tick(60000);
  assert.equal(ui.state.calls,1,'notificação pendente não é substituída');
  ui.state.noticeHidden=true;
  ui.notify();
  ui.tick(25000);
  assert.equal(ui.state.calls,2,'novo contato permitido após intervalo');
});
test('[web] V111.84 — conversa, SMS e chamadas nunca recebem interrupção extra',()=>{
  const ui=setup();
  for(const view of ['chat','free-sms','free-call','free-video','free-summary','free-pix']){
    ui.state.view=view;
    ui.tick(50000);
    assert.equal(ui.state.calls,0,view);
  }
  ui.state.view='home';
  ui.state.dialog=true;
  ui.tick(50000);
  assert.equal(ui.state.calls,0,'painel aberto');
  ui.state.dialog=false;
  ui.state.active=false;
  ui.tick(50000);
  assert.equal(ui.state.calls,0,'Modo Livre encerrado');
});
test('[ios/android] V111.84 — script não executa fora da Web',()=>{
  for(const platform of ['ios','android']){
    const ui=setup(platform);
    assert.equal(ui.state.interval,null);
    assert.equal(ui.window.EducaWebEvents,undefined);
  }
  assert.match(loader,/free-events-v11184\.js\?v=11184/);
  assert.match(src,/data-educa-platform/);
  assert.doesNotMatch(src,/\/api\/|fetch\(/);
});

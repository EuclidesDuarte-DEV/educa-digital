import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source=readFileSync('public/static/js/free-mode.js','utf8');
const page=readFileSync('public/html/index.html','utf8');
function setup(){
 const all=new Map(), requests=[],listeners={},timers=new Map();let timerId=0;
 const make=()=>({
  hidden:false,dataset:{},textContent:'',value:'',className:'',style:{},
  classList:{add(){},remove(){},toggle(){}}, children:[],
  append(...args){this.children.push(...args);},
  prepend(...args){this.children.unshift(...args);},
  replaceChildren(...args){this.children=[...args];},
  querySelector(){return null;},querySelectorAll(){return [];},
  remove(){},setAttribute(){},getAttribute(name){return name==='data-current-view'?this.dataset.currentView:null;},
  addEventListener(type,fn){(this.listeners??={})[type]=fn;},
  fire(type='click'){this.listeners?.[type]?.({preventDefault(){},stopImmediatePropagation(){}});},
  scrollHeight:0,scrollTop:0
 });
 const id=(key)=>{if(!all.has(key))all.set(key,make());return all.get(key);};
 const list=make();
 list.querySelectorAll=()=>[];
 const phone=id('#phoneScreen');phone.dataset.currentView='home';
 const document={
  querySelector(selector){if(selector==='#whatsappView .wa-chat-list')return list;if(selector.startsWith('#whatsappView [data-'))return null;return id(selector);},
  querySelectorAll(){return [];},
  createElement(){return make();},
  createTextNode(value){return value;},
  addEventListener(type,fn){listeners[type]=fn;}
 };
 const window={EducaFreeView:{isTraining(){return true;},setView(name){phone.dataset.currentView=name;}},
  EducaVideoCall:{incoming(s){requests.push(s.id);window.EducaFreeMode.enterVideo();phone.dataset.currentView='free-video';},close(){}},
  addEventListener(){},speechSynthesis:{cancel(){}}};
 const sandbox={document,window,MutationObserver:class{observe(){}},
  setTimeout(fn,ms){const id=++timerId;timers.set(id,{fn,ms});return id;},clearTimeout(id){timers.delete(id);},Math,Date,AbortController,console};
 vm.runInNewContext(source,sandbox);
 return {window,id,phone,requests,runTransition(){const entry=[...timers.entries()].find(([,v])=>v.ms===2800);assert.ok(entry,'transição automática programada');timers.delete(entry[0]);entry[1].fn();},hasTransition(){return [...timers.values()].some(v=>v.ms===2800);}};
}

test('V111.10: WhatsApp -> videochamada -> ligação de voz, sem pular desafio',()=>{
 const {window,id,phone,requests}=setup();
 const mode=window.EducaFreeMode;
 mode.start();
 mode.triggerEvent();
 assert.equal(id('#freeEventTitle').textContent,'Nova mensagem no WhatsApp');
 assert.deepEqual(requests,[],'a ligação não deve ocorrer antes da atividade WhatsApp');
 // Mesmo se o aviso for ignorado, não salta para ligação nem vídeo.
 id('#freeEventDismiss').fire();mode.triggerEvent();
 assert.equal(id('#freeEventTitle').textContent,'Nova mensagem no WhatsApp');
 // Abrir a conversa, bloquear o contato e concluir.
 id('#freeEventOpen').fire();
 assert.equal(phone.dataset.currentView,'chat');
 assert.equal(id('#freeFamilyActions').hidden,false);
 id('#freeFamilyBlock').fire();
 assert.equal(phone.dataset.currentView,'free-summary');
 assert.equal(id('#freeSummaryNext').textContent,'Avançar agora');
 id('#freeSummaryNext').fire();
 assert.deepEqual(requests,['video']);
 assert.equal(phone.dataset.currentView,'free-video');
 mode.hangupVideo();
 assert.equal(phone.dataset.currentView,'free-summary');
 assert.equal(id('#freeSummaryNext').textContent,'Avançar agora');
 id('#freeSummaryNext').fire();
 assert.equal(phone.dataset.currentView,'free-call');
 assert.equal(id('#freeCallName').textContent,'Central de segurança');
 assert.deepEqual(requests,['video']);
});
test('V111.12: atividades avançam automaticamente e sem clique intermediário',()=>{
 const {window,id,phone,requests,runTransition,hasTransition}=setup();
 const mode=window.EducaFreeMode;mode.start();mode.triggerEvent();
 id('#freeEventOpen').fire();id('#freeFamilyBlock').fire();
 assert.equal(phone.dataset.currentView,'free-summary');
 assert.ok(hasTransition());assert.match(id('#freeSummaryAuto').textContent,/automaticamente/);
 runTransition();assert.deepEqual(requests,['video']);assert.equal(phone.dataset.currentView,'free-video');
 mode.hangupVideo();assert.ok(hasTransition());runTransition();
 assert.equal(phone.dataset.currentView,'free-call');
 id('#freeCallHangup').fire();assert.ok(hasTransition());runTransition();
 assert.equal(phone.dataset.currentView,'home');
});
test('V111.12: sair do treinamento cancela avanço pendente',()=>{
 const {window,id,requests,runTransition,hasTransition}=setup();
 const mode=window.EducaFreeMode;mode.start();mode.triggerEvent();
 id('#freeEventOpen').fire();id('#freeFamilyBlock').fire();
 assert.ok(hasTransition());mode.stop();
 assert.equal(hasTransition(),false);assert.deepEqual(requests,[]);
});
test('V111.10: as ações seguras do WhatsApp e a transição explícita aparecem no HTML',()=>{
 for(const id of ['freeFamilyActions','freeFamilyVerify','freeFamilyBlock','freeSummaryNext'])assert.ok(page.includes(`id="${id}"`));
 assert.match(page,/free-mode\.js\?v=111(?:32|52|53)/);
});

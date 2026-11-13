import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const script=readFileSync('public/static/channels/web/overrides.js','utf8');
const css=readFileSync('public/static/channels/web/overrides.css','utf8');

// Simula a sequência real: o guia muda seu balão, o ResizeObserver move
// o destaque, e uma nova atividade surge com os textos ampliados.
function createSession(platform='web') {
  const listeners=new Map(),queue=[],classes=new Set(['a11y-text-extra']);
  let removeRootCount=0,computedCount=0,observer;
  const originals=[];
  function makeText(text) {
    const styles=new Map();
    const node={
      nodeType:1,tagName:'P',
      childNodes:[{nodeType:3,nodeValue:text}],
      attributes:new Set(),
      closest:(selector)=>selector.includes('.android-view.is-active')?{id:'bankSendView'}:null,
      style:{
        getPropertyValue:k=>styles.get(k)?.value||'',
        getPropertyPriority:k=>styles.get(k)?.priority||'',
        setProperty:(k,value,priority='')=>{styles.set(k,{value,priority});},
        removeProperty:k=>styles.delete(k)
      },
      setAttribute:k=>node.attributes.add(k),
      removeAttribute:k=>node.attributes.delete(k)
    };
    originals.push(node);
    return node;
  }
  const first=makeText('Conferir destinatário');
  const view={
    nodeType:1,
    closest:selector=>selector.includes('.android-view.is-active')?{id:'bankSendView'}:null,
    querySelectorAll:()=>originals
  };
  const phone={
    querySelectorAll:selector=>{
      if(selector === '.android-view'||selector === '.android-view.is-active') return [view];
      if(selector === '[data-educa-web-a11y-text]')
        return originals.filter(node=>node.attributes.has('data-educa-web-a11y-text'));
      return [];
    }
  };
  const document={
    documentElement:{dataset:{educaPlatform:platform},classList:{
      contains:x=>classes.has(x),
      add:x=>classes.add(x),
      remove:(...xs)=>{removeRootCount++;xs.forEach(x=>classes.delete(x));}
    }},
    querySelector:selector=>selector==='#phoneScreen'?phone:null,
    readyState:'complete',addEventListener(){}
  };
  const context={
    document,window:{
      addEventListener:(event,fn)=>listeners.set(event,fn),
      visualViewport:{addEventListener(){}}
    },
    requestAnimationFrame:fn=>{queue.push(fn);return queue.length},
    getComputedStyle:()=>{computedCount++;return {fontFamily:'Inter',fontSize:'11px'}},
    MutationObserver:class{constructor(fn){observer=fn} observe(){}},
    console,Array,Set,WeakSet,WeakMap,Number,parseFloat
  };
  vm.runInNewContext(script,context);
  const flush=()=>{
    let n=0;
    while(queue.length&&n++<20)queue.shift()();
    assert.ok(n<20,'possible frame loop');
  };
  return {
    first,originals,view,classes,flush,
    get counts(){return {removeRootCount,computedCount}},
    guideMutation(){
      observer([{type:'childList',target:{
        nodeType:1,closest:()=>null
      },addedNodes:[{nodeType:3,nodeValue:'Conferir dados'}]}]);
    },
    existingTextMutation(){
      observer([{type:'characterData',target:{
        nodeType:3,parentElement:first
      }}]);
    },
    addActivityText(){
      const other=makeText('Etapa 3 de 4');
      observer([{type:'childList',target:view,addedNodes:[other]}]);
      return other;
    },
    updateFont(){
      listeners.get('educa:accessibility-change')?.();
    }
  };
}

test('[web] destaque Pix não dispara reflow a cada mutação do balão do guia',()=>{
 const s=createSession();
 s.flush();
 const baseline=s.counts;
 assert.equal(s.first.style.getPropertyValue('font-size'),
   'max(var(--ed-web-text-min, 14px), calc(11px * var(--ed-font-factor, 1)))');
 for(let i=0;i<30;i++){s.guideMutation();s.flush();}
 assert.deepEqual(s.counts,baseline,
   'guide pointer mutation must not trigger another font sweep');
 for(let i=0;i<10;i++){s.existingTextMutation();s.flush();}
 assert.deepEqual(s.counts,baseline,
   'text replacement in already-scaled activity must not sweep again');
});

test('[web] novo texto de atividade cresce sem reescrever botões anteriores',()=>{
 const s=createSession();
 s.flush();
 const baseline=s.counts;
 const oldStyle=s.first.style.getPropertyValue('font-size');
 const dynamic=s.addActivityText();
 s.flush();
 assert.equal(dynamic.style.getPropertyValue('font-size'),
   'max(var(--ed-web-text-min, 14px), calc(11px * var(--ed-font-factor, 1)))');
 assert.equal(s.first.style.getPropertyValue('font-size'),oldStyle);
 assert.equal(s.counts.removeRootCount,baseline.removeRootCount+1,
   'one layout pass for genuinely new content');
 s.classes.delete('a11y-text-extra');
 s.classes.add('a11y-text-large');
 s.updateFont();s.flush();
 assert.equal(s.counts.removeRootCount,baseline.removeRootCount+1,
   'large / extra uses CSS factor, no repeat measurement');
 s.classes.delete('a11y-text-large');
 s.updateFont();s.flush();
 assert.equal(s.first.style.getPropertyValue('font-size'),'');
 assert.equal(dynamic.style.getPropertyValue('font-size'),'');
});

test('[web] banco mantém único painel de rolagem; Android e iOS não carregam override',()=>{
 assert.match(css,/#bankSendView\.android-view\.is-active\s*\{\s*overflow:\s*hidden\s*!important/);
 assert.match(css,/#bankSendView \.bank-content\s*\{[\s\S]*?overflow-anchor:\s*none/);
 assert.match(css,/scroll-behavior:\s*auto\s*!important/);
 assert.match(css,/#guideSpotlight,#guidePointer/);
 assert.match(css,/html\[data-educa-platform="web"\]/);
 for(const platform of ['android','ios']){
   const session=createSession(platform);
   session.flush();
   assert.equal(session.counts.removeRootCount,0);
   assert.equal(session.first.style.getPropertyValue('font-size'),'');
 }
});

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const js = readFileSync('public/static/channels/web/overrides.js','utf8');
const css = readFileSync('public/static/channels/web/overrides.css','utf8');

function harness(platform = 'web') {
 const listeners = new Map(), frames = [], attrs = new Set();
 const classes = new Set();
 const element = {
  tagName: 'P',
  childNodes: [{nodeType:3,nodeValue:'Confira os dados antes de fazer um Pix.'}],
  style: new (class {
   map=new Map();
   getPropertyValue(key){return this.map.get(key)?.value||''}
   getPropertyPriority(key){return this.map.get(key)?.priority||''}
   setProperty(key,value,priority=''){this.map.set(key,{value,priority})}
   removeProperty(key){this.map.delete(key)}
  })(),
  closest(){return null},
  setAttribute(key){attrs.add(key)},
  removeAttribute(key){attrs.delete(key)}
 };
 const view={
  querySelectorAll(){return [element]}
 };
 const phone={
  querySelectorAll(selector){
   if(selector === '.android-view' || selector === '.android-view.is-active')return [view];
   if(selector === '[data-educa-web-a11y-text]')return attrs.has('data-educa-web-a11y-text')?[element]:[];
   return [];
  }
 };
 const doc={
  documentElement:{
   dataset:{educaPlatform:platform},
   classList:{contains:c=>classes.has(c),add:c=>classes.add(c),remove:(...cs)=>cs.forEach(c=>classes.delete(c))}
  },
  querySelector:s=>s==='#phoneScreen'?phone:null,
  readyState:'complete',
  addEventListener(){}
 };
 let observerCallback=null;
 const win={
  addEventListener:(name,cb)=>listeners.set(name,cb),
  visualViewport:{addEventListener:()=>{}}
 };
 const context={
  document:doc,
  window:win,
  getComputedStyle:()=>({fontFamily:'Inter',fontSize:'12px'}),
  requestAnimationFrame:cb=>{frames.push(cb);return frames.length},
  MutationObserver:class {constructor(cb){observerCallback=cb}observe(){}},
  Set,WeakMap,Array,Number,parseFloat,console
 };
 vm.runInNewContext(js,context,{timeout:1000});
 function flush() {while(frames.length)frames.shift()()}
 return {win,classes,element,attrs,flush,accessibility:()=>listeners.get('educa:accessibility-change')?.(),
  mutation:()=>observerCallback?.([{type:'childList'}])};
}

test('[web] somente o navegador Web aplica ajustes de fontes internas',()=>{
 const android=harness('android');android.classes.add('a11y-text-extra');
 android.flush();
 assert.equal(android.win.EducaWebChannel,undefined);
 assert.equal(android.element.style.getPropertyValue('font-size'),'');
 const ios=harness('ios');ios.classes.add('a11y-text-large');ios.flush();
 assert.equal(ios.win.EducaWebChannel,undefined);
 const web=harness('web');
 assert.equal(web.win.EducaWebChannel.name,'web');
 assert.equal(web.win.EducaWebChannel.a11yActivityVersion,'11162');
});

test('[web] texto interno amplia em grande e muito grande e volta ao original',()=>{
 const ui=harness('web');
 ui.flush();
 assert.equal(ui.element.style.getPropertyValue('font-size'),'');
 ui.classes.add('a11y-text-large');
 ui.accessibility();ui.flush();
 assert.equal(ui.element.style.getPropertyValue('font-size'),'calc(12px * var(--ed-font-factor, 1))');
 assert.equal(ui.element.style.getPropertyPriority('font-size'),'important');
 assert.equal(ui.attrs.has('data-educa-web-a11y-text'),true);
 ui.classes.delete('a11y-text-large');ui.classes.add('a11y-text-extra');
 ui.accessibility();ui.flush();
 assert.equal(ui.element.style.getPropertyValue('font-size'),'calc(12px * var(--ed-font-factor, 1))');
 ui.mutation();ui.flush(); // conteúdo criado dinamicamente ao iniciar atividade.
 ui.classes.delete('a11y-text-extra');ui.accessibility();ui.flush();
 assert.equal(ui.element.style.getPropertyValue('font-size'),'');
 assert.equal(ui.attrs.has('data-educa-web-a11y-text'),false);
});

test('[web] reflow não utiliza zoom e não muda códigos Android/iOS',()=>{
 assert.match(css,/html\[data-educa-platform="web"\]/);
 assert.match(css,/data-educa-web-a11y-text/);
 assert.match(css,/overflow-y:\s*auto/);
 assert.match(css,/grid-template-columns:\s*minmax\(0,1fr\)/);
 assert.doesNotMatch(css,/(^|[;\s])zoom\s*:/m);
 assert.match(js,/educa:accessibility-change/);
 assert.match(js,/MutationObserver/);
 assert.match(js,/var\(--ed-font-factor,\s*1\)/);
 assert.match(js,/getComputedStyle\(el\)\.fontSize/);
});

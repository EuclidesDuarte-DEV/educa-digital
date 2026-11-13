import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const js=readFileSync('public/static/channels/web/overrides.js','utf8');
const css=readFileSync('public/static/channels/web/overrides.css','utf8');
const html=readFileSync('public/html/index.html','utf8');

test('[web] feedback de Pix não fica coberto pelo tutorial depois da resposta',()=>{
 assert.match(css,/#phoneScreen:has\(/);
 assert.match(css,/#bankReviewView\.is-active #bankReviewOptions button:is\(\.is-correct,\.is-wrong\)/);
 assert.match(css,/#bankSecurityView\.is-active #bankScamOptions button:is\(\.is-correct,\.is-wrong\)/);
 assert.match(css,/#guideOverlay\s*\{\s*display:none\s*!important/);
 assert.match(css,/#bankAnswerFeedback,#bankScamFeedback/);
 assert.match(css,/#bankReviewView,#bankSecurityView/);
 assert.match(html,/id="bankReviewOptions"/);
 assert.match(html,/id="bankAnswerFeedback"/);
 assert.ok(html.indexOf('id="bankReviewOptions"')<html.indexOf('id="bankAnswerFeedback"'));
});

test('[web] modo letras muito grandes aplica mínimo de 16px às fontes pequenas',()=>{
 assert.match(css,/\.a11y-text-extra\s*\{\s*--ed-web-text-min:16px;/);
 assert.match(css,/\.a11y-text-large\s*\{\s*--ed-web-text-min:14px;/);
 assert.match(js,/max\(var\(--ed-web-text-min, 14px\), calc\(/);
 assert.match(css,/grid-template-columns:minmax\(0,1fr\);\s*justify-items:start/);
 assert.match(css,/#bankAnswerFeedback,#bankScamFeedback/);
 assert.doesNotMatch(css,/\bzoom\s*:/);
});

function makeMock(platform='web') {
 const handlers=new Map(),frames=[],classes=new Set(['a11y-text-extra']);
 const fonts=new Map();
 const txt={nodeType:1,tagName:'SMALL',
  childNodes:[{nodeType:3,nodeValue:'Quem vai receber'}],
  closest:()=>null,
  style:{
    getPropertyValue:k=>fonts.get(k)?.value??'',
    getPropertyPriority:k=>fonts.get(k)?.priority??'',
    setProperty:(k,value,priority)=>fonts.set(k,{value,priority}),
    removeProperty:k=>fonts.delete(k)
  },setAttribute(){},removeAttribute(){}};
 const view={querySelectorAll:()=>[txt]};
 const phone={querySelectorAll:selector=>selector==='.android-view'||selector==='.android-view.is-active'?[view]:[]};
 const scroller={scrollTop:0,getBoundingClientRect:()=>({bottom:400})};
 const feedback={hidden:false,closest:()=>scroller,getBoundingClientRect:()=>({bottom:454})};
 const options={addEventListener:(event,fn)=>handlers.set(event,fn)};
 const doc={
   documentElement:{dataset:{educaPlatform:platform},classList:{contains:k=>classes.has(k),add:k=>classes.add(k),remove:(...keys)=>keys.forEach(k=>classes.delete(k))}},
   readyState:'complete',
   querySelector:selector=>selector==='#phoneScreen'?phone:null,
   getElementById:id=>id==='bankReviewOptions'?options:id==='bankAnswerFeedback'?feedback:null,
   addEventListener(){}
 };
 const win={addEventListener(){},visualViewport:{addEventListener(){}}};
 vm.runInNewContext(js,{document:doc,window:win,requestAnimationFrame:fn=>(frames.push(fn),frames.length),getComputedStyle:()=>({fontFamily:'Inter',fontSize:'8px'}),MutationObserver:class{observe(){}},WeakSet,WeakMap,Set,Array,Number,parseFloat,console},{timeout:1000});
 const flush=()=>{for(let i=0;frames.length&&i<15;i++)frames.shift()();assert.equal(frames.length,0,'layout loop');};
 return {handlers,flush,scroller,feedback,txt,fonts,win};
}
test('[web] correção rola feedback para área visível, mas não afeta Android/iOS',()=>{
 const web=makeMock();web.flush();
 assert.equal(web.fonts.get('font-size').value,'max(var(--ed-web-text-min, 14px), calc(8px * var(--ed-font-factor, 1)))');
 web.handlers.get('click')({target:{closest:()=>({dataset:{bankAnswer:'correct'}})}});
 web.flush();
 assert.equal(web.scroller.scrollTop,70);
 web.feedback.hidden=true;
 web.handlers.get('click')({target:{closest:()=>({dataset:{bankAnswer:'correct'}})}});
 web.flush();
 assert.equal(web.scroller.scrollTop,70);
 for(const platform of ['android','ios']){
   const app=makeMock(platform);app.flush();
   assert.equal(app.handlers.size,0);
   assert.equal(app.win.EducaWebChannel,undefined);
 }
});

test('[web] acerto continua legível na conclusão após avanço de 900 ms',()=>{
 assert.match(js,/pendingSuccessNote/);
 assert.match(js,/data-current-view/);
 assert.match(js,/attributeFilter:\s*\['data-current-view'\]/);
 assert.match(js,/web-pix-review-result/);
 assert.match(js,/successLearned/);
 assert.match(css,/#successView \.web-pix-review-result/);
 assert.match(css,/background:#e8f8ef/);
});

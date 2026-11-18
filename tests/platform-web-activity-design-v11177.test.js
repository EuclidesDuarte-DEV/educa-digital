import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const js=readFileSync('public/static/channels/web/overrides.js','utf8');
const css=readFileSync('public/static/channels/web/overrides.css','utf8');
const shield=readFileSync('public/static/channels/web/security-shield-v11177.svg','utf8');

function element(tag='span') {
  const attrs={};
  const children=[];
  return {
    tagName:tag.toUpperCase(),
    attributes:attrs,children,
    textContent:'',className:'',
    alt:'',decoding:'',
    setAttribute(name,value){attrs[name]=String(value)},
    getAttribute(name){return attrs[name]??null},
    appendChild(child){children.push(child)},
    querySelector(selector){return selector==='img'?children.find(x=>x.tagName==='IMG')??null:null}
  };
}
function fakeClassList(){
  const values=new Set();
  return {
    add(key){values.add(key)},
    toggle(key,on){if(on)values.add(key);else values.delete(key)},
    contains(key){return values.has(key)},
    has(key){return values.has(key)}
  };
}
function makeHeader(kind){
  const selector=kind==='lesson'?'.module-path-header > div':'.video-lesson-header > div';
  const marker=kind==='lesson'?'ed-activity-topic-icon':'ed-video-topic-icon';
  let badge=null;
  const content=element('div');
  return {
    querySelector(sel){
      if(sel===selector)return content;
      if(sel==='.'+marker)return badge;
      return null;
    },
    insertBefore(node,anchor){
      assert.equal(anchor,content);
      badge=node;
    },
    get mark(){return badge}
  };
}
function scene(platform='web'){
  const lessonHeader=makeHeader('lesson'),videoHeader=makeHeader('video');
  const pathClasses=fakeClassList(),videoClasses=fakeClassList();
  const title={textContent:'PIX'};
  const headline={textContent:'Confira os dados antes de pagar'};
  const intro={textContent:'Veja a orientação e depois pratique.'};
  const progress={textContent:'0 de 3 atividades'};
  const note={textContent:'Volte quando quiser.'};
  const aria={};
  const progressPanel={setAttribute(k,v){aria[k]=v}};
  let cards=[];
  const list={querySelectorAll(s){return s==='button[data-module-lesson]'?cards:[]}};
  const view={
    classList:pathClasses,
    querySelector(s){
      if(s==='.module-path-header')return lessonHeader;
      if(s==='.module-path-progress')return progressPanel;
      if(s==='.module-path-note p')return note;
      return null;
    }
  };
  const videoView={classList:videoClasses,querySelector(s){return s==='.video-lesson-header'?videoHeader:null}};
  const phone={querySelectorAll(){return []}};
  const nodes={
    modulePathView:view,videoLessonView:videoView,
    moduleLessonList:list,modulePathTitle:title,modulePathHeadline:headline,
    modulePathIntro:intro,modulePathProgressText:progress
  };
  let listRefresh=()=>{};
  const doc={
    documentElement:{dataset:{educaPlatform:platform},classList:{contains(){return false}}},
    readyState:'complete',head:null,
    getElementById(id){return nodes[id]??null},
    querySelector(s){return s==='#phoneScreen'?phone:null},
    createElement:element
  };
  const env={
    document:doc,window:{addEventListener(){},visualViewport:{addEventListener(){}}},
    MutationObserver:class {constructor(callback){this.callback=callback}
      observe(node){if(node===list)listRefresh=this.callback}},
    requestAnimationFrame(){return 1},console
  };
  vm.runInNewContext(js,env,{timeout:2500});
  function setTopic(name,done,total){
    title.textContent=name;
    cards=Array.from({length:total},(_,i)=>({
      classList:{contains:cls=>cls==='is-complete'&&i<done}
    }));
    listRefresh([{type:'childList'}]);
  }
  return {setTopic,title,headline,intro,progress,aria,note,pathClasses,
    videoClasses,lessonHeader,videoHeader};
}

test('[web] V111.77 — logos locais das seis trilhas e no cabeçalho do vídeo',()=>{
  const ui=scene();
  const cases=[
    ['PIX','pix','/static/icons/pix.svg',3],
    ['WhatsApp','whatsapp','/static/icons/whatsapp.svg',4],
    ['Segurança','security','/static/channels/web/security-shield-v11177.svg',4],
    ['Ajustes','settings','/static/icons/settings.svg',3],
    ['GOV.BR','govbr','/static/icons/govbr.svg',4],
    ['Apps seguros','playstore','/static/icons/playstore.svg',4]
  ];
  for(const [title,key,icon,total] of cases){
    ui.setTopic(title,1,total);
    assert.ok(ui.pathClasses.has('is-theme-'+key),title+' recebeu tema');
    assert.ok(ui.videoClasses.has('is-theme-'+key),title+' vídeo recebeu tema');
    assert.ok(ui.videoClasses.has('ed-web-video-polished'),'vídeo no Design System');
    assert.equal(ui.lessonHeader.mark.querySelector('img').getAttribute('src'),icon);
    assert.equal(ui.videoHeader.mark.querySelector('img').getAttribute('src'),icon);
    assert.equal(ui.progress.textContent,'1/'+total);
    assert.equal(ui.lessonHeader.mark.attributes['aria-hidden'],'true');
  }
  assert.match(shield,/<svg/);
  assert.match(shield,/viewBox="0 0 512 512"/);
});
test('[web] V111.77 — tema muda sem duplicar ícone nem apagar conclusão',()=>{
  const ui=scene();
  ui.setTopic('PIX',0,3);
  const mark=ui.lessonHeader.mark;
  ui.setTopic('PIX',2,3);
  assert.equal(ui.lessonHeader.mark,mark);
  assert.equal(ui.progress.textContent,'2/3');
  ui.setTopic('WhatsApp',4,4);
  assert.equal(ui.lessonHeader.mark,mark);
  assert.ok(ui.pathClasses.has('is-theme-whatsapp'));
  assert.ok(!ui.pathClasses.has('is-theme-pix'));
  assert.ok(ui.pathClasses.has('is-web-activity-complete'));
  assert.equal(ui.progress.textContent,'Parabéns! 100% das atividades concluídas!');
  assert.match(ui.aria['aria-label'],/4 de 4 atividades concluídas/);
  assert.equal(ui.lessonHeader.mark.querySelector('img').getAttribute('src'),'/static/icons/whatsapp.svg');
  assert.equal(ui.note.textContent,'Volte quando quiser para revisar o que aprendeu!');
});
test('[web] V111.77 — plataforma Android e iOS continuam intactas',()=>{
  for(const platform of ['android','ios']){
    const ui=scene(platform);
    ui.setTopic('PIX',3,3);
    assert.equal(ui.lessonHeader.mark,null);
    assert.equal(ui.videoHeader.mark,null);
    assert.ok(!ui.pathClasses.has('web-activity-simple'));
    assert.equal(ui.progress.textContent,'0 de 3 atividades');
  }
  assert.match(js,/dataset\.educaPlatform !== 'web'/);
});
test('[web] V111.77 — check vetorial segue classe real, sem estado falso',()=>{
  assert.match(css,/V111\.77 — SOMENTE WEB/);
  assert.match(css,/\.module-lesson-card\.is-complete \.module-lesson-number::after/);
  assert.match(css,/mask:url\("data:image\/svg\+xml/);
  assert.match(css,/\.ed-activity-topic-icon/);
  assert.match(css,/\.ed-video-topic-icon/);
  assert.match(css,/#videoLessonView\.ed-web-video-polished/);
  assert.match(css,/#videoPracticeBtn/);
  assert.match(css,/#videoLessonSummary/);
  assert.match(css,/\.video-safe-note/);
  assert.match(css,/a11y-text-extra/);
  assert.ok(!js.includes('completedLessons.add('),'Design System nao altera gravacao de progresso');
});
test('[web] V111.77 — apenas arquivos exclusivos Web podem ser modificados',async()=>{
  const {validate}=await import('../scripts/validar-escopo-plataformas.mjs');
  const files=[
    'public/static/channels/web/overrides.js',
    'public/static/channels/web/overrides.css',
    'public/static/channels/web/security-shield-v11177.svg',
    'tests/platform-web-activity-design-v11177.test.js',
    'docs/plataformas/web/DESIGN_SYSTEM_ATIVIDADES_V11177.md'
  ];
  assert.equal(validate(files,'web').ok,true);
  assert.equal(validate(['public/static/js/training.js'],'web').ok,false);
});


test('[web] V111.78 — check de conclusão centralizado sem alterar lógica ou plataformas',()=>{
  const selector='html[data-educa-platform="web"]\\n#modulePathView.web-activity-simple .module-lesson-card.is-complete .module-lesson-number::after {';
  const begin=css.indexOf(selector);
  assert.ok(begin>=0,'check restrito ao canal Web e ao estado real de conclusão');
  const end=css.indexOf('\\n}',begin);
  assert.ok(end>begin,'regra CSS deve terminar corretamente');
  const rule=css.slice(begin,end+2);
  for(const style of ['display:block','width:22px','height:22px','place-self:center','pointer-events:none']){
    assert.ok(rule.includes(style),'estilo esperado: '+style);
  }
  assert.ok(rule.includes('M5.5 12.5 L9.75 16.5 L18.5 7.75'),'desenho regular e equilibrado');
  assert.ok(rule.includes("stroke-width='3'"),'espessura uniforme');
  assert.ok(rule.includes("stroke-linecap='round'"),'pontas arredondadas');
  assert.ok(rule.includes('-webkit-mask:url("data:image/svg+xml'),'máscara Safari/WebKit');
  assert.ok(rule.includes('mask:url("data:image/svg+xml'),'máscara padrão');
  assert.ok(!js.includes('completedLessons.add('),'a apresentação não muda o progresso');
});

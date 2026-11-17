import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const read = file => readFileSync(file,'utf8');
const js=read('public/static/channels/web/overrides.js');
const css=read('public/static/channels/web/overrides.css');

function harness(platform='web') {
  let cards=[];
  const classes=new Set();
  const textNode=(text='')=>({textContent:text});
  const progress=textNode('0 de 3 atividades concluídas');
  const headline=textNode('Confira os dados antes de pagar');
  const intro=textNode('Veja a orientação e depois pratique.');
  const title=textNode('PIX');
  const note=textNode('Faça uma etapa por vez.');
  const aria={};
  const progressPanel={setAttribute:(key,value)=>{aria[key]=value}};
  const list={
    querySelectorAll(selector){
      return selector==='button[data-module-lesson]'?cards:[];
    }
  };
  const view={
    classList:{
      add:name=>classes.add(name),
      toggle:(name,on)=>on?classes.add(name):classes.delete(name)
    },
    querySelector(selector){
      return selector==='.module-path-progress'?progressPanel:
        selector==='.module-path-note p'?note:null;
    }
  };
  const nodes={
    modulePathView:view,moduleLessonList:list,modulePathTitle:title,
    modulePathHeadline:headline,modulePathIntro:intro,
    modulePathProgressText:progress
  };
  const phone={
    querySelectorAll(){return []}
  };
  let listObserver=()=>{};
  const observers=[];
  const doc={
    documentElement:{dataset:{educaPlatform:platform},classList:{contains(){return false}}},
    querySelector(selector){return selector==='#phoneScreen'?phone:null},
    getElementById(id){return nodes[id]??null},
    readyState:'complete',
    head:null
  };
  const context={
    document:doc,window:{addEventListener(){},visualViewport:{addEventListener(){}}},
    MutationObserver:class {
      constructor(callback){this.callback=callback;observers.push(this)}
      observe(node) {
        if(node===list)listObserver=this.callback;
      }
    },
    requestAnimationFrame(){return 1},
    console
  };
  vm.runInNewContext(js,context,{timeout:1500});
  const setLessons=(done,total)=>{
    cards=Array.from({length:total},(_,i)=>({
      classList:{contains:c=>c==='is-complete'&&i<done}
    }));
    listObserver([{type:'childList'}]);
  };
  return {classes,progress,headline,intro,note,title,aria,setLessons,ctx:context};
}

test('[web] a lista PIX sem nenhuma lição concluída tem 0/3 e apresentação simples',()=>{
  const ui=harness();
  ui.setLessons(0,3);
  assert.equal(ui.progress.textContent,'0/3');
  assert.equal(ui.headline.textContent,'Aprenda como fazer um Pix com segurança');
  assert.equal(ui.intro.textContent,'Siga os passos e pratique no seu ritmo.');
  assert.ok(ui.classes.has('web-activity-simple'));
  assert.ok(!ui.classes.has('is-web-activity-complete'));
  assert.match(ui.aria['aria-label'],/0 de 3 atividades concluídas/);
});

test('[web] contagem reflete estado real em 1/3, 2/3 e 3/3',()=>{
  const ui=harness();
  ui.setLessons(1,3);
  assert.equal(ui.progress.textContent,'1/3');
  ui.setLessons(2,3);
  assert.equal(ui.progress.textContent,'2/3');
  ui.setLessons(3,3);
  assert.equal(ui.progress.textContent,'Parabéns! 100% das atividades concluídas!');
  assert.equal(ui.note.textContent,'Volte quando quiser para revisar o que aprendeu!');
  assert.ok(ui.classes.has('is-web-activity-complete'));
  assert.match(ui.aria['aria-label'],/3 de 3 atividades concluídas/);
  // Reabrir a trilha após uma revisão deve remover o estado final se necessário.
  ui.setLessons(2,3);
  assert.equal(ui.progress.textContent,'2/3');
  assert.ok(!ui.classes.has('is-web-activity-complete'));
});

test('[web] temas de quatro lições continuam com títulos próprios e 1/4',()=>{
  const ui=harness();
  ui.title.textContent='Segurança';
  ui.setLessons(1,4);
  assert.equal(ui.progress.textContent,'1/4');
  assert.equal(ui.headline.textContent,'Confira os dados antes de pagar');
  assert.equal(ui.intro.textContent,'Veja a orientação e depois pratique.');
});

test('[web] código desativado totalmente no Android e iOS',()=>{
  for(const platform of ['android','ios']){
    const ui=harness(platform);
    ui.setLessons(3,3);
    assert.ok(!ui.classes.has('web-activity-simple'));
    assert.equal(ui.progress.textContent,'0 de 3 atividades concluídas');
  }
  assert.match(js,/dataset\.educaPlatform !== 'web'/);
  assert.match(css,/html\[data-educa-platform="web"\]/);
});

test('[web] layout da equipe: cartões numerados, chevron, badges e rolagem',()=>{
  assert.match(css,/V111\.76 — SOMENTE WEB/);
  assert.match(css,/#modulePathView\.web-activity-simple \.module-path-header/);
  assert.match(css,/#modulePathView\.web-activity-simple \.module-path-intro/);
  assert.match(css,/#modulePathView\.web-activity-simple \.module-lesson-card/);
  assert.match(css,/grid-template-columns:42px minmax\(0,1fr\) 22px/);
  assert.match(css,/min-height:92px/);
  assert.match(css,/min-height:44px/);
  assert.match(css,/overflow-y:auto !important/);
  assert.match(css,/\.is-web-activity-complete/);
  assert.match(css,/\.module-path-note/);
  assert.match(js,/querySelectorAll\('button\[data-module-lesson\]'\)/);
  assert.match(js,/classList\.contains\('is-complete'\)/);
  assert.match(js,/\.observe\(list, \{childList:true\}\)/);
  assert.match(js,/el\.closest\?\.\('#modulePathView \.module-path-surface, #videoLessonView \.video-lesson-surface'\)/);
  assert.doesNotMatch(css.slice(css.indexOf('V111.76 — SOMENTE WEB')),/(^|[;{\s])zoom\s*:/m);
});

test('[web] somente arquivos do canal web e testes web são alteráveis',async()=>{
  const {validate}=await import('../scripts/validar-escopo-plataformas.mjs');
  const allowed=[
    'public/static/channels/web/overrides.css',
    'public/static/channels/web/overrides.js',
    'tests/platform-web-simple-activities-v11176.test.js',
    'docs/plataformas/web/ATIVIDADES_SIMPLES_V11176.md'
  ];
  assert.equal(validate(allowed,'web').ok,true);
  assert.equal(validate(['public/static/js/training.js'],'web').ok,false);
});

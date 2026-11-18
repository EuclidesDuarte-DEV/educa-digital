import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const read=p=>readFileSync(p,'utf8');
const game=read('public/static/channels/web/gamification-v11182.js');
const loader=read('public/static/channels/web/overrides.js');
const css=read('public/static/channels/web/overrides.css');
const free=read('public/static/js/free-mode.js');
const training=read('public/static/js/training.js');

function runWebGamification(platform='web'){
  const ids=new Map();
  const store=new Map();
  const observers=[];
  let scenario='family';
  class Element {
    constructor(tag='div'){
      this.tagName=tag.toUpperCase();
      this.children=[];
      this.attrs={};
      this.listeners={};
      this.dataset={};
      this.style={};
      this.textContent='';
      this.className='';
      this.classes=new Set();
      this.classList={
        add:x=>this.classes.add(x),
        remove:x=>this.classes.delete(x),
        contains:x=>this.classes.has(x)
      };
      this.disabled=false;
    }
    set id(v){this._id=v;ids.set(v,this);}
    get id(){return this._id;}
    set innerHTML(v){
      this._html=v;
      if(this._id==='edModoLevelBadge'){
        const span=new Element('span');
        span.textContent='Nível 1';
        this.children.push(span);
      }
    }
    appendChild(v){this.children.push(v);v.parentElement=this;return v;}
    append(...nodes){for(const x of nodes)this.appendChild(x);}
    insertBefore(node,_before){this.children.unshift(node);node.parentElement=this;return node;}
    insertAdjacentElement(_position,node){this.parentElement?.appendChild(node);}
    remove(){if(this.parentElement)this.parentElement.children=this.parentElement.children.filter(x=>x!==this); if(this.id)ids.delete(this.id);}
    addEventListener(name,fn){this.listeners[name]=fn;}
    setAttribute(k,v){this.attrs[k]=String(v);}
    focus(){}
    querySelector(sel){if(sel==='span')return this.children.find(x=>x.tagName==='SPAN')||null;return null;}
    click(){this.listeners.click?.({target:this,preventDefault(){}});}
  }
  const phone=new Element('div');phone.id='phoneScreen';phone.dataset.currentView='learning';
  const header=new Element('header');
  const controls=new Element('div');controls.id='freeHomeTools';
  const fakeSummary=new Element('p');fakeSummary.id='freeSummaryText';
  const summaryRoot=new Element('div');summaryRoot.append(fakeSummary);
  const title=new Element('h2');title.id='freeSummaryTitle';
  const document={
    documentElement:{dataset:{educaPlatform:platform}},
    activeElement:null,
    getElementById:id=>ids.get(id)||null,
    querySelector:selector=>selector==='#learningView .learning-header'?header:null,
    createElement:tag=>new Element(tag),
    createTextNode:text=>{const t=new Element('text');t.textContent=text;return t;},
    addEventListener(){}
  };
  class MutationObserver{constructor(cb){observers.push(cb);}observe(){}}
  const window={
    EducaFreeMode:{videoState:()=>scenario},
    MutationObserver,
  };
  const localStorage={
    getItem:k=>store.get(k)||null,
    setItem:(k,v)=>{store.set(k,v);}
  };
  vm.runInNewContext(game,{document,window,MutationObserver,localStorage,Date,Object,Set,Math,Number,String,JSON}, {timeout:2000});
  const fire=(id,isSafe,active=true)=>{
    scenario=id;phone.dataset.currentView='free-summary';
    if(active) phone.classList.add('free-active');
    else phone.classList.remove('free-active');
    title.textContent=isSafe?'Situação concluída':'Atenção à decisão';
    for(const fn of observers)fn();
  };
  const walk=(root,cls)=>{
    if(root.className?.split(' ').includes(cls))return root;
    for(const child of root.children){const found=walk(child,cls);if(found)return found;}
    return null;
  };
  return {window,phone,controls,header,fire,walk,store};
}

test('[web] V111.82 — indicador discreto, XP só no Modo Livre e 3 faixas',()=>{
  const ui=runWebGamification();
  assert.equal(ui.window.EducaWebGamification.getSnapshot().level,1);
  assert.equal(ui.window.EducaWebGamification.getSnapshot().xp,0);
  const badge=ui.header.children.find(x=>x.id==='edModoLevelBadge');
  assert.ok(badge);
  assert.equal(badge.querySelector('span').textContent,'Nível 1');
  assert.equal(badge.attrs['aria-haspopup'],'dialog');
  assert.equal(ui.controls.children.find(x=>x.id==='edModoChallengeBtn')?.textContent,'Desafio');
  assert.ok(!game.includes('completedLessons.add('));
  assert.ok(!game.includes('/api/progresso'));
  assert.match(css,/#learningView \.ed-modo-level-badge/);
});

test('[web] pontuação: acertos sobem, erros descem, e a mesma situação não rende XP repetidamente',()=>{
  const ui=runWebGamification();
  ui.fire('family',true);
  assert.equal(ui.window.EducaWebGamification.getSnapshot().xp,20);
  ui.fire('family',true);
  assert.equal(ui.window.EducaWebGamification.getSnapshot().xp,20);
  for(const id of ['video','bank','code'])ui.fire(id,true);
  assert.equal(ui.window.EducaWebGamification.getSnapshot().xp,80);
  assert.equal(ui.window.EducaWebGamification.getSnapshot().name,'Intermediário');
  for(const id of ['relative','delivery'])ui.fire(id,false);
  assert.equal(ui.window.EducaWebGamification.getSnapshot().xp,50);
  assert.equal(ui.window.EducaWebGamification.getSnapshot().name,'Novato');
});

test('[web] pontua só enquanto a simulação estiver ativa; modo ausente não altera XP',()=>{
  const ui=runWebGamification();
  ui.fire('family',true);
  assert.equal(ui.window.EducaWebGamification.getSnapshot().xp,20);
  ui.fire('bank',true,false);
  assert.equal(ui.window.EducaWebGamification.getSnapshot().xp,20);
  ui.fire('bank',true);
  assert.equal(ui.window.EducaWebGamification.getSnapshot().xp,40);
});

test('[web] desafios têm complexidade crescente sem URLs, senhas reais ou Pix real',()=>{
  assert.match(game,/n1-number/);
  assert.match(game,/n2-delivery/);
  assert.match(game,/n3-video/);
  assert.match(game,/A aparência da mensagem não prova a origem/);
  assert.match(game,/Imagem, voz e nome podem ser imitados por IA/);
  assert.match(game,/Nenhum link ou Pix real é utilizado/);
  assert.match(game,/const tierFor=xp=>xp>=210\?3:xp>=80\?2:1/);
  assert.match(game,/safe\?20:-15/);
  assert.match(game,/correct\?15:-10/);
  assert.match(game,/model\.credits\[key\]===today\(\)/);
  assert.doesNotMatch(game,/fetch\s*\(/);
});

test('[web] dificuldade permanece isolada no canal Web; sem editar núcleo, Android/iOS ou D1',async()=>{
  assert.match(game,/educaPlatform !== 'web'/);
  assert.match(loader,/gamification-v11182\.js\?v=11182/);
  assert.match(loader,/educaPlatform !== 'web'/);
  const {validate}=await import('../scripts/validar-escopo-plataformas.mjs');
  const changed=[
    'public/static/channels/web/overrides.js',
    'public/static/channels/web/overrides.css',
    'public/static/channels/web/gamification-v11182.js',
    'tests/platform-web-gamification-v11182.test.js'
  ];
  assert.equal(validate(changed,'web').ok,true);
  assert.equal(validate([...changed,'public/static/js/free-mode.js'],'web').ok,false);
  assert.match(free,/function finish\(kind='safe',reason=''\)/);
  assert.match(free,/freeSummaryTitle/);
  assert.match(training,/function saveLessonComplete/);
});

test('[ios/android] nenhum elemento de gamificação é criado fora da Web',()=>{
  for(const platform of ['ios','android']){
    const ui=runWebGamification(platform);
    assert.equal(ui.window.EducaWebGamification,undefined);
    assert.equal(ui.header.children.length,0);
    assert.equal(ui.controls.children.length,0);
  }
});

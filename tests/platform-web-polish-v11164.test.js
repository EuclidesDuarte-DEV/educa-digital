import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const css=readFileSync('public/static/channels/web/overrides.css','utf8');
const js=readFileSync('public/static/channels/web/overrides.js','utf8');
const html=readFileSync('public/html/index.html','utf8');

function renderNavigation(platform='web') {
  const buttons=['Início','Extrato','Ajuda'].map((label,index)=>{
    const glyph={nodeType:3,nodeValue:['⌂','≡','?'][index]};
    const span={textContent:label};
    const children=[glyph,span];
    const attrs={};
    const button={
      childNodes:children,
      get firstChild(){return children[0]},
      querySelector(sel) {
        if(sel==='.web-bank-nav-icon')return children.find(node=>node.classList?.contains?.('web-bank-nav-icon'))||null;
        if(sel==='span')return span;
        return null;
      },
      setAttribute(name,value){attrs[name]=value},
      insertBefore(child,ref){children.splice(children.indexOf(ref),0,child)},
      get attrs(){return attrs}
    };
    return button;
  });
  function svgNode(tag){
    const classes=new Set(),attrs={};
    return {
      tag,childNodes:[],
      classList:{add:name=>classes.add(name),contains:name=>classes.has(name)},
      setAttribute:(name,value)=>{attrs[name]=value},
      appendChild(child){this.childNodes.push(child)},
      get attrs(){return attrs}
    };
  }
  const nav={querySelectorAll:selector=>selector==='button'?buttons:[]};
  const phone={querySelectorAll:()=>[]};
  const doc={
    documentElement:{dataset:{educaPlatform:platform}},
    querySelector:selector=>selector==='#phoneScreen'?phone:
      selector==='#bankHomeView .bank-bottom-nav'?nav:null,
    createElementNS:(_ns,tag)=>svgNode(tag),
    readyState:'complete',
    getElementById:()=>null
  };
  const window={
    addEventListener(){},
    visualViewport:{addEventListener(){}}
  };
  const frames=[];
  vm.runInNewContext(js,{
    document:doc,window,requestAnimationFrame:fn=>(frames.push(fn),frames.length),
    Set,WeakSet,WeakMap,Array,parseFloat,console
  },{timeout:1000});
  while(frames.length)frames.shift()();
  return {buttons,window};
}

test('[web] navegação do banco usa ícones SVG reais e mantém rótulos e botões',()=>{
  const {buttons,window}=renderNavigation('web');
  assert.equal(window.EducaWebChannel?.a11yActivityVersion,'11164');
  for(const [i,button] of buttons.entries()){
    const icon=button.querySelector('.web-bank-nav-icon');
    assert.equal(icon?.tag,'svg');
    assert.equal(icon.attrs['aria-hidden'],'true');
    assert.equal(icon.attrs.viewBox,'0 0 24 24');
    assert.ok(icon.childNodes.length>=1);
    assert.equal(button.attrs['aria-label'],['Início','Extrato','Ajuda'][i]);
    assert.equal(button.childNodes[1].nodeValue,'');
    assert.equal(button.querySelector('span').textContent,['Início','Extrato','Ajuda'][i]);
  }
});

test('[web] Android/iOS não têm alterações em sua barra',()=>{
  for(const platform of ['android','ios']){
    const {buttons,window}=renderNavigation(platform);
    assert.equal(window.EducaWebChannel,undefined);
    for(const btn of buttons) {
      assert.equal(btn.querySelector('.web-bank-nav-icon'),null);
      assert.equal(btn.attrs['aria-label'],undefined);
    }
  }
});

test('[web] card depois do treino some sem alterar HTML original',()=>{
  assert.match(html,/class="real-app-companion bank-real-apps"/);
  assert.match(css,/html\[data-educa-platform="web"\] #bankHomeView \.bank-real-apps\s*\{\s*display:none !important/);
  assert.match(css,/#bankHomeView \.bank-content\s*\{[^}]*padding-bottom:82px/);
  assert.match(css,/#bankHomeView \.bank-bottom-nav button\s*\{/);
  assert.match(css,/min-height:44px/);
  assert.match(css,/\.web-bank-nav-icon\s*\{/);
});

test('[web] fontes têm hierarquia: legenda, ação e título, sem zoom forçado',()=>{
  assert.match(css,/V111\.64 — Somente Web/);
  assert.match(css,/--ed-web-text-min:14px/);
  assert.match(css,/--ed-web-text-min:15px/);
  assert.match(css,/--ed-web-text-min:16px/);
  assert.match(css,/--ed-web-text-min:19px/);
  assert.match(css,/\.bank-training-note strong/);
  assert.match(css,/\.pix-practice-progress/);
  assert.match(css,/\.bank-bottom-nav button span/);
  assert.match(css,/\.bank-shortcut strong/);
  assert.match(css,/\.bank-welcome h2/);
  assert.doesNotMatch(css,/(^|[;{\s])zoom\s*:/m);
});

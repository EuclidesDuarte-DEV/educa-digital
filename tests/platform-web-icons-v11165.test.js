import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const JS=readFileSync('public/static/channels/web/icons-v11165.js','utf8');
const CSS=readFileSync('public/static/channels/web/overrides.css','utf8');
const WEB=readFileSync('public/static/channels/web/overrides.js','utf8');
const HTML=readFileSync('public/html/index.html','utf8');
const iconData=JSON.parse(readFileSync('public/static/channels/web/icons-data-v11165.json','utf8'));

test('[web] 54 vetores locais Lucide sem CDN externo',()=>{
  assert.ok(Object.keys(iconData).length>=50);
  for(const name of ['mail','smartphone','id-card','qr-code','receipt-text',
    'credit-card','shield-check','lock-keyhole','house','message-circle','camera',
    'paperclip','send','menu','search','users','file-pen-line']) {
    assert.ok(iconData[name], 'Faltando: '+name);
    assert.match(iconData[name],/<(?:path|rect|circle|line|polyline|polygon)\b/);
  }
  assert.match(JS,/https:\/\/lucide.dev\/license/);
  assert.match(JS,/asset = '\/static\/channels\/web\/icons-data-v11165.json'/);
  assert.doesNotMatch(JS,/cdn\.jsdelivr|unpkg\.com|fonts\.googleapis/);
  assert.match(WEB,/\/static\/channels\/web\/icons-v11165\.js\?v=11165/);
});

test('[web] seletores específicos dos ícones e logos nativos preservados',()=>{
  assert.match(HTML,/data-pix-type="email">✉ E-mail/);
  assert.match(HTML,/data-pix-type="phone">▣ Celular/);
  assert.match(HTML,/data-pix-type="cpf">◉ CPF/);
  assert.match(JS,/#pixTypeGrid \[data-pix-type="email"\]/);
  assert.match(JS,/#pixTypeGrid \[data-pix-type="phone"\]/);
  assert.match(JS,/#pixTypeGrid \[data-pix-type="cpf"\]/);
  assert.match(JS,/\.gov-bottom-nav/);
  assert.match(JS,/\.gov-service-card/);
  assert.match(JS,/\.chat-composer/);
  assert.match(JS,/\.bank-generic-icon/);
  assert.match(HTML,/\/static\/icons\/pix\.svg/);
  assert.match(HTML,/\/static\/icons\/whatsapp\.svg/);
  assert.match(HTML,/\/static\/icons\/govbr\.svg/);
  assert.match(CSS,/data-educa-platform="web"/);
  assert.match(CSS,/#pixTypeGrid button\.ed-lucide-row/);
  assert.match(CSS,/focus-visible/);
  assert.match(CSS,/a11y-text-extra/);
});

function testDOM(platform='web') {
  const elements=new Map();
  const attr=(name)=>({name});
  function button(initial) {
    const text={nodeType:3,nodeValue:initial};
    const attributes={};
    const icons=[];
    const classes=new Set();
    return {
      tagName:'BUTTON',childNodes:[text],
      get text(){return text.nodeValue},
      get icons(){return icons},
      setAttribute:(k,v)=>{attributes[k]=v},
      hasAttribute:k=>Object.hasOwn(attributes,k),
      get attributes(){return attributes},
      classList:{add:c=>classes.add(c),contains:c=>classes.has(c)},
      querySelector:sel=>sel==='.ed-lucide-icon'?icons[0]||null:null,
      insertBefore:(svg,ref)=>{assert.equal(ref,text);icons.push(svg);},
      get children(){return icons},
      get textContent(){return text.nodeValue},
      set textContent(v){text.nodeValue=v},
    };
  }
  const email=button('✉ E-mail'),phoneBtn=button('▣ Celular'),cpf=button('◉ CPF');
  const inputs=[
    ['#pixTypeGrid [data-pix-type="email"]',email],
    ['#pixTypeGrid [data-pix-type="phone"]',phoneBtn],
    ['#pixTypeGrid [data-pix-type="cpf"]',cpf]
  ];
  for(const [sel,el] of inputs) elements.set(sel,[el]);
  const main={
    querySelectorAll:selector=>elements.get(selector)||[]
  };
  const doc={
    documentElement:{dataset:{educaPlatform:platform}},
    querySelector:sel=>sel==='#phoneScreen'?main:null,
    createElementNS:(_ns,tag)=>{
      assert.equal(tag,'svg');
      const attrs={};
      const cls=new Set();
      return {tagName:'svg',attrs,
        classList:{add:c=>cls.add(c),contains:c=>cls.has(c)},
        setAttribute:(k,v)=>{attrs[k]=v}
      };
    },
    readyState:'complete',
    addEventListener:()=>{}
  };
  const queue=[];
  const win={fetch:async()=>({ok:true,json:async()=>iconData})};
  const context={document:doc,window:win,fetch:win.fetch,
    requestAnimationFrame:cb=>(queue.push(cb),queue.length),
    MutationObserver:class{observe(){}},console,Set,Array};
  return {doc,inputs,context,queue};
}

test('[web] Pix E-mail/Celular/CPF viram SVG sem perder os rótulos',async()=>{
  const dom=testDOM();
  vm.runInNewContext(JS,dom.context,{timeout:1000});
  await new Promise(resolve=>setImmediate(resolve));
  for(const [selector,el] of dom.inputs){
    assert.equal(el.icons.length,1,selector);
    assert.equal(el.icons[0].attrs['aria-hidden'],'true');
    assert.equal(el.icons[0].attrs['viewBox'],'0 0 24 24');
    assert.ok(el.icons[0].innerHTML.includes('<'));
    assert.equal(el.text,['E-mail','Celular','CPF'][dom.inputs.findIndex(([s])=>s===selector)]);
  }
});

test('[android/ios] não aplica ícones Web nem faz fetch',async()=>{
  for(const platform of ['android','ios']){
    const dom=testDOM(platform);
    vm.runInNewContext(JS,dom.context,{timeout:1000});
    await new Promise(resolve=>setImmediate(resolve));
    assert.equal(dom.inputs.every(([,el])=>el.icons.length===0),true);
  }
});

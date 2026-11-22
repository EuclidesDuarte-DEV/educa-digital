/* V112.10: provar no Chromium que aceitar Pix mostra a perda e avança
 * sem esperar Workers AI, em três tamanhos de tela. Sem APIs reais. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
const cases=[
 {width:390,height:844,font:'normal'},
 {width:320,height:640,font:'extra'},
 {width:1366,height:768,font:'normal'}
];
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
await mkdir('artifacts/quick-result-v11210',{recursive:true});
try{
 for(const cfg of cases){
  const name=cfg.width+'x'+cfg.height+'-'+cfg.font;
  const page=await browser.newPage({viewport:{width:cfg.width,height:cfg.height}});
  let aiCalls=0;
  try{
   await page.route('**/api/modo-livre/conversar-web',async route=>{
    aiCalls++;await route.abort();
   });
   await page.goto('http://127.0.0.1:8789/html/',{waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForFunction(()=>window.EducaFreeMode&&window.EducaFreeView&&
    document.documentElement.dataset.educaPlatform==='web',{timeout:15000});
   await page.evaluate(font=>{
    window.EducaFreeView.isTraining=()=>true;
    window.EducaFreeMode.start();
    if(font!=='normal')window.EducaAccessibility?.update?.({text:font});
    window.EducaFreeMode.triggerEvent();
   },cfg.font);
   await page.locator('#freeEventOpen').click({timeout:10000});
   await page.locator('#freeOriginalInput').fill('VOU TE MANDAR O PIX');
   await page.locator('#freeOriginalSend').click({timeout:10000});
   await page.waitForFunction(()=>document.querySelector('#freeSummaryView.web-quick-risk.is-active')&&
    document.querySelector('#freeSummaryTitle').textContent.includes('perdeu 15 pontos'),{timeout:1000});
   assert.equal(aiCalls,0,name+': diálogo chamou IA depois da decisão insegura');
   const result=await page.evaluate(()=>{
    const container=document.querySelector('#freeSummaryView');
    const panel=container.querySelector('.v106-summary');
    const title=document.querySelector('#freeSummaryTitle');
    const detail=document.querySelector('#freeSummaryDetail');
    const next=document.querySelector('#freeSummaryNext');
    const auto=document.querySelector('#freeSummaryAuto');
    const chatAlert=document.querySelector('#chatWallpaper .free-risk-feedback');
    const actions=[next,document.querySelector('#freeSummaryExit')];
    const pr=panel.getBoundingClientRect();
    return {title:title.textContent,text:document.querySelector('#freeSummaryText').textContent,
      detail:detail.textContent,panelHeight:panel.clientHeight,panelScroll:panel.scrollHeight,
      overflow:getComputedStyle(panel).overflowY,
      autoHidden:auto.hidden||getComputedStyle(auto).display==='none',
      nextVisible:getComputedStyle(next).display!=='none',
      chatAlert:!!chatAlert,
      buttons:actions.map(x=>{panel.scrollTop=panel.scrollHeight;const br=x.getBoundingClientRect();
       return {title:x.textContent,visible:getComputedStyle(x).display!=='none',
         width:br.width,top:br.top,bottom:br.bottom,panelTop:pr.top,panelBottom:pr.bottom}})};
   });
   assert.ok(result.text.includes('85 pontos'),name+': pontos faltando: '+JSON.stringify(result));
   assert.ok(result.detail.length<100,name+': resumo excessivamente longo');
   assert.equal(result.autoHidden,true,name+': aviso de pausa não deveria aparecer');
   assert.equal(result.chatAlert,false,name+': aviso gigante permaneceu no chat');
   assert.equal(result.overflow,'auto',name+': rolagem bloqueada');
   assert.ok(result.nextVisible,name+': botão próximo desafio ausente');
   assert.ok(result.buttons.every(x=>x.visible&&x.width>90),name+': botões ocultos');
   await page.screenshot({path:'artifacts/quick-result-v11210/'+name+'.png'});
   console.log('OK '+name+' perda imediata, 85 pontos, sem IA; '+JSON.stringify(result.buttons));
  }finally{await page.close();}
 }
}finally{await browser.close();}

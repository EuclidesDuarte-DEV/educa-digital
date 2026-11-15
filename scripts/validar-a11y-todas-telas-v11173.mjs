/* V111.73 — auditoria real em Chromium de TODAS as telas do telefone.
 * 3 tamanhos de fonte, 9 resoluções, mockup e fullscreen.
 * Serve para encontrar regressões em DOM, layout e área de toque.
 */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';

const viewports=[
  {w:320,h:640},{w:360,h:780},{w:390,h:844},{w:430,h:932},
  {w:768,h:1024},{w:1024,h:768},{w:1366,h:768},
  {w:1920,h:1080},{w:896,h:414}
];
const fullScreenWidths=new Set([390,896,1366]);
const fontModes=['normal','large','extra'];
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const issues=[];
let screensChecked=0,statesChecked=0;
await mkdir('artifacts/reflow-v11173',{recursive:true});

const near=(a,b,pad=4)=>a.bottom<=b.top+pad;
try {
  for(const {w,h} of viewports) for(const font of fontModes) {
    for(const full of [false,...(fullScreenWidths.has(w)?[true]:[])]) {
      const description=`${w}x${h} / ${font} / ${full?'fullscreen':'mockup'}`;
      const page=await browser.newPage({viewport:{width:w,height:h},deviceScaleFactor:1});
      const errors=[];
      page.on('pageerror',err=>errors.push(String(err.message).slice(0,250)));
      try {
        await page.goto('http://127.0.0.1:8789/html/',{waitUntil:'domcontentloaded',timeout:30000});
        await page.waitForFunction(()=>Boolean(window.EducaFreeView&&window.EducaAccessibility),{timeout:20000});
        await page.addStyleTag({content:'*,*::before,*::after{animation-duration:0s!important;transition-duration:0s!important;}'});
        await page.evaluate(({font,full})=>{
          if (font!=='normal') window.EducaAccessibility.update({text:font});
          if (full) {
            document.body.classList.add('prototype-focus');
            document.documentElement.classList.add('educa-fullscreen-active');
          }
        },{font,full});
        // Todas as telas são visitadas na mesma sessão, sem chamadas de IA.
        const audit=await page.evaluate(()=>{
          const phone=document.getElementById('phoneScreen');
          const panels=[...phone.querySelectorAll('.android-view[data-view]')];
          const results=[];
          for(const panel of panels) {
            window.EducaFreeView.setView(panel.dataset.view);
            const box=panel.getBoundingClientRect();
            const frame=phone.getBoundingClientRect();
            const horizontal=panel.scrollWidth-panel.clientWidth;
            let outside=0;
            const examples=[];
            for(const control of panel.querySelectorAll('button,a,input,select,textarea')) {
              if (control.closest('[hidden]')) continue;
              const b=control.getBoundingClientRect();
              if(b.width<2||b.height<2||b.bottom<frame.top||b.top>frame.bottom)continue;
              // Não escondemos o problema usando overflow:hidden; analisamos
              // controles que deveriam permanecer dentro da moldura.
              if (b.left<frame.left-8 || b.right>frame.right+8) {
                outside++;
                if(examples.length<3)examples.push((control.id||control.getAttribute('aria-label')||control.textContent||control.tagName).trim().slice(0,50));
              }
            }
            results.push({view:panel.dataset.view,visible:panel.classList.contains('is-active'),
              width:Math.round(box.width),horizontal:Math.round(horizontal),outside,examples});
          }
          return {total:panels.length,results};
        });
        screensChecked+=audit.total;
        assert.ok(audit.total>=45,description+': telas ausentes, total='+audit.total);
        for(const row of audit.results) {
          assert.ok(row.visible,description+' tela '+row.view+' nao abriu');
          assert.ok(row.width>=240,description+' tela '+row.view+' sem largura util');
          if(row.outside>0 || row.horizontal>12)
            issues.push({description,...row});
        }
        // Caso real do usuário: WhatsApp simulado, mensagem longa, 2 decisões,
        // teclado, e diferença entre modo de treino e Modo Livre.
        const chat=await page.evaluate(()=>{
          const phone=document.getElementById('phoneScreen');
          window.EducaFreeView.setView('chat');
          phone.classList.add('free-active','free-family-chat');
          const actions=document.getElementById('freeFamilyActions');
          const composer=document.getElementById('freeOriginalComposer');
          actions.hidden=false;
          composer.hidden=false;
          document.getElementById('scenarioTitle').textContent='Filho — número novo';
          const wallpaper=document.getElementById('chatWallpaper');
          wallpaper.replaceChildren();
          const messages=[
            ['incoming','Oi, sou o Rafael. Troquei de número. Preciso pagar uma conta urgente. Você consegue me mandar R$ 350 por Pix? Te devolvo depois.'],
            ['outgoing','Olá'],
            ['incoming','Oi! Tudo bem? É o Rafael, troquei de número agora. Será que você consegue me dar uma força com um Pix de 350 reais? É pra pagar uma conta aqui.']
          ];
          for(const [role,text] of messages) {
            const message=document.createElement('div');
            message.className='message '+role;
            message.appendChild(document.createTextNode(text));
            const clock=document.createElement('time');clock.textContent='14:38';
            message.appendChild(clock);
            wallpaper.appendChild(message);
          }
          wallpaper.scrollTop=wallpaper.scrollHeight;
          const rect=el=>el.getBoundingClientRect().toJSON();
          const header=document.querySelector('#chatView .chat-header');
          const title=document.getElementById('scenarioTitle');
          const send=document.getElementById('freeOriginalSend');
          const input=document.getElementById('freeOriginalInput');
          return {
            header:rect(header),wallpaper:rect(wallpaper),actions:rect(actions),
            composer:rect(composer),title:rect(title),input:rect(input),send:rect(send),
            root:rect(document.querySelector('#chatView .chat-surface')),
            titleLines:Math.round(title.clientHeight/parseFloat(getComputedStyle(title).lineHeight)),
            contentOverflow:wallpaper.scrollWidth-wallpaper.clientWidth,
            actionOverflow:actions.scrollWidth-actions.clientWidth,
            messageOverflow:[...wallpaper.querySelectorAll('.message')].map(m=>({
              textOverflow:m.scrollHeight-m.clientHeight,
              widthOverflow:m.scrollWidth-m.clientWidth,
              right:m.getBoundingClientRect().right
            })),
            buttons:[...actions.querySelectorAll('button')].map(rect)
          };
        });
        assert.ok(chat.titleLines<=1,description+': nome do contato quebra no cabecalho');
        assert.ok(near(chat.header,chat.wallpaper),description+': cabecalho cobre conversa');
        assert.ok(near(chat.wallpaper,chat.actions),description+': mensagens cobertas pelos botoes');
        assert.ok(near(chat.actions,chat.composer),description+': decisoes cobrem o campo de digitar');
        assert.ok(chat.input.right<chat.send.left+3,description+': input invade botao de enviar');
        assert.ok(chat.contentOverflow<=3,description+': conversa com scroll horizontal');
        assert.ok(chat.actionOverflow<=3,description+': botoes de seguranca com scroll horizontal');
        for(const x of chat.messageOverflow) {
          assert.ok(x.textOverflow<=3,description+': texto da mensagem foi cortado');
          assert.ok(x.widthOverflow<=3,description+': balao de mensagem estoura largura');
        }
        for(const x of chat.buttons)
          assert.ok(x.height>=44,description+': botao de escolha com alvo menor que 44px');
        statesChecked++;
        if([320,390,768,1366,1920,896].includes(w)){
          await page.screenshot({path:`artifacts/reflow-v11173/whatsapp-${w}-${font}-${full?'full':'mock'}.png`});
        }

        // Mensagem guiada e conversa comum usam os mesmos limites estruturais.
        await page.evaluate(()=>{
          const phone=document.getElementById('phoneScreen');
          phone.classList.remove('free-active','free-family-chat');
          document.getElementById('freeFamilyActions').hidden=true;
          document.getElementById('freeOriginalComposer').hidden=true;
          window.EducaFreeView.setView('normal-chat');
          const target=document.getElementById('normalMessages');
          const p=document.createElement('div');
          p.className='message incoming';
          p.textContent='Esta é uma mensagem longa que deve permanecer legível mesmo com o texto muito grande e o celular em modo de tela cheia.';
          target.append(p);
        });
        const normal=await page.evaluate(()=>{
          const view=document.getElementById('normalChatView');
          const header=view.querySelector('.chat-header').getBoundingClientRect();
          const messages=view.querySelector('.chat-wallpaper').getBoundingClientRect();
          const compose=view.querySelector('.chat-composer').getBoundingClientRect();
          const screen=view.getBoundingClientRect();
          return {headerBottom:header.bottom,msgTop:messages.top,msgBottom:messages.bottom,
            composeTop:compose.top,composeRight:compose.right,screenRight:screen.right};
        });
        assert.ok(normal.headerBottom<=normal.msgTop+4,description+': cabecalho sobreposto conversa normal');
        assert.ok(normal.msgBottom<=normal.composeTop+4,description+': conversa normal coberta pelo teclado');
        assert.ok(normal.composeRight<=normal.screenRight+4,description+': composer fora do celular');
        if(errors.length)issues.push({description,view:'JS runtime',examples:errors.slice(0,3)});

        console.log(`V111.73 ${description}: ${audit.total} telas, chat e tela cheia verificados`);
      }finally{await page.close();}
    }
  }
}finally{await browser.close();}

await writeFile('artifacts/reflow-v11173/diagnostico.json',JSON.stringify({
  checkedScreens:screensChecked, chatStates:statesChecked, issues
},null,2));
console.log(`AUDITORIA V111.73: ${screensChecked} combinacoes de telas, ${statesChecked} estados WhatsApp, ${issues.length} apontamentos de reflow geral.`);
const serious=issues.filter(i=>i.view==='JS runtime'||i.outside>=3||i.horizontal>=30);
if(serious.length) {
  console.error('Problemas graves detectados:',JSON.stringify(serious.slice(0,35)));
  throw new Error(`${serious.length} telas com problemas graves: ver diagnostico.json`);
}

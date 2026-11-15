/* Educa+ V111.74 — WhatsApp real do treinamento: geometria e leitura.
 * Matriz: 9 viewports, 3 fontes, fullscreen em 3. Chrome headless.
 */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';

const cases=[
  [320,640],[360,780],[390,844],[430,932],[768,1024],
  [1024,768],[1366,768],[1920,1080],[896,414]
];
const fullscreen=new Set([390,896,1366]);
const sizes=['normal','large','extra'];
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
await mkdir('artifacts/whatsapp-v11174',{recursive:true});
const errors=[];
let checks=0;
try {
  for (const [width,height] of cases) {
    for (const size of sizes) {
      for (const full of [false,...(fullscreen.has(width)?[true]:[])]) {
        const label=`${width}x${height} / ${size} / ${full?'fullscreen':'mockup'}`;
        const page=await browser.newPage({viewport:{width,height}});
        const pageErrors=[];
        page.on('pageerror',e=>pageErrors.push(e.message));
        try {
          await page.goto('http://127.0.0.1:8789/html/',{waitUntil:'domcontentloaded',timeout:30000});
          await page.waitForFunction(()=>Boolean(window.EducaFreeView&&window.EducaAccessibility),{timeout:20000});
          await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important;}'});
          await page.evaluate(({size,full})=>{
            if(size!=='normal')window.EducaAccessibility.update({text:size});
            if(full){
              document.body.classList.add('prototype-focus');
              document.documentElement.classList.add('educa-fullscreen-active');
            }
            window.EducaFreeView.setView('whatsapp');
            document.getElementById('phoneScreen').classList.add('free-active');
          },{size,full});
          await page.waitForTimeout(110);
          const result=await page.evaluate(()=>{
            const root=document.querySelector('#whatsappView .whatsapp-surface');
            const header=document.querySelector('#whatsappView .wa-topbar');
            const search=document.querySelector('#whatsappView .whatsapp-search');
            const filters=document.querySelector('#whatsappView .whatsapp-filters');
            const archive=document.querySelector('#whatsappView .wa-archived');
            const list=document.querySelector('#whatsappView .wa-chat-list');
            const footer=document.querySelector('#whatsappView .whatsapp-bottom');
            const phone=document.querySelector('#phoneScreen');
            const bounds=x=>x.getBoundingClientRect().toJSON();
            const labels=[...footer.querySelectorAll('button small')].map(el=>{
              const style=getComputedStyle(el);
              return {text:el.textContent.trim(),
                rect:bounds(el),fontSize:parseFloat(style.fontSize),
                lineHeight:parseFloat(style.lineHeight),
                nowrap:style.whiteSpace==='nowrap',
                scrollX:el.scrollWidth-el.clientWidth};
            });
            const rows=[...list.querySelectorAll('.chat-row:not([hidden])')].map(row=>{
              const name=row.querySelector('.chat-copy strong');
              const preview=row.querySelector('.chat-copy small');
              const meta=row.querySelector('.chat-meta small');
              return {r:bounds(row),name:bounds(name),
                title:name.textContent.trim(),
                nameNoWrap:getComputedStyle(name).whiteSpace==='nowrap',
                preview:bounds(preview),previewFont:parseFloat(getComputedStyle(preview).fontSize),
                meta:bounds(meta),rowOverflow:row.scrollWidth-row.clientWidth,
                previewLineHeight:parseFloat(getComputedStyle(preview).lineHeight)};
            });
            const base={root:bounds(root),header:bounds(header),search:bounds(search),
              filters:bounds(filters),archive:bounds(archive),list:bounds(list),
              footer:bounds(footer),phone:bounds(phone),
              footerHeight:footer.getBoundingClientRect().height,
              listOverflowX:list.scrollWidth-list.clientWidth,
              listOverflowY:list.scrollHeight-list.clientHeight,
              footerOverflowX:footer.scrollWidth-footer.clientWidth,
              labels,rows,searchFont:parseFloat(getComputedStyle(search.querySelector('span')).fontSize)};
            list.scrollTop=list.scrollHeight;
            const last=list.querySelector('.chat-row:last-child');
            base.lastRow=bounds(last);
            base.lastRowReachable=last.getBoundingClientRect().bottom<=list.getBoundingClientRect().bottom+3;
            return base;
          });
          const le=(a,b)=>a.bottom<=b.top+3;
          assert.ok(le(result.header,result.search),label+': cabeçalho cobre busca');
          assert.ok(le(result.search,result.filters),label+': busca cobre filtros');
          assert.ok(le(result.filters,result.archive),label+': filtros cobrem Arquivadas');
          assert.ok(le(result.archive,result.list),label+': Arquivadas cobre conversas');
          assert.ok(le(result.list,result.footer),label+': barra inferior cobre conversas');
          assert.ok(result.footer.bottom<=result.root.bottom+3,label+': barra ultrapassa telefone');
          assert.ok(result.footerHeight>=50&&result.footerHeight<=60,label+': barra cresceu demais');
          assert.ok(result.list.height>=60,label+': lista perdeu area de leitura');
          assert.ok(result.listOverflowX<=3,label+': lista com rolagem horizontal');
          assert.ok(result.footerOverflowX<=3,label+': barra com rolagem horizontal');
          assert.equal(result.labels.length,4,label+': 4 abas do WhatsApp');
          for(const x of result.labels){
            assert.ok(x.nowrap,label+': etiqueta '+x.text+' quebrou em linhas');
            assert.ok(x.rect.height<=x.lineHeight+4,label+': etiqueta '+x.text+' com 2+ linhas');
            assert.ok(x.scrollX<=4,label+': etiqueta '+x.text+' foi cortada');
            assert.ok(x.fontSize>=9.5&&x.fontSize<=12.5,label+': etiqueta '+x.text+' ilegivel/inchada');
          }
          assert.ok(result.rows.length>=5,label+': lista nao mostra todas as conversas');
          for(const x of result.rows){
            assert.ok(x.nameNoWrap,label+': nome '+x.title+' quebrou palavras');
            assert.ok(x.name.height<=27,label+': nome muito alto');
            assert.ok(x.preview.height<=x.previewLineHeight*2+3,label+': previa ocupa 3+ linhas');
            assert.ok(x.rowOverflow<=4,label+': linha '+x.title+' estoura largura');
          }
          assert.ok(result.lastRowReachable,label+': ultimas conversas inalcançaveis');
          assert.ok(pageErrors.length===0,label+': erros no console JS: '+pageErrors.join('; '));
          checks++;
          if([320,390,768,1366,1920,896].includes(width)){
            await page.screenshot({path:`artifacts/whatsapp-v11174/lista-${width}-${size}-${full?'full':'mock'}.png`});
          }

          // Nao deixar o aviso educativo ocupar toda a metade superior do WhatsApp.
          await page.evaluate(()=>{
            document.getElementById('freeEventTitle').textContent='Nova mensagem no WhatsApp';
            document.getElementById('freeEventText').textContent='Filho — número novo: Oi, sou o Rafael. Troquei de número. Preciso pagar uma conta urgente. Você consegue me ajudar com Pix?';
            document.getElementById('freeEventNotice').hidden=false;
          });
          const toast=await page.evaluate(()=>{
            const el=document.getElementById('freeEventNotice');
            const open=document.getElementById('freeEventOpen');
            return {height:el.getBoundingClientRect().height,
              width:el.getBoundingClientRect().width,
              openHeight:open.getBoundingClientRect().height,
              openVisible:getComputedStyle(open).display!=='none',
              overflowX:el.scrollWidth-el.clientWidth};
          });
          assert.ok(toast.height<=111,label+': alerta educativo ocupa altura excessiva');
          assert.ok(toast.openVisible&&toast.openHeight>=35,label+': botao Abrir nao acessivel');
          assert.ok(toast.overflowX<=5,label+': alerta educativo estoura largura');
          if([390,896].includes(width)&&size==='extra'){
            await page.screenshot({path:`artifacts/whatsapp-v11174/aviso-${width}-${full?'full':'mock'}.png`});
          }
          console.log('V111.74 '+label+': lista, barra, letras, aviso, rolagem OK');
        }catch(e){
          errors.push({label,message:String(e)});
          console.error('FALHA V111.74 '+label+': '+e.message);
        }finally{await page.close();}
      }
    }
  }
}finally{await browser.close();}
await writeFile('artifacts/whatsapp-v11174/resultado.json',JSON.stringify({checks,errors},null,2));
console.log(`AUDITORIA WHATSAPP V111.74: ${checks} estados completos, ${errors.length} falhas`);
if(errors.length)throw new Error(`${errors.length} erros WhatsApp: veja resultado.json`);

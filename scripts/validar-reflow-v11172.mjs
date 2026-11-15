/* Auditoria de reflow V111.72 — casos reais em navegador headless.
 * Publicado apenas no CI e executado contra o frontend local: sem D1/IA remota.
 */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';

const viewports = [
  {width:320,height:640}, {width:360,height:780},
  {width:390,height:844}, {width:430,height:932},
  {width:768,height:1024}, {width:1024,height:768},
  {width:1366,height:768}, {width:1920,height:1080},
  {width:896,height:414}
];
const browser = await chromium.launch({headless:true,args:['--no-sandbox']});
const capture = new Set([320,390,768,1366,1920,896]);
await mkdir('artifacts/reflow-v11172',{recursive:true});

try {
  for (const viewport of viewports) {
    for (const size of ['normal','extra']) {
      const page = await browser.newPage({viewport,deviceScaleFactor:1});
      const prefix = viewport.width + 'x' + viewport.height + ' ' + size;
      try {
        await page.goto('http://127.0.0.1:8789/html/', {
          waitUntil:'domcontentloaded',timeout:30000
        });
        await page.waitForFunction(() => Boolean(window.EducaFreeView && window.EducaAccessibility), {timeout:20000});
        await page.evaluate(mode => {
          if (mode !== 'normal') window.EducaAccessibility.update({text:mode});
          window.EducaFreeView.setView('bank-review');
        }, size);
        await page.locator('#phoneHardware').scrollIntoViewIfNeeded();
        await page.waitForTimeout(130);

        const bank = await page.evaluate(() => {
          const view = document.querySelector('#bankReviewView');
          const header = view.querySelector('.bank-sub-header');
          const scroller = view.querySelector('.bank-content');
          const rect = el => el.getBoundingClientRect();
          scroller.scrollTop = scroller.scrollHeight;
          const options = view.querySelector('#bankReviewOptions');
          return {
            active:view.classList.contains('is-active'),
            header:rect(header).toJSON(), content:rect(scroller).toJSON(),
            options:rect(options).toJSON(),
            scrollable:scroller.scrollHeight > scroller.clientHeight,
            overflow:scroller.scrollWidth - scroller.clientWidth,
            buttons:[...options.querySelectorAll('button')].map(el=>({
              width:el.clientWidth,scrollWidth:el.scrollWidth,
              rect:rect(el).toJSON(),text:el.textContent.trim()
            }))
          };
        });
        assert.ok(bank.active,prefix+' review nao abriu');
        assert.ok(bank.content.top >= bank.header.bottom-4,
          prefix+' cabecalho invade o cartao de Pix');
        assert.ok(bank.overflow <= 3,prefix+' rolagem horizontal no banco '+bank.overflow);
        assert.ok(bank.options.left >= bank.content.left-3 && bank.options.right <= bank.content.right+3,
          prefix+' alternativas ultrapassam a area do banco');
        for (const btn of bank.buttons) {
          assert.ok(btn.scrollWidth <= btn.width+3,prefix+' resposta cortada '+btn.text);
          assert.ok(btn.rect.height >= 44,prefix+' opcao pequena demais '+btn.text);
        }
        if(capture.has(viewport.width)){
          await page.screenshot({
            path:'artifacts/reflow-v11172/bank-'+viewport.width+'-'+size+'.png'
          });
        }

        await page.evaluate(()=>{
          const view=document.querySelector('#bankSecurityView');
          window.EducaFreeView.setView('bank-security');
          const panel=view?.querySelector('.bank-content');
          if (panel) panel.scrollTop=panel.scrollHeight;
        });
        const security = await page.evaluate(()=>{
          const el=document.querySelector('#bankSecurityView .bank-content');
          return el ? el.scrollWidth-el.clientWidth : 0;
        });
        assert.ok(security <=3,prefix+' rolagem horizontal na atividade golpe');

        // Textos reais e longos da conclusao. O rodape deve ficar acessivel
        // por rolagem em uma area, sem encostar no relogio simulado.
        await page.evaluate(()=>{
          window.EducaFreeView.setView('success');
          document.querySelector('#successTitle').textContent='Muito bem!';
          document.querySelector('#successText').textContent='Você concluiu a atividade “Encontrar o Pix no banco” de PIX.';
          document.querySelector('#successLearned').textContent='Antes de confirmar um Pix, confira nome, CPF mascarado, instituição e valor. Não faça pagamentos quando o destinatário for diferente.';
        });
        await page.waitForTimeout(100);
        const success = await page.evaluate(()=>{
          const panel=document.querySelector('#successView .lesson-success-screen');
          const title=document.querySelector('#successTitle');
          const actions=document.querySelector('#successView .lesson-success-actions');
          const rect=el=>el.getBoundingClientRect();
          const before={
            title:rect(title).toJSON(),panel:rect(panel).toJSON(),
            scrollable:panel.scrollHeight>panel.clientHeight,
            overflow:panel.scrollWidth-panel.clientWidth
          };
          panel.scrollTop=panel.scrollHeight;
          return {...before,buttons:[...actions.querySelectorAll('button:not([hidden])')].map(el=>({
            rect:rect(el).toJSON(),overflow:el.scrollWidth-el.clientWidth
          }))};
        });
        assert.ok(success.overflow<=3,prefix+' sucesso com rolagem horizontal');
        assert.ok(success.title.width<=success.panel.width+2,prefix+' titulo do sucesso sai da tela');
        assert.ok(success.buttons.length>=2,prefix+' botoes finais ausentes');
        for(const btn of success.buttons){
          assert.ok(btn.overflow<=3,prefix+' botao de continuidade cortado');
          assert.ok(btn.rect.height>=44,prefix+' botao final pequeno');
          assert.ok(btn.rect.left>=success.panel.left-3 && btn.rect.right<=success.panel.right+3,
            prefix+' botoes finais fora dos limites');
          assert.ok(btn.rect.bottom<=success.panel.bottom+4,
            prefix+' botao de continuar inacessivel apos a rolagem');
        }
        if(capture.has(viewport.width)){
          await page.screenshot({
            path:'artifacts/reflow-v11172/success-'+viewport.width+'-'+size+'.png'
          });
        }

        // Outros paineis: card e trilha nao podem ter overflow horizontal.
        await page.evaluate(()=>window.EducaFreeView.setView('learning'));
        const learning = await page.evaluate(()=>{
          const root=document.querySelector('#learningView .learning-surface');
          const cards=[...document.querySelectorAll('#learningView .learning-card')];
          return {overflow:root.scrollWidth-root.clientWidth,
            cardOverflow:cards.map(c=>c.scrollWidth-c.clientWidth)};
        });
        assert.ok(learning.overflow<=4,prefix+' painel de aprendizagem ultrapassa largura');
        assert.ok(learning.cardOverflow.every(n=>n<=4),prefix+' cartao aprendizado corta texto');
        console.log('V11172 '+prefix+' OK: Pix, golpes, sucesso, ações e aprendizagem');
      } finally {
        await page.close();
      }
    }
  }
} finally {
  await browser.close();
}

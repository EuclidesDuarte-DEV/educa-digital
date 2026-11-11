/* V111.48: smoke test de layout em tamanhos de celulares e tablet.
   Inicia-se com servidor estatico de /public; nenhum banco remoto e acessado. */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const widths = [320, 360, 375, 390, 412, 430, 768];
await mkdir('artifacts/layout-v11148', { recursive: true });

try {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 844 }, deviceScaleFactor: 1 });
    try {
      await page.goto('http://127.0.0.1:8789/html/', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForFunction(() => Boolean(window.EducaFreeView && window.EducaAccessibility), { timeout: 20000 });

      const first = await page.evaluate(() => {
        const frame = document.querySelector('#phoneHardware')?.getBoundingClientRect();
        const button = document.querySelector('#a11yReadNow');
        return {
          phoneWidth: frame?.width ?? 0,
          left: frame?.left ?? 0,
          right: frame?.right ?? 0,
          audioInPanel: Boolean(button?.closest('#accessibilityDialog')),
          audioPosition: button ? getComputedStyle(button).position : 'missing'
        };
      });
      assert.ok(first.phoneWidth >= 250, width + ': celular ficou pequeno demais');
      assert.ok(first.phoneWidth <= (width <= 600 ? 356 : 380), width + ': celular excessivamente largo: ' + first.phoneWidth);
      assert.ok(first.left >= -1 && first.right <= width + 1, width + ': moldura sai da tela');
      assert.ok(first.audioInPanel && first.audioPosition === 'static', width + ': audio sobreposto');

      // Começar pré-teste real pelo aplicativo Banco da home.
      await page.evaluate(() => {
        document.querySelector('#educaTourClose')?.click();
        document.querySelector('[data-open-app="bank"]')?.click();
      });
      const state = await page.evaluate(() => ({
        pretestActive: document.body.classList.contains('pretest-in-progress'),
        barVisible: !document.querySelector('#pretestStepBar')?.hidden,
        duplicated: getComputedStyle(document.querySelector('.preview-badge.training-badge')).display !== 'none',
        etapa: document.querySelector('#pretestStepLabel')?.textContent ?? ''
      }));
      assert.ok(state.pretestActive && state.barVisible && !state.duplicated, width + ': pre-teste duplicado ou sem orientacao');
      assert.match(state.etapa, /ETAPA 1 DE 4/);

      await page.evaluate(() => document.querySelector('#bankPixBtn')?.click());
      assert.match(await page.locator('#pretestStepLabel').innerText(), /ETAPA 2 DE 4/);
      await page.evaluate(() => document.querySelector('#bankSendPixBtn')?.click());
      assert.match(await page.locator('#pretestStepLabel').innerText(), /ETAPA 3 DE 4/);
      
      await page.evaluate(() => {
        window.EducaAccessibility.update({ text: 'extra', colors: true });
        window.EducaFreeView.setView('learning');
      });
      const adapted = await page.evaluate(() => {
        const cards = [...document.querySelectorAll('#learningView .learning-card')];
        const bad = cards.filter(card => card.scrollWidth > card.clientWidth + 3).length;
        const grid = document.querySelector('#learningView .learning-grid');
        const count = getComputedStyle(grid).gridTemplateColumns.trim().split(/\s+/).length;
        return { bad, count, active: document.querySelector('#learningView').classList.contains('is-active') };
      });
      assert.ok(adapted.active, width + ': central nao abriu no teste');
      assert.equal(adapted.bad, 0, width + ': textos cortados nos cards grandes');
      assert.equal(adapted.count, 1, width + ': modo letras extra grandes deve reflu ir para uma coluna');

      if ([320,390,430,768].includes(width)) {
        await page.screenshot({ path: 'artifacts/layout-v11148/' + width + '.png', fullPage: false });
      }
      console.log('V111.48: ' + width + 'px OK; celular=' + Math.round(first.phoneWidth) + 'px, audio e etapa visiveis, fontes grandes');
    } finally {
      await page.close();
    }
  }
} finally {
  await browser.close();
}

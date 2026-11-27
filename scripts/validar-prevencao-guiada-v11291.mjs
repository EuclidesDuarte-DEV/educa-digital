import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { chromium, webkit } from 'playwright';

const baseUrl = process.env.EDUCA_URL || 'http://127.0.0.1:8789';
const useWebKit = process.env.EDUCA_BROWSER === 'webkit';
const engine = useWebKit ? webkit : chromium;
const browser = await engine.launch(useWebKit ? {} : { args: ['--no-sandbox'] });
const originalCourses = [
  ['security', 'Link falso para roubar dados', 'guided-link-dados', /transportadora|oficial/i, /proteja seu CPF/i],
  ['security', 'Ligação de falso sequestro', 'guided-falso-sequestro', /encerre|desligue/i, /190/],
  ['pix', 'Golpe do Pix errado', 'guided-pix-devolucao', /extrato/i, /opção Devolver/],
  ['whatsapp', 'Áudio com voz conhecida', 'guided-whatsapp-voz', /voz|identidade/i, /número já salvo/i],
  ['whatsapp', 'Loja falsa no WhatsApp', 'guided-whatsapp-loja', /loja/i, /confira o destinatário/i],
  ['govbr', 'Falsa prova de vida', 'guided-gov-prova-vida', /dados|documento/i, /Central 135/i]
];
const catalog = {};
runInNewContext(await readFile('public/static/js/guided-prevention-catalog-v11292.js', 'utf8'), { window: catalog });
const expandedCourses = catalog.EducaGuidedPrevention.map(lesson => [
  lesson.topic, lesson.title, lesson.code, lesson.choices.find(choice => choice.length > 1)[1], lesson.takeaway, lesson.group
]);
const profiles = [
  { platform: 'web', viewport: { width: 1366, height: 768 }, font: 'normal' },
  { platform: 'android', viewport: { width: 320, height: 700 }, font: 'extra' },
  { platform: 'ios', viewport: { width: 390, height: 844 }, font: 'large' }
];

try {
  for (const [profile, { platform, viewport, font }] of profiles.entries()) {
    const courses = [...originalCourses, ...expandedCourses.filter((_, index) => index % profiles.length === profile)];
    const mobile = platform !== 'web';
    const page = await browser.newPage({ viewport, hasTouch: mobile, isMobile: mobile });
    const recorded = [];
    await page.addInitScript(() => localStorage.setItem('educaRememberedUser', JSON.stringify({
      name: 'Participante', phone: '65900000001', levelToken: 'a'.repeat(64)
    })));
    await page.route('**/api/**', route => {
      const request = route.request();
      if (request.method() === 'POST' && new URL(request.url()).pathname === '/api/progresso') {
        recorded.push(request.postDataJSON());
      }
      return route.fulfill({ json: { ok: true, atividades: [] } });
    });
    const suffix = mobile ? `?app=1&platform=${platform}&experience=web` : '';
    await page.goto(`${baseUrl}/html/${suffix}`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.EducaAccessibility && window.EducaWebChannel?.refreshActivityText);
    await page.evaluate(font => window.EducaAccessibility.update({ text: font }), font);

    const hit = locator => mobile ? locator.tap() : locator.click();
    const expectGuide = async selector => {
      await page.waitForFunction(selector => {
        const target=document.querySelector(selector),overlay=document.querySelector('#guideOverlay'),spot=document.querySelector('#guideSpotlight');
        if(!target?.classList.contains('guide-target')||overlay?.hidden||!spot)return false;
        const a=target.getBoundingClientRect(),b=spot.getBoundingClientRect();
        return Math.min(a.right,b.right)-Math.max(a.left,b.left)>8&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>8;
      },selector);
    };
    await hit(page.locator('#startNowBtn'));
    const home = page.locator('#learningView.is-active');
    await home.waitFor({ state: 'visible' });
    assert.deepEqual(await home.locator('[data-learning-topic]').evaluateAll(cards => cards.map(card => card.dataset.learningTopic)),
      ['pix', 'security', 'whatsapp', 'govbr']);
    assert.equal(await page.locator('#openAccessibilitySettings').isVisible(), true);
    assert.ok(await home.locator('#freeModeEntry').isVisible());
    assert.equal(await page.locator('#phoneScreen').getAttribute('data-guided-app-lesson'),null);
    assert.equal(await page.locator('#phoneScreen').evaluate(el=>el.classList.contains('free-active')),false);
    assert.ok(await page.locator('#freeExitBtn').isHidden());

    for (const [topic, title, code, retry, advice, group] of courses) {
      await hit(home.locator(`[data-learning-topic="${topic}"]`));
      const path = page.locator('#modulePathView.is-active');
      const lesson = path.locator('[data-module-lesson]').filter({ has: page.getByText(title, { exact: true }) });
      if (group) assert.equal(await path.getByRole('heading', { name: group, exact: true }).count(), 1);
      assert.ok(await path.isVisible());
      assert.equal(await page.locator('#phoneScreen').getAttribute('data-guided-app-lesson'),null);
      await hit(lesson);
      const intro=page.locator('#videoLessonView.is-active');
      await intro.waitFor({state:'visible'});
      assert.ok(await intro.locator('#videoPracticeBtn').isVisible());
      assert.ok(await intro.locator('#videoIntroPlaceholder').isVisible());
      assert.equal(await page.locator('#phoneScreen').getAttribute('data-guided-app-lesson'),null);
      assert.ok(await page.locator('#guideOverlay').isHidden());
      await hit(intro.locator('#videoPracticeBtn'));
      assert.equal(await page.locator('#phoneScreen').evaluate(el=>el.classList.contains('free-active')),false);
      assert.ok(await page.locator('#freeExitBtn').isHidden());
      const nativeRoutes={
        'guided-pix-devolucao':[['bank-home','#bankExtractBtn'],['bank-extract','#nativeGuidedAction'],['bank-extract','#nativeGuidedAction']],
        'guided-comprovante-falso':[['bank-home','#bankExtractBtn'],['bank-extract','#nativeGuidedAction']],
        'guided-pix-apos-golpe':[['bank-home','#bankExtractBtn'],['bank-extract','#nativeGuidedAction'],['bank-extract','#nativeGuidedAction']],
        'guided-gov-prova-vida':[['govbr-home','#govSearchBox'],['govbr-services','#govProofRow'],['govbr-proof','#govProofFoundBtn']],
        'guided-gov-acesso-suspeito':[['govbr-home','#govProfileNav'],['govbr-menu','#govSecurityMenuRow'],['govbr-security','#govTwoFactorRow'],['govbr-security-2fa','#gov2faLearnBtn']]
      };
      if(code.startsWith('guided-whatsapp-'))nativeRoutes[code]=[['whatsapp','#guidedIncomingChat'],['chat','#guidedChatSafeAction'],['normal-chat','#guidedChatConfirm']];
      if(nativeRoutes[code]){
        assert.equal(await page.locator('#phoneScreen').getAttribute('data-guided-app-lesson'),code);
        for(const [view,target] of nativeRoutes[code]){
          await page.locator('.android-view.is-active[data-view="'+view+'"]').waitFor({state:'visible'});
          await expectGuide(target);
          assert.equal(recorded.some(event=>event.activity_code===code&&event.event==='complete'),false);
          await hit(page.locator(target));
        }
        const success=page.locator('#successView.is-active');
        await success.waitFor({state:'visible'});
        const takeaway=await success.locator('#successLearned').textContent();
        if(group)assert.equal(takeaway,advice);else assert.match(takeaway,advice);
        assert.equal(await page.locator('#phoneScreen').getAttribute('data-guided-app-lesson'),null);
        await hit(success.locator('#nextLessonBtn'));
        assert.match(await lesson.getAttribute('aria-label'),/Concluída/);
        await hit(path.locator('#modulePathBack'));
      await home.waitFor({state:'visible'});
      assert.ok(await home.locator('#freeModeEntry').isVisible());
      assert.equal(await page.locator('#phoneScreen').getAttribute('data-guided-app-lesson'),null);
        continue;
      }
      const activity = page.locator('#guidedPracticeView.is-active[data-guided-prevention]');
      await activity.waitFor({ state: 'visible' });
      assert.equal(await activity.locator('#guidedTitle').textContent(), title);
      const surface = activity.locator('.guided-surface');
      const recap = activity.locator('#guidedRecap');
      assert.equal(await recap.isHidden(), true);
      assert.equal(await activity.locator('#guidedExample a, input, audio').count(), 0);
      assert.equal(await activity.getAttribute('data-prototype-stage'), '1');
      assert.ok(await activity.locator('#guidedOptions').isHidden());
      assert.equal(await activity.locator('#guidedPrototypeOpen').isVisible(), true);
      const wrong = activity.locator('[data-guided-correct="0"]').first();
      if (code === 'guided-falso-sequestro') {
        await hit(activity.getByRole('button', { name: 'Voltar às atividades' }));
        await hit(lesson);
        await hit(page.locator('#videoLessonView.is-active #videoPracticeBtn'));
        assert.equal(await recap.isHidden(), true);
      }
      await expectGuide('#guidedPrototypeOpen');
      await hit(activity.locator('#guidedPrototypeOpen'));
      assert.equal(await activity.getAttribute('data-prototype-stage'), '2');
      assert.equal(await activity.locator('#guidedExample .guided-prototype-appbar').count(), 1);
      await expectGuide('#guidedOptions [data-guided-correct="1"]');
      await hit(wrong);
      const feedback = await activity.getByRole('status').textContent();
      if (group) assert.equal(feedback, retry);
      else assert.match(feedback, retry);
      assert.equal(await recap.isHidden(), true);
      assert.equal(recorded.some(event => event.activity_code === code && event.event === 'complete'), false);
      await expectGuide('#guidedPrototypeRetry');
      await hit(activity.locator('#guidedPrototypeRetry'));
      await expectGuide('#guidedOptions [data-guided-correct="1"]');
      await hit(activity.locator('[data-guided-correct="1"]'));
      assert.equal(await activity.getAttribute('data-prototype-stage'), '3');
      assert.equal(await recap.isHidden(), true);
      assert.equal(recorded.some(event => event.activity_code === code && event.event === 'complete'), false);
      const action = activity.locator('#guidedPrototypeFinish');
      assert.ok((await action.boundingBox()).height >= 44);
      await expectGuide('#guidedPrototypeFinish');
      await hit(action);
      assert.equal(await activity.getAttribute('data-prototype-stage'), 'done');
      await recap.waitFor({ state: 'visible' });
      assert.equal(await recap.getByRole('listitem').count(), 3);
      const continueButton = recap.getByRole('button', { name: 'Concluir atividade' });
      assert.ok((await continueButton.boundingBox()).height >= 44);
      assert.ok(await surface.evaluate(el => el.scrollWidth <= el.clientWidth + 1));
      await expectGuide('#guidedContinue');
      await hit(continueButton);
      assert.ok(await page.locator('#guideOverlay').isHidden());
      const success = page.locator('#successView.is-active');
      const takeaway = await success.locator('#successLearned').textContent();
      if (group) assert.equal(takeaway, advice);
      else assert.match(takeaway, advice);
      await hit(success.locator('#nextLessonBtn'));
      assert.match(await lesson.getAttribute('aria-label'), /Concluída/);
      await hit(path.locator('#modulePathBack'));
      await home.waitFor({state:'visible'});
      assert.ok(await home.locator('#freeModeEntry').isVisible());
      assert.equal(await page.locator('#phoneScreen').getAttribute('data-guided-app-lesson'),null);
    }
    assert.deepEqual(recorded.filter(event => event.event === 'complete').map(event => event.activity_code).sort(),
      courses.map(([, , code]) => code).sort());
    console.log(`V112.92 ${engine.name()} ${platform} ${font} — ${courses.length} atividades concluídas`);
    await page.close();
  }
} finally {
  await browser.close();
}

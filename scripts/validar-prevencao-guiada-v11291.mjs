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
    await hit(page.locator('#startNowBtn'));
    const home = page.locator('#learningView.is-active');
    await home.waitFor({ state: 'visible' });
    assert.deepEqual(await home.locator('[data-learning-topic]').evaluateAll(cards => cards.map(card => card.dataset.learningTopic)),
      ['pix', 'security', 'whatsapp', 'govbr']);
    assert.equal(await page.locator('#openAccessibilitySettings').isVisible(), true);

    for (const [topic, title, code, retry, advice, group] of courses) {
      await hit(home.locator(`[data-learning-topic="${topic}"]`));
      const path = page.locator('#modulePathView.is-active');
      const lesson = path.locator('[data-module-lesson]').filter({ has: path.getByText(title, { exact: true }) });
      if (group) assert.equal(await path.getByRole('heading', { name: group, exact: true }).count(), 1);
      await hit(lesson);
      const activity = page.locator('#guidedPracticeView.is-active[data-guided-prevention]');
      await activity.waitFor({ state: 'visible' });
      assert.equal(await activity.locator('#guidedTitle').textContent(), title);
      const surface = activity.locator('.guided-surface');
      const recap = activity.locator('#guidedRecap');
      assert.equal(await recap.isHidden(), true);
      assert.equal(await activity.locator('#guidedExample a, input, audio').count(), 0);
      const wrong = activity.locator('[data-guided-correct="0"]').first();
      if (code === 'guided-falso-sequestro') {
        await hit(activity.getByRole('button', { name: 'Voltar às atividades' }));
        await hit(lesson);
        assert.equal(await recap.isHidden(), true);
      }
      await hit(wrong);
      const feedback = await activity.getByRole('status').textContent();
      if (group) assert.equal(feedback, retry);
      else assert.match(feedback, retry);
      assert.equal(await recap.isHidden(), true);
      assert.equal(recorded.some(event => event.activity_code === code && event.event === 'complete'), false);
      await hit(activity.locator('[data-guided-correct="1"]'));
      await recap.waitFor({ state: 'visible' });
      assert.equal(await recap.getByRole('listitem').count(), 3);
      const continueButton = recap.getByRole('button', { name: 'Concluir atividade' });
      assert.ok((await continueButton.boundingBox()).height >= 44);
      assert.ok(await surface.evaluate(el => el.scrollWidth <= el.clientWidth + 1));
      await hit(continueButton);
      const success = page.locator('#successView.is-active');
      const takeaway = await success.locator('#successLearned').textContent();
      if (group) assert.equal(takeaway, advice);
      else assert.match(takeaway, advice);
      await hit(success.locator('#nextLessonBtn'));
      assert.match(await lesson.getAttribute('aria-label'), /Concluída/);
      await hit(path.locator('#modulePathBack'));
    }
    assert.deepEqual(recorded.filter(event => event.event === 'complete').map(event => event.activity_code).sort(),
      courses.map(([, , code]) => code).sort());
    console.log(`V112.92 ${engine.name()} ${platform} ${font} — ${courses.length} atividades concluídas`);
    await page.close();
  }
} finally {
  await browser.close();
}

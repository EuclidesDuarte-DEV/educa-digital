import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const read = file => readFileSync(file, 'utf8');
const js = read('public/static/js/training.js');
const system = read('public/static/js/android-system.js');
const free = read('public/static/js/free-mode.js');
const xp = read('public/static/channels/web/gamification-v11182.js');

function between(start, end) {
  const from = js.indexOf(start);
  const to = js.indexOf(end, from + 1);
  assert.ok(from >= 0 && to > from);
  return js.slice(from, to);
}

test('preteste limita destinos mesmo sem overlay', () => {
  const c = vm.createContext({});
  vm.runInContext(between('  function pretestAllowsView(', '  function blockPretestNavigation('), c);
  for (const v of ['learning','whatsapp','free-summary','module-path','bank-extract','bank-keys','settings-main']) {
    assert.equal(c.pretestAllowsView(v,false,false),false);
    assert.equal(c.pretestAllowsView(v,true,false),false);
    assert.equal(c.pretestAllowsView(v,true,true),false);
  }
  assert.equal(c.pretestAllowsView('home',false,false),true);
  assert.equal(c.pretestAllowsView('home',true,false),false);
  for(const v of ['bank-home','bank-pix','bank-send','bank-review']) assert.equal(c.pretestAllowsView(v,true,false),true);
  assert.equal(c.pretestAllowsView('success',true,false),false);
  assert.equal(c.pretestAllowsView('success',true,true),true);
  assert.equal(c.pretestAllowsView('bank-home',true,true),false);
  const target = selector => ({ matches: list => list.split(', ').includes(selector) });
  assert.equal(c.pretestAllowsControl('home',target('[data-open-app="bank"]')),true);
  assert.equal(c.pretestAllowsControl('home',target('[data-open-app="whatsapp"]')),false);
  assert.equal(c.pretestAllowsControl('bank-home',target('#bankExtractBtn')),false);
  assert.equal(c.pretestAllowsControl('bank-home',target('#bankPixBtn')),true);
  assert.equal(c.pretestAllowsControl('bank-send',target('#bankContinuePix')),true);
  assert.equal(c.pretestAllowsControl('bank-send',target('#gestureHome')),false);
  assert.equal(c.pretestAllowsControl('success',target('#nextLessonBtn')),true);
});

test('guardas de navegação precedem a alteração de estado', () => {
  assert.match(js,/function setView\(name\) \{\s*if \(pretestLocked\(\)/);
  assert.match(js,/function openLearningHub\(\) \{\s*if \(pretestLocked\(\)\)/);
  assert.match(js,/function startGuidedTopic\(topicId\) \{\s*if \(pretestLocked\(\)\)/);
  assert.match(js,/if \(pretestAllowsControl\(view, control\)\) return;\s*event.preventDefault\(\);\s*event.stopImmediatePropagation\(\)/);
  assert.match(system,/function showRecents\(\) \{\s*if \(navigationLocked\(\)\) return/);
  assert.match(system,/function showShade\(\) \{\s*if \(navigationLocked\(\)\) return/);
  assert.match(free,/!bridge\(\)\?\.canFreeMode\?\.\(\)/);
});

test('conclusão do pré-teste é vinculada apenas ao telefone autenticado e repetida após falha', async () => {
  const storage = new Map(), requests = [];
  let phone = '65900000001', success = false;
  const c = vm.createContext({
    getRememberedUser: () => ({phone}),
    lessonKey: (t,i) => t+':'+i,
    lessonsKey: p => 'lessons:'+p,
    guestCompletedLessons: new Set(['pix:0']),
    completedLessons: new Set(),
    selectLessonsOwner: () => {},
    persistLessons: () => {},
    learningTopics: {pix:{lessons:[['','', 'pix-recipient']]}},
    localStorage: {setItem:(k,v)=>storage.set(k,v),getItem:k=>storage.get(k),removeItem:k=>storage.delete(k)},
    window: {addEventListener:()=>{}},
    fetch: async (url, options) => {
      requests.push(JSON.parse(options.body));
      return {ok:success,json:async()=>({ok:success})};
    }
  });
  vm.runInContext(between('  async function syncProgressEvent(', '  async function loadServerProgress('), c);
  c.attachGuestPretest(phone);
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(c.guestCompletedLessons.size,0);
  assert.ok(c.completedLessons.has('pix:0'));
  assert.equal(storage.get('lessons:65900000001:pretest-pending'),'1');
  phone = '65900000002';
  await c.flushPretestProgress(phone);
  assert.equal(requests.length,1);
  assert.equal(requests[0].phone,'65900000001');
  phone = '65900000001';
  success = true;
  await c.flushPretestProgress(phone);
  assert.equal(requests.length,2);
  assert.equal(requests[1].activity_code,'pix-recipient');
  assert.equal(storage.has('lessons:65900000001:pretest-pending'),false);
  await c.flushPretestProgress(phone);
  assert.equal(requests.length,2);
});

test('renovação do token mantém XP e fila local separados por conta', () => {
  assert.match(js,/async function reauthenticateLevel\(\)/);
  assert.match(js,/await openExistingAccountCode\(phone\)/);
  assert.match(xp,/target.authRequired=true/);
  assert.match(xp,/reauthenticateLevel\?\.\(\)/);
  assert.match(xp,/model=restore\(next.key\)/);
});

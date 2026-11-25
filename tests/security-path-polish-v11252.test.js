import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('polimento Segurança limita-se à Web e não altera outros temas',async()=>{
 const css=await readFile('public/static/css/security-path-polish-v11252.css','utf8');
 assert.ok(css.includes('html[data-educa-platform="web"] #modulePathView[data-topic="security"]'));
 const scopes=css.match(/#modulePathView\[data-topic="security"\]/g)||[];
 assert.ok(scopes.length>12);
 assert.doesNotMatch(css,/#[a-z]+View\[data-topic="(pix|whatsapp|govbr)"\]/);
});
test('fluxo Segurança mantém quatro lições e controles originais',async()=>{
 const html=await readFile('public/html/index.html','utf8');
 const js=await readFile('public/static/js/training.js','utf8');
 assert.match(html,/security-path-polish-v11252\.css\?v=11252/);
 assert.match(js,/modulePathView\.dataset\.topic = topicId/);
 assert.match(js,/topicId === 'security'\s*\? `\$\{completedCount\}\/\$\{topic\.lessons\.length\}`/);
 assert.match(js,/\['Golpe do falso filho'/);
 assert.match(js,/\['Link falso do banco'/);
 assert.match(js,/\['Falsa central bancária'/);
 assert.match(html,/id="moduleLessonList"/);
 assert.match(html,/id="modulePathBack"/);
});

test('V112.58: apenas título, botão voltar e um ícone; Segurança usa três colunas na Web',async()=>{
 const html=await readFile('public/html/index.html','utf8');
 const css=await readFile('public/static/css/security-path-polish-v11252.css','utf8');
 const header=html.match(/<header class="module-path-header">([\s\S]*?)<\/header>/)?.[1];
 assert.ok(header);
 assert.doesNotMatch(header,/atividades livres/i);
 assert.match(header,/id="modulePathTitle"/);
 assert.match(css,/\.web-activity-simple \.module-path-header\{\s*grid-template-columns:44px 40px minmax\(0,1fr\)!important/);
 assert.match(css,/\.module-path-header>div::before\{\s*content:none!important/);
 assert.match(html,/security-path-polish-v11252\.css\?v=11252&header=11258/);
});

test('V112.59: todos os módulos compartilham cabeçalho de três colunas',async()=>{
 const css=await readFile('public/static/css/security-path-polish-v11252.css','utf8');
 const browser=await readFile('scripts/validar-module-header-v11258.mjs','utf8');
 assert.match(css,/#modulePathView\.web-activity-simple \.module-path-header\{\s*grid-template-columns:44px 40px minmax\(0,1fr\)!important/);
 assert.match(css,/#modulePathView\.web-activity-simple #modulePathTitle/);
 for(const topic of ['security','settings','whatsapp','pix','govbr','playstore'])assert.ok(browser.includes("'"+topic+"'"));
});

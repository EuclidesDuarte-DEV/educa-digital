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

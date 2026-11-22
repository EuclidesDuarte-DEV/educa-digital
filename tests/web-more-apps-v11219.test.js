import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const html=readFileSync('public/html/index.html','utf8');
const profileCss=readFileSync('public/static/css/web-light-youtube-maps-agenda-v11219.css','utf8');
const apps=readFileSync('public/static/js/web-more-apps-v11219.js','utf8');
const bridge=readFileSync('public/static/js/web-real.js','utf8');
const workflow=readFileSync('.github/workflows/web-apps-v11216.yml','utf8');
test('V112.19: scripts sintaticamente validos e carregamento depois da ponte de apps',()=>{
 assert.doesNotThrow(()=>new vm.Script(apps));
 const css=html.indexOf('web-light-youtube-maps-agenda-v11219.css?v=11219');
 const previous=html.indexOf('web-apps-light-notices-v11218.css?v=11218');
 assert.ok(css>previous,'tema claro precisa sobrepor estilos antigos');
 const src=html.indexOf('web-more-apps-v11219.js?v=11219');
 assert.ok(src>html.indexOf('web-real.js?v=11219'),'modulo carregado depois da ponte Web');
 assert.ok(src>html.indexOf('web-apps-v11216.js?v=11217'));
 assert.match(bridge,/EducaWebMoreAppsV11219\?\.open/);
 assert.match(bridge,/EducaWebMoreAppsV11219\?\.close/);
});
test('V112.19: modo claro do WhatsApp nao depende do tema escuro do celular',()=>{
 assert.match(profileCss,/html\[data-educa-platform="web"\] #phoneScreen \{color-scheme:light!important;\}/);
 assert.match(profileCss,/#chatView \.fc-layer\{\s*background:#f6f8fb!important/);
 assert.match(profileCss,/#chatView \.fc-nav \{/);
 assert.match(profileCss,/#chatView \.fc-group button \{/);
 assert.match(profileCss,/#chatView \.fc-menu\{/);
 assert.doesNotMatch(profileCss,/html\[data-educa-platform="(ios|android)"\]/);
});
test('V112.19: YouTube tem telas e interacoes ficticias',()=>{
 for(const value of ["'youtube'","'yt-tab'","'yt-category'","'yt-official'","'yt-read'","'yt-like'","'yt-subscribe'"]){
  assert.ok(apps.includes(value),'faltou '+value);
 }
 assert.match(apps,/Nenhum vídeo do YouTube real é reproduzido/);
 assert.match(apps,/webv-video-card/);
});
test('V112.19: Maps usa lugares ficticios e nunca pede GPS',()=>{
 for(const value of ['Biblioteca Educa','Centro de Saúde Exemplo','Praça Modelo','map-place','map-route','map-save']){
  assert.ok(apps.includes(value),'faltou '+value);
 }
 assert.match(apps,/NÃO representam lugares reais/);
 assert.doesNotMatch(apps,/navigator\.geolocation|getCurrentPosition|watchPosition|fetch\(/);
});
test('V112.19: agenda salva localmente, permite mês/dia, exclusão, ICS',()=>{
 for(const value of ['educa-v109-eventos-locais','wvAgendaForm','calendarGrid','agendaHours','cal-delete','cal-export','BEGIN:VCALENDAR']){
  assert.ok(apps.includes(value),'faltou '+value);
 }
 assert.match(apps,/localStorage\.setItem/);
 assert.match(apps,/não sincroniza|Não sincroniza/);
});
test('V112.19: CI testa modo escuro do dispositivo e tap em novas telas',()=>{
 assert.match(workflow,/web-more-apps-v11219\.test\.js/);
 assert.match(workflow,/validar-web-more-apps-v11219\.mjs/);
 assert.match(workflow,/web-light-youtube-maps-agenda-v11219\.css/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const html=readFileSync('public/html/index.html','utf8');
const css=readFileSync('public/static/css/web-compact-toolbars-v11221.css','utf8');
const old=readFileSync('public/static/js/web-apps-v11216.js','utf8');
const apps=readFileSync('public/static/js/web-more-apps-v11219.js','utf8');
const workflow=readFileSync('.github/workflows/web-apps-v11216.yml','utf8');

test('V112.21: Apps alterados compilam e são carregados com cache renovado',()=>{
 assert.doesNotThrow(()=>new vm.Script(old));
 assert.doesNotThrow(()=>new vm.Script(apps));
 assert.match(html,/web-apps-v11216\.js\?v=11221/);
 assert.match(html,/web-more-apps-v11219\.js\?v=11221/);
 const previous=html.indexOf('web-call-touch-light-v11220.css?v=11220');
 const latest=html.indexOf('web-compact-toolbars-v11221.css?v=11221');
 assert.ok(previous>=0&&latest>previous&&latest<html.indexOf('</head>'));
});

test('V112.21: Busca e filtros dos novos apps ficam no topo, e não dentro do feed',()=>{
 for(const name of ['wvYtSearch','wvMapsSearch','webv-toolbar','webv-chips','webv-cal-controls'])
   assert.ok(apps.includes(name),name);
 assert.match(apps,/role="group" aria-label="Pesquisar e filtrar aulas"/);
 assert.match(apps,/role="group" aria-label="Pesquisar e explorar mapa"/);
 assert.match(apps,/role="group" aria-label="Navegação e períodos da agenda"/);
 assert.match(apps,/type="submit" aria-label="Buscar aulas"/);
 assert.match(apps,/type="submit" aria-label="Buscar local"/);
 // No outro contexto (aula individual) a barra de voltar deve permanecer.
 assert.match(apps,/data-wv="yt-back"/);
});

test('V112.21: Busca de Fotos deixa a área de imagens e mantém input e tab existentes',()=>{
 assert.match(old,/const search=tab==='search'\?/);
 assert.match(old,/galleryHeader\(\)\+search\+photoActions\(\)\+'<main class="webx-photos-scroll">/);
 assert.ok(!old.includes("if(tab==='search')tiles+='<label class=\"webx-photo-search\""));
 assert.match(old,/id="webxPhotoSearch"/);
 assert.match(old,/data-webx="photo-tab"/);
});

test('V112.21: rolagem independente e controls responsivos, só Web',()=>{
 assert.match(css,/html\[data-educa-platform="web"\]/);
 assert.match(css,/grid-template-columns:minmax\(0,1fr\) 44px!important/);
 assert.match(css,/\.webv-app > \.webv-scroll/);
 assert.match(css,/\.webx-photos-scroll/);
 assert.match(css,/\.webx-mail-scroll/);
 assert.match(css,/\.webx-sms-list/);
 assert.match(css,/overscroll-behavior-y:contain!important/);
 assert.doesNotMatch(css,/data-educa-platform="(?:ios|android)"/);
});

test('V112.21: auditoria visual automatizada faz toque e verifica geometria',()=>{
 assert.match(workflow,/validar-web-toolbars-v11221\.mjs/);
 assert.match(workflow,/web-toolbars-v11221\.test\.js/);
 assert.match(workflow,/web-compact-toolbars-v11221\.css/);
});

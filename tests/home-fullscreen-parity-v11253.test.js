import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('fullscreen Web aplica mesma home e mantém mobile imersivo',async()=>{
 const [html,css]=await Promise.all([readFile('public/html/index.html','utf8'),readFile('public/static/css/home-fullscreen-parity-v11253.css','utf8')]);
 assert.match(html,/home-fullscreen-parity-v11253.css\?v=11253/);
 assert.match(css,/\.hero-copy :is\(\.hero-eyebrow,\.hero-trust-row,\.hero-action-note\)\{\s*display:none!important/);
 assert.match(css,/#startNowBtn\{\s*display:flex!important/);
 assert.match(css,/@media\(min-width:601px\)/);
 assert.doesNotMatch(css,/@media\(max-width:600px\)/);
});

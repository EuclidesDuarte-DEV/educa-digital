import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const html=readFileSync('public/html/index.html','utf8');
const css=readFileSync('public/static/css/web-chat-photo-scroll-v11215.css','utf8');
const js=readFileSync('public/static/js/web-chat-photo-scroll-v11215.js','utf8');
const current=readFileSync('public/static/js/free-mode.js','utf8');

test('V112.15: foto pequena no chat, arquivo HD preservado e zoom ao toque',()=>{
 assert.match(html,/web-chat-photo-scroll-v11215\.css\?v=11215/);
 assert.match(html,/web-chat-photo-scroll-v11215\.js\?v=11215/);
 assert.match(css,/free-training-photo img/);
 assert.match(css,/height:134px!important/);
 assert.match(css,/height:112px!important/);
 assert.match(css,/width:min\(58%,168px\)!important/);
 assert.match(current,/photoUrl:'\/static\/img\/free-family-photo-v11214\.webp'/);
 assert.match(html,/web-contact-profile-v11214\.js/);
 assert.doesNotThrow(()=>new vm.Script(js));
});
test('V112.15: mensagens rolam e campo permanece na linha do composer no Web',()=>{
 assert.match(css,/html\[data-educa-platform="web"\]/);
 assert.match(css,/#chatWallpaper[\s\S]*?overflow-y:auto!important/);
 assert.match(css,/overscroll-behavior-y:auto!important/);
 assert.match(css,/#freeOriginalComposer:not\(\[hidden\]\)/);
 assert.match(css,/grid-row:4/);
 assert.match(css,/font-size:max\\(16px,var\\(--ed-chat-input,16px\\)\\)!important/);
 assert.match(js,/visualViewport/);
 assert.match(js,/window\.scrollBy/);
 assert.match(js,/input\.addEventListener\('focus'/);
 assert.match(js,/family-photo/);
 assert.doesNotMatch(js,/fetch\(|localStorage|navigator\.contacts|location\.href|PaymentRequest/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';

const html=readFileSync('public/html/index.html','utf8');
const ui=readFileSync('public/static/js/web-apps-v11216.js','utf8');
const css=readFileSync('public/static/css/web-apps-v11216.css','utf8');
const web=readFileSync('public/static/js/web-real.js','utf8');
test('V112.16: Web carrega Fototeca, Gmail e SMS sem alterar aplicativos nativos',()=>{
 assert.match(html,/web-apps-v11216\.css\?v=11216/);
 assert.match(html,/web-apps-v11216\.js\?v=1121[67]/);
 assert.match(web,/EducaWebAppsV11216\?\.open\?\./);
 assert.match(web,/EducaWebAppsV11216\?\.close\?\./);
 assert.match(ui,/dataset\.educaPlatform!=='web'/);
 assert.match(ui,/\['photos','gmail','messages'\]/);
 assert.match(css,/html\[data-educa-platform="web"\]/);
 assert.doesNotThrow(()=>new Script(ui));
});
test('V112.16: Fotos só consulta IndexedDB após ação, não lê galeria do celular automaticamente',()=>{
 assert.match(ui,/api\.readPhotos\(\)/);
 assert.match(ui,/api\.addFiles\(files\)/);
 assert.match(ui,/api\.removePhoto\(x\)/);
 assert.match(ui,/URL\.createObjectURL/);
 assert.match(ui,/URL\.revokeObjectURL/);
 assert.match(ui,/file" accept="image\/\*"/);
 assert.match(ui,/Fototeca/);
 assert.match(ui,/Coleções/);
 assert.match(ui,/Anos/);
 assert.match(ui,/Meses/);
 assert.match(ui,/Ilustrações de exemplo/);
 assert.doesNotMatch(ui,/navigator\.contacts|navigator\.getUserMedia|fetch\(|axios\(|sendBeacon/);
});
test('V112.16: Gmail sem OAuth, caixa e pastas marcadas como fictícias',()=>{
 for(const s of ['Caixa de entrada','Com estrela','Todos os e-mails','Rascunhos','Promoções','Spam','Lixeira','Mensagens fictícias','Pesquisar no e-mail','mailto:','mail-save-draft'])
   assert.ok(ui.includes(s),'faltou no Gmail: '+s);
 assert.match(ui,/window\.open\('https:\/\/mail\.google\.com\//);
 assert.doesNotMatch(ui,/gmail\.users|gmail\.readonly|access_token|authorization: bearer|auth\/google|OAuth2/);
 assert.match(ui,/Nenhum e-mail é enviado pelo Educa/);
});
test('V112.16: SMS e galeria permanecem no telefone simulado com rolagem independente',()=>{
 assert.match(css,/min-height:0/);
 assert.match(css,/overflow-y:auto/);
 assert.match(css,/touch-action:pan-y/);
 assert.match(css,/a11y-text-extra/);
 assert.match(css,/free-event-notice:not\(\[hidden\]\)/);
 assert.match(css,/pointer-events:none!important/);
 assert.match(css,/#webRealStatus:not\(\[hidden\]\)/);
 assert.match(css,/--webx-body-size:17px/);
 assert.match(ui,/SMS fictício/);
 assert.match(css,/#webRealView:has\(#webRealCameraVideo\)/);
 assert.match(css,/data-wr="camera-capture"/);
 assert.match(ui,/Não acessamos mensagens reais/);
});

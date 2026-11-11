import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const rd=p=>readFileSync(p,'utf8');
const h=rd('public/html/index.html'),f=rd('public/static/js/free-video.js'),d=rd('public/lia-ao-vivo.html'),sw=rd('public/static/sw.js'),old=rd('public/static/js/lia3d-call.js');
test('V111.5 substituiu a caricatura pela Lia do vídeo enviado',()=>{
 for(const item of ['id="freeVideoView"','id="liaPhotoPoster"','id="liaPhotoSpeech"','id="liaPhotoConfigure"','id="freeVideoMic"','id="freeVideoCamera"'])assert.ok(h.includes(item),item);
 assert.doesNotMatch(h,/id="lia3dCallStage"/);assert.doesNotMatch(h,/lia3d-call\.js/);
 assert.match(h,/lia-fotorreal\.css/);assert.ok(existsSync('public/static/img/lia-lovable-poster.jpg'));
});
test('Só reproduce MP4 gerado para a resposta, nunca movimentação fake da foto',()=>{
 assert.match(f,/\/api\/avatar\/speak/);assert.match(f,/\/api\/avatar\/render/);
 assert.match(f,/\/api\/avatar\/render-status/);assert.match(f,/playVideo/);
 assert.match(f,/video_enabled/);assert.match(f,/video_url/);
 assert.doesNotMatch(f,/animateMouth|beginBrowserSpeech|EducaLia3D/);
});
test('Kokoro ou voz do navegador não se passam por vídeo sincronizado',()=>{
 assert.match(f,/SpeechSynthesisUtterance/);
 assert.match(f,/vídeo realista controlado pela voz/);
 assert.match(f,/Kokoro/);
 assert.match(f,/sincronia labial/);
});
test('Rota antiga redireciona para a Lia realista e o motor antigo fica em laboratório',()=>{
 assert.match(d,/lia-realista\.html/);
 assert.match(old,/class LiaRender3D/);
 assert.match(sw,/(?:educa-cf111(?:21-lia-voz-escuta|23-lia-modo-livre|28-kokoro-browser|29-kokoro-diagnostico|30-inferencia-watchdog|31-lia-video-tts-progress|32-lia-video-prefetch-gpu|33-lia-acessibilidade|34-tutorial-sob-demanda|35-access-inside-phone|36-access-home-icon|37-access-external|38-access-fullscreen|39-access-position)|educa-cf11140-access-drawer|educa-cf11143-guide-start-train|educa-cf11144-first-login-guide|educa-cf11145-mobile-a11y-shortcuts|educa-cf11147-phone-only-responsive-a11y)/);
 assert.ok(existsSync('public/static/css/lia-fotorreal.css'));
});

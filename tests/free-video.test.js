import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {validarMensagem,responderModoLivre} from '../src/free-chat.js';
const h=readFileSync('public/html/index.html','utf8');
const f=readFileSync('public/static/js/free-video.js','utf8');
const m=readFileSync('public/static/js/free-mode.js','utf8');
test('V110 mantém Android e WhatsApp originais e acrescenta uma tela de vídeo distinta',()=>{
 assert.match(h,/data-view="home"/); assert.match(h,/data-view="whatsapp"/); assert.match(h,/data-view="free-video"/);
 assert.match(h,/id="freeVideoInput"/); assert.match(h,/free-video\.js\?v=111(?:1[4678]|21|23|24|26|28|31|32|52)/);
 assert.ok(existsSync('public/static/img/avatar-lia-v110.webp'));
 assert.ok(existsSync('public/static/img/lips/rest.webp'));
 assert.ok(existsSync('public/static/img/lips/ah.webp'));
});
test('Videochamada é o segundo desafio (após WhatsApp) e não um botão do menu',()=>{
 assert.match(m,/SCRIPTED_ORDER=Object\.freeze\(\['family','video','bank'\]\)/);
 assert.match(m,/video\(\)\?\.incoming\(s\)/);
 assert.doesNotMatch(h,/id="freeNextBtn"/);
});
test('IA usa histórico e somente mensagem fornecida pelo participante',async()=>{
 let called=0;
 const req=new Request('https://educa.example/api/modo-livre/conversar',{method:'POST',headers:{origin:'https://educa.example'},body:JSON.stringify({scenario:'video',message:'Como posso verificar sua identidade?',history:[]})});
 const res=await responderModoLivre(req,{AI:{run:async(_model,options)=>{called++;assert.match(options.messages[0].content,/personagem visual fictícia/);return {response:'Você faz bem em verificar por outro número.'};}}});
 assert.equal(res.status,200);assert.equal(called,1);assert.equal((await res.json()).mode,'ia');
 assert.match(validarMensagem({scenario:'video',message:'Minha senha é 12345678'}).error,/Não digite/);
});
test('Voz pede permissão e não captura webcam sem ato do usuário',()=>{
 assert.match(f,/getUserMedia/);assert.match(f,/getUserMedia/);
 assert.match(f,/SpeechRecognition/);assert.match(f,/lang='pt-BR'/);assert.match(f,/SpeechSynthesisUtterance/);assert.match(f,/pt\[-_\]BR/);
 assert.match(f,/stream\.getTracks\(\)/);assert.match(h,/SIMULAÇÃO EDUCATIVA/);
});

test('V111.5 usa rosto foto-real no lugar do renderizador 3D principal',()=>{
 assert.match(h,/id="liaPhotoPoster"/);assert.match(h,/id="liaPhotoSpeech"/);
 assert.doesNotMatch(h,/id="lia3dCallStage"/);
 assert.doesNotMatch(h,/lia3d-call\.js/);
 assert.match(f,/MuseTalk gerando um vídeo novo/);
 assert.match(f,/playVideo\(job\.video_url/);
 assert.match(f,/\/api\/avatar\/render-status/);
 assert.match(f,/video_enabled/);
 assert.doesNotMatch(f,/EducaLia3D/);
});
test('microfone e webcam exigem permissão e param ao encerrar',()=>{
 assert.match(f,/function setHandsFree\(v\)/);assert.match(f,/setHandsFree\(false\)/);
 assert.match(f,/function scheduleListen\(/);assert.match(f,/r\.onresult=/);
 assert.match(f,/function stopRecognition\(/);assert.match(f,/stream\.getTracks\(/);
});
test('fallback mostra movimento gravado real e não o anuncia como sincronia labial',()=>{
 assert.match(f,/vídeo realista controlado pela voz/i); assert.match(f,/fonemas são aproximados/);
 assert.match(f,/SpeechSynthesisUtterance/);
 assert.doesNotMatch(h,/id="freeVideoEyes"|id="freeVideoNextFrame"/);
 assert.match(h,/PERSONAGEM FICTÍCIA/);
});

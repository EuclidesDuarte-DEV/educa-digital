import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';
const html=readFileSync('public/html/index.html','utf8');
const css=readFileSync('public/static/css/lia-fotorreal.css','utf8');
const js=readFileSync('public/static/js/free-video.js','utf8');
const call=html.slice(html.indexOf('id="freeVideoView"'),html.indexOf('id="freeContactsView"'));
test('V111.14 tem barra de chamada com cinco controles redondos e sem botões duplicados',()=>{
 const toolbar=call.match(/<div class="v110-video-toolbar"[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/)?.[0];
 assert.ok(toolbar,'barra de chamada disponível');
 for(const id of ['freeVideoMore','freeVideoCameraToggle','freeVideoSpeaker','freeVideoMic','freeVideoHangup'])assert.match(toolbar,new RegExp('id="'+id+'"'));
 assert.match(toolbar,/id="freeVideoAnswer"/);
 assert.ok(call.indexOf('id="freeVideoText"')<call.indexOf('v110-video-bottom'),'teclado fora da barra inferior');
});
test('Legendas, Pix fictício, repetir, voz feminina e diagnóstico ficam no menu',()=>{
 const menu=call.slice(call.indexOf('id="freeVideoMore"'),call.indexOf('id="freeVideoCameraToggle"'));
 for(const id of ['freeVideoCaptionsSwitch','freeVideoActions','freeVideoVerify','freeVideoRepeat','freeVideoPix','liaPhotoConfigure','freeVideoVoiceSettings'])assert.match(menu,new RegExp('id="'+id+'"'));
 assert.match(css,/#freeVideoView\[data-captions="on"\] \.v112-caption-box\{display:flex\}/);
 assert.match(css,/#freeVideoView \.v112-video-more-content\{position:absolute/);
});
test('O aviso de simulação com personagem fictícia é visível e não há alegação de criptografia',()=>{
 assert.match(call,/SIMULAÇÃO COM IA · PERSONAGEM FICTÍCIA/);
 assert.doesNotMatch(call,/criptografia de ponta a ponta/i);
});
test('Controles possuem interação e estado acessível para câmera, microfone, som e tela cheia',()=>{
 for(const name of ['freeVideoSpeaker','freeVideoMic','freeVideoCameraToggle','freeVideoText','freeVideoExpand'])assert.match(call,new RegExp('id="'+name+'"'));
 assert.match(js,/speaker\?\.addEventListener\('click'/);
 assert.match(js,/captionSwitch\?\.addEventListener\('click'/);
 assert.match(js,/expand\?\.addEventListener\('click'/);
 assert.match(js,/function stopCamera\(/);
 assert.match(js,/async function toggleCamera\(/);
});

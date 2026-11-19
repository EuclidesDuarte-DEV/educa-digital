import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const video=readFileSync('public/static/js/free-video.js','utf8');
const html=readFileSync('public/html/index.html','utf8');
const readSegment=(start,end)=>{
 const i=video.indexOf(start),j=video.indexOf(end,i+start.length);
 assert.ok(i>=0&&j>i,'bloco ausente: '+start);
 return video.slice(i,j);
};
const startCode=readSegment('function startSpeechChunk(phrase,serial){','function speak(text){');
function makeCall(platform='web',chosen={lang:'pt-BR'}){
 const calls={fast:[],neural:[],progress:[]};
 const session={serial:5,active:true,connected:true,waiting:false,renderReady:false,
  teamCode:'',fastVoiceSerial:-1,voiceChoiceDoneSerial:-1,motorPending:null,utterance:null};
 let resolveLater=null;
 const window={
  location:{protocol:'http:'},
  EducaLiaBrowserKokoro:{isReady:()=>false},
  EducaLiaVoice:{
   choose:()=>chosen,
   waitForFemale:()=>new Promise(resolve=>{resolveLater=resolve;})
  }
 };
 const context={window,document:{documentElement:{dataset:{educaPlatform:platform}}},
  session,selectedEngine:()=>'feminina',showVoiceProgress:x=>calls.progress.push(x),
  audioOnly:(text,serial)=>calls.fast.push({text,serial}),
  playBrowserKokoro:(text,serial)=>{calls.neural.push({text,serial});return Promise.resolve(true);},
  indicator:()=>{},status:()=>{},Promise,setTimeout};
 return {calls,session,window,resolveVoice:v=>resolveLater?.(v),
  start:vm.runInNewContext(startCode+';startSpeechChunk;',context)};
}

test('V111.91 — saudação curta inicia a fala sem alterar palavras originais',()=>{
 const part=readSegment('function speechSegments(text){','const captionToggle=');
 const fn=vm.runInNewContext(part+';speechSegments;');
 const introduction='Oi, sou a Lia. Troquei de celular e estou precisando de um favor. Você pode me emprestar R$ 350 pelo Pix de treino? Eu devolvo depois.';
 const chunks=Array.from(fn(introduction));
 assert.equal(chunks[0],'Oi, sou a Lia.');
 assert.ok(chunks.length>=3&&chunks.length<=5,JSON.stringify(chunks));
 assert.equal(chunks.join(' '),introduction);
 assert.ok(chunks.every(x=>x.length<=105),JSON.stringify(chunks));
});

test('V111.91 — Web usa voz feminina local imediatamente enquanto Kokoro carrega',async()=>{
 const s=makeCall();
 s.start('Oi, sou a Lia.',5);
 await Promise.resolve();
 assert.equal(s.calls.fast.length,1);
 assert.equal(s.calls.neural.length,0);
 assert.equal(s.session.fastVoiceSerial,5);
 assert.ok(s.calls.progress.some(x=>x.includes('voz feminina rápida')));
 s.start('Troquei de celular.',5);
 assert.equal(s.calls.fast.length,2);
 assert.equal(s.calls.neural.length,0);
});

test('V111.91 — Android e iOS continuam usando o Kokoro original',async()=>{
 for(const platform of ['android','ios']){
  const s=makeCall(platform);
  s.start('Oi, sou a Lia.',5);
  await Promise.resolve();
  assert.equal(s.calls.fast.length,0);
  assert.equal(s.calls.neural.length,1,platform);
 }
});

test('V111.91 — sem voz feminina o sistema espera Kokoro, nunca seleciona masculina',async()=>{
 const s=makeCall('web',null);
 s.start('Oi, sou a Lia.',5);
 s.resolveVoice(null);
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(s.calls.fast.length,0);
 assert.equal(s.calls.neural.length,1);
 assert.equal(s.session.voiceChoiceDoneSerial,5);
});

test('V111.91 — voz antiga não toca após o participante sair da chamada',async()=>{
 const s=makeCall('web',null);
 s.start('Oi, sou a Lia.',5);
 s.session.serial=6;
 s.session.connected=false;
 s.resolveVoice({lang:'pt-BR'});
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(s.calls.fast.length,0);
 assert.equal(s.calls.neural.length,0);
});

test('V111.91 — transcrição antecipada e cache atualizado só no canal Web',()=>{
 const speech=readSegment('function speak(text){','async function configure(){');
 assert.match(speech,/subtitle\(whole\);/);
 assert.doesNotMatch(speech,/subtitle\('Lia está preparando a fala/);
 assert.match(video,/educaPlatform==='web'/);
 assert.match(video,/if\(session\.fastVoiceSerial===serial\)/);
 assert.match(video,/session\.fastVoiceSerial=-1;session\.voiceChoiceDoneSerial=-1/);
 assert.match(html,/free-video\.js\?v=11191&patch=11191/);
 const loader=readFileSync('public/static/js/platform-channel-v11160.js','utf8');
 assert.match(loader,/platform === 'web' \? '11190' : '11160'/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

test('pré-aquecimento e chamada compartilham a mesma síntese; aberturas fixas usam cache',async()=>{
 let speakCalls=0, terminated=0;
 class FakeWorker{
  constructor(){this.onmessage=null;}
  postMessage(data){
   if(data.type==='prepare')queueMicrotask(()=>this.onmessage?.({data:{type:'ready',device:'wasm'}}));
   if(data.type==='speak'){
    speakCalls++;
    setTimeout(()=>this.onmessage?.({data:{type:'audio',id:data.id,voice:'pf_dora',buffer:new Uint8Array(6000).buffer,viseme_cues:[]}}),2);
   }
  }
  terminate(){terminated++;}
 }
 const localStorage={getItem:()=>null,setItem:()=>{}};
 const context={window:{},Worker:FakeWorker,Blob,Error,Promise,Map,Set,Object,JSON,Number,Array,String,Uint8Array,
  setTimeout,clearTimeout,queueMicrotask,localStorage};
 vm.runInNewContext(readFileSync('public/static/js/lia-kokoro-browser.js','utf8'),context);
 const api=context.window.EducaLiaBrowserKokoro;
 const warm=api.prewarmIntro();
 const duplicate=api.synthesize('Oi! Sou a Lia.');
 const [ready,first]=await Promise.all([warm,duplicate]);
 assert.equal(ready,true);assert.equal(first.voice,'pf_dora');
 assert.equal(speakCalls,1,'o aquecimento não deve gerar WAV e atrasar a primeira resposta');
 const again=await api.synthesize('Oi! Sou a Lia.');
 assert.equal(speakCalls,1,'áudio fixo deve ser reutilizado sem refazer inferência');
 assert.equal(again.voice,'pf_dora');assert.equal(terminated,0);
});

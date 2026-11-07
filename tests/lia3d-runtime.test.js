import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

test('motor 3D monta cena sem CDN, desenha malhas e encerra sem gerar foto',async()=>{
 let draws=0,requested=0,raf=null,hasCanvas=false,exposed=null;
 const gl={
  VERTEX_SHADER:35633,FRAGMENT_SHADER:35632,COMPILE_STATUS:35713,LINK_STATUS:35714,
  ARRAY_BUFFER:34962,ELEMENT_ARRAY_BUFFER:34963,STATIC_DRAW:35044,FLOAT:5126,
  UNSIGNED_SHORT:5123,TRIANGLES:4,DEPTH_TEST:2929,COLOR_BUFFER_BIT:16384,DEPTH_BUFFER_BIT:256,
  createShader:()=>({}),shaderSource:()=>{},compileShader:()=>{},getShaderParameter:()=>true,
  getShaderInfoLog:()=>'',createProgram:()=>({}),attachShader:()=>{},bindAttribLocation:()=>{},linkProgram:()=>{},
  getProgramParameter:()=>true,createVertexArray:()=>({}),bindVertexArray:()=>{},
  createBuffer:()=>({}),bindBuffer:()=>{},bufferData:()=>{},enableVertexAttribArray:()=>{},vertexAttribPointer:()=>{},
  getUniformLocation:()=>({}),uniformMatrix4fv:()=>{},uniform3fv:()=>{},uniform1f:()=>{},
  viewport:()=>{},enable:()=>{},clearColor:()=>{},clear:()=>{},useProgram:()=>{},
  drawElements:()=>{draws++;},deleteVertexArray:()=>{},deleteProgram:()=>{}
 };
 const elements={
  lia3dCallStage:{getBoundingClientRect:()=>({width:320,height:610}),replaceChildren(c){hasCanvas=true;exposed=c;}},
  lia3dFallback:{hidden:false},lia3dLoadStatus:{textContent:''},lia3dCallModelLabel:{textContent:''},
  freeVideoState:{textContent:''},lia3dKokoroSetup:{addEventListener:()=>{}}
 };
 const window={devicePixelRatio:1,matchMedia:()=>({matches:false}),addEventListener:()=>{},removeEventListener:()=>{},AudioContext:class{resume(){}close(){}},};
 const sandbox={document:{getElementById:id=>elements[id]||null,createElement:()=>({getContext:()=>gl,setAttribute:()=>{},remove:()=>{},width:0,height:0})},
  window,console,Float32Array,Uint16Array,Uint8Array,Math,TextEncoder,AbortController,performance:{now:()=>1000},
  ResizeObserver:class{observe(){}disconnect(){}},requestAnimationFrame:f=>{raf=f;return ++requested;},cancelAnimationFrame:()=>{},setInterval:()=>1,clearInterval:()=>{},
  fetch:()=>{throw Error('A renderização local não deve usar rede.');}};
 runInNewContext(readFileSync('public/static/js/lia3d-call.js','utf8'),sandbox);
 assert.equal(await window.EducaLia3D.open(),true);
 assert.equal(hasCanvas,true);assert.equal(elements.lia3dFallback.hidden,true);
 assert.match(window.EducaLia3D.diagnostics().engine,/WebGL2/);
 raf(1100);assert.ok(draws>35,`esperava >=35 volumes 3D, encontrado ${draws}`);
 window.EducaLia3D.beginBrowserSpeech('Olá, cuidado com golpes!');
 window.EducaLia3D.wordBoundary(0);raf(1166);assert.ok(draws>70);
 assert.equal(await window.EducaLia3D.speak('Oi!'),false); // Kokoro desativado
 window.EducaLia3D.close();assert.equal(window.EducaLia3D.isReady(),false);
 assert.match(elements.lia3dLoadStatus.textContent,/Atender/);
});

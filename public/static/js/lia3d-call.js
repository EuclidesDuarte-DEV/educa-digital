/**
 * Educa+ Digital V111.3 — LIA, personagem 3D ORIGINAL da equipe.
 * Motor WebGL2 próprio, sem Simli, Avaturn, SDKs pagos, fotografias ou MP4 falso.
 * Renderização local, olhos/piscada, expressão, cabeça, respiração, articulação oral.
 * Voz: Kokoro opcional (mesmo WAV toca e dirige energia labial) ou Web Speech pt-BR.
 * A amplitude sonora não identifica fonemas: Web Speech usa visemas aproximados por texto.
 * NÃO clona rosto ou voz de pessoas existentes. É uma simulação educativa identificada.
 */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const stage=$('lia3dCallStage'), placeholder=$('lia3dFallback'), loading=$('lia3dLoadStatus');
const localState=$('lia3dCallModelLabel');
const status=message=>{const n=$('freeVideoState');if(n)n.textContent=message;};
const lerp=(a,b,t)=>a+(b-a)*t;
const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
const mat={
 identity(){return new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);},
 mul(a,b){const r=new Float32Array(16);for(let c=0;c<4;c++)for(let i=0;i<4;i++)for(let k=0;k<4;k++)r[c*4+i]+=a[k*4+i]*b[c*4+k];return r;},
 translation(x,y,z){const m=this.identity();m[12]=x;m[13]=y;m[14]=z;return m;},
 scale(x,y,z){const m=this.identity();m[0]=x;m[5]=y;m[10]=z;return m;},
 rotateX(a){const c=Math.cos(a),s=Math.sin(a),m=this.identity();m[5]=c;m[6]=s;m[9]=-s;m[10]=c;return m;},
 rotateY(a){const c=Math.cos(a),s=Math.sin(a),m=this.identity();m[0]=c;m[2]=-s;m[8]=s;m[10]=c;return m;},
 rotateZ(a){const c=Math.cos(a),s=Math.sin(a),m=this.identity();m[0]=c;m[1]=s;m[4]=-s;m[5]=c;return m;},
 ortho(l,r,b,t,n,f){const m=this.identity();m[0]=2/(r-l);m[5]=2/(t-b);m[10]=-2/(f-n);m[12]=-(r+l)/(r-l);m[13]=-(t+b)/(t-b);m[14]=-(f+n)/(f-n);return m;}
};
const vertexSource=`#version 300 es
in vec3 aPosition;in vec3 aNormal;
uniform mat4 uTransform;uniform mat4 uModel;
out vec3 vNormal;out vec3 vWorld;
void main(){vec4 pos=uModel*vec4(aPosition,1.0);vWorld=pos.xyz;
 vNormal=normalize(mat3(uModel)*aNormal);gl_Position=uTransform*pos;}`;
const fragmentSource=`#version 300 es
precision mediump float;
in vec3 vNormal;in vec3 vWorld;uniform vec3 uColor;uniform float uGloss;
out vec4 frag;
void main(){vec3 n=normalize(vNormal);vec3 key=normalize(vec3(-0.65,0.9,1.7));
 float lam=max(dot(n,key),0.0);float fill=max(dot(n,normalize(vec3(1.0,0.2,0.9))),0.0);
 float rim=pow(1.0-max(dot(n,vec3(0.,0.,1.)),0.),2.4);
 float shine=pow(max(dot(reflect(-key,n),vec3(0.,0.,1.)),0.),24.0)*uGloss;
 vec3 c=uColor*(0.52+0.34*lam+0.18*fill)+vec3(0.14,0.20,0.29)*rim+vec3(0.35)*shine;
 frag=vec4(pow(c,vec3(0.93)),1.);}`;
function uvSphere(segments=28,rings=20){
 const vertices=[],indices=[];
 for(let j=0;j<=rings;j++){const theta=j*Math.PI/rings;
  for(let i=0;i<=segments;i++){const phi=i*2*Math.PI/segments;
   const x=Math.sin(theta)*Math.cos(phi),y=Math.cos(theta),z=Math.sin(theta)*Math.sin(phi);
   vertices.push(x,y,z,x,y,z);
  }
 }
 for(let j=0;j<rings;j++)for(let i=0;i<segments;i++){
  const a=j*(segments+1)+i,b=a+segments+1;indices.push(a,b,a+1,b,b+1,a+1);
 }
 return {vertices:new Float32Array(vertices),indices:new Uint16Array(indices)};
}
function shader(gl,type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);
 if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('Shader inválido: '+gl.getShaderInfoLog(s));return s;}
function objectGeometry(gl){const shape=uvSphere();const vao=gl.createVertexArray();gl.bindVertexArray(vao);
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,shape.vertices,gl.STATIC_DRAW);
 const idx=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,idx);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,shape.indices,gl.STATIC_DRAW);
 gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,24,0);
 gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,24,12);
 gl.bindVertexArray(null);return {vao,count:shape.indices.length};}
const palette={skin:[.81,.51,.37],skinLight:[.92,.62,.47],skinShade:[.70,.39,.30],
 hair:[.21,.105,.09],hairLit:[.36,.17,.12],hairShade:[.15,.065,.067],
 eyes:[.97,.95,.90],iris:[.31,.49,.45],pupil:[.055,.095,.12],
 lip:[.63,.245,.28],mouth:[.19,.06,.09],teeth:[.94,.90,.86],
 coat:[.075,.28,.48],coatLight:[.12,.40,.61],inner:[.89,.91,.96],
 jewelry:[.89,.69,.40],eyebrow:[.20,.09,.085]};
class LiaRender3D{
 constructor(container){
  this.container=container;this.canvas=document.createElement('canvas');this.canvas.setAttribute('aria-label','Lia: avatar 3D animado em tempo real');
  this.canvas.setAttribute('role','img');container.replaceChildren(this.canvas);
  const gl=this.canvas.getContext('webgl2',{antialias:true,alpha:true,powerPreference:'low-power'});
  if(!gl)throw Error('Este aparelho não permite WebGL2.');this.gl=gl;
  const program=gl.createProgram();gl.attachShader(program,shader(gl,gl.VERTEX_SHADER,vertexSource));gl.attachShader(program,shader(gl,gl.FRAGMENT_SHADER,fragmentSource));
  gl.bindAttribLocation(program,0,'aPosition');gl.bindAttribLocation(program,1,'aNormal');gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Falha na montagem do motor 3D.');
  this.program=program;this.geo=objectGeometry(gl);
  this.locations={projection:gl.getUniformLocation(program,'uTransform'),model:gl.getUniformLocation(program,'uModel'),color:gl.getUniformLocation(program,'uColor'),gloss:gl.getUniformLocation(program,'uGloss')};
  this.active=true;this.speaking=false;this.mouth=0;this.round=0;this.closeLips=0;this.smile=.18;
  this.mood='neutral';this.noise=0;this.headMotion=0;this.frame=0;this.started=performance.now();this.last=performance.now();
  this.audioLevel=null;this.blink=0;this.sizeX=0;this.sizeY=0;
  this.resize=()=>{if(!this.active)return;const b=container.getBoundingClientRect();
   const dpr=Math.min(window.devicePixelRatio||1,1.4);const w=Math.max(2,Math.floor(b.width*dpr)),h=Math.max(2,Math.floor(b.height*dpr));
   if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;this.gl.viewport(0,0,w,h);}
   const ratio=w/h;const halfHeight=2.12;const halfWidth=Math.max(1.22,Math.min(2.65,halfHeight*ratio));
   this.projection=mat.ortho(-halfWidth,halfWidth,-halfHeight+.12,halfHeight+.12,-10,10);
  };
  this.observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(this.resize):null;this.observer?.observe(container);
  window.addEventListener('resize',this.resize);this.resize();this.tick=this.tick.bind(this);this.raf=requestAnimationFrame(this.tick);
 }
 draw(x,y,z,sx,sy,sz,color,rotation=null,parent=null,gloss=.08){
  const g=this.gl;let m=mat.translation(x,y,z);
  if(rotation){if(rotation[0])m=mat.mul(m,mat.rotateX(rotation[0]));if(rotation[1])m=mat.mul(m,mat.rotateY(rotation[1]));if(rotation[2])m=mat.mul(m,mat.rotateZ(rotation[2]));}
  m=mat.mul(m,mat.scale(sx,sy,sz));if(parent)m=mat.mul(parent,m);
  g.uniformMatrix4fv(this.locations.model,false,m);g.uniform3fv(this.locations.color,color);g.uniform1f(this.locations.gloss,gloss);g.drawElements(g.TRIANGLES,this.geo.count,g.UNSIGNED_SHORT,0);
 }
 tick(now){if(!this.active)return;this.raf=requestAnimationFrame(this.tick);
  const dt=Math.min(.08,(now-this.last)/1000);this.last=now;
  if(this.canvas.width<3||this.canvas.height<3)return;
  this.frame+=dt;const t=this.frame;const motion=reduced()?0:1;
  const closing=Math.pow(Math.max(0,Math.sin(t*1.9+0.55)),62)+Math.pow(Math.max(0,Math.sin(t*1.23-1.3)),80);
  this.blink=clamp(closing*1.2);
  if(this.audioLevel){const level=this.audioLevel();this.mouth=lerp(this.mouth,clamp(.07+level*3.0,.01,.88),clamp(dt*15));
   this.round=lerp(this.round,.17,clamp(dt*8));}
  else if(!this.speaking){this.mouth=lerp(this.mouth,0,clamp(dt*15));this.round=lerp(this.round,0,clamp(dt*9));}
  const g=this.gl;g.viewport(0,0,this.canvas.width,this.canvas.height);g.enable(g.DEPTH_TEST);
  g.clearColor(0,0,0,0);g.clear(g.COLOR_BUFFER_BIT|g.DEPTH_BUFFER_BIT);
  g.useProgram(this.program);g.bindVertexArray(this.geo.vao);g.uniformMatrix4fv(this.locations.projection,false,this.projection);
  const breathe=(Math.sin(t*1.5)*.014)*motion;
  // Corpo, braços e gola: cada volume tem normais e profundidade 3D reais.
  this.draw(0,-1.49,-.18,.88,.91,.49,palette.coatLight,[0,0,breathe]);
  this.draw(-.84,-1.37,-.16,.35,.67,.42,palette.coat,[-.15,0,-.27]);
  this.draw(.84,-1.37,-.16,.35,.67,.42,palette.coat,[-.15,0,.27]);
  this.draw(0,-1.13,.23,.28,.37,.12,palette.inner);
  this.draw(-.34,-1.17,.30,.22,.42,.08,palette.coat,[0,0,-.45]);
  this.draw(.34,-1.17,.30,.22,.42,.08,palette.coat,[0,0,.45]);
  this.draw(0,-.49,.0,.235,.39,.23,palette.skin);
  this.draw(0,-.75,.25,.055,.058,.055,palette.jewelry,[],null,.7);
  // Volume de cabelo traseiro acompanha o giro de cabeça (não é uma foto).
  const yaw=Math.sin(t*.62)*.048*motion+(this.speaking?Math.sin(t*1.7)*.021*motion:0);
  const roll=Math.sin(t*.49+.6)*.028*motion;
  const nod=Math.sin(t*.69)*.029*motion+(this.speaking?Math.sin(t*2)*.02*motion:0);
  let head=mat.translation(0,.42+Math.sin(t*1.45)*.012*motion,.04);
  head=mat.mul(head,mat.rotateY(yaw));head=mat.mul(head,mat.rotateZ(roll));head=mat.mul(head,mat.rotateX(nod));
  // Todas as medidas faciais abaixo são relativas ao centro do crânio.
  this.draw(0,.01,-.20,.69,.86,.59,palette.hairShade,null,head,.22);
  this.draw(-.55,-.47,-.14,.26,.78,.33,palette.hair,[0,0,-.06],head);
  this.draw(.55,-.47,-.14,.26,.78,.33,palette.hair,[0,0,.06],head);
  this.draw(0,-.03,.055,.595,.735,.515,palette.skin,null,head,.12);
  this.draw(-.585,-.18,.03,.135,.215,.12,palette.skinShade,null,head);
  this.draw(.585,-.18,.03,.135,.215,.12,palette.skinShade,null,head);
  this.draw(-.38,-.25,.485,.17,.095,.045,palette.skinLight,null,head);
  this.draw(.38,-.25,.485,.17,.095,.045,palette.skinLight,null,head);
  // Maquiagem discreta: olhos possuem globo, íris e pupila como volumes separados.
  for(const dir of [-1,1]){
   const x=dir*.239;
   const eyeRoot=mat.mul(head,mat.translation(x,.115,.49));
   const eyelidScale=Math.max(.035,1-this.blink);
   this.draw(0,0,0,.192,.110*eyelidScale,.075,palette.eyes,null,eyeRoot,.42);
   this.draw(-dir*.01,-.008,.066,.079,.080*eyelidScale,.033,palette.iris,null,eyeRoot,.52);
   this.draw(-dir*.009,-.007,.092,.034,.054*eyelidScale,.017,palette.pupil,null,eyeRoot,.75);
   this.draw(-dir*.027,.03,.107,.018,.022*eyelidScale,.012,palette.eyes,null,eyeRoot,.8);
   this.draw(0,.176,.0,.205,.035,.050,palette.eyebrow,[0,0,dir*.13],eyeRoot);
   if(this.blink>.6)this.draw(0,.005,.073,.198,.024,.01,palette.skinShade,null,eyeRoot);
  }
  this.draw(0,-.124,.525,.104,.186,.146,palette.skinLight,[.11,0,0],head);
  this.draw(0,-.255,.629,.133,.08,.106,palette.skinLight,null,head);
  this.draw(-.092,-.28,.622,.035,.025,.032,palette.skinShade,null,head);
  this.draw(.092,-.28,.622,.035,.025,.032,palette.skinShade,null,head);
  // Boca abre, fecha, arredonda e revela dentes: sem substituir imagens.
  const open=clamp(this.mouth,0,.94);const rounded=clamp(this.round,0,.95);
  const mouthWidth=.177*(1-.40*rounded+.12*this.smile);
  const mouthHeight=.021+open*.158;
  const mouthRoot=mat.mul(head,mat.translation(0,-.415,.526));
  this.draw(0,0,0,mouthWidth,mouthHeight,.053,palette.mouth,null,mouthRoot);
  if(open>.10)this.draw(0,mouthHeight*.42,.048,mouthWidth*.79,Math.min(.047,mouthHeight*.21),.018,palette.teeth,null,mouthRoot,.26);
  this.draw(0,mouthHeight+.012,.015,mouthWidth*1.06,.040,.061,palette.lip,null,mouthRoot);
  this.draw(0,-mouthHeight-.007,.027,mouthWidth*1.055,.048,.070,palette.lip,null,mouthRoot);
  // Mechas frontais com volume; topo do cabelo.
  this.draw(0,.63,-.095,.65,.38,.48,palette.hair,null,head,.26);
  this.draw(-.41,.40,.37,.25,.37,.23,palette.hairLit,[.06,0,-.23],head,.24);
  this.draw(.44,.42,.26,.24,.38,.25,palette.hair,[.10,0,.25],head,.24);
  this.draw(-.58,-.38,-.015,.195,.70,.28,palette.hairLit,[0,0,-.045],head,.21);
  this.draw(.59,-.40,-.015,.19,.72,.29,palette.hair,[0,0,.045],head,.21);
  // Brincos pequenos, não desaparecem com o movimento da cabeça.
  this.draw(-.59,-.37,.15,.045,.075,.042,palette.jewelry,null,head,.9);
  this.draw(.59,-.37,.15,.045,.075,.042,palette.jewelry,null,head,.9);
  g.bindVertexArray(null);
 }
 setMood(text){const s=String(text||'').toLowerCase();this.mood=/perigo|suspeit|golpe|urgente|cuidado/.test(s)?'concerned':/obrigad|legal|ótimo|parabéns|ajud/.test(s)?'warm':'neutral';this.smile=this.mood==='warm'?.65:this.mood==='concerned'?.05:.21;}
 setPhoneme(segment){const s=String(segment||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  if(!s.trim()){this.setOral(.02,0);return;}
  const letter=s[0];const shut=/[bmp]/.test(letter),rounded=/[ouqw]/.test(letter),wide=/[ie]/.test(letter),fric=/[fvsz]/.test(letter);
  this.setOral(shut?.025:rounded?.35:wide?.48:fric?.19:.63,rounded?.86:wide?.04:.14);
 }
 setOral(open,round){this.speaking=true;this.mouth=lerp(this.mouth,open,.72);this.round=lerp(this.round,round,.7);}
 stopOral(){this.speaking=false;this.audioLevel=null;this.mouth=0;this.round=0;this.setMood('');}
 destroy(){this.active=false;cancelAnimationFrame(this.raf);this.observer?.disconnect();window.removeEventListener('resize',this.resize);
  const g=this.gl;if(g){g.deleteVertexArray(this.geo.vao);g.deleteProgram(this.program);}this.canvas.remove();}
}
let engine=null,active=false,ready=false,opening=null,context=null,voiceCode='',voiceOnline=false,healthChecked=false;
let source=null,analyser=null,bufferNode=null,signalController=null,speechCounter=0;
let browserText='',wordIndex=0,wordTime=0,lastBrowserWord='',browserMode=false;
function showPlaceholder(message){if(placeholder)placeholder.hidden=false;if(loading)loading.textContent=message;}
async function open(){active=true;if(ready&&engine)return true;if(opening)return opening;
 opening=(async()=>{try{
   engine?.destroy();engine=new LiaRender3D(stage);ready=true;
   if(placeholder)placeholder.hidden=true;
   if(localState)localState.textContent='Lia · avatar 3D original · renderização local';
   status('Avatar 3D da Lia pronto. O diálogo será feito pela IA do Educa+ Digital.');
   return true;
  }catch(err){ready=false;showPlaceholder('Não foi possível iniciar WebGL2. A conversa por texto continua.');console.warn('Motor 3D Lia:',err);return false;}
  finally{opening=null;}})();return opening;
}
function clearAudio(){try{bufferNode?.stop();}catch(_){}try{bufferNode?.disconnect();}catch(_){}try{analyser?.disconnect();}catch(_){}
 bufferNode=null;analyser=null;source=null;signalController?.abort();signalController=null;}
function stopSpeech(){speechCounter++;browserMode=false;clearAudio();engine?.stopOral();}
function close(){active=false;ready=false;stopSpeech();voiceCode='';healthChecked=false;voiceOnline=false;
 engine?.destroy();engine=null;showPlaceholder('Toque em Atender para iniciar a Lia em 3D.');}
function unlockAudio(){if(!context&&window.AudioContext)context=new AudioContext();
 try{void context?.resume();}catch(_){}}
async function checkVoice(){if(healthChecked)return voiceOnline;healthChecked=true;
 try{const resp=await fetch('/api/avatar/health',{cache:'no-store',credentials:'same-origin'});
 const obj=await resp.json();voiceOnline=resp.ok&&obj.enabled===true;}
 catch(_){voiceOnline=false;}return voiceOnline;}
async function configureVoice(){if(!await checkVoice()){status('Kokoro não conectado. A Lia continuará usando voz gratuita do navegador.');return false;}
 const value=window.prompt('Código privado de testes do Kokoro (não é senha de usuário):');
 if(!value)return false;voiceCode=String(value).trim().slice(0,150);status('Kokoro configurado para esta sessão.');return true;}
async function speak(text,hooks={}){
 if(!active||!ready||!voiceCode||!await checkVoice())return false;
 stopSpeech();const id=speechCounter;const ctrl=new AbortController();signalController=ctrl;
 try{
  status('A Lia está gerando voz brasileira pelo Kokoro…');
  const response=await fetch('/api/avatar/speak',{method:'POST',cache:'no-store',credentials:'same-origin',signal:ctrl.signal,
   headers:{'Content-Type':'application/json','X-Educa-Lia-Code':voiceCode},body:JSON.stringify({text:String(text).slice(0,450)})});
  if(!response.ok)throw Error('Falha no Kokoro (HTTP '+response.status+')');
  const data=await response.json();
  if(!/^\/api\/avatar\/media\/[a-f0-9]{32}\.wav$/.test(String(data.audio_url||'')))throw Error('O servidor não devolveu WAV válido.');
  const wav=await fetch(data.audio_url,{cache:'no-store',credentials:'same-origin',signal:ctrl.signal,headers:{'X-Educa-Lia-Code':voiceCode}});
  if(!wav.ok)throw Error('Não foi possível carregar o WAV.');
  const bytes=await wav.arrayBuffer();if(bytes.byteLength<44||bytes.byteLength>30*1024*1024)throw Error('WAV fora do tamanho permitido.');
  if(!context)context=new AudioContext();await context.resume();
  const buffer=await context.decodeAudioData(bytes);
  if(ctrl.signal.aborted||id!==speechCounter||!active)return true;
  const node=context.createBufferSource();node.buffer=buffer;
  analyser=context.createAnalyser();analyser.fftSize=1024;analyser.smoothingTimeConstant=.63;
  node.connect(analyser);analyser.connect(context.destination);bufferNode=node;source=node;
  const samples=new Uint8Array(analyser.fftSize);
  engine.audioLevel=()=>{if(!analyser)return 0;analyser.getByteTimeDomainData(samples);
   let sum=0;for(let i=0;i<samples.length;i++){const v=(samples[i]-128)/128;sum+=v*v;}return clamp(Math.sqrt(sum/samples.length)*4);};
  engine.setMood(text);engine.speaking=true;
  node.onended=()=>{if(id!==speechCounter)return;clearAudio();engine?.stopOral();hooks.onEnd?.();};
  node.start();hooks.onStart?.();return true;
 }catch(e){if(ctrl.signal.aborted||id!==speechCounter)return true;
  console.warn('Voz Kokoro da Lia:',e);clearAudio();engine?.stopOral();return false;}
}
function beginBrowserSpeech(text){if(!active||!ready)return;
 browserText=String(text||'');wordIndex=0;wordTime=performance.now();lastBrowserWord='';browserMode=true;
 engine.setMood(text);engine.setOral(.16,.1);
}
function wordBoundary(offset){if(!browserMode||!engine)return;
 wordIndex=clamp(Number(offset)||0,0,browserText.length);
 lastBrowserWord=browserText.slice(wordIndex).match(/^[\p{L}\p{N}]+/u)?.[0]||'';
 wordTime=performance.now();engine.setPhoneme(lastBrowserWord);
}
// Ao usar Web Speech não há WAV acessível: um ciclo visual usa letras aproximadas.
// O início/fim vem da voz real do navegador; não anunciamos sincronização fonêmica precisa.
let oralTimer=null;
function mouthLoop(){if(!browserMode||!engine)return;
 const elapsed=performance.now()-wordTime;
 const word=lastBrowserWord||browserText.slice(wordIndex).match(/^[\p{L}]+/u)?.[0]||'a';
 const step=Math.floor(elapsed/85)%Math.max(1,word.length);
 engine.setPhoneme(word.slice(step,step+1));
}
function endBrowserSpeech(){browserMode=false;engine?.stopOral();browserText='';wordIndex=0;lastBrowserWord='';}
oralTimer=setInterval(mouthLoop,75);
$('lia3dKokoroSetup')?.addEventListener('click',()=>void configureVoice());
window.addEventListener('pagehide',()=>{close();void context?.close();context=null;});
window.EducaLia3D=Object.freeze({open,close,speak,stopSpeech,isReady:()=>active&&ready,
 isLipReady:()=>!!analyser,configureVoice,unlockAudio,beginBrowserSpeech,wordBoundary,endBrowserSpeech,
 diagnostics:()=>({ready,engine:engine?'WebGL2 original':'nenhum',speechMode:analyser?'Kokoro/WAV':browserMode?'Web Speech':'idle',cloudflareVoice:voiceOnline})});
})();

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';

const read=p=>readFileSync(p,'utf8');
const worker=read('src/worker.js'),video=read('public/static/js/free-video.js');
const css=read('public/static/css/lia-fullscreen-v11206.css');
const page=read('public/html/index.html');
const neural=read('public/static/js/lia-paradee-worker-v11206.js');
const bridge=read('public/static/js/lia-free-neural-v11206.js');
const demo=read('public/testar-voz-neural-gratis.html');

test('V112.06 — scripts neural ONNX, bridge and video parse without SyntaxError',()=>{
 for(const file of [
  'public/static/js/lia-paradee-worker-v11206.js',
  'public/static/js/lia-free-neural-v11206.js',
  'public/static/js/free-video.js'
 ])assert.doesNotThrow(()=>execFileSync(process.execPath,['--check',file],
  {timeout:10000,stdio:'pipe'}));
});

test('V112.06 — fullscreen shows full LIA photo and all video layers, Web-only',()=>{
 assert.match(css,/html\[data-educa-platform="web"\]/);
 assert.match(css,/#freeVideoView:is\(:fullscreen,\.v115-fullscreen\)/);
 assert.match(css,/html\[data-educa-platform="web"\]\.educa-fullscreen-active/);
 assert.match(css,/#freeVideoPortrait\.lia-photo-real > img/);
 assert.match(css,/#freeVideoPortrait\.lia-photo-real > video/);
 assert.match(css,/object-fit:contain!important/);
 assert.match(css,/object-position:50% 50%!important/);
 assert.match(css,/#liaPhotoPlay:not\(\[hidden\]\)/);
 assert.match(css,/env\(safe-area-inset-bottom/);
 assert.match(page,/lia-fullscreen-v11206\.css\?v=11206/);
});

test('V112.06 — free neural voice is chosen only on Web; native options preserved',()=>{
 assert.match(video,/data[sS]et\?\.educaPlatform==='web'&&voiceEngine\?\.value==='gratuita'/);
 assert.match(video,/voiceEngine\.insertBefore\(freeOption,voiceEngine\.options\[0\]\)/);
 assert.match(video,/voiceEngine\.value='gratuita'/);
 assert.match(video,/selectedEngine\(\)==='gratuita'/);
 assert.match(video,/playFreeNeuralVoice\(phrase,serial\)/);
 assert.match(video,/EducaLiaFreeNeural\?\.prepare/);
 assert.match(video,/option\[value="feminina"\]/);
 assert.doesNotMatch(neural,/api\.elevenlabs\.io|xi-api-key|speechSynthesis/);
 assert.match(bridge,/new Worker\('\/static\/js\/lia-paradee-worker-v11206\.js/);
});

test('V112.06 — local inference uses Brazilian phonemes and two strict static assets',()=>{
 assert.match(worker,/LIA_FREE_MODEL_PATHS=new Set\(\['config\.json','onnx\/paradee_dora_int8\.onnx'\]\)/);
 assert.match(worker,/!LIA_FREE_MODEL_PATHS\.has\(path\)/);
 assert.match(worker,/https:\/\/huggingface\.co\/eraldohug\/Paradee-8M-PtBr\/resolve\/main\//);
 assert.match(worker,/rota\.startsWith\('\/api\/lia-free-model\/'\)/);
 assert.match(worker,/url\.pathname\.startsWith\('\/api\/lia-free-model\/'\)/);
 assert.match(neural,/loadVoice\('pt-br'\)/);
 assert.match(neural,/executionProviders:\['wasm'\]/);
 assert.match(neural,/new ort\.Tensor\('int64',BigInt64Array/);
 assert.match(neural,/\/api\/lia-free-model\/onnx\/paradee_dora_int8\.onnx/);
 assert.match(neural,/\/api\/lia-free-model\/config\.json/);
 assert.match(neural,/getData/);
});

test('V112.06 — direct browser voice test measures actual timing and credits source',()=>{
 assert.match(demo,/Testar voz neural feminina gratuita/);
 assert.match(demo,/Inferência ONNX/);
 assert.match(demo,/elapsed_ms/);
 assert.match(demo,/huggingface\.co\/eraldohug\/Paradee-8M-PtBr/);
 assert.doesNotMatch(demo,/api\/lia\/voz-web\/speak|xi-api-key/);
 const styles=page.indexOf('lia-fullscreen-v11206.css');
 const script=page.indexOf('lia-free-neural-v11206.js');
 const player=page.indexOf('free-video.js?');
 assert.ok(styles>0&&script>styles&&player>script);
});

test('V112.06 — published provenance and license, preview remains separate',()=>{
 const docs=read('docs/plataformas/web/LIA_VOZ_GRATUITA_FULLSCREEN_V11206.md');
 const wrangler=read('wrangler.toml');
 assert.match(docs,/Apache-2\.0/);
 assert.match(docs,/não é a Roberta|NÃO é a Roberta/i);
 assert.match(wrangler,/LIA_WEB_HQ_TTS_PROVIDER = "elevenlabs"/);
 assert.match(wrangler,/\[previews\.vars\][\s\S]*LIA_WEB_HQ_TTS_ENABLED = "false"/);
});

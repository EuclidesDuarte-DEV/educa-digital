import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const html=read('public/html/index.html');
const app=read('public/static/js/free-video.js');
const wrangler=read('wrangler.toml');
const old=read('public/testar-voz-roberta.html');
const workflow=read('.github/workflows/preview-v11147.yml');
const browser=read('scripts/validar-dora-neural-real-v11207.mjs');

test('V112.07 — identificar Web/iOS/Android ANTES de inicializar a lista de voz',()=>{
 const platform=html.indexOf('/static/js/platform-channel-v11160.js');
 const player=html.indexOf('/static/js/free-video.js');
 assert.ok(platform>0&&player>platform);
 const snippet=html.slice(platform,platform+115);
 assert.doesNotMatch(snippet,/\bdefer\b|\basync\b/);
 assert.match(html,/&neuralfree=11207/);
 assert.match(html,/lia-free-neural-v11206\.js\?v=11207/);
});

test('V112.07 — Web remove Roberta e seleciona Dora; nativos mantêm opção anterior',()=>{
 assert.match(app,/voiceEngine\.querySelector\('option\[value="feminina"\]'\)\?\.remove\(\)/);
 assert.match(app,/voiceEngine\.value='gratuita'/);
 assert.match(app,/if\(document\.documentElement\?\.dataset\?\.educaPlatform==='web'\)/);
 assert.match(app,/return voiceEngine\?\.value==='padrao'\?'padrao':'gratuita'/);
 assert.match(app,/return voiceEngine\?\.value==='padrao'\?'padrao':'feminina'/);
 const webBranch=app.split('function startSpeechChunk(phrase,serial){')[1].split(' // V112.01 — Somente Web:')[0];
 assert.match(webBranch,/playFreeNeuralVoice\(phrase,serial\)/);
 assert.doesNotMatch(webBranch,/playWebHQVoice|Tentar Roberta/);
 assert.match(webBranch,/if\(selectedEngine\(\)==='padrao'\)/);
 const speak=app.split('function speak(text){')[1].split('async function configure()')[0];
 assert.match(speak,/web&&selectedEngine\(\)==='gratuita'\?speechSegments\(whole\)/);
 assert.doesNotMatch(app,/session\.hqVoiceCheck=inspectWebHQVoice\(\)/);
});

test('V112.07 — API paga da produção e Preview permanecem desativadas',()=>{
 assert.equal(wrangler.match(/LIA_WEB_HQ_TTS_ENABLED = "false"/g)?.length,2);
 assert.doesNotMatch(wrangler,/LIA_WEB_HQ_TTS_ENABLED = "true"/);
 assert.doesNotMatch(wrangler,/LIA_ELEVENLABS_VOICE_ID\s*=/);
 assert.doesNotMatch(old,/api\/lia\/voz-web\/speak/);
 assert.match(old,/testar-voz-neural-gratis\.html/);
});

test('V112.07 — teste de áudio real bloqueia deploy se WAV for mudo',()=>{
 assert.match(browser,/e\.prepare\(\)/);
 assert.match(browser,/e\.speak\(/);
 assert.match(browser,/out\.peak>100/);
 assert.match(browser,/out\.header\.slice\(8,12\),'WAVE'/);
 assert.match(browser,/active\.value,'gratuita'/);
 assert.match(browser,/paidCalls,0/);
 assert.match(workflow,/Provar áudio ONNX real da Dora, sem Roberta nem API paga/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const js=readFileSync('public/static/js/free-video.js','utf8');
const backend=readFileSync('lia_educa_local.py','utf8');
const motor=readFileSync('lia_motor/server.py','utf8');
const mode=readFileSync('public/static/js/free-mode.js','utf8');

test('V111.24: Ollama warms only on the local call without blocking UI',()=>{
 assert.match(backend,/api\/generate/);
 assert.match(backend,/def preload_ollama/);
 assert.match(backend,/threading\.Thread\(target=_warm_ollama/);
 assert.match(backend,/if not _same_origin\(\)/);
 assert.match(js,/window\.location\?\.hostname/);
 assert.match(js,/api\/modo-livre\/preload/);
});
test('V111.24: bounded neural audio and graceful female fallback',()=>{
 assert.match(js,/TTS_FIRST_RESPONSE_TIMEOUT_MS=25000/);
 assert.match(js,/controller\.abort\(\)/);
 assert.match(js,/audioOnly\(phrase,serial\)/);
 assert.match(js,/session\.renderAbort\?\.abort\(\)/);
 assert.match(js,/startSpeechMotion\(audio,cues\)/);
});
test('V111.24: Kokoro phonemes measured by audio chunks, not claimed sample-accurate',()=>{
 assert.match(motor,/phoneme_chunks\.append/);
 assert.match(motor,/build_cues\(phoneme_chunks, rate\)/);
 assert.match(motor,/approximate-chunk-duration/);
 assert.match(backend,/viseme_cues.*cues\[:160\]/s);
 assert.match(js,/dataset\.viseme/);
});
test('V111.24: core module sequence and no real Pix',()=>{
 assert.match(mode,/\['family','video','bank'\]/);
 assert.match(mode,/CHAVE-TREINO-/);
 assert.doesNotMatch(mode,/pix\.com\.br\/v1\/transfer/);
});

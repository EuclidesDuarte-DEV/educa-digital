"""Offline tests that do not download Kokoro/MuseTalk models or use a GPU."""
import os
import pathlib
import sys
import tempfile
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient
os.environ['LIA_API_TOKEN'] = 'unit-test-secret-strong-123456789'
sys.path.insert(0,str(pathlib.Path(__file__).parent))
import server


class MotorTest(unittest.TestCase):
    def setUp(self):
        server.TOKEN = 'unit-test-secret-strong-123456789'
        self.c=TestClient(server.app)
        self.h={'Authorization': 'Bearer unit-test-secret-strong-123456789'}

    def test_auth_enforced(self):
        self.assertEqual(self.c.get('/health').status_code,401)
        self.assertEqual(self.c.post('/v1/lia/speak',json={'text':'Oi'}).status_code,401)
        self.assertEqual(self.c.get('/v1/media/'+'a'*32+'.wav').status_code,401)

    def test_health_and_media_validation(self):
        r=self.c.get('/health',headers=self.h)
        self.assertEqual(r.status_code,200)
        self.assertEqual(r.json()['voice'],'pf_dora')
        self.assertFalse(r.json()['video_enabled'])
        self.assertEqual(self.c.get('/v1/media/../anything',headers=self.h).status_code,404)
        self.assertEqual(self.c.get('/v1/media/'+'z'*32+'.mp4',headers=self.h).status_code,400)
        self.assertEqual(self.c.post('/v1/lia/render/'+'a'*32,headers=self.h).status_code,503)

    def test_invalid_voice_style_cannot_reach_backend(self):
        r=self.c.post('/v1/lia/speak',headers=self.h,
                      json={'text':'Olá', 'style':'comando-perigoso'})
        self.assertEqual(r.status_code,422)

    def test_chatterbox_v3_can_render_using_local_fictional_reference_mock(self):
        import numpy as np
        class FakeChatterbox:
            sr=24000
            def generate(self,text,language_id,audio_prompt_path,**params):
                self.last={'text':text,'language_id':language_id,'audio_prompt_path':audio_prompt_path,**params}
                return np.ones((1,5000),dtype=np.float32)*.08
        fake=FakeChatterbox()
        with tempfile.TemporaryDirectory() as temp:
            path=pathlib.Path(temp)
            ref=path/'referencia.wav'
            ref.write_bytes(b'RIFFdemo')
            with (patch.object(server,'get_chatterbox',return_value=fake),
                  patch.object(server,'MEDIA',path),
                  patch.object(server,'TTS_ENGINE','chatterbox'),
                  patch.object(server,'VOICE_REFERENCE',str(ref)),
                  patch.object(server,'voice_diagnostic',return_value='ready')):
                r=self.c.post('/v1/lia/speak',headers=self.h,
                              json={'text':'Oi, você pode conversar?', 'style':'calma'})
                self.assertEqual(r.status_code,200,r.text)
                self.assertEqual(r.json()['voice_engine'],'chatterbox')
                self.assertEqual(fake.last['language_id'],'pt')
                self.assertEqual(fake.last['audio_prompt_path'],str(ref))
                self.assertEqual(self.c.get('/v1/media/'+r.json()['job_id']+'.wav',headers=self.h).content[:4],b'RIFF')

    def test_force_kokoro_female_with_chatterbox_default(self):
        import numpy as np
        class FemaleKokoro:
            def __call__(self,text,voice,speed=1.0):
                self.voice = voice
                return [(text, 'phonemes', np.ones(3500, dtype=np.float32)*.03)]
        female = FemaleKokoro()
        with tempfile.TemporaryDirectory() as temp:
            with (patch.object(server,'TTS_ENGINE','chatterbox'),
                  patch.object(server,'MEDIA',pathlib.Path(temp)),
                  patch.object(server,'get_pipeline',return_value=female),
                  patch.object(server,'get_chatterbox',side_effect=AssertionError('not selected')),
                  patch.object(server,'voice_diagnostic',return_value='ready')):
                response=self.c.post('/v1/lia/speak', headers=self.h,
                                     json={'text':'Oi! Eu sou a Lia.','engine':'feminina'})
                self.assertEqual(response.status_code,200,response.text)
                self.assertEqual(response.json()['voice_engine'],'kokoro')
                self.assertEqual(response.json()['voice_id'],'pf_dora')
                self.assertEqual(female.voice,'pf_dora')
                self.assertTrue((pathlib.Path(temp)/(response.json()['job_id']+'.wav')).is_file())

    def test_invalid_engine_refused(self):
        response=self.c.post('/v1/lia/speak',headers=self.h,
                             json={'text':'Olá','engine':'desconhecido'})
        self.assertEqual(response.status_code,422)

    def test_preload_disabled_skips_background_model_load(self):
        with patch.dict(os.environ, {'LIA_PREWARM_VOICE':'false'}), \
             patch.object(server, 'get_pipeline', side_effect=AssertionError('prewarm desativado')):
            server.warm_female_voice_on_startup()

    def test_preload_background_does_not_block_server_start(self):
        class InstantThread:
            started = 0
            def __init__(self, target, name, daemon):
                self.target=target
            def start(self):
                InstantThread.started += 1
                self.target()
        with patch.dict(os.environ, {'LIA_PREWARM_VOICE':'true'}), \
             patch.object(server, 'voice_diagnostic', return_value='ready'), \
             patch.object(server, 'get_pipeline', return_value=object()) as get_pipeline, \
             patch.object(server.threading, 'Thread', InstantThread):
            server.warm_female_voice_on_startup()
            self.assertEqual(InstantThread.started, 1)
            get_pipeline.assert_called_once()

    def test_preload_requires_auth_and_warms_engine(self):
        self.assertEqual(self.c.post('/v1/lia/preload').status_code, 401)
        with patch.object(server, 'TTS_ENGINE', 'chatterbox'), patch.object(server,'voice_diagnostic',return_value='ready'), patch.object(server,'get_chatterbox',return_value=object()) as loader:
            response=self.c.post('/v1/lia/preload',headers=self.h)
            self.assertEqual(response.status_code,200)
            self.assertEqual(response.json()['voice_loaded'],True)
            loader.assert_called_once()

    def test_preload_can_warm_female_kokoro_even_when_chatterbox_is_default(self):
        with patch.object(server, 'TTS_ENGINE', 'chatterbox'), \
             patch.object(server, 'voice_diagnostic', return_value='ready'), \
             patch.object(server, 'get_pipeline', return_value=object()) as female, \
             patch.object(server, 'get_chatterbox', side_effect=AssertionError('not needed')):
            r = self.c.post('/v1/lia/preload?engine=feminina', headers=self.h)
            self.assertEqual(r.status_code, 200, r.text)
            self.assertEqual(r.json()['engine'], 'kokoro')
            female.assert_called_once()

    def test_tts_generated_wav_without_real_model(self):
        import numpy as np
        class FakePipe:
            def __call__(self,text,voice,speed=1.0):
                self.speed=speed
                self.voice=voice
                return [(text,'phonemes',np.zeros(2400,dtype=np.float32))]
        fake=FakePipe()
        with patch.object(server,'get_pipeline',return_value=fake), patch.object(server,'MEDIA',pathlib.Path(tempfile.mkdtemp())), patch.object(server,'voice_diagnostic',return_value='ready'), patch.object(server,'TTS_ENGINE','kokoro'):
            r=self.c.post('/v1/lia/speak',headers=self.h,json={'text':'Lia, simulação educativa.'})
            self.assertEqual(r.status_code,200)
            data=r.json()
            self.assertEqual(fake.voice,'pf_dora')
            self.assertAlmostEqual(fake.speed,1.0,places=2)
            self.assertRegex(data['job_id'],r'^[a-f0-9]{32}$')
            media=self.c.get('/v1/media/'+data['job_id']+'.wav',headers=self.h)
            self.assertEqual(media.status_code,200)
            self.assertEqual(media.content[:4],b'RIFF')


if __name__=='__main__':unittest.main()

# Additional checks for V110.8 async render protocol. Model inference is mocked;
# these tests verify correct nonblocking job lifecycle, not video realism.
class AsyncRenderTest(unittest.TestCase):
    def setUp(self):
        server.TOKEN = 'unit-test-secret-strong-123456789'
        self.c = TestClient(server.app)
        self.h = {'Authorization': 'Bearer unit-test-secret-strong-123456789'}

    def test_report_missing_gpu_as_not_ready(self):
        with patch.object(server, 'USE_MUSE', True), patch.object(server, 'MUSE_DIR', pathlib.Path('/nonexistent')):
            self.assertFalse(server.video_ready())
            self.assertIn('Pasta MuseTalk', server.video_diagnostic())

    def test_async_render_queues_without_waiting(self):
        job = 'b'*32
        with tempfile.TemporaryDirectory() as temp:
            media = pathlib.Path(temp)
            (media / (job+'.wav')).write_bytes(b'RIFFdummy')
            recorded = []
            with patch.object(server, 'MEDIA', media), patch.object(server, 'video_ready', return_value=True), \
                 patch.object(server.render_pool, 'submit', side_effect=lambda *args: recorded.append(args)):
                with server.render_jobs_lock:
                    server.render_jobs.clear()
                response = self.c.post('/v1/lia/render/'+job, headers=self.h)
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.json()['status'], 'queued')
                self.assertEqual(len(recorded),1)
                state = self.c.get('/v1/lia/render-status/'+job, headers=self.h)
                self.assertEqual(state.json()['status'], 'queued')
                (media / (job+'.mp4')).write_bytes(b'fake-mp4')
                done = self.c.get('/v1/lia/render-status/'+job, headers=self.h)
                self.assertEqual(done.json()['status'], 'ready')
                self.assertTrue(done.json()['video_url'].endswith(job+'.mp4'))
                with server.render_jobs_lock:
                    server.render_jobs.clear()

class RenderExecutionTest(unittest.TestCase):
    def test_external_inference_produces_mp4_via_fake_engine(self):
        job = 'c'*32
        with tempfile.TemporaryDirectory() as temp:
            media = pathlib.Path(temp) / 'generated'
            media.mkdir()
            (media / (job+'.wav')).write_bytes(b'RIFFvoice')
            musetalk = pathlib.Path(temp) / 'MuseTalk'
            musetalk.mkdir()
            fake_video = pathlib.Path(temp) / 'lia_idle.mp4'
            fake_video.write_bytes(b'mock video reference')
            def simulate_engine(args, **kwargs):
                self.assertEqual(args[1:3], ['-m','scripts.inference'])
                self.assertIn('--version', args)
                result = pathlib.Path(args[args.index('--result_dir')+1]) / 'v15' / (job+'.mp4')
                result.parent.mkdir(parents=True)
                result.write_bytes(b'generated neural frames ' * 80)
                return type('Completed', (), {'returncode':0,'stderr':'','stdout':''})()
            with patch.object(server,'MEDIA',media), patch.object(server,'MUSE_DIR',musetalk), \
                 patch.object(server,'IDLE_VIDEO',fake_video), \
                 patch.object(server.subprocess,'run',side_effect=simulate_engine):
                server._render_video(job)
                self.assertEqual((media/(job+'.mp4')).read_bytes()[:9],b'generated')
                self.assertEqual(server.render_jobs[job],'ready')
                with server.render_jobs_lock:
                    server.render_jobs.pop(job,None)

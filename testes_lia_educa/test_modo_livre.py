import unittest
from unittest.mock import patch
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from lia_educa_local import responder,_strip_reasoning
from app import app

class VideoTest(unittest.TestCase):
    def test_video_context(self):
        def fake(url,payload,timeout=26,headers=None):
            assert payload['messages'][0]['role']=='system'
            assert 'Pix FICTÍCIO' in payload['messages'][0]['content']
            assert payload['messages'][-1]['content']=='Quem está falando?'
            assert payload['think'] is False
            return {'message':{'content':'Sou a Lia, no treino de videochamada. Você pode confirmar por outro canal.'}}
        with patch('lia_educa_local._post_json',side_effect=fake):
            result,code=responder({'scenario':'video','message':'Quem está falando?','history':[]})
        self.assertEqual(code,200)
        self.assertEqual(result['mode'],'ia')
        self.assertIn('Lia',result['reply'])
    def test_private_data_blocked(self):
        r,c=responder({'scenario':'video','message':'Meu CPF é 12345678900','history':[]})
        self.assertEqual(c,400)
    def test_unknown_scenario(self):
        r,c=responder({'scenario':'xyz','message':'Olá','history':[]})
        self.assertEqual(c,400)
    def test_reasoning_removed(self):
        self.assertEqual(_strip_reasoning('<think>do this</think>Olá **Lia**'), 'Olá Lia')
    def test_flask_route(self):
        with patch('lia_educa_local._post_json',return_value={'message':{'content':'Olá, eu sou a Lia da simulação.'}}):
            resp=app.test_client().post('/api/modo-livre/conversar',json={'scenario':'video','message':'Olá','history':[]})
        self.assertEqual(resp.status_code,200)
        self.assertEqual(resp.json['mode'],'ia')
    def test_health_offline_graceful(self):
        with patch('lia_educa_local._motor_json',side_effect=ValueError('offline')):
            r=app.test_client().get('/api/avatar/health')
        self.assertEqual(r.status_code,200)
        self.assertFalse(r.json['enabled'])
    def test_voice_rejects_cross_origin(self):
        r=app.test_client().post('/api/avatar/speak',json={'text':'Olá'},headers={'Origin':'https://example.org'})
        self.assertEqual(r.status_code,403)
    def test_voice_never_returns_token(self):
        with patch('lia_educa_local._motor_json',return_value={'job_id':'a'*32,'video_enabled':False}):
            r=app.test_client().post('/api/avatar/speak',json={'text':'Olá'})
        self.assertEqual(r.status_code,200)
        self.assertEqual(r.json['audio_url'],'/api/avatar/media/'+'a'*32+'.wav')
        self.assertNotIn('Authorization',str(r.json))
    def test_unclosed_model_reasoning_is_not_shown(self):
        self.assertEqual(_strip_reasoning('Olá! <think>explicação interna não fechada'), 'Olá!')
    def test_preload_is_local_origin_only(self):
        r=app.test_client().post('/api/modo-livre/preload',headers={'Origin':'https://attacker.invalid'})
        self.assertEqual(r.status_code,403)
    def test_preload_does_not_wait_for_ollama(self):
        import lia_educa_local as local
        with patch.object(local,'_WARM_UNTIL',0), patch.object(local.time,'monotonic',return_value=100), \
             patch.object(local.threading,'Thread') as thread:
            r=app.test_client().post('/api/modo-livre/preload')
            self.assertEqual(r.status_code,200)
            thread.assert_called_once()
            thread.return_value.start.assert_called_once()
    def test_ipa_cues_forwarded_without_internal_token(self):
        with patch('lia_educa_local._motor_json',return_value={
             'job_id':'a'*32,'video_enabled':False,'viseme_cues':[
                 {'at_ms':0,'shape':'m'}, {'at_ms':20,'shape':'fv'},
                 {'at_ms':9999999,'shape':'m'},{'at_ms':30,'shape':'invalid'}]}):
            r=app.test_client().post('/api/avatar/speak',json={'text':'Oi'})
            self.assertEqual(r.status_code,200)
            self.assertEqual(r.json['viseme_cues'],[{'at_ms':0,'shape':'m'}, {'at_ms':20,'shape':'fv'}])
            self.assertNotIn('Authorization',str(r.json))
    def test_bypass_media_path_traversal(self):
        r=app.test_client().get('/api/avatar/media/..evil.wav')
        self.assertIn(r.status_code,(400,404))

if __name__=='__main__':unittest.main()

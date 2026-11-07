"""Tests that synthetic reference generation never captures real voices."""
import pathlib
import sys
import tempfile
import types
import unittest
import unittest.mock
import numpy as np
sys.path.insert(0,str(pathlib.Path(__file__).parent))
from gerar_referencia_feminina import generate


class FemaleReferenceTests(unittest.TestCase):
    def test_fixed_kokoro_female_voice_and_does_not_overwrite(self):
        calls=[]
        class FakePipe:
            def __init__(self, lang_code):
                self.lang_code=lang_code
            def __call__(self,text,voice,speed):
                calls.append((self.lang_code,voice,speed))
                yield ('text','phonemes',np.ones(24000*8,dtype=np.float32)*.04)
        with tempfile.TemporaryDirectory() as temp:
            dest=pathlib.Path(temp)/'female.wav'
            with unittest.mock.patch.dict(sys.modules,{'kokoro':types.SimpleNamespace(KPipeline=FakePipe)}):
                output=generate(dest)
                self.assertEqual(output,dest)
                self.assertEqual(calls,[('p','pf_dora',.99)])
                self.assertGreater(dest.stat().st_size,16000)
                generate(dest)
                self.assertEqual(len(calls),1)

if __name__=='__main__': unittest.main()

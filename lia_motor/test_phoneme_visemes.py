import unittest
from phoneme_visemes import build_cues

class VisemeTest(unittest.TestCase):
    def test_visemes_from_real_ipa_and_audio_duration(self):
        out=build_cues([('ma fɛlo',24000)],24000)
        self.assertEqual(out[0],{'at_ms':0,'shape':'rest'})
        self.assertTrue(any(v['shape']=='m' for v in out))
        self.assertTrue(any(v['shape']=='fv' for v in out))
        self.assertTrue(any(v['shape']=='ee' for v in out))
        self.assertEqual(out[-1],{'at_ms':1000,'shape':'rest'})
        self.assertTrue(all(a['at_ms']<=b['at_ms'] for a,b in zip(out,out[1:])))
    def test_cues_bounded_and_no_text_leak(self):
        out=build_cues([('ab'*1000,240000)],24000,40)
        self.assertLessEqual(len(out),40)
        self.assertEqual(out[-1]['at_ms'],10000)
        self.assertEqual(set(out[0]),{'at_ms','shape'})
    def test_no_phonemes(self):
        self.assertEqual(build_cues([('',24000)],24000),[{'at_ms':0,'shape':'rest'},{'at_ms':1000,'shape':'rest'}])

if __name__=='__main__':unittest.main()

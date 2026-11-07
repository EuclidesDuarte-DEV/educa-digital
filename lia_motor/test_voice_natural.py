"""No download or GPU required: Lia speech-normalization regression suite."""
import unittest
import numpy as np
from voice_natural import (VOICE_STYLES, normalize_ptbr, split_breath_groups,
                           join_audio, speech_rate, pause_samples)

class NaturalVoiceTest(unittest.TestCase):
    def test_money_is_spoken_in_brazilian_portuguese(self):
        self.assertEqual(normalize_ptbr('Faz um Pix de R$ 350,00?'),
                         'Faz um Pix de trezentos e cinquenta reais?')
        self.assertEqual(normalize_ptbr('R$ 1,50'), 'um real e cinquenta centavos')
        self.assertEqual(normalize_ptbr('R$ 1.250'), 'mil duzentos e cinquenta reais')
        self.assertEqual(normalize_ptbr('R$ 3500'), 'três mil quinhentos reais')
    def test_short_breath_groups_preserve_words_and_questions(self):
        parts = split_breath_groups('Oi, tudo bem? Preciso de uma ajuda. Você consegue conversar?')
        self.assertEqual(len(parts), 1)  # uma fala curta, sem reiniciar entonacao
        self.assertTrue(parts[0].endswith('?'))
        long = 'Oi, eu sou a Lia, e quero conversar sobre um assunto importante para você ' * 5
        groups = split_breath_groups(long,max_chars=130)
        self.assertTrue(all(len(group)<=130 for group in groups))
        self.assertEqual(' '.join(groups).replace(', ',' ').split(),
                         long.replace(', ',' ').split())
    def test_natural_styles_keep_subtle_pacing(self):
        for style in VOICE_STYLES:
            self.assertGreater(speech_rate(style,0),.9)
            self.assertLess(speech_rate(style,0),1.1)
        self.assertLess(speech_rate('calma',0),speech_rate('natural',0))
        self.assertEqual(speech_rate('natural',0), speech_rate('natural',1))
    def test_numbers_percents_and_money_are_pronounced(self):
        self.assertEqual(normalize_ptbr('A taxa e 15%. Pague R$ 0,50.'),
                         'A taxa e quinze por cento. Pague cinquenta centavos.')
        self.assertEqual(normalize_ptbr('O valor e R$ 10.000,00.'),
                         'O valor e dez mil reais.')

    def test_short_messages_stay_in_one_generation(self):
        self.assertEqual(split_breath_groups('Oi! Tudo bem? Sou a Lia.'), ['Oi! Tudo bem? Sou a Lia.'])
        self.assertEqual(split_breath_groups(''), [])
        with self.assertRaises(ValueError): split_breath_groups('Oi', max_chars=10)

    def test_preserve_model_pause_instead_of_doubling_it(self):
        # If the model already made 200 ms of tail silence, do not add 160 ms.
        first = np.concatenate([np.ones(2000, dtype=np.float32)*.3, np.zeros(4800, dtype=np.float32)])
        second = np.ones(2000,dtype=np.float32)*.3
        output = join_audio([('Oi.',first),('Sim!',second)],24000,'natural')
        self.assertEqual(len(output),len(first)+len(second))

    def test_one_chunk_does_not_add_gap(self):
        item=np.ones(8000,dtype=np.float32)*.1
        self.assertEqual(join_audio([('Oi.',item)],24000,'natural').size,8000)

    def test_wav_join_adds_pause_without_clicks(self):
        items=[('Oi?',np.ones(2000,dtype=np.float32)*.3),
               ('Tudo bem!',np.ones(2000,dtype=np.float32)*.3)]
        wav=join_audio(items,24000,'natural')
        self.assertLessEqual(abs(wav.size-(4000+pause_samples('Oi?',24000,'natural'))),10)
        self.assertEqual(wav[0],0)
        self.assertEqual(wav[-1],0)
        self.assertLessEqual(np.max(np.abs(wav)),.94)
        with self.assertRaises(ValueError):
            join_audio([('X',np.array([np.nan]))],24000,'natural')

if __name__=='__main__':
    unittest.main()

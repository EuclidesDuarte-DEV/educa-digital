"""Approximate viseme targets from Kokoro's real IPA phoneme output.

Timestamps are distributed across the duration of each actual generated audio
chunk, NOT forced alignment. MuseTalk can provide real frame-based lip sync when
properly installed; these cues are for future lightweight avatar renderers.
No spoken text or phoneme string is written to disk.
"""
from __future__ import annotations

SHAPES = frozenset(('rest','m','fv','ah','ee','oh','oo','wide'))


def _shape(char: str) -> str:
    if char in 'pբbmɱ':return 'm'
    if char in 'fv':return 'fv'
    if char in 'aɑɐɒæɜʌ':return 'ah'
    if char in 'eɛiɪɨy':return 'ee'
    if char in 'oɔø':return 'oh'
    if char in 'uʊɯ':return 'oo'
    if char.isspace() or char in ',.;:!?':return 'rest'
    return 'wide' if char.isalpha() else 'rest'


def build_cues(chunks: list[tuple[str,int]], sample_rate: int, max_cues: int = 160) -> list[dict]:
    """Each (IPA, sample count) pair comes from one real Kokoro audio chunk.

    No attempt is made to claim true phoneme-boundary alignment. Keep the
    timeline small to avoid excessive JSON and to support mobile devices.
    """
    if sample_rate <= 0 or max_cues < 2:
        raise ValueError('invalid cue parameters')
    events = [{'at_ms':0, 'shape':'rest'}]
    running = 0
    for phonemes, samples in chunks:
        duration_ms = max(0,round(max(0,samples)*1000/sample_rate))
        chars=[ch for ch in str(phonemes or '') if not ch.isdigit() and ch not in '/[]ˈˌ']
        if chars and duration_ms:
            weights=[1.4 if _shape(ch) in ('ah','ee','oh','oo') else (.5 if _shape(ch)=='rest' else 1.0) for ch in chars]
            total=sum(weights);offset=0.0
            for ch,weight in zip(chars,weights):
                shape=_shape(ch)
                if events[-1]['shape']!=shape:
                    events.append({'at_ms':running+round(offset/total*duration_ms),'shape':shape})
                offset+=weight
        running+=duration_ms
    if events[-1]['at_ms']!=running or events[-1]['shape']!='rest':
        events.append({'at_ms':running,'shape':'rest'})
    if len(events)>max_cues:
        step=(len(events)-2)/(max_cues-2)
        events=[events[0]]+[events[1+round(i*step)] for i in range(max_cues-2)]+[events[-1]]
    return events

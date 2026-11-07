"""Cria a referencia da Lia usando uma voz FEMININA sintética PT-BR (Kokoro pf_dora).

Nenhuma fala de pessoa real é capturada. O arquivo fica local, e só é criado
quando ainda não existe — referência feminina consentida pode substituí-lo.
"""
from __future__ import annotations
import argparse
import pathlib
import sys
import numpy as np
import soundfile as sf

HERE = pathlib.Path(__file__).resolve().parent
DEST = HERE / 'assets' / 'lia_voz_feminina_pf_dora.wav'
SAMPLE_TEXT = (
    'Oi, tudo bem? Eu sou a Lia. Que bom ter você aqui! '
    'Vamos conversar com calma. Se alguma coisa parecer estranha, '
    'a gente confere junto, tá?'
)


def generate(destination: pathlib.Path = DEST) -> pathlib.Path:
    destination = pathlib.Path(destination)
    if destination.is_file() and destination.stat().st_size > 16000:
        print(f'Referencia feminina ja existente: {destination.name}. Mantida.')
        return destination
    from kokoro import KPipeline
    print('Gerando referencia feminina pt-BR com Kokoro pf_dora...')
    pipeline = KPipeline(lang_code='p')
    chunks = []
    for _gr, _phonemes, wav in pipeline(SAMPLE_TEXT, voice='pf_dora', speed=.99):
        audio = wav.detach().cpu().numpy() if hasattr(wav, 'detach') else np.asarray(wav)
        audio = np.asarray(audio, dtype=np.float32).reshape(-1)
        if audio.size:
            chunks.append(audio)
    if not chunks:
        raise RuntimeError('Kokoro nao gerou a referencia feminina.')
    output = np.concatenate(chunks)
    duration = len(output) / 24000
    if not (5 <= duration <= 35):
        raise RuntimeError(f'Referencia fora da duracao segura: {duration:.1f}s')
    peak = float(np.max(np.abs(output)))
    if not np.all(np.isfinite(output)) or peak < .001:
        raise RuntimeError('Audio incompleto ou silencioso.')
    if peak > .93:
        output *= .93 / peak
    fade = min(360, len(output)//4)
    output[:fade] *= np.linspace(0, 1, fade)
    output[-fade:] *= np.linspace(1, 0, fade)
    destination.parent.mkdir(parents=True, exist_ok=True)
    temp = destination.with_suffix('.tmp.wav')
    try:
        sf.write(temp, output, 24000, subtype='PCM_16')
        temp.replace(destination)
    finally:
        temp.unlink(missing_ok=True)
    print(f'REFERENCIA FEMININA CRIADA: {destination.name} ({duration:.1f}s)')
    return destination


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Prepara a voz feminina original da Lia (Kokoro pf_dora).')
    parser.add_argument('--dest', type=pathlib.Path, default=DEST)
    args = parser.parse_args()
    try:
        generate(args.dest)
    except Exception as error:
        print(f'FALHA: {error}', file=sys.stderr)
        raise SystemExit(1)

"""Educa+ Digital V110.7: own backend for the FICTITIOUS Lia avatar.

Routes are private (secret bearer token), and Cloudflare Worker acts as gateway.
Kokoro produces 24 kHz WAV; MuseTalk v1.5 optionally makes video from SAME WAV.
MuseTalk requires separate model weights, ffmpeg, CUDA-capable device for reasonable latency.
"""
import os
import pathlib
import re
import shutil
import subprocess
import threading
import time
import uuid
import sys
import importlib.util
import logging
from functools import lru_cache
from typing import Literal
from voice_natural import VOICE_STYLES, normalize_ptbr, split_breath_groups, speech_rate, join_audio
from phoneme_visemes import build_cues
from concurrent.futures import ThreadPoolExecutor

from fastapi import FastAPI, Header, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

ROOT = pathlib.Path(__file__).resolve().parent
MEDIA = ROOT / 'generated'
MEDIA.mkdir(exist_ok=True)
ASSET = ROOT / 'assets' / 'lia_ficticia.png'
IDLE_VIDEO = ROOT / 'assets' / 'lia_idle.mp4'
LOVABLE_REFERENCE = ROOT / 'assets' / 'lia-lovable-movimento.mp4'
# Optional independently recorded/animated *fictional* Lia reference with head, shoulders and posture.
# MuseTalk preserves the motion in this video while synthesizing the mouth from the audio.
MOTION_SOURCE = pathlib.Path(os.environ.get('LIA_MOTION_SOURCE', str(LOVABLE_REFERENCE if LOVABLE_REFERENCE.is_file() else IDLE_VIDEO))).expanduser()
TOKEN = os.environ.get('LIA_API_TOKEN', '')
MUSE_DIR = pathlib.Path(os.environ.get('LIA_MUSETALK_DIR', '')).expanduser() if os.environ.get('LIA_MUSETALK_DIR') else None
USE_MUSE = os.environ.get('LIA_MUSETALK_ENABLED', 'false').lower() == 'true'
# Kokoro remains the fast default. Chatterbox V3 (optional) can offer more
# expressive speech with a *fictional or consented* PT-BR reference recording.
TTS_ENGINE = os.environ.get('LIA_TTS_ENGINE', 'kokoro').strip().lower()
if TTS_ENGINE not in ('kokoro', 'chatterbox'):
    TTS_ENGINE = 'kokoro'
VOICE_REFERENCE = os.environ.get(
    'LIA_VOICE_REFERENCE', str(ROOT / 'assets' / 'lia_voz_feminina_pf_dora.wav')
).strip()
app = FastAPI(title='Educa+ Digital Lia (personagem fictícia)', version='111.24')
render_pool = ThreadPoolExecutor(max_workers=1, thread_name_prefix='lia-neural')
render_jobs = {}
render_jobs_lock = threading.Lock()
MAX_RENDER_QUEUE = 3
log = logging.getLogger('lia.render')
voice_lock = threading.Lock()
video_lock = threading.Lock()
_pipeline = None
_chatterbox = None
JOB = re.compile(r'^[a-f0-9]{32}$')
MAX_AGE_SECONDS = 900


def auth(authorization: str | None):
    if not TOKEN or len(TOKEN) < 20:
        raise HTTPException(503, 'Configure LIA_API_TOKEN with a random strong token')
    if authorization != 'Bearer ' + TOKEN:
        raise HTTPException(401, 'Unauthorized')


@lru_cache(maxsize=1)
def gpu_available():
    """Check CUDA in the *MuseTalk* Python environment (can differ from Kokoro's)."""
    python = os.environ.get('LIA_MUSETALK_PYTHON', sys.executable)
    try:
        r = subprocess.run([python, '-c', 'import torch; print(int(torch.cuda.is_available()))'],
                           capture_output=True, text=True, timeout=12, check=False)
        return r.returncode == 0 and r.stdout.strip().endswith('1')
    except (OSError, subprocess.TimeoutExpired):
        return False


def video_diagnostic():
    if not USE_MUSE:
        return 'MuseTalk ainda nao habilitado: LIA_MUSETALK_ENABLED=true'
    if not MUSE_DIR or not MUSE_DIR.is_dir():
        return 'Pasta MuseTalk nao encontrada: configure LIA_MUSETALK_DIR'
    if ' ' in str(MUSE_DIR):
        return 'Instale MuseTalk em um caminho sem espacos (ex.: C:\\IA\\MuseTalk)'
    files = ['models/musetalkV15/unet.pth', 'models/musetalkV15/musetalk.json',
             'models/whisper/config.json', 'models/whisper/pytorch_model.bin',
             'models/sd-vae/config.json', 'models/sd-vae/diffusion_pytorch_model.bin']
    if any(not (MUSE_DIR / name).is_file() for name in files):
        return 'Modelos MuseTalk incompletos: rode download_weights.bat no repositorio oficial'
    if not shutil.which('ffmpeg'):
        return 'FFmpeg nao encontrado no PATH'
    if not (ASSET.is_file() or MOTION_SOURCE.is_file()):
        return 'Imagem/video do avatar Lia ausente'
    if not gpu_available():
        return 'CUDA/GPU indisponivel no Python do MuseTalk; configure LIA_MUSETALK_PYTHON'
    if os.environ.get('LIA_REQUIRE_BODY_MOTION', 'false').lower() == 'true':
        if not MOTION_SOURCE.is_file() or MOTION_SOURCE.suffix.lower() != '.mp4':
            return 'Ative uma fonte MP4 da Lia com cabeca e ombros: LIA_MOTION_SOURCE'
        info = inspect_motion_source(MOTION_SOURCE)
        if not info['suitable']:
            return 'Referencia corporal insuficiente: forneca video >=8s, >=480px e >=24fps'
    return 'ready'


def inspect_motion_source(path):
    """Technical screening only. Does NOT certify lifelike motion or identity consent."""
    import json
    try:
        r = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0',
                            '-show_entries', 'stream=width,height,r_frame_rate:format=duration',
                            '-of', 'json', str(path)], capture_output=True, text=True, timeout=10)
        doc = json.loads(r.stdout) if r.returncode == 0 else {}
        stream = (doc.get('streams') or [{}])[0]
        rate = str(stream.get('r_frame_rate','0/1')).split('/')
        fps = float(rate[0]) / max(float(rate[1]) if len(rate)>1 else 1.0, 1.0)
        length = float(doc.get('format',{}).get('duration',0))
        suitable = min(int(stream.get('width',0)),int(stream.get('height',0))) >= 480 and fps >= 24 and length >= 8
        return {'suitable': suitable, 'duration_seconds': round(length, 2), 'fps':round(fps,2),
                'width':int(stream.get('width',0)), 'height':int(stream.get('height',0))}
    except (OSError, ValueError, TypeError, subprocess.TimeoutExpired, IndexError):
        return {'suitable':False, 'reason':'ffprobe unavailable or invalid MP4'}


def video_ready():
    return video_diagnostic() == 'ready'


def cleanup():
    """Delete short-lived media after 15 minutes; never store user speech transcripts."""
    now = time.time()
    for item in MEDIA.iterdir():
        try:
            if now - item.stat().st_mtime > MAX_AGE_SECONDS:
                if item.is_dir():
                    shutil.rmtree(item)
                elif item.is_file():
                    item.unlink()
        except OSError:
            pass


class Speak(BaseModel):
    text: str = Field(min_length=1, max_length=450)
    style: str = Field(default='natural', pattern=r'^(natural|calma|clara)$')
    engine: Literal['padrao','feminina'] = 'padrao'  # feminina: Kokoro pf_dora, sem referencia masculina


def get_chatterbox():
    global _chatterbox
    if _chatterbox is None:
        import torch
        from chatterbox.mtl_tts import ChatterboxMultilingualTTS
        device = 'cuda' if torch.cuda.is_available() else ('mps' if getattr(torch.backends, 'mps', None) and torch.backends.mps.is_available() else 'cpu')
        # V3 multilingual engine supports Portuguese; voice reference determines
        # the female timbre and Brazilian accent. Downloaded only when enabled.
        model = ChatterboxMultilingualTTS.from_pretrained(device=device, t3_model='v3')
        # Extract the same fictional voice identity ONCE, not for each sentence.
        model.prepare_conditionals(str(pathlib.Path(VOICE_REFERENCE).expanduser()), exaggeration=.56)
        _chatterbox = model
    return _chatterbox


def voice_diagnostic(engine=None):
    engine = engine or TTS_ENGINE
    if engine == 'kokoro':
        return 'ready' if importlib.util.find_spec('kokoro') else 'Instale Kokoro no ambiente do motor Lia'
    if not importlib.util.find_spec('chatterbox'):
        return 'Instale chatterbox-tts no ambiente do motor Lia'
    reference = pathlib.Path(VOICE_REFERENCE).expanduser() if VOICE_REFERENCE else None
    if not reference or not reference.is_file() or reference.suffix.lower() not in ('.wav', '.flac', '.mp3'):
        return 'Referencia feminina ausente. Execute PREPARAR_VOZ_FEMININA_LIA_WINDOWS.ps1 ou informe um WAV de voz autorizada (5-15 s).'
    return 'ready'


def get_pipeline():
    global _pipeline
    if _pipeline is None:
        from kokoro import KPipeline
        _pipeline = KPipeline(lang_code='p')
    return _pipeline


def warm_female_voice_on_startup():
    """Precarrega Kokoro paralelamente ao servidor, sem bloquear o acesso à API."""
    if os.environ.get('LIA_PREWARM_VOICE','true').lower() != 'true':
        return
    def task():
        try:
            if voice_diagnostic('kokoro') == 'ready':
                with voice_lock:
                    pipeline=get_pipeline()
                    # Sintese curta prepara o fonemizador e a inferencia inicial.
                    # Nao gera arquivo nem toca audio sem solicitacao do usuario.
                    for _graphemes,_phonemes,_audio in pipeline('Olá, tudo bem?',voice='pf_dora',speed=1.0):
                        break
                log.info('Lia: Kokoro pf_dora aquecido para primeira resposta')
        except Exception:
            log.exception('Aquecimento de voz indisponivel; carregamento sob demanda permanece ativo')
    threading.Thread(target=task, name='lia-prewarm-female', daemon=True).start()


@app.on_event('startup')
def startup_voice():
    warm_female_voice_on_startup()


@app.get('/health')
def health(authorization: str | None = Header(default=None)):
    auth(authorization)
    return {'ok': True, 'voice': 'pf_dora' if TTS_ENGINE == 'kokoro' else 'referencia-pt-br',
            'voice_engine': TTS_ENGINE, 'voice_installed': voice_diagnostic() == 'ready',
            'voice_loaded': _chatterbox is not None if TTS_ENGINE == 'chatterbox' else _pipeline is not None,
            'voice_reason': voice_diagnostic(), 'voice_styles': list(VOICE_STYLES),
            'female_voice_engine': 'kokoro', 'female_voice_id': 'pf_dora',
            'female_voice_ready': voice_diagnostic('kokoro') == 'ready',
            'video_enabled': video_ready(), 'video_reason': video_diagnostic(), 'simli': False,
            'render_mode': 'async-turn-based', 'gestures_generated': False, 'lip_sync_mode': 'MuseTalk-v1.5' if video_ready() else 'none',
            'body_motion_source': 'reference-video' if MOTION_SOURCE.is_file() else 'static-image',
            'body_motion_quality': inspect_motion_source(MOTION_SOURCE) if MOTION_SOURCE.is_file() else None}


@app.post('/v1/lia/preload')
def preload(authorization: str | None = Header(default=None), engine: Literal['padrao', 'feminina'] = 'padrao'):
    """Warm up the selected voice WITHOUT synthesizing a message.

    Preparing Kokoro when Chatterbox happens to be the default is important:
    students choose the female voice in the web interface independently.
    """
    auth(authorization)
    chosen = 'kokoro' if engine == 'feminina' else TTS_ENGINE
    if voice_diagnostic(chosen) != 'ready':
        raise HTTPException(503, 'Voice engine is not installed: ' + voice_diagnostic(chosen))
    with voice_lock:
        try:
            get_chatterbox() if chosen == 'chatterbox' else get_pipeline()
        except Exception as exc:
            log.exception('Unable to preload Lia voice')
            raise HTTPException(503, 'Preload failed; check installed voice engine and available memory') from exc
    return {'ok': True, 'engine': chosen, 'voice_loaded': True}


@app.post('/v1/lia/speak')
def speak(request: Speak, authorization: str | None = Header(default=None)):
    auth(authorization)
    import numpy as np
    import soundfile as sf
    if not request.text.strip():
        raise HTTPException(400, 'Empty text')
    # 'feminina' escolhe uma voz feminina fixa e independente da amostra de clonagem.
    # 'padrao' usa Chatterbox com referencia feminina nova quando configurado.
    engine = 'kokoro' if request.engine == 'feminina' else TTS_ENGINE
    # No transcript persistence and no personal data requested in this simulation.
    if voice_diagnostic(engine) != 'ready':
        raise HTTPException(503, 'Lia speech backend not configured: ' + voice_diagnostic(engine))
    job = uuid.uuid4().hex
    wav = MEDIA / (job + '.wav')
    with voice_lock:
        cleanup()
        try:
            spoken = normalize_ptbr(request.text)
            groups = split_breath_groups(spoken)
            chunks = []
            phoneme_chunks = []  # real Kokoro IPA strings + duration of each generated segment
            if engine == 'chatterbox':
                model = get_chatterbox()
                rate = int(model.sr)
                for index, phrase in enumerate(groups):
                    # One identity across turns: do not randomly select voices.
                    chunk = model.generate(
                        phrase, language_id='pt',
                        # Models initialized by get_chatterbox reuse their cached voice profile.
                        # Allow old test doubles that require an explicit prompt path.
                        audio_prompt_path=None if hasattr(model, 'prepare_conditionals') else str(pathlib.Path(VOICE_REFERENCE).expanduser()),
                        exaggeration=.56 if request.style == 'natural' else .43 if request.style == 'calma' else .48,
                        cfg_weight=.34, temperature=.75
                    )
                    chunks.append((phrase, chunk.detach().cpu().numpy() if hasattr(chunk, 'detach') else np.asarray(chunk)))
            else:
                rate = 24000
                pipe = get_pipeline()
                for index, phrase in enumerate(groups):
                    pieces = []
                    for _g, _p, audio in pipe(phrase, voice='pf_dora', speed=speech_rate(request.style, index)):
                        piece=audio.detach().cpu().numpy() if hasattr(audio, 'detach') else np.asarray(audio)
                        pieces.append(piece)
                        phoneme_chunks.append((str(_p or ''), int(piece.size)))
                    if pieces:
                        chunks.append((phrase, np.concatenate(pieces)))
            # Keep model-created natural silence: only fill pauses when needed.
            # Do not add pitch shifts, tremolo, breaths or fake room noise.
            output = join_audio(chunks, rate, request.style)
            # Chunk-level targets, not sample-accurate phone boundaries.
            visemes = build_cues(phoneme_chunks, rate) if phoneme_chunks else []
            sf.write(wav, output, rate, subtype='PCM_16')
        except Exception as exc:
            wav.unlink(missing_ok=True)
            log.exception('Lia local speech synthesis failed')
            raise HTTPException(503, 'Local speech synthesis failed; check engine and reference voice') from exc
    return {'ok': True, 'job_id': job, 'audio_url': '/v1/media/' + job + '.wav',
            'voice_engine': engine, 'voice_id': 'pf_dora' if engine == 'kokoro' else 'referencia-feminina',
            'style': request.style, 'video_enabled': video_ready(),
            'viseme_cues': visemes, 'viseme_precision': 'approximate-chunk-duration' if visemes else 'unavailable'}


def _render_video(job_id: str):
    """Run the OFFICIAL MuseTalk inference in a bounded background worker.

    Crucial: it generates actual MP4 frames, never pre-made mouth/eye images.
    """
    with render_jobs_lock:
        render_jobs[job_id] = 'rendering'
    wav = MEDIA / (job_id + '.wav')
    mp4 = MEDIA / (job_id + '.mp4')
    # O CLI oficial do MuseTalk usa chamadas FFmpeg com caminhos sem aspas.
    # Copiar entrada e WAV para um subdiretorio do proprio checkout evita erros
    # quando o projeto Educa+ estiver em uma pasta com espacos no Windows.
    jobs = MUSE_DIR / 'lia_worker_tasks' / job_id
    try:
        jobs.mkdir(parents=True, exist_ok=True)
        cfg = jobs / 'task.yaml'
        result_dir = jobs / 'results'
        staged_wav = jobs / 'voz.wav'
        staged_video = jobs / ('lia.mp4' if MOTION_SOURCE.is_file() else 'lia.png')
        shutil.copyfile(wav, staged_wav)
        shutil.copyfile(MOTION_SOURCE if MOTION_SOURCE.is_file() else ASSET, staged_video)
        import json
        # Upstream script uses shell commands for ffmpeg, so the MuseTalk checkout
        # and working paths should not contain spaces (Windows: C:\IA\MuseTalk).
        cfg.write_text('task_0:\n  video_path: ' + json.dumps(str(staged_video)) +
                       '\n  audio_path: ' + json.dumps(str(staged_wav)) +
                       '\n  result_name: ' + json.dumps(job_id + '.mp4') + '\n', encoding='utf-8')
        args = [os.environ.get('LIA_MUSETALK_PYTHON', sys.executable), '-m', 'scripts.inference',
                '--inference_config', str(cfg), '--result_dir', str(result_dir),
                '--unet_model_path', 'models/musetalkV15/unet.pth',
                '--unet_config', 'models/musetalkV15/musetalk.json', '--version', 'v15', '--fps', '25']
        if os.environ.get('LIA_MUSETALK_FP16', '').lower() == 'true':
            args.append('--use_float16')
        completed = subprocess.run(args, cwd=MUSE_DIR, capture_output=True, text=True,
                                   timeout=int(os.environ.get('LIA_RENDER_TIMEOUT_SECONDS', '900')),
                                   check=False)
        output = result_dir / 'v15' / (job_id + '.mp4')
        if completed.returncode != 0 or not output.is_file() or output.stat().st_size < 1000:
            log.error('MuseTalk failed (exit %s): %s', completed.returncode, (completed.stderr or completed.stdout)[-1800:])
            raise RuntimeError('MuseTalk did not create a playable MP4; check motor logs')
        shutil.copyfile(output, mp4)
        with render_jobs_lock:
            render_jobs[job_id] = 'ready'
    except Exception:
        log.exception('MuseTalk job %s failed', job_id)
        with render_jobs_lock:
            render_jobs[job_id] = 'failed'
    finally:
        shutil.rmtree(jobs, ignore_errors=True)


@app.post('/v1/lia/render/{job_id}')
def render(job_id: str, authorization: str | None = Header(default=None)):
    auth(authorization)
    if not JOB.fullmatch(job_id):
        raise HTTPException(400, 'Invalid job id')
    if not video_ready():
        raise HTTPException(503, video_diagnostic())
    wav, mp4 = MEDIA / (job_id + '.wav'), MEDIA / (job_id + '.mp4')
    if not wav.is_file():
        raise HTTPException(404, 'Audio file not found')
    if mp4.is_file():
        return {'ok': True, 'status': 'ready', 'video_url': '/v1/media/' + job_id + '.mp4'}
    with render_jobs_lock:
        state = render_jobs.get(job_id)
        if state is None:
            backlog = sum(v in ('queued', 'rendering') for v in render_jobs.values())
            if backlog >= MAX_RENDER_QUEUE:
                raise HTTPException(429, 'Render queue is full')
            render_jobs[job_id] = 'queued'
            state = 'queued'
            render_pool.submit(_render_video, job_id)
        elif state == 'failed':
            raise HTTPException(503, 'MuseTalk rendering failed; check server logs')
    return {'ok': True, 'status': state, 'job_id': job_id}


@app.get('/v1/lia/render-status/{job_id}')
def render_status(job_id: str, authorization: str | None = Header(default=None)):
    auth(authorization)
    if not JOB.fullmatch(job_id):
        raise HTTPException(400, 'Invalid job id')
    if (MEDIA / (job_id + '.mp4')).is_file():
        return {'ok': True, 'status': 'ready', 'video_url': '/v1/media/' + job_id + '.mp4'}
    with render_jobs_lock:
        state = render_jobs.get(job_id)
    if not state:
        raise HTTPException(404, 'Render job not found')
    return {'ok': True, 'status': state}


@app.get('/v1/media/{filename}')
def media(filename: str, authorization: str | None = Header(default=None)):
    auth(authorization)
    m = re.fullmatch(r'([a-f0-9]{32})\.(wav|mp4)', filename)
    if not m:
        raise HTTPException(400, 'Invalid media name')
    target = MEDIA / filename
    if not target.is_file():
        raise HTTPException(404, 'Media unavailable')
    return FileResponse(target, media_type='audio/wav' if m.group(2) == 'wav' else 'video/mp4',
                        headers={'Cache-Control': 'private, no-store'})

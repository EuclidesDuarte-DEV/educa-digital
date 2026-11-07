"""Portuguese Brazilian speech shaping for Lia, a clearly fictional character.

Keep the TTS model's prosody intact: do not add artificial pitch, vibrato,
random speed shifts, noise, or forced inhalations. No changes to the meaning.
"""
import re
import numpy as np

VOICE_STYLES = ('natural', 'calma', 'clara')

_UNITS = ('zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito',
          'nove', 'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze',
          'dezesseis', 'dezessete', 'dezoito', 'dezenove')
_TENS = ('', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta',
         'setenta', 'oitenta', 'noventa')
_HUNDREDS = ('', 'cento', 'duzentos', 'trezentos', 'quatrocentos',
             'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos')


def _number(n: int) -> str:
    if n < 20:
        return _UNITS[n]
    if n < 100:
        return _TENS[n // 10] + (' e ' + _UNITS[n % 10] if n % 10 else '')
    if n == 100:
        return 'cem'
    if n < 1000:
        return _HUNDREDS[n // 100] + (' e ' + _number(n % 100) if n % 100 else '')
    if n < 1000000:
        thousands = n // 1000
        head = 'mil' if thousands == 1 else _number(thousands) + ' mil'
        rest = n % 1000
        return head + ((' e ' if rest <= 100 else ' ') + _number(rest) if rest else '')
    return str(n)


def _money(match):
    amount = int(match.group(1).replace('.', ''))
    cents = int(match.group(2) or '0')
    if not amount and cents:
        return _number(cents) + (' centavo' if cents == 1 else ' centavos')
    words = _number(amount) + (' real' if amount == 1 else ' reais')
    if cents:
        words += ' e ' + _number(cents) + (' centavo' if cents == 1 else ' centavos')
    return words


def _percentage(match):
    n = int(match.group(1))
    return _number(n) + ' por cento' if n < 1000000 else match.group(0)


def normalize_ptbr(text: str) -> str:
    """Keep the reply faithful; expand obvious notation that TTS often misreads."""
    value = re.sub(r'<[^>]*>', ' ', str(text))
    value = re.sub(r'\*\*|__|[`#]', '', value)
    value = re.sub(r'[\U0001F300-\U0001FAFF]', '', value)
    value = value.replace('…', '...').replace('—', ', ')
    value = re.sub(r'R\$\s*(\d{1,3}(?:\.\d{3})+|\d{1,6})(?!\d)(?:,(\d{2}))?', _money, value)
    value = re.sub(r'(?<![\d\w])([0-9]{1,6})\s*%(?!\w)', _percentage, value)
    value = re.sub(r'\b[Pp][Ii][Xx]\b', 'Pix', value)
    return re.sub(r'\s+', ' ', value).strip()


def split_breath_groups(text: str, max_chars: int = 240) -> list[str]:
    """Let TTS handle whole short replies and their native sentence rhythm.

    Only split longer answers on sentence boundaries (or comma/word boundary
    when necessary). The old one-sentence-per-call strategy restarted the
    intonation for every sentence, even if the whole answer was short.
    """
    text = normalize_ptbr(text)
    if not text:
        return []
    if max_chars < 40:
        raise ValueError('max_chars must be >= 40')
    sentences = re.split(r'(?<=[.!?;])\s+', text)
    groups = []
    current = ''
    for sentence in sentences:
        if not sentence:
            continue
        if current and len(current) + 1 + len(sentence) <= max_chars:
            current += ' ' + sentence
            continue
        if current:
            groups.append(current)
            current = ''
        if len(sentence) <= max_chars:
            current = sentence
            continue
        remaining = sentence
        while len(remaining) > max_chars:
            # Prefer a comma; splitting after a punctuation mark preserves it.
            comma = remaining.rfind(', ', max(15, max_chars // 3), max_chars + 1)
            space = remaining.rfind(' ', max(15, max_chars // 3), max_chars + 1)
            cut = comma + 1 if comma >= 0 else space
            if cut < 1:
                cut = max_chars
            groups.append(remaining[:cut].strip())
            remaining = remaining[cut:].strip()
        current = remaining
    if current:
        groups.append(current)
    return groups


def speech_rate(style: str, index: int = 0) -> float:
    """Keep speed stable across chunks; no telltale synthetic rate modulation."""
    return {'natural': 1.0, 'calma': 0.95, 'clara': 0.98}[style]


def pause_samples(text: str, sample_rate: int, style: str) -> int:
    """Target silence between two model chunks, NOT extra added silence."""
    if text.rstrip().endswith('?'):
        seconds = 0.14
    elif text.rstrip().endswith(('.', '!', ';')):
        seconds = 0.16
    elif text.rstrip().endswith(','):
        seconds = 0.085
    else:
        seconds = 0.07
    if style == 'calma':
        seconds *= 1.17
    elif style == 'clara':
        seconds *= 1.08
    return round(sample_rate * seconds)


def _silence_edges(audio: np.ndarray) -> tuple[int, int]:
    """Estimate already-generated silence at the edges; never trim speech."""
    if not len(audio):
        return 0, 0
    peak = float(np.max(np.abs(audio)))
    if peak < 1e-5:
        return 0, 0  # silence-only test doubles must not erase output
    threshold = max(1e-5, peak * .006)
    nonquiet = np.flatnonzero(np.abs(audio) > threshold)
    if not nonquiet.size:
        return 0, 0
    return int(nonquiet[0]), int(len(audio) - 1 - nonquiet[-1])


def join_audio(chunks: list[tuple[str, np.ndarray]], sample_rate: int, style: str) -> np.ndarray:
    """Preserve neural prosody, avoid doubled pauses and clicks on joining."""
    if not chunks:
        raise ValueError('no audio generated')
    prepared = []
    for _, samples in chunks:
        audio = np.asarray(samples, dtype=np.float32).reshape(-1).copy()
        if not audio.size or not np.all(np.isfinite(audio)):
            raise ValueError('audio contains no finite samples')
        # Tiny fade only for clicks, without compressing or changing pitch.
        fade = min(int(sample_rate * .004), audio.size // 2)
        if fade:
            ramp = np.linspace(0, 1, fade, dtype=np.float32)
            audio[:fade] *= ramp
            audio[-fade:] *= ramp[::-1]
        prepared.append(audio)
    assembled = []
    for i, ((text, _), audio) in enumerate(zip(chunks, prepared)):
        assembled.append(audio)
        if i < len(chunks) - 1:
            _, tail = _silence_edges(audio)
            lead, _ = _silence_edges(prepared[i + 1])
            # Models already synthesize natural quiet intervals. Count them
            # before adding any silence; do not add a robotic extra 200 ms.
            missing = max(0, pause_samples(text, sample_rate, style) - tail - lead)
            if missing:
                assembled.append(np.zeros(missing, dtype=np.float32))
    output = np.concatenate(assembled)
    peak = float(np.max(np.abs(output)))
    if peak > .94:
        output *= .94 / peak
    return output

"""Normaliza o vídeo ORIGINAL e CONSENTIDO de Lia para o MuseTalk 1.5.

Uso: python lia_motor/preparar_movimentos_lia.py "C:\\Videos\\lia_gestos.mp4"
É preparação técnica (FFmpeg), NÃO inventa movimentos, nem cria lip-sync.
"""
import argparse
import json
import pathlib
import shutil
import subprocess
import sys

ROOT=pathlib.Path(__file__).resolve().parent
DEST=ROOT/'assets'/'lia-lovable-movimento.mp4'

def probe(path):
    r=subprocess.run(['ffprobe','-v','error','-select_streams','v:0',
      '-show_entries','stream=width,height,r_frame_rate:format=duration',
      '-of','json',str(path)],capture_output=True,text=True,check=True,timeout=15)
    d=json.loads(r.stdout)
    s=d['streams'][0]
    a,b=(s.get('r_frame_rate') or '0/1').split('/')
    return {'duracao':float(d['format']['duration']),'largura':s['width'],
            'altura':s['height'],'fps':float(a)/max(1,float(b))}

def prepare(source,target=DEST):
    source=pathlib.Path(source).expanduser().resolve()
    if not source.is_file():raise ValueError('Arquivo de vídeo inexistente')
    if not shutil.which('ffmpeg') or not shutil.which('ffprobe'):
        raise RuntimeError('Instale ffmpeg e ffprobe antes de continuar')
    before=probe(source)
    if min(before['largura'],before['altura'])<480:
        raise ValueError('O vídeo deve ter resolução mínima de 480 px no menor lado')
    if before['duracao']<8:
        print('AVISO: vídeo curto; gestos serão repetitivos. Recomendado: 20-40 s de Lia em movimento.')
    target.parent.mkdir(parents=True,exist_ok=True)
    tmp=target.with_name('lia_25fps_temp.mp4')
    try:
        subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y',
            '-i',str(source),'-map','0:v:0','-an','-vf','fps=25,scale=trunc(iw/2)*2:trunc(ih/2)*2',
            '-c:v','libx264','-crf','19','-pix_fmt','yuv420p','-movflags','+faststart',str(tmp)],
            check=True,timeout=240)
        after=probe(tmp)
        if after['duracao']<1: raise RuntimeError('Exportação muito curta')
        tmp.replace(target)
        return after
    finally:
        if tmp.exists():tmp.unlink()

if __name__=='__main__':
    parser=argparse.ArgumentParser(description='Prepara vídeo fictício da Lia a 25 FPS sem som original.')
    parser.add_argument('arquivo')
    args=parser.parse_args()
    try:
        print('Pronto:',DEST,'\nMetadados:',json.dumps(prepare(args.arquivo),ensure_ascii=False))
    except (OSError,ValueError,RuntimeError,subprocess.CalledProcessError) as e:
        print('ERRO:',e,file=sys.stderr);sys.exit(1)

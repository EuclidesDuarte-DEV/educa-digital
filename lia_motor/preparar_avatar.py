"""Generate a 25 fps idle-loop from the project's own fictional Lia art.
Blink interpolation is cosmetic. Real lip synchronization comes from MuseTalk + audio.
Requires Pillow and ffmpeg. Does not change the original portrait.
"""
import pathlib
import subprocess
import tempfile
from PIL import Image
ROOT=pathlib.Path(__file__).resolve().parent
base=Image.open(ROOT.parent/'public/static/img/lips/rest.webp').convert('RGB').resize((512,512),Image.Resampling.LANCZOS)
blink=Image.open(ROOT.parent/'public/static/img/lips/blink.webp').convert('RGB').resize((512,512),Image.Resampling.LANCZOS)
output=ROOT/'assets/lia_idle.mp4'
output.parent.mkdir(exist_ok=True,parents=True)
with tempfile.TemporaryDirectory() as tmp:
    tmp=pathlib.Path(tmp)
    for i in range(50):
        # brief eyelid closures at 0.6s and 1.55s. No identity-altering edits.
        amount=max(0,1-abs(i-15)/2,1-abs(i-39)/2)
        frame=Image.blend(base,blink, min(1.,amount*.96))
        frame.save(tmp/f'{i:04d}.png')
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-framerate','25',
                    '-i',str(tmp/'%04d.png'),'-an','-c:v','libx264','-crf','22',
                    '-pix_fmt','yuv420p','-movflags','+faststart',str(output)],check=True)
print('Avatar idle criado:',output)

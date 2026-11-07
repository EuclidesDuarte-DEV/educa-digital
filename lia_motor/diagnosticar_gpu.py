"""Verifica capacidade local. Não instala nada e não expõe segredos."""
import importlib.util
import os
import shutil
import subprocess
import sys

print('Python:',sys.executable)
for exe in ('ffmpeg','ffprobe','nvidia-smi'):
 print(exe+':',shutil.which(exe) or 'NÃO encontrado')
if shutil.which('nvidia-smi'):
 try:
  r=subprocess.run(['nvidia-smi','--query-gpu=name,memory.total','--format=csv,noheader'],
      capture_output=True,text=True,timeout=10)
  print('GPU(s):',r.stdout.strip() or r.stderr.strip()[:200])
 except Exception as e: print('Falha no diagnóstico:',type(e).__name__)
try:
 import torch
 print('PyTorch:',torch.__version__)
 print('CUDA disponível:',torch.cuda.is_available())
 if torch.cuda.is_available(): print('Placa CUDA:',torch.cuda.get_device_name(0))
except ImportError:
 print('PyTorch não instalado neste ambiente')
print('Kokoro instalado:',bool(importlib.util.find_spec('kokoro')))
print('MuseTalk dir:',os.environ.get('LIA_MUSETALK_DIR','NÃO configurado'))
print('Este diagnóstico não prova desempenho nem qualidade do lip-sync.')

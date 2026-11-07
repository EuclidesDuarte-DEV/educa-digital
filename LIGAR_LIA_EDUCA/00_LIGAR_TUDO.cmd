@echo off
chcp 65001>nul
cd /d "%~dp0.."
start "LIA EDUCA - OLLAMA" "%~dp001_OLLAMA.cmd"
start "LIA EDUCA - VOZ" "%~dp002_VOZ_KOKORO.cmd"
timeout /t 4 /nobreak>nul
start "LIA EDUCA - SITE" "%~dp003_SITE_EDUCA.cmd"
echo Iniciados os servicos da LIA EDUCA. Feche somente as janelas quando terminar.
pause

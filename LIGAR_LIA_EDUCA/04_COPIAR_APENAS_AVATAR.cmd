@echo off
chcp 65001>nul
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0SINCRONIZAR_VISUAL.ps1"
pause

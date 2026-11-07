@echo off
chcp 65001>nul
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0INICIAR_EDUCA.ps1" -Servico site
pause

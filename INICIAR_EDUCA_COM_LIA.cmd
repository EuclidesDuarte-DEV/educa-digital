@echo off
chcp 65001>nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (echo Instale o Node.js para iniciar o projeto. & pause & exit /b 1)
node "scripts\iniciar-local-com-lia.mjs"
if errorlevel 1 pause

@echo off
setlocal
cd /d "%~dp0..\.."
echo ===========================================
echo   Educa+ Digital V110.1 - Windows
 echo ===========================================
echo.
where node >nul 2>nul
if errorlevel 1 (
 echo [ERRO] Node.js nao encontrado. Instale Node.js antes de continuar.
 pause
 exit /b 1
)
if not exist "node_modules\.bin\wrangler.cmd" (
 echo [1/2] Instalando dependencias do projeto...
 call npm.cmd install
 if errorlevel 1 (
   echo [ERRO] Falha ao instalar dependencias.
   pause
   exit /b 1
 )
)
echo [2/2] Preparando banco D1 local e abrindo servidor...
echo Acesse no navegador: http://127.0.0.1:8787
echo Para encerrar, pressione Ctrl+C nesta janela.
echo.
call npm.cmd run dev
if errorlevel 1 (
 echo [ERRO] O servidor nao iniciou. Veja a mensagem acima.
 pause
 exit /b 1
)
endlocal

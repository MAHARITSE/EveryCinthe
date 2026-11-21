@echo off
title Everything Search App - Launcher
cd /d "%~dp0"

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js n'est pas installe ou n'est pas dans le PATH.
    echo Telechargez Node.js sur https://nodejs.org/
    pause
    exit /b 1
)

echo Demarrage du serveur Everything Search App...
start "" http://localhost:3000
node server.js
pause

@echo off
cd /d "%~dp0"

echo Indexation des disques en cours...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0indexer.ps1"

start "" "%~dp0Everything-Standalone.html"

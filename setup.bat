@echo off
REM Ottoidea Etsy Creator - Windows kurulum (cift tikla)
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup.ps1"
pause

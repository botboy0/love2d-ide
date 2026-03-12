@echo off
cd /d "%~dp0"
call npm install --silent
call npm run build --silent
node server.js
pause

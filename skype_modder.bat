@echo off

echo Checking if Node.js is installed
where node > nul
if %ERRORLEVEL% GEQ 1 (
echo Install Node.js, or restart your PC if it is already installed
echo PATH may not be up to date in some processes like File Explorer until restart
pause
exit /b 1
)

echo Checking if asar is installed
where asar > nul
if %ERRORLEVEL% GEQ 1 (npm install -g asar)

echo Changing current directory to "%~dp0"
cd /d "%~dp0"

node skype_modder.js

pause

@echo off
setlocal
title Digital Farming System - dev server

rem Use the portable Node 22 install (no system Node on this machine).
set "PATH=%LOCALAPPDATA%\dfs-tools\node-v22.12.0-win-x64;%PATH%"

rem Always run from the folder this script lives in, so it works from anywhere.
cd /d "%~dp0"

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo.
  echo [ERROR] npm was not found.
  echo Expected portable Node 22 at:
  echo   %LOCALAPPDATA%\dfs-tools\node-v22.12.0-win-x64
  echo.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Installing dependencies ^(first run only^)...
  call npm.cmd install
  if errorlevel 1 (
    echo.
    echo [ERROR] npm install failed.
    pause
    exit /b 1
  )
)

echo.
echo Starting the Digital Farming System...
echo The browser will open at http://localhost:5173/
echo Press Ctrl+C in this window to stop the server.
echo.

start "" "http://localhost:5173/"
call npm.cmd run dev

echo.
echo Server stopped.
pause

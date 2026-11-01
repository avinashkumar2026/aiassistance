@echo off
setlocal
cd /d "%~dp0"
title Project AI - OpenRouter
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Install Node.js LTS from https://nodejs.org/ and run this file again.
  pause
  exit /b 1
)
if not exist "server\.env" (
  copy "server\.env.example" "server\.env" >nul
  echo.
  echo A new server\.env file was created.
  echo Opening it now so you can paste your OpenRouter API key.
  start /wait notepad.exe "%CD%\server\.env"
  echo Save the file in Notepad, then close Notepad to continue.
  pause
)
if not exist "server\node_modules" (
  echo Installing backend dependencies...
  pushd server
  call npm install
  if errorlevel 1 (popd & echo Backend dependency installation failed. & pause & exit /b 1)
  popd
)
if not exist "client\node_modules" (
  echo Installing frontend dependencies...
  pushd client
  call npm install
  if errorlevel 1 (popd & echo Frontend dependency installation failed. & pause & exit /b 1)
  popd
)
start "Project AI Backend" cmd /k "cd /d "%CD%\server" && npm start"
timeout /t 2 /nobreak >nul
start "Project AI Frontend" cmd /k "cd /d "%CD%\client" && npm run dev -- --host 127.0.0.1"
timeout /t 4 /nobreak >nul
start "" "http://localhost:5173"
echo Project AI is starting. Keep both terminal windows open while using it.
endlocal

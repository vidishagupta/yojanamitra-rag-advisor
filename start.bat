@echo off
title YojanaMitra AI Launcher
echo =====================================================================
echo    YojanaMitra (योजनामित्र) AI - Indian Government Schemes Advisor
echo    Eligibility-Aware Multilingual RAG in Hindi & Hinglish
echo =====================================================================
echo.

echo [1/2] Starting Python FastAPI Backend on http://127.0.0.1:8000 ...
start "YojanaMitra Backend (FastAPI)" cmd /k "cd /d %~dp0backend && python main.py"

echo [2/2] Starting React Vite Frontend on http://localhost:5173 ...
start "YojanaMitra Frontend (Vite React)" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo Launching your browser...
timeout /t 3 /nobreak >nul
start http://localhost:5173/

echo.
echo Both servers are running!
echo Frontend: http://localhost:5173
echo Backend API Docs: http://127.0.0.1:8000/docs
echo.
pause

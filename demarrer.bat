@echo off
title Plateforme UNCHK - Demarrage
color 0A

echo.
echo  ====================================================
echo   PLATEFORME UNCHK - Demarrage Local
echo  ====================================================
echo.
echo  Base de donnees : PostgreSQL local (port 5432)
echo  Backend API     : http://localhost:3001
echo  Frontend        : http://localhost:5173
echo  ====================================================
echo.

REM Verifie que le service PostgreSQL tourne
sc query postgresql-x64-18 | find "RUNNING" >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Demarrage du service PostgreSQL...
    net start postgresql-x64-18
    timeout /t 3 /nobreak >nul
) else (
    echo [OK] PostgreSQL local demarre
)

REM Demarre le Backend dans une nouvelle fenetre
echo.
echo [>>] Demarrage du Backend...
start "UNCHK Backend" cmd /k "cd /d %~dp0backend && npm run dev"

REM Attend 4 secondes pour que le backend initialise
timeout /t 4 /nobreak >nul

REM Demarre le Frontend dans une nouvelle fenetre
echo [>>] Demarrage du Frontend...
start "UNCHK Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo [OK] Les deux serveurs sont en cours de demarrage.
echo.
echo  Ouvrez votre navigateur sur : http://localhost:5173
echo  Admin : admin@unchk.sn / Admin@1234
echo.
echo  Fermez les fenetres "UNCHK Backend" et "UNCHK Frontend" pour arreter.
echo.
pause

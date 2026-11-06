@echo off
title SI-PATIR Starter
color 0B

:: Pastikan Node.js dan Git ada di PATH
set "PATH=C:\Program Files\nodejs;C:\Program Files\Git\cmd;%PATH%"

echo ======================================================
echo    MEMULAI SISTEM SI-PATIR (Sistem Integrasi Pemantau Aktivitas)
echo ======================================================
echo.

echo [1/3] Memeriksa dan membersihkan bentrok port...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 5000, 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }" >nul 2>&1
echo [OK] Port 5000 dan 3000 siap digunakan!
echo.

:: Auto-initialize .env jika belum ada
if not exist "%~dp0backend\.env" (
    echo [!] backend\.env belum ada. Menyalin dari .env.example...
    copy "%~dp0backend\.env.example" "%~dp0backend\.env" >nul
    echo [OK] backend\.env berhasil disiapkan.
)

:: Auto-install dependencies jika node_modules belum ada
if not exist "%~dp0backend\node_modules" (
    echo [*] Menginstal dependensi backend [npm install]...
    cd /d "%~dp0backend" && call npm.cmd install
)

if not exist "%~dp0frontend\node_modules" (
    echo [*] Menginstal dependensi frontend [npm install]...
    cd /d "%~dp0frontend" && call npm.cmd install
)

echo [2/3] Menjalankan Backend Server (Port 5000)...
start "SI-PATIR Backend (Port 5000)" cmd /k "set PATH=C:\Program Files\nodejs;C:\Program Files\Git\cmd;%%PATH%% && cd /d %~dp0backend && npm.cmd run dev"

echo [3/3] Menjalankan Frontend Dashboard (Port 3000)...
start "SI-PATIR Frontend (Port 3000)" cmd /k "set PATH=C:\Program Files\nodejs;C:\Program Files\Git\cmd;%%PATH%% && cd /d %~dp0frontend && npm.cmd run dev"

echo.
echo ======================================================
echo    SI-PATIR BERHASIL DIJALANKAN!
echo ======================================================
echo - Dashboard Web : http://localhost:3000
echo - Backend API   : http://localhost:5000
echo - Webhook URL   : http://localhost:5000/api/webhooks/github
echo ======================================================
echo Membuka Google Chrome dalam 3 detik...
ping 127.0.0.1 -n 4 >nul
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" "http://localhost:3000"
) else (
    start http://localhost:3000
)


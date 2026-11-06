@echo off
title SI-PATIR Starter
color 0B

echo ======================================================
echo    MEMULAI SISTEM SI-PATIR (Sistem Integrasi Pemantau Aktivitas)
echo ======================================================
echo.

echo [1/3] Memeriksa dan membersihkan bentrok port...

:: Cek dan matikan proses pada port 5000 (Backend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do (
    echo [!] Port 5000 sedang terpakai (PID: %%a). Menutup proses...
    taskkill /F /PID %%a >nul 2>&1
)

:: Cek dan matikan proses pada port 3000 (Frontend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    echo [!] Port 3000 sedang terpakai (PID: %%a). Menutup proses...
    taskkill /F /PID %%a >nul 2>&1
)

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
    echo [*] Menginstal dependensi backend (npm install)...
    cd /d "%~dp0backend" && call npm install
)

if not exist "%~dp0frontend\node_modules" (
    echo [*] Menginstal dependensi frontend (npm install)...
    cd /d "%~dp0frontend" && call npm install
)

echo [2/3] Menjalankan Backend Server (Port 5000)...
start "SI-PATIR Backend (Port 5000)" cmd /k "cd /d %~dp0backend && npm run dev"

echo [3/3] Menjalankan Frontend Dashboard (Port 3000)...
start "SI-PATIR Frontend (Port 3000)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ======================================================
echo    SI-PATIR BERHASIL DIJALANKAN!
echo ======================================================
echo - Dashboard Web : http://localhost:3000
echo - Backend API   : http://localhost:5000
echo - Webhook URL   : http://localhost:5000/api/webhooks/github
echo ======================================================
echo Membuka browser dalam 3 detik...
timeout /t 3 >nul
start http://localhost:3000


@echo off
title SI-PATIR Database Backup
color 0A

:: Pastikan Node.js dan Git ada di PATH
set "PATH=C:\Program Files\nodejs;C:\Program Files\Git\cmd;%PATH%"

echo ======================================================
echo    SI-PATIR AUTOMATED DATABASE BACKUP TOOL
echo    Penanggung Jawab: Fatir (@Patirparkerr)
echo ======================================================
echo.

if not exist "%~dp0..\backups" (
    mkdir "%~dp0..\backups"
)

echo [*] Menjalankan automasi backup database MySQL...
node "%~dp0backup_helper.js"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [OK] Proses backup selesai dengan sukses!
    echo.
    echo Daftar 5 file backup terbaru:
    dir "%~dp0..\backups\*.sql" /B /O:-D 2>nul | findstr /N "^" | findstr /B "[1-5]:"
) else (
    echo.
    echo [ERROR] Terjadi kesalahan saat mengeksekusi backup database.
)

echo.
echo Tekan sembarang tombol untuk menutup...
pause >nul

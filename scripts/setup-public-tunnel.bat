@echo off
REM ==============================================================================
REM SI-PATIR: Setup Public Webhook Gateway Tunnel (Windows)
REM ==============================================================================

set PORT=5000
echo ======================================================
echo 🌐 SI-PATIR: Public Webhook Gateway Setup (Windows)
echo ======================================================
echo.
echo Menjalankan Public HTTPS Tunnel untuk port %PORT%...
echo.
echo 📋 Setelah tunnel aktif, masukkan URL berikut ke GitHub Repo Webhook:
echo    👉 https://^<domain-tunnel^>/api/v1/webhooks/github
echo ------------------------------------------------------
echo.

npx localtunnel --port %PORT%
pause

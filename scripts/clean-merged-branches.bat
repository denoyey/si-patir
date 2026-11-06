@echo off
setlocal enabledelayedexpansion

set "PROJECT_DIR=%~dp0.."
cd /d "%PROJECT_DIR%"

echo ======================================================
echo    SI-PATIR: Clean Merged Branches (Windows Engine)
echo    Conflict-Proof Branch Cleanup
echo ======================================================
echo.

echo [1/3] Memeriksa status workspace...
git diff --quiet
if %ERRORLEVEL% neq 0 (
    echo.
    echo [WARNING] Terdeteksi perubahan file yang belum di-commit!
    echo Silakan commit atau stash perubahan Anda terlebih dahulu sebelum membersihkan branch.
    exit /b 1
)

git diff --staged --quiet
if %ERRORLEVEL% neq 0 (
    echo.
    echo [WARNING] Terdeteksi perubahan staged yang belum di-commit!
    echo Silakan commit atau stash perubahan Anda terlebih dahulu sebelum membersihkan branch.
    exit /b 1
)

for /f %%i in ('git rev-parse --abbrev-ref HEAD') do set CURRENT_BRANCH=%%i

if not "%CURRENT_BRANCH%"=="main" (
    echo   -^> Berpindah ke branch main...
    git checkout main
    if !ERRORLEVEL% neq 0 (
        echo [ERROR] Gagal checkout ke main.
        exit /b 1
    )
)

echo [2/3] Mengambil metadata ^& pembaruan dari origin/main...
git fetch origin --prune --quiet
git pull origin main --quiet

echo [3/3] Memeriksa branch yang sudah di-merge ke origin/main...

:: Hapus local branches yang sudah di-merge ke origin/main
for /f "tokens=*" %%b in ('git branch --merged origin/main ^| findstr /v "\* main"') do (
    set "BRANCH=%%b"
    set "BRANCH=!BRANCH: =!"
    if not "!BRANCH!"=="" if not "!BRANCH!"=="main" (
        echo   - Menghapus lokal: !BRANCH!
        git branch -d !BRANCH! 2>nul || git branch -D !BRANCH! 2>nul
    )
)

:: Hapus remote branches yang sudah di-merge di origin
for /f "tokens=*" %%b in ('git branch -r --merged origin/main ^| findstr /v "origin/main origin/HEAD"') do (
    set "RBRANCH=%%b"
    set "RBRANCH=!RBRANCH: =!"
    set "RBRANCH=!RBRANCH:origin/=!"
    if not "!RBRANCH!"=="" if not "!RBRANCH!"=="main" (
        echo   - Menghapus remote: !RBRANCH!
        git push origin --delete !RBRANCH! 2>nul
    )
)

git fetch --prune origin --quiet
echo.
echo ======================================================
echo [OK] Pembersihan selesai! Repositori kini bersih dan rapi.
echo ======================================================
exit /b 0

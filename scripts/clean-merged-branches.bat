@echo off
setlocal enabledelayedexpansion

set "PROJECT_DIR=%~dp0.."
cd /d "%PROJECT_DIR%"

echo ======================================================
echo    SI-PATIR: Clean Merged Branches (Windows Engine)
echo ======================================================
echo.

echo Memeriksa branch aktif...
for /f %%i in ('git rev-parse --abbrev-ref HEAD') do set CURRENT_BRANCH=%%i

if not "%CURRENT_BRANCH%"=="main" (
    echo Berpindah ke branch main...
    git checkout main
)

git pull origin main --quiet

echo Memeriksa branch yang sudah di-merge ke main...

:: Hapus local branches yang sudah di-merge
for /f "tokens=*" %%b in ('git branch --merged main ^| findstr /v "\* main"') do (
    set "BRANCH=%%b"
    set "BRANCH=!BRANCH: =!"
    if not "!BRANCH!"=="" if not "!BRANCH!"=="main" (
        echo   - Menghapus lokal: !BRANCH!
        git branch -d !BRANCH!
    )
)

:: Hapus remote branches yang sudah di-merge di origin
for /f "tokens=*" %%b in ('git branch -r --merged main ^| findstr /v "origin/main origin/HEAD"') do (
    set "RBRANCH=%%b"
    set "RBRANCH=!RBRANCH: =!"
    set "RBRANCH=!RBRANCH:origin/=!"
    if not "!RBRANCH!"=="" if not "!RBRANCH!"=="main" (
        echo   - Menghapus remote: !RBRANCH!
        git push origin --delete !RBRANCH!
    )
)

git fetch --prune origin --quiet
echo.
echo [OK] Repositori bersih dan rapi!
exit /b 0

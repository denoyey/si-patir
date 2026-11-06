@echo off
setlocal enabledelayedexpansion

set "PROJECT_DIR=%~dp0.."
cd /d "%PROJECT_DIR%"

set "BRANCH_TYPE=%~1"
set "BRANCH_SLUG=%~2"
set "COMMIT_SCOPE=%~3"
set "COMMIT_MSG=%~4"

if "%BRANCH_TYPE%"=="" goto :usage
if "%BRANCH_SLUG%"=="" goto :usage
if "%COMMIT_SCOPE%"=="" goto :usage
if "%COMMIT_MSG%"=="" goto :usage

set "BRANCH_NAME=%BRANCH_TYPE%/%BRANCH_SLUG%"

if /i "%BRANCH_NAME%"=="main" goto :main_error
if /i "%BRANCH_NAME%"=="master" goto :main_error

echo ======================================================
echo    SI-PATIR: Automated Git Push (Windows Engine)
echo ======================================================
echo.

echo [1/4] Menjalankan Pre-Push Quality Gate...
echo   -^> Menjalankan Backend TypeScript Check...
cd /d "%PROJECT_DIR%\backend"
call npx tsc --noEmit
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Backend TypeScript Check gagal! Perbaiki error sebelum push.
    exit /b 1
)

echo   -^> Menjalankan Frontend Build Production...
cd /d "%PROJECT_DIR%\frontend"
call npm run build
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Frontend Build Production gagal! Perbaiki error sebelum push.
    exit /b 1
)

cd /d "%PROJECT_DIR%"
echo [OK] Pre-Push Quality Gate Lolos! (0 error)
echo.

echo [2/4] Menyiapkan Branch: %BRANCH_NAME%...
git show-ref --verify --quiet "refs/heads/%BRANCH_NAME%"
if %ERRORLEVEL% equ 0 (
    git checkout "%BRANCH_NAME%"
) else (
    git checkout -b "%BRANCH_NAME%"
)
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Gagal checkout ke branch %BRANCH_NAME%.
    exit /b 1
)
echo.

echo [3/4] Melakukan Staging & Conventional Commit...
git add .
set "FULL_COMMIT_MSG=%BRANCH_TYPE%(%COMMIT_SCOPE%): %COMMIT_MSG%"
git commit -m "%FULL_COMMIT_MSG%"
if %ERRORLEVEL% neq 0 (
    echo [WARNING] Tidak ada perubahan baru untuk di-commit atau commit sudah ada.
) else (
    echo [OK] Commit berhasil dibuat: "%FULL_COMMIT_MSG%"
)
echo.

echo [4/4] Mengirim (Push) ke GitHub Remote (origin/%BRANCH_NAME%)...
git push -u origin "%BRANCH_NAME%"
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Gagal melakukan push ke remote GitHub.
    exit /b 1
)

echo.
echo ======================================================
echo    BERHASIL AUTO-PUSH KE BRANCH: %BRANCH_NAME%
echo    Buka GitHub untuk membuat Pull Request ke branch main.
echo ======================================================
exit /b 0

:main_error
echo.
echo [ERROR] Dilarang keras push langsung ke branch main/master!
echo Gunakan branch fitur atau perbaikan terpisah (misal: feat/... atau fix/...).
exit /b 1

:usage
echo.
echo Penggunaan (Windows):
echo   scripts\auto-git-push.bat ^<type^> ^<branch_slug^> ^<scope^> ^<commit_message^>
echo.
echo Contoh:
echo   scripts\auto-git-push.bat feat responsive-ui ui "standardize rounded-md tokens"
echo   scripts\auto-git-push.bat fix route-scroll ui "reset scroll to top on navigation"
exit /b 1

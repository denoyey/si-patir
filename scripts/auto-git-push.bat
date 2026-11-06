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
echo    Conflict-Proof Verification and Branch Engine
echo ======================================================
echo.

echo [1/5] Mengambil metadata terbaru ^& memeriksa remote...
git fetch origin --prune --quiet

echo [2/5] Menjalankan Pre-Push Quality Gate...
echo   -^> Backend TypeScript Check...
cd /d "%PROJECT_DIR%\backend"
call npx tsc --noEmit
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Backend TypeScript Check gagal! Perbaiki error sebelum push.
    exit /b 1
)

echo   -^> Frontend Build Production...
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

echo [3/5] Menyiapkan Branch: %BRANCH_NAME%...
for /f %%i in ('git rev-parse --abbrev-ref HEAD') do set CURRENT_BRANCH=%%i

git show-ref --verify --quiet "refs/heads/%BRANCH_NAME%"
if %ERRORLEVEL% equ 0 (
    if not "%CURRENT_BRANCH%"=="%BRANCH_NAME%" (
        git checkout "%BRANCH_NAME%"
    )
) else (
    git ls-remote --exit-code --heads origin "%BRANCH_NAME%" >nul 2>&1
    if !ERRORLEVEL! equ 0 (
        echo   -^> Mendeteksi branch di remote GitHub. Melacak origin/%BRANCH_NAME%...
        git checkout -b "%BRANCH_NAME%" --track "origin/%BRANCH_NAME%"
    ) else (
        if "%CURRENT_BRANCH%"=="main" (
            git diff --quiet
            if !ERRORLEVEL! equ 0 (
                git diff --staged --quiet
                if !ERRORLEVEL! equ 0 (
                    git pull --ff-only origin main --quiet 2>nul
                )
            )
        )
        git checkout -b "%BRANCH_NAME%"
    )
)

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Gagal checkout/menyiapkan branch %BRANCH_NAME%.
    exit /b 1
)
echo.

echo [4/5] Melakukan Staging ^& Conventional Commit...
git add .
set "FULL_COMMIT_MSG=%BRANCH_TYPE%(%COMMIT_SCOPE%): %COMMIT_MSG%"

git diff --staged --quiet
if %ERRORLEVEL% equ 0 (
    echo [INFO] Tidak ada perubahan baru untuk di-commit.
) else (
    git commit -m "%FULL_COMMIT_MSG%"
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Gagal membuat commit.
        exit /b 1
    )
    echo [OK] Commit berhasil dibuat: "%FULL_COMMIT_MSG%"
)
echo.

echo [5/5] Sinkronisasi Anti-Conflict sebelum Push...
git ls-remote --exit-code --heads origin "%BRANCH_NAME%" >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo   -^> Mendeteksi commit di remote origin/%BRANCH_NAME%. Melakukan rebase sinkronisasi...
    git pull --rebase origin "%BRANCH_NAME%" 2>nul
    if !ERRORLEVEL! neq 0 (
        echo.
        echo [WARNING] Terjadi conflict dengan commit rekan tim di remote!
        echo Membatalkan rebase secara otomatis agar workspace aman...
        git rebase --abort >nul 2>&1
        echo [ERROR] PUSH DIBATALKAN UNTUK MENCEGAH KERUSAKAN KODE.
        echo Silakan selesaikan manual: 'git pull origin %BRANCH_NAME%'
        exit /b 1
    )
)

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

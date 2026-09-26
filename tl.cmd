@echo off
rem ===========================================================
rem  TradeLink - launcher npm
rem
rem  Kenapa file .cmd, bukan .ps1:
rem  PowerShell memblokir eksekusi skrip .ps1 (termasuk npm.ps1)
rem  bila execution policy masih Restricted. File batch tidak
rem  terkena aturan itu, jadi launcher ini langsung bisa dipakai
rem  tanpa mengubah setelan keamanan dan tanpa hak administrator.
rem
rem  Pemakaian:
rem    .\tl install
rem    .\tl run dev
rem    .\tl run build
rem    .\tl start
rem ===========================================================

setlocal

set "NODE_EXE="
set "NPM_CLI="

rem --- 1) Prioritaskan Node portable hasil setup tanpa admin ---
for /d %%D in ("%LOCALAPPDATA%\node-portable\node-v*") do (
    if exist "%%D\node.exe" (
        set "PATH=%%D;%PATH%"
        set "NODE_EXE=%%D\node.exe"
        set "NPM_CLI=%%D\node_modules\npm\bin\npm-cli.js"
    )
)

rem --- 2) Kalau tidak ada, pakai Node yang terpasang di sistem ---
if not defined NODE_EXE (
    where node.exe >nul 2>nul
    if errorlevel 1 (
        echo.
        echo [TradeLink] Node.js tidak ditemukan.
        echo.
        echo Pilihan:
        echo   a^) Pasang Node.js resmi: https://nodejs.org/en/download
        echo   b^) Atau letakkan Node portable di:
        echo      %LOCALAPPDATA%\node-portable\node-vXX.XX.X-win-x64
        echo.
        exit /b 1
    )
    set "NODE_EXE=node"
)

if "%~1"=="" goto usage

rem Panggil npm-cli.js langsung supaya tidak lewat shim npm.ps1.
if defined NPM_CLI (
    "%NODE_EXE%" "%NPM_CLI%" %*
) else (
    call npm %*
)
exit /b %ERRORLEVEL%

:usage
echo.
echo   TradeLink - launcher npm
echo.
echo   .\tl install       pasang dependencies
echo   .\tl run dev       jalankan server pengembangan  ^(localhost:3000^)
echo   .\tl run build     build produksi + type-check
echo   .\tl start         jalankan hasil build
echo   .\tl run typecheck periksa tipe saja
echo.
exit /b 1

@echo off
REM --------------------------------------------
REM Script para iniciar Backend y Frontend
REM --------------------------------------------

REM Abrir backend en nueva ventana de PowerShell
start "Sistema Bodega - Backend" powershell -NoExit -Command "Set-Location -LiteralPath '%~dp0backend'; npm run start:dev"

REM Abrir frontend en nueva ventana de PowerShell
start "Sistema Bodega - Frontend" powershell -NoExit -Command "Set-Location -LiteralPath '%~dp0frontend'; npm run start -- --open"

echo 🚀 Backend y Frontend iniciados
pause

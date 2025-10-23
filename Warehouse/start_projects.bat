@echo off
REM --------------------------------------------
REM Script para iniciar Backend y Frontend
REM --------------------------------------------

REM Abrir backend en nueva ventana de PowerShell
start powershell -NoExit -Command "cd 'C:\Users\Robert\Documents\GitHub\Sistema_Bodega\Warehouse\backend'; npm run start:dev"

REM Abrir frontend en nueva ventana de PowerShell
start powershell -NoExit -Command "cd 'C:\Users\Robert\Documents\GitHub\Sistema_Bodega\Warehouse\frontend'; ng serve -o"

echo 🚀 Backend y Frontend iniciados
pause

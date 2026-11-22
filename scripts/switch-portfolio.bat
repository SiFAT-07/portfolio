@echo off
set "VARIANT=%~1"
if "%VARIANT%"=="" set "VARIANT=status"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0switch-portfolio.ps1" -Variant "%VARIANT%"

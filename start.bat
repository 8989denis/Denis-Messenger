@echo off
chcp 65001
cls
title [Client] Denis Messenger
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Instalowanie Node.js...
    winget install OpenJS.NodeJS --accept-package-agreements
    echo Node.js zostal pomyslnie zainstalowany.
    SET "PATH=%PATH%;C:\Program Files\nodejs\"
)
cls
echo Uruchamianie Denis Messenger...
node Data/Client.mjs
pause

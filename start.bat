@echo off
start cmd /k "node server.js"
timeout /t 5
start cmd /k "ngrok http 4000"

@echo off
REM Poker Game - Complete Startup Script for Windows

setlocal enabledelayedexpansion

echo.
echo 🎰 Poker Game - Starting all services...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install-all
)

echo Starting services...
echo.

REM Create logs directory
if not exist "logs" mkdir logs

REM Start Hardhat node
echo 1. Starting Hardhat node...
cd contracts
start cmd /k "npx hardhat node > ..\logs\hardhat.log 2>&1"
timeout /t 5 /nobreak

REM Deploy contract
echo 2. Deploying smart contract...
call npm run deploy > ..\logs\deploy.log 2>&1
for /f "tokens=*" %%a in (..\logs\deploy.log) do (
    if "%%a" contain "deployed to:" set CONTRACT_ADDRESS=%%a
)

REM Start backend
echo 3. Starting backend server...
cd ..\backend
start cmd /k "npm start > ..\logs\backend.log 2>&1"
timeout /t 3 /nobreak

REM Start frontend
echo 4. Starting frontend...
cd ..\frontend
start cmd /k "npm run dev > ..\logs\frontend.log 2>&1"
timeout /t 5 /nobreak

echo.
echo === All services started ===
echo.
echo Service URLs:
echo   - Frontend:      http://localhost:3000
echo   - Backend API:   http://localhost:8080
echo   - WebSocket:     ws://localhost:8081
echo   - Hardhat Node:  http://localhost:8545
echo.
echo Logs:
echo   - Hardhat:  logs\hardhat.log
echo   - Backend:  logs\backend.log
echo   - Frontend: logs\frontend.log
echo   - Deploy:   logs\deploy.log
echo.
echo Game ready! Open http://localhost:3000 in your browser
echo.
pause

@echo off
REM Installation script for Poker Game - Windows

setlocal enabledelayedexpansion

echo 🎰 Poker Game - Installation Script
echo ====================================
echo.

REM Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed
    echo Please install Node.js 16+ from https://nodejs.org
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i

echo ✅ Node.js %NODE_VERSION%
echo ✅ npm %NPM_VERSION%
echo.

REM Create directories
if not exist "logs" mkdir logs

REM Install dependencies
echo 📦 Installing dependencies...
echo.

echo   Installing backend dependencies...
cd backend
call npm install
cd ..

echo   Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo   Installing contract dependencies...
cd contracts
call npm install
cd ..

echo.
echo ✅ All dependencies installed!
echo.

REM Create .env files
echo 🔧 Setting up configuration files...
echo.

if not exist "backend\.env" (
    echo   Creating backend\.env...
    (
        echo PORT=8080
        echo WS_PORT=8081
        echo NODE_ENV=development
        echo ETHEREUM_RPC_URL=http://localhost:8545
        echo CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
        echo PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb476c10d2754bab4eddc4f7f2738
    ) > backend\.env
) else (
    echo   backend\.env already exists
)

if not exist "frontend\.env.local" (
    echo   Creating frontend\.env.local...
    (
        echo NEXT_PUBLIC_API_URL=http://localhost:8080
        echo NEXT_PUBLIC_WS_URL=ws://localhost:8081
    ) > frontend\.env.local
) else (
    echo   frontend\.env.local already exists
)

echo.
echo ✅ Configuration files created!
echo.

echo 🎉 Installation complete!
echo.
echo Next steps:
echo.
echo 1. Start Hardhat node (Terminal 1^):
echo    cd contracts && npx hardhat node
echo.
echo 2. Deploy contract (Terminal 2^):
echo    cd contracts && npm run deploy
echo.
echo 3. Start backend (Terminal 3^):
echo    cd backend && npm start
echo.
echo 4. Start frontend (Terminal 4^):
echo    cd frontend && npm run dev
echo.
echo Or run everything at once:
echo    start.bat
echo.
echo Then open http://localhost:3000 in your browser!
echo.
pause

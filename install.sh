#!/bin/bash

# Install script for Poker Game

set -e

echo "🎰 Poker Game - Installation Script"
echo "===================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js 16+ from https://nodejs.org"
    exit 1
fi

echo "✅ Node.js $(node --version)"
echo "✅ npm $(npm --version)"
echo ""

# Create directories
mkdir -p logs

# Install dependencies
echo "📦 Installing dependencies..."
echo ""

echo "  Installing backend dependencies..."
cd backend
npm install
cd ..

echo "  Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "  Installing contract dependencies..."
cd contracts
npm install
cd ..

echo ""
echo "✅ All dependencies installed!"
echo ""

# Create .env files
echo "🔧 Setting up configuration files..."
echo ""

if [ ! -f "backend/.env" ]; then
    echo "  Creating backend/.env..."
    cat > backend/.env << 'EOF'
PORT=8080
WS_PORT=8081
NODE_ENV=development
ETHEREUM_RPC_URL=http://localhost:8545
CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb476c10d2754bab4eddc4f7f2738
EOF
else
    echo "  backend/.env already exists"
fi

if [ ! -f "frontend/.env.local" ]; then
    echo "  Creating frontend/.env.local..."
    cat > frontend/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8081
EOF
else
    echo "  frontend/.env.local already exists"
fi

echo ""
echo "✅ Configuration files created!"
echo ""

# Summary
echo "🎉 Installation complete!"
echo ""
echo "Next steps:"
echo ""
echo "1. Start Hardhat node (Terminal 1):"
echo "   cd contracts && npx hardhat node"
echo ""
echo "2. Deploy contract (Terminal 2):"
echo "   cd contracts && npm run deploy"
echo ""
echo "3. Start backend (Terminal 3):"
echo "   cd backend && npm start"
echo ""
echo "4. Start frontend (Terminal 4):"
echo "   cd frontend && npm run dev"
echo ""
echo "Or run everything at once:"
echo "   bash start.sh (Linux/Mac)"
echo "   start.bat (Windows)"
echo ""
echo "Then open http://localhost:3000 in your browser!"
echo ""

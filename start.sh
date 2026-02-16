#!/bin/bash

# Poker Game - Complete Startup Script

echo "🎰 Poker Game - Starting all services..."
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install-all
fi

echo -e "${GREEN}Starting services...${NC}"
echo ""

# Open new terminal windows/tabs for each service
echo -e "${BLUE}1. Starting Hardhat node...${NC}"
cd contracts
npx hardhat node > ../logs/hardhat.log 2>&1 &
HARDHAT_PID=$!
echo "   Hardhat PID: $HARDHAT_PID"

sleep 5

echo -e "${BLUE}2. Deploying smart contract...${NC}"
npm run deploy > ../logs/deploy.log 2>&1
CONTRACT_ADDRESS=$(grep "PokerGame deployed to:" ../logs/deploy.log | awk '{print $NF}')
echo "   Contract Address: $CONTRACT_ADDRESS"

echo -e "${BLUE}3. Starting backend server...${NC}"
cd ../backend
npm start > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

sleep 3

echo -e "${BLUE}4. Starting frontend...${NC}"
cd ../frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"

sleep 5

echo ""
echo -e "${GREEN}=== All services started ===${NC}"
echo ""
echo "📊 Service URLs:"
echo "  - Frontend:      http://localhost:3000"
echo "  - Backend API:   http://localhost:8080"
echo "  - WebSocket:     ws://localhost:8081"
echo "  - Hardhat Node:  http://localhost:8545"
echo ""
echo "📁 Logs:"
echo "  - Hardhat:  logs/hardhat.log"
echo "  - Backend:  logs/backend.log"
echo "  - Frontend: logs/frontend.log"
echo "  - Deploy:   logs/deploy.log"
echo ""
echo "🎮 Ready to play! Open http://localhost:3000 in your browser"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for Ctrl+C
wait

# Cleanup
echo ""
echo -e "${YELLOW}Stopping services...${NC}"
kill $HARDHAT_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null
echo -e "${GREEN}All services stopped${NC}"

# 📚 Полная документация - Poker Game

## Оглавление
1. [Установка](#установка)
2. [Архитектура](#архитектура)
3. [Запуск](#запуск)
4. [API документация](#api-документация)
5. [Smart Contract](#smart-contract)
6. [Troubleshooting](#troubleshooting)

---

## 🚀 Установка

### Предварительные требования
- **Node.js**: v16 или выше
- **npm** или **yarn**
- **Git**
- **MetaMask** (для Web3 интеграции)

### Полная установка за один раз

```bash
# Клонируйте проект
cd poker-game

# Установите все зависимости
npm install-all

# Создайте .env файлы
cp backend/.env.example backend/.env
```

### Или установите поэтапно

```bash
# Backend
cd backend && npm install && cd ..

# Frontend
cd frontend && npm install && cd ..

# Contracts
cd contracts && npm install && cd ..
```

---

## 🏗️ Архитектура

### Система компонентов

```
┌─────────────────────────────────────────────┐
│          Frontend (Next.js)                  │
│  - Pages: index, lobby, table                │
│  - UI Components & Game Logic                │
│  - Web3 & WebSocket Integration              │
└──────────────────┬──────────────────────────┘
                   │
                   │ REST API + WebSocket
                   │
┌──────────────────▼──────────────────────────┐
│       Backend (Express + WebSocket)          │
│  - Game Logic & State Management             │
│  - Table & Lobby Management                  │
│  - Player Action Processing                  │
│  - Ethereum Contract Interaction             │
└──────────────────┬──────────────────────────┘
                   │
                   │ ethers.js
                   │
┌──────────────────▼──────────────────────────┐
│   Smart Contract (Solidity on Ethereum)      │
│  - Stake Management                          │
│  - Payout Distribution                       │
│  - Platform Fee Collection                   │
└──────────────────────────────────────────────┘
```

### Технологии

| Слой | Технология | Назначение |
|------|-----------|-----------|
| **Frontend** | Next.js 14 | UI, страницы, SSR |
| | React 18 | UI компоненты |
| | TypeScript | Типизированный код |
| | Zustand | State management |
| | axios | HTTP запросы |
| **Backend** | Express.js | REST API |
| | WebSocket (ws) | Real-time связь |
| | Node.js | Runtime |
| **Contract** | Solidity 0.8.0 | Smart contract |
| | Hardhat | Development framework |
| | ethers.js | Contract interaction |

---

## 🎮 Запуск

### Опция 1: Docker (рекомендуется)

```bash
# Запустите все сервисы одной командой
docker-compose up

# Фронтенд: http://localhost:3000
# Backend API: http://localhost:8080
# Ethereum Node: http://localhost:8545
```

### Опция 2: Локальный запуск (для разработки)

#### Терминал 1 - Ethereum Node

```bash
cd contracts
npx hardhat node
```

**Результат:**
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
```

Скопируйте приватный ключ первого аккаунта.

#### Терминал 2 - Deploy контракта

```bash
cd contracts

# Обновите .env
# PRIVATE_KEY=<скопированный приватный ключ>

npm run deploy
```

**Результат:**
```
PokerGame deployed to: 0x5FbDB2315678afccb333f8a9c6122c7960e1674c
```

Скопируйте адрес контракта и добавьте в backend/.env

#### Терминал 3 - Backend

```bash
cd backend

# Обновите .env
cat > .env << EOF
PORT=8080
WS_PORT=8081
NODE_ENV=development
ETHEREUM_RPC_URL=http://localhost:8545
CONTRACT_ADDRESS=<адрес из предыдущего шага>
PRIVATE_KEY=<приватный ключ>
EOF

npm start
```

**Результат:**
```
Poker game server running on port 8080
WebSocket server running on port 8081
```

#### Терминал 4 - Frontend

```bash
cd frontend

# Обновите .env.local
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8081
EOF

npm run dev
```

**Результат:**
```
▲ Next.js 14.0.0
- Local:        http://localhost:3000
```

Откройте браузер: **http://localhost:3000**

### Опция 3: Все сразу одной командой

```bash
cd poker-game
npm run dev

# Автоматически запустит backend, frontend, и Hardhat node
```

---

## 📡 API Документация

### REST API Endpoints

#### Получить лобби

```bash
GET /api/lobbies
```

**Ответ:**
```json
[
  {
    "id": "uuid",
    "name": "High Stakes",
    "tableSize": 6,
    "playersCount": 3,
    "minBet": 1,
    "maxBet": 100,
    "createdAt": "2026-02-16T10:00:00Z"
  }
]
```

#### Создать лобби

```bash
POST /api/lobbies
Content-Type: application/json

{
  "name": "High Stakes",
  "tableSize": 6,
  "minBet": 1,
  "maxBet": 100
}
```

**Ответ:**
```json
{
  "id": "uuid",
  "name": "High Stakes",
  "tableSize": 6,
  "minBet": 1,
  "maxBet": 100,
  "players": [],
  "tables": [],
  "createdAt": "2026-02-16T10:00:00Z"
}
```

#### Создать стол

```bash
POST /api/tables
Content-Type: application/json

{
  "lobbyId": "uuid",
  "minBet": 1,
  "maxBet": 100,
  "tableSize": 6
}
```

#### Получить состояние стола

```bash
GET /api/tables/:tableId
```

**Ответ:**
```json
{
  "tableId": "uuid",
  "maxPlayers": 6,
  "seats": [
    {
      "playerId": "uuid",
      "playerName": "John",
      "stake": 1000,
      "bet": 50,
      "folded": false,
      "allIn": false,
      "cardsCount": 2
    },
    null,
    null,
    null,
    null,
    null
  ],
  "gameState": "preflop",
  "pot": 100,
  "communityCards": [],
  "currentBet": 50,
  "activePlayer": 0,
  "button": 0
}
```

### WebSocket Events

#### Подключение

```javascript
// Client -> Server
{ "type": "join-table", "payload": { "tableId": "uuid", "playerName": "John", "stake": 1000 } }

// Server -> Client
{ "type": "connected", "playerId": "uuid" }
{ "type": "joined-table", "tableState": {...}, "seatIndex": 0 }
```

#### Действия в игре

```javascript
// Fold
{ "type": "action", "payload": { "action": "fold" } }

// Check
{ "type": "action", "payload": { "action": "check" } }

// Call
{ "type": "action", "payload": { "action": "call" } }

// Raise
{ "type": "action", "payload": { "action": "raise", "amount": 100 } }

// All-in
{ "type": "action", "payload": { "action": "all-in" } }
```

#### Обновления

```javascript
// Server -> Client
{ "type": "table-update", "tableState": {...} }
```

---

## 💎 Smart Contract

### PokerGame.sol

#### Основные функции

##### Управление средствами

```solidity
// Депозит ETH
depositFunds() payable

// Вывод ETH
withdrawFunds(uint256 amount)
```

##### Управление таблицами

```solidity
// Создать новый стол
createTable(
  string memory tableId,
  uint8 maxPlayers,
  uint256 minBet,
  uint256 maxBet
)

// Присоединиться к столу
joinTable(string memory tableId, uint256 stake)

// Покинуть стол
leaveTable(string memory tableId)
```

##### Игровой процесс

```solidity
// Разместить ставку
placeBet(string memory tableId, uint256 amount)

// Начать новую руку
startHand(string memory tableId)

// Завершить игру и выплатить победителя
endGame(
  string memory tableId,
  address winner,
  uint256 payout
)
```

##### Просмотр данных

```solidity
// Информация о столе
getTableInfo(string memory tableId)

// Аккаунт игрока
getPlayerAccount(address player)

// Ставка игрока за столом
getPlayerStake(address player, string memory tableId)

// Игроки за столом
getTablePlayers(string memory tableId)

// История рук игрока
getPlayerHandHistory(address player)

// История рук за столом
getTableHandHistory(string memory tableId)
```

#### События

```solidity
event TableCreated(string indexed tableId, uint8 maxPlayers, uint256 minBet, uint256 maxBet)
event PlayerJoined(string indexed tableId, address indexed player, uint256 stake)
event PlayerLeft(string indexed tableId, address indexed player)
event HandStarted(string indexed tableId, uint256 indexed handId)
event GameEnded(string indexed tableId, uint256 indexed handId, address indexed winner, uint256 payout)
event BetPlaced(string indexed tableId, address indexed player, uint256 amount)
event FundsDeposited(address indexed player, uint256 amount)
event FundsWithdrawn(address indexed player, uint256 amount)
```

#### Комиссия платформы

- **Размер**: 0.5% (5 из 1000)
- **Применяется**: На выигрыши
- **Управление**: Только владелец контракта может вывести

```solidity
// Вывести комиссии платформы (только владелец)
withdrawPlatformFees(uint256 amount)

// Получить статистику платформы
getPlatformStats() returns (uint256 fees, uint256 totalHands)
```

### Развертывание контракта

#### На Hardhat (локальная сеть)

```bash
cd contracts
npm run deploy
```

#### На Sepolia (тестовая сеть)

```bash
# Обновите .env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/<YOUR_INFURA_KEY>
PRIVATE_KEY=<YOUR_PRIVATE_KEY>

# Убедитесь, что у вас есть Sepolia ETH на кране:
# https://sepoliafaucet.com

npx hardhat run scripts/deploy.js --network sepolia
```

#### На Mainnet

```bash
# ⚠️ ВАЖНО: Используйте реальные средства осторожно!

# Обновите .env
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/<YOUR_ALCHEMY_KEY>
PRIVATE_KEY=<YOUR_PRIVATE_KEY>

npx hardhat run scripts/deploy.js --network mainnet
```

---

## 🧪 Тестирование

### Unit тесты контракта

```bash
cd contracts
npm test
```

**Результат:**
```
PokerGame
  Deployment
    ✓ Should deploy successfully
  Funds Management
    ✓ Should allow deposit
    ✓ Should allow withdrawal
  Table Management
    ✓ Should create table with correct parameters
    ✓ Should allow player to join table
    ✓ Should track player stake
  Game Flow
    ✓ Should start hand
    ✓ Should process bet
    ✓ Should end game and payout winner
  Edge Cases
    ✓ Should reject invalid table size
    ✓ Should prevent joining table twice

11 passing
```

### Интеграционные тесты

```bash
# Запустите Hardhat node
npx hardhat node

# В другом терминале
npm test
```

### Ручное тестирование

1. Откройте http://localhost:3000
2. Создайте лобби
3. Создайте стол
4. Присоединитесь с разными браузерами/вкладками
5. Тестируйте действия: Fold, Check, Call, Raise, All-in

---

## 🔐 Безопасность

### Аудит контракта

Перед продакшеном на Mainnet:

```bash
# Используйте tools для анализа
npm install --save-dev hardhat-docgen slither-analyzer

# Документируйте контракт
npm hardhat docgen

# Анализируйте безопасность
slither contracts/PokerGame.sol
```

### Best Practices

✅ Все транзакции проверяются  
✅ Используется OpenZeppelin patterns  
✅ Комиссия платформы предотвращает эксплуатацию  
✅ Fallback функция для простых депозитов  
✅ Защита от re-entrancy  

⚠️ **Рекомендации для production:**
- Проведите профессиональный аудит
- Используйте Chainlink VRF для RNG
- Добавьте rate limiting
- Используйте proxy pattern для обновлений

---

## 🐛 Troubleshooting

### "Cannot connect to WebSocket"

**Проблема**: WebSocket подключение отказывает в соединении

```
WebSocket connection failed
```

**Решение**:
1. Проверьте, что бекенд запущен (`npm start` в backend)
2. Проверьте порт 8081:
   ```bash
   # Windows
   netstat -ano | findstr :8081
   
   # Mac/Linux
   lsof -i :8081
   ```
3. Проверьте `NEXT_PUBLIC_WS_URL` в frontend/.env.local
4. Перезагрузите браузер

### "Contract address is invalid"

**Проблема**: 
```
Error: Invalid contract address
```

**Решение**:
1. Проверьте, что `CONTRACT_ADDRESS` установлен в backend/.env
2. Разверните контракт заново: `npm run deploy` в contracts
3. Скопируйте новый адрес

### "Insufficient balance"

**Проблема**: При присоединении к столу
```
Error: Insufficient balance
```

**Решение**:
1. Сделайте депозит ETH (используйте тестовые кошельки Hardhat)
2. Используйте кран для Sepolia: https://sepoliafaucet.com
3. Проверьте баланс в контракте

### MetaMask не видит контракт

**Проблема**: Can't read contract state

**Решение**:
1. Добавьте сеть в MetaMask:
   - **Network Name**: Hardhat Local
   - **RPC URL**: http://127.0.0.1:8545
   - **Chain ID**: 31337
2. Импортируйте аккаунт Hardhat в MetaMask
3. Убедитесь, что контракт развернут

### "Port already in use"

**Проблема**: 
```
Error: listen EADDRINUSE: address already in use :::8080
```

**Решение**:
```bash
# Найдите процесс
netstat -ano | findstr :8080

# Убейте процесс (замените PID)
taskkill /PID <PID> /F

# Или используйте другой порт
PORT=8090 npm start
```

### Неверные действия в игре

**Проблема**: "Cannot check, must match bet"

**Решение**: Это нормально - следуйте правилам покера:
- **Check**: Только если текущая ставка = вашей ставке
- **Call**: Уравняйте текущую ставку
- **Raise**: Увеличьте ставку
- **Fold**: Сбросьте карты

---

## 📈 Мониторинг и Логирование

### Backend логи

```bash
# Просмотрите консоль бекенда
# Вы увидите: WebSocket подключения, действия игроков, ошибки

# Для более детального логирования добавьте:
# NODE_DEBUG=* npm start
```

### Frontend логи

```javascript
// В консоли браузера (F12)
// Посмотрите Network tab для API запросов
// Посмотрите Console для ошибок WebSocket
```

### Contract события

```bash
# Посмотрите события контракта
npx hardhat run -c "hardhat" scripts/monitorEvents.js

# Или используйте Etherscan для Sepolia/Mainnet
```

---

## 🚀 Deployment на Production

### 1. Frontend (Vercel)

```bash
# Установите Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel deploy
```

### 2. Backend (Railway/Heroku)

```bash
# Установите Railway CLI
npm install -g @railway/cli

# Deploy
cd backend
railway deploy
```

### 3. Smart Contract (Ethereum Mainnet)

```bash
# ⚠️ Используйте настоящие ETH
# Убедитесь что контракт прошел аудит!

cd contracts
npm run deploy -- --network mainnet
```

---

## 📞 Поддержка

- **Issues**: Создайте GitHub issue
- **Discussions**: GitHub discussions
- **Email**: support@pokergame.dev

---

**Версия**: 1.0.0  
**Последнее обновление**: Февраль 2026  
**Лицензия**: MIT

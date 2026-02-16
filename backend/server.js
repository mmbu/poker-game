const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Game state management
const lobbies = new Map();
const tables = new Map();
const players = new Map();

// Poker game logic
class PokerTable {
  constructor(tableId, maxPlayers, minBet, maxBet) {
    this.tableId = tableId;
    this.maxPlayers = maxPlayers;
    this.minBet = minBet;
    this.maxBet = maxBet;
    this.seats = new Array(maxPlayers).fill(null);
    this.gameState = 'waiting'; // waiting, preflop, flop, turn, river, showdown
    this.pot = 0;
    this.deck = [];
    this.communityCards = [];
    this.button = 0;
    this.smallBlind = 0;
    this.bigBlind = 1;
    this.currentBet = 0;
    this.activePlayer = this.bigBlind + 1;
    this.actions = [];
    this.handHistory = [];
  }

  addPlayer(playerId, playerName, stake) {
    const seatIndex = this.seats.findIndex(seat => seat === null);
    if (seatIndex === -1) return { success: false, error: 'Table full' };
    
    this.seats[seatIndex] = {
      playerId,
      playerName,
      stake,
      cards: [],
      bet: 0,
      folded: false,
      allIn: false,
      isActive: true
    };
    return { success: true, seatIndex };
  }

  removePlayer(playerId) {
    const seatIndex = this.seats.findIndex(seat => seat && seat.playerId === playerId);
    if (seatIndex !== -1) {
      this.seats[seatIndex] = null;
    }
    return seatIndex;
  }

  initializeDeck() {
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
    this.deck = [];
    for (let suit of suits) {
      for (let rank of ranks) {
        this.deck.push({ rank, suit });
      }
    }
    this.shuffleDeck();
  }

  shuffleDeck() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  dealCards() {
    this.initializeDeck();
    const activePlayers = this.seats.filter(s => s !== null);
    for (let player of activePlayers) {
      player.cards = [this.deck.pop(), this.deck.pop()];
    }
  }

  flopCards() {
    if (this.deck.length >= 3) {
      this.communityCards = [this.deck.pop(), this.deck.pop(), this.deck.pop()];
    }
  }

  turnCard() {
    if (this.deck.length >= 1) {
      this.communityCards.push(this.deck.pop());
    }
  }

  riverCard() {
    if (this.deck.length >= 1) {
      this.communityCards.push(this.deck.pop());
    }
  }

  startHand() {
    this.gameState = 'preflop';
    this.pot = 0;
    this.communityCards = [];
    this.currentBet = 0;
    this.actions = [];
    
    // Reset player states
    this.seats.forEach(seat => {
      if (seat) {
        seat.bet = 0;
        seat.folded = false;
        seat.allIn = false;
      }
    });

    // Post blinds
    const smallBlindAmount = this.minBet;
    const bigBlindAmount = this.minBet * 2;

    const sbSeat = this.seats[this.smallBlind];
    const bbSeat = this.seats[this.bigBlind];

    if (sbSeat) {
      sbSeat.bet = Math.min(smallBlindAmount, sbSeat.stake);
      this.pot += sbSeat.bet;
      sbSeat.stake -= sbSeat.bet;
    }

    if (bbSeat) {
      bbSeat.bet = Math.min(bigBlindAmount, bbSeat.stake);
      this.pot += bbSeat.bet;
      bbSeat.stake -= bbSeat.bet;
    }

    this.currentBet = bigBlindAmount;
    this.dealCards();
  }

  processAction(playerId, action, amount) {
    const playerSeat = this.seats.find(s => s && s.playerId === playerId);
    if (!playerSeat) return { success: false, error: 'Player not found' };

    const actionRecord = { playerId, action, amount, timestamp: Date.now() };

    switch (action) {
      case 'fold':
        playerSeat.folded = true;
        break;
      case 'check':
        if (playerSeat.bet < this.currentBet) {
          return { success: false, error: 'Cannot check, must match bet' };
        }
        break;
      case 'call':
        const callAmount = Math.min(this.currentBet - playerSeat.bet, playerSeat.stake);
        playerSeat.stake -= callAmount;
        playerSeat.bet += callAmount;
        this.pot += callAmount;
        break;
      case 'raise':
        if (amount < this.minBet || amount > this.maxBet) {
          return { success: false, error: 'Bet outside limits' };
        }
        const raiseAmount = Math.min(amount, playerSeat.stake);
        playerSeat.stake -= raiseAmount;
        playerSeat.bet += raiseAmount;
        this.pot += raiseAmount;
        this.currentBet = playerSeat.bet;
        break;
      case 'all-in':
        const allInAmount = playerSeat.stake;
        playerSeat.stake = 0;
        playerSeat.bet += allInAmount;
        this.pot += allInAmount;
        playerSeat.allIn = true;
        break;
    }

    this.actions.push(actionRecord);
    return { success: true };
  }

  getTableState() {
    return {
      tableId: this.tableId,
      maxPlayers: this.maxPlayers,
      seats: this.seats.map(seat => seat ? {
        playerId: seat.playerId,
        playerName: seat.playerName,
        stake: seat.stake,
        bet: seat.bet,
        folded: seat.folded,
        allIn: seat.allIn,
        cardsCount: seat.cards.length
      } : null),
      gameState: this.gameState,
      pot: this.pot,
      communityCards: this.communityCards,
      currentBet: this.currentBet,
      activePlayer: this.activePlayer,
      button: this.button
    };
  }
}

// REST API endpoints
app.get('/api/lobbies', (req, res) => {
  const lobbiesList = Array.from(lobbies.values()).map(lobby => ({
    id: lobby.id,
    name: lobby.name,
    tableSize: lobby.tableSize,
    playersCount: lobby.players.length,
    minBet: lobby.minBet,
    maxBet: lobby.maxBet,
    createdAt: lobby.createdAt
  }));
  res.json(lobbiesList);
});

app.post('/api/lobbies', (req, res) => {
  const { name, tableSize, minBet, maxBet } = req.body;
  if (![1, 6, 9].includes(tableSize)) {
    return res.status(400).json({ error: 'Invalid table size. Must be 1, 6, or 9' });
  }

  const lobbyId = uuidv4();
  const lobby = {
    id: lobbyId,
    name,
    tableSize,
    minBet,
    maxBet,
    players: [],
    createdAt: new Date(),
    tables: []
  };

  lobbies.set(lobbyId, lobby);
  res.json({ lobbyId, ...lobby });
});

app.get('/api/tables/:tableId', (req, res) => {
  const { tableId } = req.params;
  const table = tables.get(tableId);

  if (!table) {
    return res.status(404).json({ error: 'Table not found' });
  }

  res.json(table.getTableState());
});

app.post('/api/tables', (req, res) => {
  const { lobbyId, minBet, maxBet, tableSize } = req.body;
  const tableId = uuidv4();

  const table = new PokerTable(tableId, tableSize, minBet, maxBet);
  tables.set(tableId, table);

  const lobby = lobbies.get(lobbyId);
  if (lobby) {
    lobby.tables.push(tableId);
  }

  res.json({ tableId, ...table.getTableState() });
});

// WebSocket handlers
wss.on('connection', (ws) => {
  const playerId = uuidv4();
  players.set(playerId, { ws, tableId: null, lobbyId: null });

  ws.send(JSON.stringify({ type: 'connected', playerId }));

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      handleWebSocketMessage(playerId, message, ws);
    } catch (error) {
      console.error('Error handling message:', error);
      ws.send(JSON.stringify({ type: 'error', error: 'Invalid message' }));
    }
  });

  ws.on('close', () => {
    const player = players.get(playerId);
    if (player && player.tableId) {
      const table = tables.get(player.tableId);
      if (table) {
        table.removePlayer(playerId);
        broadcastTableUpdate(player.tableId);
      }
    }
    players.delete(playerId);
  });
});

function handleWebSocketMessage(playerId, message, ws) {
  const { type, payload } = message;
  const player = players.get(playerId);

  switch (type) {
    case 'join-table':
      handleJoinTable(playerId, payload, ws);
      break;
    case 'action':
      handlePlayerAction(playerId, payload);
      break;
    case 'start-hand':
      handleStartHand(playerId, payload);
      break;
    case 'leave-table':
      handleLeaveTable(playerId);
      break;
  }
}

function handleJoinTable(playerId, payload, ws) {
  const { tableId, playerName, stake } = payload;
  const table = tables.get(tableId);

  if (!table) {
    ws.send(JSON.stringify({ type: 'error', error: 'Table not found' }));
    return;
  }

  const result = table.addPlayer(playerId, playerName, stake);
  if (!result.success) {
    ws.send(JSON.stringify({ type: 'error', error: result.error }));
    return;
  }

  const player = players.get(playerId);
  player.tableId = tableId;

  ws.send(JSON.stringify({ 
    type: 'joined-table', 
    tableState: table.getTableState(),
    seatIndex: result.seatIndex
  }));

  broadcastTableUpdate(tableId);
}

function handlePlayerAction(playerId, payload) {
  const player = players.get(playerId);
  if (!player || !player.tableId) return;

  const table = tables.get(player.tableId);
  if (!table) return;

  const { action, amount } = payload;
  const result = table.processAction(playerId, action, amount);

  if (result.success) {
    broadcastTableUpdate(player.tableId);
  }
}

function handleStartHand(playerId, payload) {
  const player = players.get(playerId);
  if (!player || !player.tableId) return;

  const table = tables.get(player.tableId);
  if (!table) return;

  table.startHand();
  broadcastTableUpdate(player.tableId);
}

function handleLeaveTable(playerId) {
  const player = players.get(playerId);
  if (!player || !player.tableId) return;

  const table = tables.get(player.tableId);
  if (table) {
    table.removePlayer(playerId);
    broadcastTableUpdate(player.tableId);
  }
  player.tableId = null;
}

function broadcastTableUpdate(tableId) {
  const table = tables.get(tableId);
  if (!table) return;

  const tableState = table.getTableState();
  const message = JSON.stringify({ type: 'table-update', tableState });

  players.forEach((player) => {
    if (player.tableId === tableId && player.ws.readyState === WebSocket.OPEN) {
      player.ws.send(message);
    }
  });
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Poker game server running on port ${PORT}`);
  console.log(`WebSocket server running on port 8081`);
});

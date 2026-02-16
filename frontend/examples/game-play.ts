/**
 * Example: Playing a poker game
 */

import WebSocketManager from './lib/websocket';
import { useGameStore } from './lib/gameStore';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8081';

async function playPokerGame() {
  // Initialize WebSocket
  const ws = new WebSocketManager(WS_URL);

  // Set up message handlers
  ws.on('connected', (msg) => {
    console.log('Connected to server:', msg.playerId);
    const { setPlayerId } = useGameStore.getState();
    setPlayerId(msg.playerId);
  });

  ws.on('joined-table', (msg) => {
    console.log('Joined table:', msg.tableState.tableId);
    const { setTableState } = useGameStore.getState();
    setTableState(msg.tableState);
  });

  ws.on('table-update', (msg) => {
    console.log('Table updated:', msg.tableState);
    const { setTableState } = useGameStore.getState();
    setTableState(msg.tableState);
  });

  // Connect to server
  console.log('Connecting to WebSocket server...');
  await ws.connect();

  // Wait for connection
  setTimeout(() => {
    // Join a table
    const tableId = 'table-001';
    const playerName = 'Player1';
    const stake = 1000;

    console.log(`Joining table ${tableId}...`);
    ws.send('join-table', {
      tableId,
      playerName,
      stake,
    });
  }, 1000);

  // After joining, start a hand
  setTimeout(() => {
    console.log('Starting hand...');
    ws.send('start-hand', {});
  }, 2000);

  // Simulate player actions
  setTimeout(() => {
    console.log('Placing bet of 100...');
    ws.send('action', {
      action: 'raise',
      amount: 100,
    });
  }, 3000);

  // Keep connection alive
  setTimeout(() => {
    console.log('Calling bet...');
    ws.send('action', {
      action: 'call',
    });
  }, 4000);
}

export { playPokerGame };

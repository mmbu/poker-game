import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useGameStore } from '../../lib/gameStore';
import WebSocketManager from '../../lib/websocket';

interface TableState {
  tableId: string;
  maxPlayers: number;
  seats: any[];
  gameState: string;
  pot: number;
  communityCards: any[];
  currentBet: number;
  activePlayer: number;
}

export default function PokerTable() {
  const router = useRouter();
  const { id: tableId } = router.query;
  const [tableState, setTableState] = useState<TableState | null>(null);
  const [ws, setWs] = useState<WebSocketManager | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [stake, setStake] = useState('100');
  const [joined, setJoined] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState('10');

  useEffect(() => {
    if (!tableId) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8081';
    const wsManager = new WebSocketManager(wsUrl);

    wsManager.connect().then(() => {
      wsManager.on('connected', (msg: any) => {
        console.log('Connected to server:', msg.playerId);
      });

      wsManager.on('joined-table', (msg: any) => {
        setTableState(msg.tableState);
        setJoined(true);
      });

      wsManager.on('table-update', (msg: any) => {
        setTableState(msg.tableState);
      });

      wsManager.on('error', (msg: any) => {
        alert('Error: ' + msg.error);
      });

      setWs(wsManager);
    });

    return () => {
      if (wsManager) {
        wsManager.disconnect();
      }
    };
  }, [tableId]);

  const handleJoinTable = () => {
    if (!ws || !tableId || !playerName) {
      alert('Please enter your name');
      return;
    }

    ws.send('join-table', {
      tableId,
      playerName,
      stake: parseInt(stake)
    });
  };

  const handlePlayerAction = (action: string, amount?: number) => {
    if (!ws) return;

    ws.send('action', {
      action,
      amount: amount || 0
    });
  };

  const handleStartHand = () => {
    if (!ws) return;
    ws.send('start-hand', {});
  };

  const getCardDisplay = (card: any) => {
    return card ? `${card.rank}${card.suit}` : '';
  };

  if (!tableId) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;
  }

  if (!joined) {
    return (
      <div style={{ padding: '20px', maxWidth: '400px', margin: '100px auto' }}>
        <h1>Join Poker Table</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            style={{
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
          <input
            type="number"
            placeholder="Starting stake"
            value={stake}
            onChange={(e) => setStake(e.target.value)}
            min="10"
            style={{
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
          <button
            onClick={handleJoinTable}
            style={{
              padding: '12px',
              fontSize: '16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Join Table
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#0d5f0d', minHeight: '100vh', color: 'white' }}>
      <h1>🎮 Poker Table</h1>

      {tableState && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr 1fr',
          gap: '20px',
          marginBottom: '20px'
        }}>
          {/* Left: Player Stats */}
          <div style={{
            backgroundColor: 'rgba(0,0,0,0.3)',
            padding: '15px',
            borderRadius: '8px'
          }}>
            <h3>Table Info</h3>
            <p><strong>Max Players:</strong> {tableState.maxPlayers}</p>
            <p><strong>Game State:</strong> {tableState.gameState}</p>
            <p><strong>Pot:</strong> 💰 {tableState.pot}</p>
            <p><strong>Current Bet:</strong> {tableState.currentBet}</p>
          </div>

          {/* Center: Game Board */}
          <div style={{
            textAlign: 'center',
            backgroundColor: 'rgba(0,0,0,0.3)',
            padding: '20px',
            borderRadius: '8px'
          }}>
            <h3>Community Cards</h3>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '10px',
              marginBottom: '20px',
              fontSize: '24px'
            }}>
              {tableState.communityCards.length > 0 ? (
                tableState.communityCards.map((card, idx) => (
                  <div key={idx} style={{
                    width: '60px',
                    height: '90px',
                    backgroundColor: 'white',
                    color: 'black',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px',
                    fontWeight: 'bold'
                  }}>
                    {getCardDisplay(card)}
                  </div>
                ))
              ) : (
                <p>No community cards yet</p>
              )}
            </div>

            <button
              onClick={handleStartHand}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                backgroundColor: '#ff9800',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Start Hand
            </button>
          </div>

          {/* Right: Seats */}
          <div style={{
            backgroundColor: 'rgba(0,0,0,0.3)',
            padding: '15px',
            borderRadius: '8px',
            maxHeight: '300px',
            overflow: 'auto'
          }}>
            <h3>Seats</h3>
            {tableState.seats.map((seat, idx) => (
              <div key={idx} style={{
                padding: '10px',
                marginBottom: '5px',
                backgroundColor: idx === tableState.activePlayer ? '#4CAF50' : '#333',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                {seat ? (
                  <>
                    <p><strong>Seat {idx + 1}:</strong> {seat.playerName}</p>
                    <p>Stake: 💰 {seat.stake}</p>
                    <p>Bet: {seat.bet}</p>
                    {seat.folded && <p style={{ color: '#ff9800' }}>FOLDED</p>}
                    {seat.allIn && <p style={{ color: '#ff6b6b' }}>ALL-IN</p>}
                  </>
                ) : (
                  <p>Empty</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
        gap: '10px',
        marginTop: '20px'
      }}>
        <button
          onClick={() => handlePlayerAction('fold')}
          style={{
            padding: '15px',
            fontSize: '16px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          FOLD
        </button>

        <button
          onClick={() => handlePlayerAction('check')}
          style={{
            padding: '15px',
            fontSize: '16px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          CHECK
        </button>

        <button
          onClick={() => handlePlayerAction('call')}
          style={{
            padding: '15px',
            fontSize: '16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          CALL
        </button>

        <button
          onClick={() => handlePlayerAction('raise', parseInt(betAmount))}
          style={{
            padding: '15px',
            fontSize: '16px',
            backgroundColor: '#ff9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          RAISE
        </button>

        <button
          onClick={() => handlePlayerAction('all-in')}
          style={{
            padding: '15px',
            fontSize: '16px',
            backgroundColor: '#e91e63',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ALL-IN
        </button>
      </div>

      <div style={{ marginTop: '15px' }}>
        <input
          type="number"
          placeholder="Bet amount"
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
          min="1"
          style={{
            padding: '10px',
            fontSize: '14px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            width: '150px'
          }}
        />
      </div>
    </div>
  );
}

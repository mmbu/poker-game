import { useEffect, useState } from 'react';
import { useGameStore } from '../lib/gameStore';
import WebSocketManager from '../lib/websocket';
import { getLobbies } from '../lib/api';
import Link from 'next/link';

export default function Home() {
  const [lobbies, setLobbies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { setConnected } = useGameStore();

  useEffect(() => {
    const loadLobbies = async () => {
      try {
        const data = await getLobbies();
        setLobbies(data);
      } catch (error) {
        console.error('Error loading lobbies:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLobbies();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h1>Loading lobbies...</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🎰 Poker Game Lobbies</h1>
      
      <Link href="/create-lobby">
        <button style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}>
          + Create New Lobby
        </button>
      </Link>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {lobbies.map((lobby) => (
          <div key={lobby.id} style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#f9f9f9'
          }}>
            <h3>{lobby.name}</h3>
            <p><strong>Table Size:</strong> {lobby.tableSize} players</p>
            <p><strong>Players:</strong> {lobby.playersCount}</p>
            <p><strong>Blind:</strong> {lobby.minBet} - {lobby.maxBet}</p>
            <Link href={`/lobby/${lobby.id}`}>
              <button style={{
                padding: '8px 16px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                width: '100%'
              }}>
                Join Lobby
              </button>
            </Link>
          </div>
        ))}
      </div>

      {lobbies.length === 0 && (
        <p style={{ textAlign: 'center', marginTop: '40px', color: '#666' }}>
          No lobbies available. Create one to get started!
        </p>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useRouter } from 'next/router';
import { createLobby } from '../lib/api';

export default function CreateLobby() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    tableSize: 6,
    minBet: 1,
    maxBet: 100
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const lobby = await createLobby(
        formData.name,
        formData.tableSize,
        formData.minBet,
        formData.maxBet
      );
      router.push(`/lobby/${lobby.id}`);
    } catch (error) {
      console.error('Error creating lobby:', error);
      alert('Failed to create lobby');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Create New Lobby</h1>

      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Lobby Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., High Stakes Game"
            required
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Table Size
          </label>
          <select
            value={formData.tableSize}
            onChange={(e) => setFormData({ ...formData, tableSize: parseInt(e.target.value) })}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          >
            <option value={1}>1 Player (Heads-up)</option>
            <option value={6}>6 Players</option>
            <option value={9}>9 Players (Full Ring)</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Min Bet
            </label>
            <input
              type="number"
              value={formData.minBet}
              onChange={(e) => setFormData({ ...formData, minBet: parseInt(e.target.value) })}
              min="1"
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Max Bet
            </label>
            <input
              type="number"
              value={formData.maxBet}
              onChange={(e) => setFormData({ ...formData, maxBet: parseInt(e.target.value) })}
              min={formData.minBet}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px',
            fontSize: '16px',
            backgroundColor: loading ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Creating...' : 'Create Lobby'}
        </button>
      </form>
    </div>
  );
}

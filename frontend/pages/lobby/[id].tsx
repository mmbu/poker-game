import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getTableState, createTable } from '../../lib/api';

export default function Lobby() {
  const router = useRouter();
  const { id: lobbyId } = router.query;
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingTable, setCreatingTable] = useState(false);

  useEffect(() => {
    if (!lobbyId) return;

    const loadTables = async () => {
      try {
        setLoading(true);
        // В реальном приложении здесь был бы API запрос
        // Для демонстрации создаем пустой список
        setTables([]);
      } catch (error) {
        console.error('Error loading tables:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTables();
  }, [lobbyId]);

  const handleCreateTable = async (tableSize: number) => {
    if (!lobbyId) return;
    
    setCreatingTable(true);
    try {
      const table = await createTable(lobbyId as string, 1, 100, tableSize);
      router.push(`/table/${table.tableId}`);
    } catch (error) {
      console.error('Error creating table:', error);
      alert('Failed to create table');
    } finally {
      setCreatingTable(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h1>Loading lobby...</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <Link href="/" style={{ textDecoration: 'none' }}>
        <button style={{
          padding: '10px 20px',
          backgroundColor: '#666',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}>
          ← Back to Lobbies
        </button>
      </Link>

      <h1>Available Tables</h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {tables.length === 0 && (
          <p style={{ gridColumn: '1/-1', color: '#666' }}>
            No tables available in this lobby yet.
          </p>
        )}
        {tables.map((table) => (
          <div key={table.tableId} style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#f9f9f9'
          }}>
            <h3>Table {table.tableId.substring(0, 8)}</h3>
            <p><strong>Players:</strong> {table.playersCount}/{table.maxPlayers}</p>
            <p><strong>Stakes:</strong> {table.minBet} - {table.maxBet}</p>
            <Link href={`/table/${table.tableId}`}>
              <button style={{
                padding: '8px 16px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                width: '100%'
              }}>
                Join Table
              </button>
            </Link>
          </div>
        ))}
      </div>

      <h2>Create New Table</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '10px'
      }}>
        {[1, 6, 9].map((size) => (
          <button
            key={size}
            onClick={() => handleCreateTable(size)}
            disabled={creatingTable}
            style={{
              padding: '15px',
              fontSize: '16px',
              backgroundColor: creatingTable ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: creatingTable ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {size} Player {size === 1 ? '(HU)' : size === 6 ? '(6-Max)' : '(9-Max)'}
          </button>
        ))}
      </div>
    </div>
  );
}

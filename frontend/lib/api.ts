import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getLobbies = async () => {
  const response = await api.get('/api/lobbies');
  return response.data;
};

export const createLobby = async (name: string, tableSize: number, minBet: number, maxBet: number) => {
  const response = await api.post('/api/lobbies', { name, tableSize, minBet, maxBet });
  return response.data;
};

export const createTable = async (lobbyId: string, minBet: number, maxBet: number, tableSize: number) => {
  const response = await api.post('/api/tables', { lobbyId, minBet, maxBet, tableSize });
  return response.data;
};

export const getTableState = async (tableId: string) => {
  const response = await api.get(`/api/tables/${tableId}`);
  return response.data;
};

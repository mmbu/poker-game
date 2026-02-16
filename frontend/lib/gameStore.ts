import create from 'zustand';

interface Player {
  playerId: string;
  playerName: string;
  stake: number;
  bet: number;
  folded: boolean;
  allIn: boolean;
}

interface TableState {
  tableId: string;
  maxPlayers: number;
  seats: (Player | null)[];
  gameState: string;
  pot: number;
  communityCards: any[];
  currentBet: number;
  activePlayer: number;
  button: number;
}

interface GameStore {
  playerId: string | null;
  playerName: string;
  tableId: string | null;
  seatIndex: number | null;
  currentStake: number;
  tableState: TableState | null;
  connected: boolean;
  setPlayerId: (id: string) => void;
  setPlayerName: (name: string) => void;
  setTableId: (id: string | null) => void;
  setSeatIndex: (index: number | null) => void;
  setCurrentStake: (stake: number) => void;
  setTableState: (state: TableState) => void;
  setConnected: (connected: boolean) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  playerId: null,
  playerName: '',
  tableId: null,
  seatIndex: null,
  currentStake: 0,
  tableState: null,
  connected: false,
  setPlayerId: (id) => set({ playerId: id }),
  setPlayerName: (name) => set({ playerName: name }),
  setTableId: (id) => set({ tableId: id }),
  setSeatIndex: (index) => set({ seatIndex: index }),
  setCurrentStake: (stake) => set({ currentStake: stake }),
  setTableState: (state) => set({ tableState: state }),
  setConnected: (connected) => set({ connected }),
}));

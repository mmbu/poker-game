/**
 * Configuration for Poker Game
 */

module.exports = {
  // Game settings
  game: {
    maxPlayersPerTable: {
      heads_up: 1,
      six_max: 6,
      full_ring: 9,
    },
    blindStructures: [
      { smallBlind: 1, bigBlind: 2 },
      { smallBlind: 2, bigBlind: 5 },
      { smallBlind: 5, bigBlind: 10 },
      { smallBlind: 10, bigBlind: 20 },
      { smallBlind: 25, bigBlind: 50 },
      { smallBlind: 50, bigBlind: 100 },
    ],
    minBuyIn: 20,
    maxBuyIn: 10000,
  },

  // Ethereum settings
  ethereum: {
    networks: {
      hardhat: {
        chainId: 31337,
        rpcUrl: 'http://localhost:8545',
      },
      sepolia: {
        chainId: 11155111,
        rpcUrl: process.env.SEPOLIA_RPC_URL,
      },
      mainnet: {
        chainId: 1,
        rpcUrl: process.env.MAINNET_RPC_URL,
      },
    },
    platformFee: 5, // 0.5%
  },

  // Server settings
  server: {
    port: process.env.PORT || 8080,
    wsPort: process.env.WS_PORT || 8081,
    environment: process.env.NODE_ENV || 'development',
  },

  // Frontend settings
  frontend: {
    apiUrl: process.env.API_URL || 'http://localhost:8080',
    wsUrl: process.env.WS_URL || 'ws://localhost:8081',
  },

  // Timeouts (in seconds)
  timeouts: {
    playerActionTimeout: 60,
    tableInactivityTimeout: 300,
    handDealTimeout: 5,
    streetActionTimeout: 60,
  },
};

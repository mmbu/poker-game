/**
 * Example: Using Poker Game with Web3
 */

import Web3Manager from './lib/web3Manager';

const POKER_CONTRACT_ADDRESS = '0x5FbDB2315678afccb333f8a9c6122c7960e1674c';

async function exampleUsage() {
  try {
    // Initialize Web3 Manager
    const web3 = new Web3Manager(POKER_CONTRACT_ADDRESS);

    console.log('Connecting to Web3...');
    const connected = await web3.connect();

    if (!connected) {
      throw new Error('Failed to connect to Web3');
    }

    const account = web3.getAccount();
    console.log('Connected account:', account);

    // Deposit 1 ETH
    console.log('Depositing 1 ETH...');
    const depositReceipt = await web3.depositFunds(1);
    console.log('Deposit confirmed:', depositReceipt.hash);

    // Get player account info
    console.log('Getting player account...');
    const playerAccount = await web3.getPlayerAccount(account);
    console.log('Player account:', playerAccount);

    // Join a table with 0.5 ETH stake
    const tableId = 'table-001';
    console.log(`Joining table ${tableId}...`);
    const joinReceipt = await web3.joinTable(tableId, 0.5);
    console.log('Joined table:', joinReceipt.hash);

    // Get player stake at table
    const stake = await web3.getPlayerStake(tableId, account);
    console.log('Your stake:', stake, 'ETH');

    // Get table info
    const tableInfo = await web3.getTableInfo(tableId);
    console.log('Table info:', tableInfo);

    // Listen for account changes
    web3.onAccountChanged((accounts) => {
      console.log('Account changed:', accounts[0]);
    });

    // Listen for network changes
    web3.onChainChanged((chainId) => {
      console.log('Network changed:', chainId);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

export { exampleUsage };

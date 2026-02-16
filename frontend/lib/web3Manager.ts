import { ethers } from 'ethers';

const POKER_GAME_ABI = [
  'function depositFunds() external payable',
  'function withdrawFunds(uint256 amount) external',
  'function createTable(string memory tableId, uint8 maxPlayers, uint256 minBet, uint256 maxBet) external',
  'function joinTable(string memory tableId, uint256 stake) external',
  'function leaveTable(string memory tableId) external',
  'function placeBet(string memory tableId, uint256 amount) external',
  'function endGame(string memory tableId, address winner, uint256 payout) external',
  'function startHand(string memory tableId) external',
  'function getTableInfo(string memory tableId) external view returns (tuple(string tableId, uint8 maxPlayers, uint256 minBet, uint256 maxBet, address[] players, bool isActive, uint256 createdAt, uint256 totalPot, string gameState))',
  'function getPlayerAccount(address player) external view returns (tuple(uint256 balance, uint256 totalStaked, uint256 totalWon, uint256 handCount, bool exists))',
  'function getPlayerStake(address player, string memory tableId) external view returns (uint256)',
  'function getTablePlayers(string memory tableId) external view returns (address[])',
];

class Web3Manager {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;
  private contractAddress: string;
  private account: string | null = null;

  constructor(contractAddress: string) {
    this.contractAddress = contractAddress;
  }

  async connect(): Promise<boolean> {
    try {
      // Check if Web3 is available
      if (!window.ethereum) {
        throw new Error('MetaMask not installed');
      }

      // Create provider
      this.provider = new ethers.BrowserProvider(window.ethereum);

      // Request accounts
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      this.account = accounts[0];

      // Get signer
      this.signer = await this.provider.getSigner();

      // Create contract instance
      this.contract = new ethers.Contract(
        this.contractAddress,
        POKER_GAME_ABI,
        this.signer
      );

      return true;
    } catch (error) {
      console.error('Failed to connect Web3:', error);
      return false;
    }
  }

  isConnected(): boolean {
    return this.contract !== null && this.account !== null;
  }

  getAccount(): string | null {
    return this.account;
  }

  async depositFunds(amountInETH: number): Promise<any> {
    if (!this.contract) throw new Error('Contract not connected');

    const amountInWei = ethers.parseEther(amountInETH.toString());
    const tx = await this.contract.depositFunds({ value: amountInWei });
    const receipt = await tx.wait();
    return receipt;
  }

  async withdrawFunds(amountInETH: number): Promise<any> {
    if (!this.contract) throw new Error('Contract not connected');

    const amountInWei = ethers.parseEther(amountInETH.toString());
    const tx = await this.contract.withdrawFunds(amountInWei);
    const receipt = await tx.wait();
    return receipt;
  }

  async joinTable(tableId: string, stakeInETH: number): Promise<any> {
    if (!this.contract) throw new Error('Contract not connected');

    const stakeInWei = ethers.parseEther(stakeInETH.toString());
    const tx = await this.contract.joinTable(tableId, stakeInWei);
    const receipt = await tx.wait();
    return receipt;
  }

  async leaveTable(tableId: string): Promise<any> {
    if (!this.contract) throw new Error('Contract not connected');

    const tx = await this.contract.leaveTable(tableId);
    const receipt = await tx.wait();
    return receipt;
  }

  async placeBet(tableId: string, amountInETH: number): Promise<any> {
    if (!this.contract) throw new Error('Contract not connected');

    const amountInWei = ethers.parseEther(amountInETH.toString());
    const tx = await this.contract.placeBet(tableId, amountInWei);
    const receipt = await tx.wait();
    return receipt;
  }

  async getPlayerAccount(playerAddress: string): Promise<any> {
    if (!this.contract) throw new Error('Contract not connected');

    const account = await this.contract.getPlayerAccount(playerAddress);
    return {
      balance: ethers.formatEther(account[0]),
      totalStaked: ethers.formatEther(account[1]),
      totalWon: ethers.formatEther(account[2]),
      handCount: account[3].toString(),
      exists: account[4],
    };
  }

  async getPlayerStake(tableId: string, playerAddress: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not connected');

    const stake = await this.contract.getPlayerStake(playerAddress, tableId);
    return ethers.formatEther(stake);
  }

  async getTableInfo(tableId: string): Promise<any> {
    if (!this.contract) throw new Error('Contract not connected');

    const table = await this.contract.getTableInfo(tableId);
    return {
      tableId: table[0],
      maxPlayers: table[1].toString(),
      minBet: ethers.formatEther(table[2]),
      maxBet: ethers.formatEther(table[3]),
      players: table[4],
      isActive: table[5],
      createdAt: new Date(table[6].toNumber() * 1000),
      totalPot: ethers.formatEther(table[7]),
      gameState: table[8],
    };
  }

  async switchNetwork(chainId: number): Promise<boolean> {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ethers.toBeHex(chainId) }],
      });
      return true;
    } catch (error) {
      console.error('Failed to switch network:', error);
      return false;
    }
  }

  onAccountChanged(callback: (accounts: string[]) => void): void {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', callback);
    }
  }

  onChainChanged(callback: (chainId: string) => void): void {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', callback);
    }
  }
}

export default Web3Manager;

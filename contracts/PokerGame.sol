// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title PokerGame
 * @dev Decentralized Poker Game Contract with ETH staking and payouts
 */

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

contract PokerGame {
    // Events
    event TableCreated(string indexed tableId, uint8 maxPlayers, uint256 minBet, uint256 maxBet);
    event PlayerJoined(string indexed tableId, address indexed player, uint256 stake);
    event PlayerLeft(string indexed tableId, address indexed player);
    event HandStarted(string indexed tableId, uint256 indexed handId);
    event GameEnded(string indexed tableId, uint256 indexed handId, address indexed winner, uint256 payout);
    event BetPlaced(string indexed tableId, address indexed player, uint256 amount);
    event FundsDeposited(address indexed player, uint256 amount);
    event FundsWithdrawn(address indexed player, uint256 amount);

    // Structures
    struct PokerTable {
        string tableId;
        uint8 maxPlayers;
        uint256 minBet;
        uint256 maxBet;
        address[] players;
        bool isActive;
        uint256 createdAt;
        uint256 totalPot;
        string gameState; // "waiting", "preflop", "flop", "turn", "river", "showdown"
    }

    struct PlayerAccount {
        uint256 balance;
        uint256 totalStaked;
        uint256 totalWon;
        uint256 handCount;
        bool exists;
    }

    struct HandHistory {
        uint256 handId;
        string tableId;
        address winner;
        uint256 payout;
        uint256 timestamp;
    }

    // State variables
    mapping(string => PokerTable) public tables;
    mapping(address => PlayerAccount) public playerAccounts;
    mapping(address => mapping(string => uint256)) public playerStakes; // player => table => stake
    mapping(string => HandHistory[]) public tableHandHistory;
    mapping(address => HandHistory[]) public playerHandHistory;

    address public owner;
    uint256 public platformFee = 5; // 0.5% fee
    uint256 public platformBalance;
    uint256 public handCounter = 0;

    constructor() {
        owner = msg.sender;
    }

    // Access control
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    // Core functions
    /**
     * @dev Deposit ETH to player account
     */
    function depositFunds() external payable {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        
        if (!playerAccounts[msg.sender].exists) {
            playerAccounts[msg.sender].exists = true;
        }
        
        playerAccounts[msg.sender].balance += msg.value;
        emit FundsDeposited(msg.sender, msg.value);
    }

    /**
     * @dev Withdraw ETH from player account
     */
    function withdrawFunds(uint256 amount) external {
        require(playerAccounts[msg.sender].exists, "Player account does not exist");
        require(playerAccounts[msg.sender].balance >= amount, "Insufficient balance");
        
        playerAccounts[msg.sender].balance -= amount;
        payable(msg.sender).transfer(amount);
        emit FundsWithdrawn(msg.sender, amount);
    }

    /**
     * @dev Create a new poker table
     */
    function createTable(
        string memory tableId,
        uint8 maxPlayers,
        uint256 minBet,
        uint256 maxBet
    ) external onlyOwner {
        require(maxPlayers == 1 || maxPlayers == 6 || maxPlayers == 9, "Invalid table size");
        require(minBet > 0, "Min bet must be greater than 0");
        require(maxBet >= minBet, "Max bet must be >= min bet");
        require(tables[tableId].maxPlayers == 0, "Table already exists");

        tables[tableId] = PokerTable({
            tableId: tableId,
            maxPlayers: maxPlayers,
            minBet: minBet,
            maxBet: maxBet,
            players: new address[](0),
            isActive: true,
            createdAt: block.timestamp,
            totalPot: 0,
            gameState: "waiting"
        });

        emit TableCreated(tableId, maxPlayers, minBet, maxBet);
    }

    /**
     * @dev Join a poker table
     */
    function joinTable(string memory tableId, uint256 stake) external {
        PokerTable storage table = tables[tableId];
        require(table.isActive, "Table is not active");
        require(table.players.length < table.maxPlayers, "Table is full");
        require(stake >= table.minBet && stake <= table.maxBet, "Stake outside limits");
        require(playerAccounts[msg.sender].balance >= stake, "Insufficient balance");
        require(playerStakes[msg.sender][tableId] == 0, "Already joined this table");

        playerAccounts[msg.sender].balance -= stake;
        playerAccounts[msg.sender].totalStaked += stake;
        playerStakes[msg.sender][tableId] = stake;
        table.players.push(msg.sender);
        table.totalPot += stake;

        emit PlayerJoined(tableId, msg.sender, stake);
    }

    /**
     * @dev Leave a poker table
     */
    function leaveTable(string memory tableId) external {
        PokerTable storage table = tables[tableId];
        require(playerStakes[msg.sender][tableId] > 0, "Not a player at this table");

        uint256 stake = playerStakes[msg.sender][tableId];
        playerStakes[msg.sender][tableId] = 0;
        playerAccounts[msg.sender].balance += stake;
        table.totalPot -= stake;

        // Remove player from array
        for (uint i = 0; i < table.players.length; i++) {
            if (table.players[i] == msg.sender) {
                table.players[i] = table.players[table.players.length - 1];
                table.players.pop();
                break;
            }
        }

        emit PlayerLeft(tableId, msg.sender);
    }

    /**
     * @dev Process bet placement
     */
    function placeBet(string memory tableId, uint256 amount) external {
        PokerTable storage table = tables[tableId];
        require(playerStakes[msg.sender][tableId] > 0, "Not a player at this table");
        require(amount >= table.minBet && amount <= table.maxBet, "Bet outside limits");

        uint256 currentStake = playerStakes[msg.sender][tableId];
        require(currentStake >= amount, "Insufficient stake");

        playerStakes[msg.sender][tableId] -= amount;
        table.totalPot += amount;

        emit BetPlaced(tableId, msg.sender, amount);
    }

    /**
     * @dev End game and payout winner
     */
    function endGame(string memory tableId, address winner, uint256 payout) external onlyOwner {
        PokerTable storage table = tables[tableId];
        require(table.isActive, "Table is not active");
        require(payout <= table.totalPot, "Payout exceeds pot");

        uint256 fee = (payout * platformFee) / 1000;
        uint256 winnerAmount = payout - fee;

        platformBalance += fee;
        playerAccounts[winner].balance += winnerAmount;
        playerAccounts[winner].totalWon += winnerAmount;
        table.totalPot -= payout;

        // Record hand history
        handCounter++;
        HandHistory memory hand = HandHistory({
            handId: handCounter,
            tableId: tableId,
            winner: winner,
            payout: winnerAmount,
            timestamp: block.timestamp
        });

        tableHandHistory[tableId].push(hand);
        playerHandHistory[winner].push(hand);

        emit GameEnded(tableId, handCounter, winner, winnerAmount);
    }

    /**
     * @dev Change game state
     */
    function setGameState(string memory tableId, string memory newState) external onlyOwner {
        require(tables[tableId].isActive, "Table is not active");
        tables[tableId].gameState = newState;
    }

    /**
     * @dev Start a new hand
     */
    function startHand(string memory tableId) external onlyOwner {
        PokerTable storage table = tables[tableId];
        require(table.isActive, "Table is not active");
        require(table.players.length > 0, "No players at table");

        table.gameState = "preflop";
        emit HandStarted(tableId, handCounter + 1);
    }

    // View functions
    /**
     * @dev Get table info
     */
    function getTableInfo(string memory tableId) external view returns (PokerTable memory) {
        return tables[tableId];
    }

    /**
     * @dev Get player account info
     */
    function getPlayerAccount(address player) external view returns (PlayerAccount memory) {
        return playerAccounts[player];
    }

    /**
     * @dev Get player stake at specific table
     */
    function getPlayerStake(address player, string memory tableId) external view returns (uint256) {
        return playerStakes[player][tableId];
    }

    /**
     * @dev Get table players
     */
    function getTablePlayers(string memory tableId) external view returns (address[] memory) {
        return tables[tableId].players;
    }

    /**
     * @dev Get player hand history
     */
    function getPlayerHandHistory(address player) external view returns (HandHistory[] memory) {
        return playerHandHistory[player];
    }

    /**
     * @dev Get table hand history
     */
    function getTableHandHistory(string memory tableId) external view returns (HandHistory[] memory) {
        return tableHandHistory[tableId];
    }

    /**
     * @dev Withdraw platform fees
     */
    function withdrawPlatformFees(uint256 amount) external onlyOwner {
        require(platformBalance >= amount, "Insufficient platform balance");
        platformBalance -= amount;
        payable(owner).transfer(amount);
    }

    /**
     * @dev Get platform stats
     */
    function getPlatformStats() external view returns (uint256 fees, uint256 totalHands) {
        return (platformBalance, handCounter);
    }

    // Emergency functions
    /**
     * @dev Emergency close table
     */
    function closeTable(string memory tableId) external onlyOwner {
        PokerTable storage table = tables[tableId];
        table.isActive = false;

        // Return stakes to all players
        for (uint i = 0; i < table.players.length; i++) {
            address player = table.players[i];
            uint256 stake = playerStakes[player][tableId];
            if (stake > 0) {
                playerAccounts[player].balance += stake;
                playerStakes[player][tableId] = 0;
            }
        }

        delete table.players;
    }

    /**
     * @dev Fallback function
     */
    receive() external payable {
        depositFunds();
    }
}

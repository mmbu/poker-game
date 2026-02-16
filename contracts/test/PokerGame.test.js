const hre = require("hardhat");
const { expect } = require("chai");

describe("PokerGame", function () {
  let pokerGame;
  let owner;
  let player1;
  let player2;

  beforeEach(async function () {
    [owner, player1, player2] = await hre.ethers.getSigners();

    const PokerGame = await hre.ethers.getContractFactory("PokerGame");
    pokerGame = await PokerGame.deploy();
    await pokerGame.deployed();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(await pokerGame.owner()).to.equal(owner.address);
    });
  });

  describe("Funds Management", function () {
    it("Should allow deposit", async function () {
      const depositAmount = hre.ethers.utils.parseEther("1.0");
      await player1.sendTransaction({
        to: pokerGame.address,
        value: depositAmount,
      });

      const account = await pokerGame.getPlayerAccount(player1.address);
      expect(account.balance).to.equal(depositAmount);
    });

    it("Should allow withdrawal", async function () {
      const depositAmount = hre.ethers.utils.parseEther("1.0");
      const withdrawAmount = hre.ethers.utils.parseEther("0.5");

      await player1.sendTransaction({
        to: pokerGame.address,
        value: depositAmount,
      });

      await pokerGame.connect(player1).withdrawFunds(withdrawAmount);

      const account = await pokerGame.getPlayerAccount(player1.address);
      expect(account.balance).to.equal(
        depositAmount.sub(withdrawAmount)
      );
    });
  });

  describe("Table Management", function () {
    beforeEach(async function () {
      await pokerGame.createTable("table1", 6, 1, 100);
    });

    it("Should create table with correct parameters", async function () {
      const table = await pokerGame.getTableInfo("table1");
      expect(table.maxPlayers).to.equal(6);
      expect(table.minBet).to.equal(1);
      expect(table.maxBet).to.equal(100);
      expect(table.isActive).to.be.true;
    });

    it("Should allow player to join table", async function () {
      const depositAmount = hre.ethers.utils.parseEther("1.0");
      await player1.sendTransaction({
        to: pokerGame.address,
        value: depositAmount,
      });

      const stake = 50;
      await pokerGame.connect(player1).joinTable("table1", stake);

      const players = await pokerGame.getTablePlayers("table1");
      expect(players.length).to.equal(1);
      expect(players[0]).to.equal(player1.address);
    });

    it("Should track player stake", async function () {
      const depositAmount = hre.ethers.utils.parseEther("1.0");
      await player1.sendTransaction({
        to: pokerGame.address,
        value: depositAmount,
      });

      const stake = 50;
      await pokerGame.connect(player1).joinTable("table1", stake);

      const playerStake = await pokerGame.getPlayerStake(player1.address, "table1");
      expect(playerStake).to.equal(stake);
    });
  });

  describe("Game Flow", function () {
    beforeEach(async function () {
      // Create table
      await pokerGame.createTable("table1", 6, 1, 100);

      // Deposit funds
      const depositAmount = hre.ethers.utils.parseEther("10.0");
      await player1.sendTransaction({
        to: pokerGame.address,
        value: depositAmount,
      });
      await player2.sendTransaction({
        to: pokerGame.address,
        value: depositAmount,
      });

      // Join table
      await pokerGame.connect(player1).joinTable("table1", 50);
      await pokerGame.connect(player2).joinTable("table1", 50);
    });

    it("Should start hand", async function () {
      await pokerGame.startHand("table1");
      const table = await pokerGame.getTableInfo("table1");
      expect(table.gameState).to.equal("preflop");
    });

    it("Should process bet", async function () {
      await pokerGame.connect(player1).placeBet("table1", 10);
      const table = await pokerGame.getTableInfo("table1");
      expect(table.totalPot).to.be.gt(0);
    });

    it("Should end game and payout winner", async function () {
      const payout = 90;
      const initialBalance = (await pokerGame.getPlayerAccount(player1.address)).balance;

      await pokerGame.endGame("table1", player1.address, payout);

      const finalAccount = await pokerGame.getPlayerAccount(player1.address);
      expect(finalAccount.totalWon).to.be.gt(0);
    });
  });

  describe("Edge Cases", function () {
    it("Should reject invalid table size", async function () {
      await expect(
        pokerGame.createTable("table1", 5, 1, 100)
      ).to.be.revertedWith("Invalid table size");
    });

    it("Should prevent joining table twice", async function () {
      await pokerGame.createTable("table1", 6, 1, 100);

      const depositAmount = hre.ethers.utils.parseEther("1.0");
      await player1.sendTransaction({
        to: pokerGame.address,
        value: depositAmount,
      });

      await pokerGame.connect(player1).joinTable("table1", 50);
      await expect(
        pokerGame.connect(player1).joinTable("table1", 50)
      ).to.be.revertedWith("Already joined this table");
    });
  });
});

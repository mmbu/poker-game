/**
 * Poker Hand Evaluator
 * Evaluates and ranks poker hands
 */

interface Card {
  rank: string;
  suit: string;
}

enum HandRank {
  HighCard = 1,
  Pair = 2,
  TwoPair = 3,
  ThreeOfAKind = 4,
  Straight = 5,
  Flush = 6,
  FullHouse = 7,
  FourOfAKind = 8,
  StraightFlush = 9,
  RoyalFlush = 10,
}

class PokerHandEvaluator {
  private rankValues: { [key: string]: number } = {
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    '10': 10,
    'J': 11,
    'Q': 12,
    'K': 13,
    'A': 14,
  };

  evaluateHand(holeCards: Card[], communityCards: Card[]): {
    rank: HandRank;
    name: string;
    cards: Card[];
  } {
    const allCards = [...holeCards, ...communityCards];
    const bestHand = this.findBestHand(allCards);
    return bestHand;
  }

  private findBestHand(cards: Card[]): {
    rank: HandRank;
    name: string;
    cards: Card[];
  } {
    const combinations = this.getCombinations(cards, 5);
    let bestRank = HandRank.HighCard;
    let bestHand: Card[] = [];
    let bestName = 'High Card';

    for (const combo of combinations) {
      const evaluation = this.evaluateHandCombination(combo);
      if (evaluation.rank > bestRank) {
        bestRank = evaluation.rank;
        bestHand = combo;
        bestName = evaluation.name;
      }
    }

    return {
      rank: bestRank,
      name: bestName,
      cards: bestHand,
    };
  }

  private evaluateHandCombination(cards: Card[]): {
    rank: HandRank;
    name: string;
  } {
    if (this.isRoyalFlush(cards)) {
      return { rank: HandRank.RoyalFlush, name: 'Royal Flush' };
    }
    if (this.isStraightFlush(cards)) {
      return { rank: HandRank.StraightFlush, name: 'Straight Flush' };
    }
    if (this.isFourOfAKind(cards)) {
      return { rank: HandRank.FourOfAKind, name: 'Four of a Kind' };
    }
    if (this.isFullHouse(cards)) {
      return { rank: HandRank.FullHouse, name: 'Full House' };
    }
    if (this.isFlush(cards)) {
      return { rank: HandRank.Flush, name: 'Flush' };
    }
    if (this.isStraight(cards)) {
      return { rank: HandRank.Straight, name: 'Straight' };
    }
    if (this.isThreeOfAKind(cards)) {
      return { rank: HandRank.ThreeOfAKind, name: 'Three of a Kind' };
    }
    if (this.isTwoPair(cards)) {
      return { rank: HandRank.TwoPair, name: 'Two Pair' };
    }
    if (this.isPair(cards)) {
      return { rank: HandRank.Pair, name: 'Pair' };
    }

    return { rank: HandRank.HighCard, name: 'High Card' };
  }

  private isRoyalFlush(cards: Card[]): boolean {
    if (!this.isStraightFlush(cards)) return false;

    const ranks = cards.map((c) => this.rankValues[c.rank]).sort((a, b) => b - a);
    return ranks[0] === 14 && ranks[1] === 13 && ranks[2] === 12 && ranks[3] === 11 && ranks[4] === 10;
  }

  private isStraightFlush(cards: Card[]): boolean {
    return this.isStraight(cards) && this.isFlush(cards);
  }

  private isFourOfAKind(cards: Card[]): boolean {
    const ranks = cards.map((c) => c.rank);
    for (const rank of ranks) {
      if (ranks.filter((r) => r === rank).length === 4) {
        return true;
      }
    }
    return false;
  }

  private isFullHouse(cards: Card[]): boolean {
    return this.isThreeOfAKind(cards) && this.isPair(cards);
  }

  private isFlush(cards: Card[]): boolean {
    const suits = cards.map((c) => c.suit);
    return suits.every((suit) => suit === suits[0]);
  }

  private isStraight(cards: Card[]): boolean {
    const ranks = cards.map((c) => this.rankValues[c.rank]).sort((a, b) => a - b);

    for (let i = 0; i < ranks.length - 1; i++) {
      if (ranks[i + 1] !== ranks[i] + 1) {
        return false;
      }
    }
    return true;
  }

  private isThreeOfAKind(cards: Card[]): boolean {
    const ranks = cards.map((c) => c.rank);
    for (const rank of ranks) {
      if (ranks.filter((r) => r === rank).length === 3) {
        return true;
      }
    }
    return false;
  }

  private isTwoPair(cards: Card[]): boolean {
    const ranks = cards.map((c) => c.rank);
    let pairCount = 0;

    for (const rank of new Set(ranks)) {
      if (ranks.filter((r) => r === rank).length === 2) {
        pairCount++;
      }
    }

    return pairCount === 2;
  }

  private isPair(cards: Card[]): boolean {
    const ranks = cards.map((c) => c.rank);
    for (const rank of ranks) {
      if (ranks.filter((r) => r === rank).length === 2) {
        return true;
      }
    }
    return false;
  }

  private getCombinations(cards: Card[], size: number): Card[][] {
    if (size === 1) {
      return cards.map((c) => [c]);
    }

    const combinations: Card[][] = [];
    for (let i = 0; i <= cards.length - size; i++) {
      const head = cards[i];
      const remaining = cards.slice(i + 1);
      const subCombinations = this.getCombinations(remaining, size - 1);

      for (const sub of subCombinations) {
        combinations.push([head, ...sub]);
      }
    }

    return combinations;
  }
}

export { PokerHandEvaluator, HandRank };

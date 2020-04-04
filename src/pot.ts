import { Player } from "./player";

class Pot {
  public amount: number;
  public averageAmount: number; // 是个定值，每个人的金额数量
  private inPlayers: Map<string, Player>;

  constructor() {
    this.amount = 0;
    this.inPlayers = new Map();
  }
  public setAverageAmount(averageAmount: number): void {
    this.averageAmount = averageAmount;
  }
  putAmount(amount: number, player: Player): void {
    this.amount += amount;
    this.inPlayers.set(player.positionName, player);
  }
}

export { Pot };

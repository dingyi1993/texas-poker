import { Player } from "./player";

class Pot {
  public amount: number;
  private inPlayers: Map<string, Player>;

  constructor() {
    this.amount = 0;
    this.inPlayers = new Map();
  }
  putAmount(amount: number, player: Player) {
    this.amount += amount;
    this.inPlayers.set(player.positionName, player);
  }
}

export { Pot };

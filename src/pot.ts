import { Player } from "./player";

class Pot {
  private amount: number;
  private inPlayers: Map<string, Player>;

  constructor() {
    this.amount = 0;
  }
  putAmount(amount: number, player: Player) {
    this.amount += amount;
    this.inPlayers.set(player.positionName, player);
  }
}

export { Pot };

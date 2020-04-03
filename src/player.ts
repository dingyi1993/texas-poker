import { Game } from "./game";

// const PLAYER_TYPE = ['BTN', 'SB', 'BB', 'UTG', 'HJ', 'CO', '+N'];
// const REQUIRED_PLAYER_TYPE = ['BTN', 'SB', 'BB', 'UTG'];

const enum PlayerType {
  BTN = 'BTN',
  SB = 'SB',
  BB = 'BB',
  UTG = 'UTG',
  N = '+N',
  HJ = 'HJ',
  CO = 'CO',
}

class Player {
  private game: Game;
  public positionName: string;
  public positionName2?: string;
  /**
   *
   * @param game 游戏实例
   */
  constructor(game: Game) {
    this.game = game;
  }
  public setPositionName(positionName: string) {
    if (!this.positionName) {
      this.positionName = positionName;
    } else if (!this.positionName2) {
      this.positionName2 = positionName;
    }
  }
  // private getPositionName(index: number) {
  //   const playerNumber = this.game.options.playerNumber;
  //   if (playerNumber <= REQUIRED_PLAYER_TYPE.length) {
  //     return REQUIRED_PLAYER_TYPE[index];
  //   } else {
  //     if (index <= 4) {
  //       return PLAYER_TYPE[index];
  //     } else if (index > 4 && index <= playerNumber - 2) {
  //       return PLAYER_TYPE[6].replace('N', String(index - 4));
  //     } else {
  //       return PLAYER_TYPE[6 - (playerNumber - (index + 1))];
  //     }
  //   }
  // }
  public takeSmallBlind() {
    this.game.pot.mainPot.putAmount(1, this);
  }
  public takeBigBlind() {
    this.game.pot.mainPot.putAmount(2, this);
  }
  public call() {}
  public check() {}
  public fold() {}

}

export { Player };

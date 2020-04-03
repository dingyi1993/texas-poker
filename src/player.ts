import { Game, GameStage, PlayerNode } from "./game";

// const PLAYER_TYPE = ['BTN', 'SB', 'BB', 'UTG', 'HJ', 'CO', '+N'];
// const REQUIRED_PLAYER_TYPE = ['BTN', 'SB', 'BB', 'UTG'];

type PlayerAction = 'check' | 'fold' | 'raise' | 'call' | 'all in';

export enum PlayerStatus {
  PENDING,
  FOLD,
  PLAYING,
  OUT,
  ALL_IN,
}

class Player {
  private game: Game;
  private status: PlayerStatus;
  private availableActions: PlayerAction[];
  public currentPot: number;
  public selfStack: number;
  public positionName: string;
  public positionName2?: string;
  /**
   *
   * @param game 游戏实例
   */
  constructor(game: Game) {
    this.game = game;
    this.currentPot = 0;
    this.status = PlayerStatus.PENDING;
    this.availableActions = [];
    this.selfStack = 200;
  }
  public setStatus(status: PlayerStatus) {
    this.status = status;
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
    const { smallBlind } = this.game.options;
    this.currentPot += smallBlind;
    this.game.pot.mainPot.putAmount(smallBlind, this);
  }
  public takeBigBlind() {
    const { bigBlind } = this.game.options;
    this.currentPot += bigBlind;
    this.game.pot.mainPot.putAmount(bigBlind, this);
  }
  public isPlaying() {
    return this.status === PlayerStatus.PLAYING;
  }
  public calAvailableActions(currentPlayerNode: PlayerNode) {
    // TODO 这里还需要计算上家弃牌或者 all in 的 case
    const availableActions: PlayerAction[] = ['fold'];
    const prevPlayer = currentPlayerNode.prev.player;
    if (this.selfStack > prevPlayer.currentPot * 2) {
      availableActions.push('all in', 'raise', 'call');
    } else if (this.selfStack > prevPlayer.currentPot) {
      availableActions.push('all in', 'call');
    } else {
      availableActions.push('all in');
    }
    this.availableActions = availableActions;
  }
  public call() {
    if (this.availableActions.indexOf('call') > -1) {
      this.currentPot = 2;
      this.game.pot.mainPot.putAmount(2, this);
      this.game.goNextPlayer();
    }
  }
  public check() {
    if (this.availableActions.indexOf('check') > -1) {
      this.game.goNextPlayer();
    }
  }
  public fold() {}

}

export { Player };

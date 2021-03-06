import { Game, PlayerNode } from "./game";
import { GameStage } from "./stage";

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

interface PlayerOptions {
  buyIn: number;
}

class Player {
  private game: Game;
  private options: PlayerOptions;
  private status: PlayerStatus;
  public availableActions: PlayerAction[];
  public currentPot: number;
  public selfStack: number;
  public isCurrentStage: boolean; // 是否是当前行动回合，比如 all in 或弃牌，有当前回合和之前回合之分
  public positionName: string;
  public positionName2?: string;
  public hasDoneAction: boolean;
  /**
   *
   * @param game 游戏实例
   */
  constructor(game: Game, options: PlayerOptions) {
    this.options = options;
    this.game = game;
    this.currentPot = 0;
    this.status = PlayerStatus.PENDING;
    this.availableActions = [];
    this.selfStack = this.options.buyIn;
    this.isCurrentStage = true;
    this.hasDoneAction = false;
  }
  public isBigBlind(): boolean {
    return this.positionName === 'BB' || this.positionName2 === 'BB';
  }
  public setStatus(status: PlayerStatus): void {
    this.status = status;
  }
  public setPositionName(positionName: string): void {
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
  public takeSmallBlind(): void {
    const { smallBlind } = this.game.options;
    this.currentPot += smallBlind;
    this.selfStack -= smallBlind;
    this.game.pot.mainPot.putAmount(smallBlind, this);
  }
  public takeBigBlind(): void {
    const { bigBlind } = this.game.options;
    this.currentPot += bigBlind;
    this.selfStack -= bigBlind;
    this.game.pot.mainPot.putAmount(bigBlind, this);
  }
  public isPlaying(): boolean {
    return this.status === PlayerStatus.PLAYING;
  }
  public isAllIn(): boolean {
    return this.status === PlayerStatus.ALL_IN;
  }
  public isFold(): boolean {
    return this.status === PlayerStatus.FOLD;
  }
  public setIsCurrentStage(isCurrentStage: boolean): void {
    this.isCurrentStage = isCurrentStage;
  }
  // TODO 这两个参数都能优化
  public calAvailableActions(currentPlayerNode: PlayerNode, prevPlayerNode: PlayerNode): void {
    const prevPlayer = prevPlayerNode.data;
    let canCheck = false;
    if (this.game.getStage().getCurrentStage() === GameStage.PRE_FLOP && this.isBigBlind() && !this.hasDoneAction && this.currentPot === prevPlayer.currentPot) {
      canCheck = true;
    }
    // TODO 这里还需要计算上家弃牌或者 all in 的 case
    const availableActions: PlayerAction[] = [];
    if (this.selfStack + this.currentPot > prevPlayer.currentPot * 2) {
      availableActions.push('all in', 'raise', canCheck ? 'check' : 'call');
    } else if (this.selfStack + this.currentPot > prevPlayer.currentPot) {
      availableActions.push('all in', canCheck ? 'check' : 'call');
    } else {
      availableActions.push('all in');
    }
    availableActions.push('fold');
    this.availableActions = availableActions;
  }
  public clearAvailableActions(): void {
    this.availableActions = [];
  }
  public allIn(): PlayerNode {
    if (this.availableActions.indexOf('all in') > -1) {
      const amount = this.selfStack;
      this.currentPot += amount;
      this.selfStack = 0;
      this.game.addAllInPlayer(this);
      this.game.pot.mainPot.putAmount(amount, this);
      this.status = PlayerStatus.ALL_IN;
      this.hasDoneAction = true;
      this.game.setLastInPlayerNode(this.game.getCurrentPlayerNode());
      return this.game.goNextPlayer();
    } else {
      throw new Error('不合法的行动');
    }
  }
  public call(): PlayerNode {
    if (this.availableActions.indexOf('call') > -1) {
      const prevPlayerNode = this.game.getPrevPlayerNode();
      if (!prevPlayerNode) {
        throw new Error('call 必须有上一个行动节点');
      }
      const prevPlayer = prevPlayerNode.data;
      const amount = prevPlayer.currentPot - this.currentPot;
      this.currentPot = prevPlayer.currentPot;
      this.selfStack -= amount;
      this.hasDoneAction = true;
      this.game.setLastInPlayerNode(this.game.getCurrentPlayerNode());
      this.game.pot.mainPot.putAmount(amount, this);
      return this.game.goNextPlayer();
    } else {
      throw new Error('不合法的行动');
    }
  }
  public raise(amount: number): PlayerNode {
    if (this.availableActions.indexOf('raise') > -1) {
      // TODO 这里获取方法要改
      const prevPlayerNode = this.game.getPrevPlayerNode();
      if (!prevPlayerNode) {
        throw new Error('raise 必须又上一个行动节点');
      }
      const prevPlayer = prevPlayerNode.data;
      if (amount < prevPlayer.currentPot * 2) {
        throw new Error('mini raise 必须为上一个人的 2 倍');
      }
      if (amount > this.currentPot + this.selfStack) {
        throw new Error('加注金额超过自己后手，想白嫖吗？');
      }
      // let sidePotAmount = 0;
      // if (prevPlayer.isAllIn()) {
      //   sidePotAmount += (amount - prevPlayer.currentPot);
      // }
      const addAmount = amount - this.currentPot;
      this.currentPot = amount;
      this.selfStack -= addAmount;
      this.hasDoneAction = true;
      this.game.pot.mainPot.putAmount(addAmount, this);
      // if (sidePotAmount && this.game.allInPlayers.length > this.game.pot.sidePot.length) {
      //   const sidePot = this.game.makeSidePot();
      //   sidePot.putAmount(sidePotAmount, this);
      // }
      this.game.setLastInPlayerNode(this.game.getCurrentPlayerNode());
      return this.game.goNextPlayer();
    } else {
      throw new Error('不合法的行动');
    }
  }
  public check(): PlayerNode {
    if (this.availableActions.indexOf('check') > -1) {
      this.hasDoneAction = true;
      return this.game.goNextPlayer();
    } else {
      throw new Error('不合法的行动');
    }
  }
  public fold(): PlayerNode {
    this.status = PlayerStatus.FOLD;
    this.hasDoneAction = true;
    return this.game.goNextPlayer();
  }

}

export { Player };

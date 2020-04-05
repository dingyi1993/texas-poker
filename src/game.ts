import { Player } from "./player";
import { Stage, GameStage } from "./stage";
import { Pot } from "./pot";
import { createDoubleLink, DoubleLink } from "./utils/link";

interface GameOptions {
  playerNumber: number;
  smallBlind: number;
  bigBlind: number;
  buyIn: number[];
}

export type PlayerNode = DoubleLink<Player>

const REQUIRED_POSITION_TYPE = ['BTN', 'SB', 'BB', 'UTG'];
const OPTIONAL_POSITION_TYPE = ['CO', 'HJ'];

class Game {
  private stage: Stage;
  private actionChain: PlayerNode;
  private currentPlayerNode: PlayerNode;
  private prevPlayerNode: PlayerNode | null;
  private lastInPlayerNode: PlayerNode;

  public options: GameOptions;
  public players: Player[];
  public allInPlayers: Player[]; // 看能不能去掉
  public pot: {
    mainPot: Pot;
    sidePot: Pot[];
  };

  constructor(options: GameOptions) {
    this.options = options;
    this.init();
  }
  private init(): void {
    this.initPlayer();
    this.initActionChain();
    this.stage = new Stage(this);
    this.pot = {
      mainPot: new Pot(),
      sidePot: [],
    };
    this.allInPlayers = [];
  }
  private initPlayer(): void {
    const { playerNumber, buyIn } = this.options;
    const players: Player[] = [];
    for (let i = 0; i < this.options.playerNumber; i++) {
      players.push(new Player(this, { buyIn: buyIn[i] }));
    }
    REQUIRED_POSITION_TYPE.forEach((positionType, index) => {
      players[index % playerNumber].setPositionName(positionType);
    });
    if (playerNumber <= REQUIRED_POSITION_TYPE.length) {
      // REQUIRED_POSITION_TYPE.forEach((positionType, index) => {
      //   players[index % playerNumber].setPositionName(positionType);
      // });
    } else if (playerNumber <= REQUIRED_POSITION_TYPE.length + OPTIONAL_POSITION_TYPE.length) {
      OPTIONAL_POSITION_TYPE.forEach((positionType, index) => {
        players[(playerNumber - 1) - index].setPositionName(positionType);
      });
    } else {
      OPTIONAL_POSITION_TYPE.forEach((positionType, index) => {
        players[(playerNumber - 1) - index].setPositionName(positionType);
      });
      for (let i = REQUIRED_POSITION_TYPE.length; i < playerNumber - OPTIONAL_POSITION_TYPE.length; i++) {
        players[i].setPositionName(`+${i - REQUIRED_POSITION_TYPE.length + 1}`);
      }
    }
    this.players = players;
  }
  private initActionChain(): void {
    const actionChain = createDoubleLink<Player>(this.players);
    this.actionChain = actionChain;
  }
  private calSidePot(): void {
    // all in 几家，就是几个边池，如果恰好有 2 个或以上玩家 all in 金额相同，则边池数量要减多出来一样玩家的个数
    // 最后一个边池，作为下一轮的主池
    // 在玩的玩家按照 all in 金额从小到大计算边池
    const currentPlayers = this.players.filter(player => player.isCurrentStage);
    const allInPlayers = currentPlayers
      .filter(player => player.isAllIn())
      .sort((a, b) => a.currentPot - b.currentPot);
    // 这里的 case 就是有 2 个或以上玩家 all in 金额相同，第一次已经把后面 all in 玩家的当前池子减为 0 了，所以这里要判空
    if (allInPlayers.length === 0) return;
    const currentMainPot = this.pot.mainPot;
    currentMainPot.clear();
    allInPlayers.forEach((allInPlayer, index) => {
      const allInPlayerCurrentPot = allInPlayer.currentPot;
      if (allInPlayerCurrentPot === 0) return;
      const currentPot = index === 0 ? currentMainPot : new Pot();
      currentPlayers.forEach(player => {
        if (player.currentPot < allInPlayerCurrentPot) {
          currentPot.putAmount(player.currentPot, player);
          player.currentPot = 0;
        } else {
          currentPot.putAmount(allInPlayerCurrentPot, player);
          player.currentPot -= allInPlayerCurrentPot;
        }
      });
      if (index !== 0) {
        this.pot.sidePot.push(currentPot);
      }
    });
    const lastPot = new Pot();
    currentPlayers.forEach(player => {
      if (player.currentPot === 0) return;
      lastPot.putAmount(player.currentPot, player);
      player.currentPot = 0;
    });
    this.pot.sidePot.push(lastPot);
  }
  public getSbPlayerNode(): PlayerNode {
    return this.actionChain.next;
  }
  public getBbPlayerNode(): PlayerNode {
    return this.actionChain.next.next;
  }
  public start(): PlayerNode {
    if (this.stage.getCurrentStage() !== GameStage.BEFORE_START) {
      throw new Error('当前阶段不能开始');
    }
    const currentPlayerNode = this.stage.next();
    if (!currentPlayerNode) {
      throw new Error('开始流程错误');
    }
    this.currentPlayerNode = currentPlayerNode;
    this.prevPlayerNode = this.getBbPlayerNode();
    return currentPlayerNode;
  }
  public goNextPlayer(): PlayerNode {
    let findNextPlayingNode = this.currentPlayerNode.next;
    while(!findNextPlayingNode.data.isPlaying()) {
      findNextPlayingNode = findNextPlayingNode.next;
      if (findNextPlayingNode === this.currentPlayerNode) {
        throw new Error('代码出问题了，不该出现的死循环');
      }
    }
    // 下一个在游戏中的玩家，当前尺子大于等于上一个入池的玩家，则代表当前阶段结束
    if (findNextPlayingNode.data.currentPot >= this.lastInPlayerNode.data.currentPot) {
      // 当前阶段结束
      // 计算边池
      this.calSidePot();
      // TODO 更新玩家状态，当前 all in => 之前 all in
      const nextStageFirstPlayerNode = this.stage.next();
      this.currentPlayerNode = nextStageFirstPlayerNode;
      this.prevPlayerNode = null;
      return nextStageFirstPlayerNode;
    }
    this.currentPlayerNode.data.clearAvailableActions();
    findNextPlayingNode.data.calAvailableActions(findNextPlayingNode, this.lastInPlayerNode);
    this.prevPlayerNode = this.currentPlayerNode;
    this.currentPlayerNode = findNextPlayingNode;
    return findNextPlayingNode;
  }
  public makeSidePot(): Pot {
    const sidePot = new Pot();
    this.pot.sidePot.push(sidePot);
    return sidePot;
  }
  public addAllInPlayer(player: Player): void {
    this.allInPlayers.push(player);
  }
  // public end() {}
  public getStage(): Stage {
    return this.stage;
  }
  public getCurrentPlayerNode(): PlayerNode {
    return this.currentPlayerNode;
  }
  public getPrevPlayerNode(): PlayerNode | null {
    return this.prevPlayerNode;
  }
  public setLastInPlayerNode(playerNode: PlayerNode): void {
    this.lastInPlayerNode = playerNode;
  }
}

const gameFactory = {
  makeGame(gameOptions?: Partial<GameOptions>): Game {
    const defaultPlayerNumber = 5;
    const defaultSmallBlind = 1;
    const defaultBigBlind = 2;
    const defaultBuyIn = defaultBigBlind * 100;
    return new Game(Object.assign({
      playerNumber: defaultPlayerNumber,
      smallBlind: defaultSmallBlind,
      bigBlind: defaultBigBlind,
      buyIn: Array(defaultPlayerNumber).fill(0).map(() => defaultBuyIn),
    }, gameOptions));
  },
};

export { Game, GameStage, gameFactory };

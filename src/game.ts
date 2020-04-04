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

export type PlayerNode = DoubleLink<Player>;

const REQUIRED_POSITION_TYPE = ['BTN', 'SB', 'BB', 'UTG'];
const OPTIONAL_POSITION_TYPE = ['CO', 'HJ'];

class Game {
  private stage: Stage;
  private actionChain: PlayerNode;
  private currentPlayerNode: PlayerNode;
  private prevPlayerNode: PlayerNode | null;

  public options: GameOptions;
  public players: Player[];
  public allInPlayers: Player[];
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
    this.currentPlayerNode.data.clearAvailableActions();
    findNextPlayingNode.data.calAvailableActions(findNextPlayingNode, this.currentPlayerNode);
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

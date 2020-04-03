import { Player } from "./player";
import { Stage, GameStage } from "./stage";
import { Pot } from "./pot";

interface GameOptions {
  playerNumber: number;
  smallBlind: number;
  bigBlind: number;
}

export interface PlayerNode {
  player: Player;
  next: PlayerNode;
  prev: PlayerNode;
}

const REQUIRED_POSITION_TYPE = ['BTN', 'SB', 'BB', 'UTG'];
const OPTIONAL_POSITION_TYPE = ['CO', 'HJ'];

class Game {
  private stage: Stage;
  private actionChain: PlayerNode;
  private currentPlayerNode: PlayerNode;

  public options: GameOptions;
  public players: Player[];
  public pot: {
    mainPot: Pot;
    sidePot: Pot[];
  };

  constructor(options: GameOptions) {
    this.options = options;
    this.init();
  }
  private init() {
    this.initPlayer();
    this.initActionChain();
    this.stage = new Stage(this);
    this.pot = {
      mainPot: new Pot(),
      sidePot: [],
    };
  }
  private initPlayer() {
    const { playerNumber } = this.options;
    const players: Player[] = [];
    for (let i = 0; i < this.options.playerNumber; i++) {
      players.push(new Player(this));
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
  private initActionChain() {
    let actionChain: PlayerNode;
    const lastNode = this.players.reduce((prev: PlayerNode | null, curr) => {
      // 这里 any 要想办法去掉
      const playerNode: any = { player: curr };
      if (!prev) {
        actionChain = playerNode;
        return actionChain;
      } else {
        prev.next = playerNode;
        playerNode.prev = prev;
        return playerNode;
      }
    }, null);
    lastNode.next = actionChain;
    actionChain.prev = lastNode;
    this.actionChain = actionChain;
  }
  public getSbPlayerNode() {
    return this.actionChain.next;
  }
  public getBbPlayerNode() {
    return this.actionChain.next.next;
  }
  public start(): PlayerNode {
    if (this.stage.getCurrentStage() !== GameStage.BEFORE_START) {
      throw new Error('当前阶段不能开始');
    }
    const currentPlayerNode = this.stage.next();
    this.currentPlayerNode = currentPlayerNode;
    return currentPlayerNode;
  }
  public goNextPlayer(): PlayerNode {
    let findNextPlayingNode = this.currentPlayerNode.next;
    while(!findNextPlayingNode.player.isPlaying()) {
      findNextPlayingNode = findNextPlayingNode.next;
      if (findNextPlayingNode === this.currentPlayerNode) {
        throw new Error('代码出问题了，不该出现的死循环');
      }
    }
    this.currentPlayerNode = findNextPlayingNode;
    return findNextPlayingNode;
  }
  public end() {}
  public getStage() {
    return this.stage;
  }
}

const gameFactory = {
  makeGame(gameOptions?: Partial<GameOptions>) {
    return new Game(Object.assign({ playerNumber: 5, smallBlind: 1, bigBlind: 2 }, gameOptions));
  }
};

export { Game, GameStage, gameFactory };

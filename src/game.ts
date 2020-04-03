import { Player } from "./player";
import { Stage, GameStage } from "./stage";
import { Pot } from "./pot";

interface GameOptions {
  playerNumber: number;
}

const REQUIRED_POSITION_TYPE = ['BTN', 'SB', 'BB', 'UTG'];
const OPTIONAL_POSITION_TYPE = ['CO', 'HJ'];

class Game {
  private stage: Stage;

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
    this.stage = new Stage();
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
    if (playerNumber <= REQUIRED_POSITION_TYPE.length) {
      REQUIRED_POSITION_TYPE.forEach((positionType, index) => {
        players[index % playerNumber].setPositionName(positionType);
      });
    } else if (playerNumber <= REQUIRED_POSITION_TYPE.length + OPTIONAL_POSITION_TYPE.length) {
      REQUIRED_POSITION_TYPE.forEach((positionType, index) => {
        players[index].setPositionName(positionType);
      });
      OPTIONAL_POSITION_TYPE.forEach((positionType, index) => {
        players[(playerNumber - 1) - index].setPositionName(positionType);
      });
    } else {
      REQUIRED_POSITION_TYPE.forEach((positionType, index) => {
        players[index].setPositionName(positionType);
      });
      OPTIONAL_POSITION_TYPE.forEach((positionType, index) => {
        players[(playerNumber - 1) - index].setPositionName(positionType);
      });
      for (let i = REQUIRED_POSITION_TYPE.length; i < playerNumber - OPTIONAL_POSITION_TYPE.length; i++) {
        players[i].setPositionName(`+${i - REQUIRED_POSITION_TYPE.length + 1}`);
      }
    }
    this.players = players;
  }
  public start() {
    if (this.stage.getCurrentStage() !== GameStage.BEFORE_START) {
      throw new Error('当前阶段不能开始');
    }
    this.stage.next();
  }
  public end() {}
  public getStage() {
    return this.stage;
  }
}

export { Game, GameStage };

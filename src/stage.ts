import { Game } from "./game";
import { PlayerStatus } from "./player";

export enum GameStage {
  BEFORE_START,
  PRE_FLOP,
  FLOP,
  TURN,
  RIVER,
  SETTLEMENT,
  GAME_OVER,
}

class Stage {
  private current: GameStage;
  private game: Game;

  constructor(game: Game) {
    this.game = game;
    this.current = GameStage.BEFORE_START;
  }
  public getCurrentStage() {
    return this.current;
  }
  public next() {
    switch (this.current) {
      case GameStage.BEFORE_START:
        this.current = GameStage.PRE_FLOP;
        this.game.players.forEach(player => {
          player.setStatus(PlayerStatus.PLAYING);
        });
        const sbPlayerNode = this.game.getSbPlayerNode();
        const bbPlayerNode = this.game.getBbPlayerNode();
        sbPlayerNode.player.takeSmallBlind();
        bbPlayerNode.player.takeBigBlind();
        const currentPlayerNode = bbPlayerNode.next;
        currentPlayerNode.player.calAvailableActions(currentPlayerNode);
        return currentPlayerNode;
      default:
        break;
    }
  }
}

export { Stage };

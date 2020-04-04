import { Game, PlayerNode } from "./game";
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
  public getCurrentStage(): GameStage {
    return this.current;
  }
  public next(): PlayerNode | null {
    switch (this.current) {
      case GameStage.BEFORE_START:
        this.current = GameStage.PRE_FLOP;
        this.game.players.forEach(player => {
          player.setStatus(PlayerStatus.PLAYING);
        });
        const sbPlayerNode = this.game.getSbPlayerNode();
        const bbPlayerNode = this.game.getBbPlayerNode();
        sbPlayerNode.data.takeSmallBlind();
        bbPlayerNode.data.takeBigBlind();
        const currentPlayerNode = bbPlayerNode.next;
        currentPlayerNode.data.calAvailableActions(currentPlayerNode, bbPlayerNode);
        return currentPlayerNode;
      default:
        return null;
    }
  }
}

export { Stage };

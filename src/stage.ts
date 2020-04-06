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
  public next(): PlayerNode {
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
      case GameStage.PRE_FLOP:
        this.current = GameStage.FLOP;
        let tmpPlayerNode = this.game.getSbPlayerNode();
        // TODO 这里判断逻辑不对
        while (tmpPlayerNode.data.selfStack === 0) {
          tmpPlayerNode = tmpPlayerNode.next;
        }
        return tmpPlayerNode;
      default:
        throw new Error('不正确的 stage');
    }
  }
  public isFinished(): boolean {
    return false;
  }
}

export { Stage };

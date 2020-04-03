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
  constructor() {
    this.current = GameStage.BEFORE_START;
  }
  public getCurrentStage() {
    return this.current;
  }
  public next() {
    switch (this.current) {
      case GameStage.BEFORE_START:
        this.current = GameStage.PRE_FLOP;
        break;
      default:
        break;
    }
  }
}

export { Stage };

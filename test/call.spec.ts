import { expect } from 'chai';
import { gameFactory, GameStage } from '../src/game';

const game = gameFactory.makeGame({ playerNumber: 5 });
let currentPlayerNode = game.start();

describe('#正常call', () => {
  it('大盲还能action', () => {
    currentPlayerNode = currentPlayerNode.data.call(); // UTG
    currentPlayerNode = currentPlayerNode.data.call(); // CO
    currentPlayerNode = currentPlayerNode.data.call(); // BTN
    let nextPlayerNode = currentPlayerNode;
    nextPlayerNode = currentPlayerNode.data.call(); // SB
    expect(nextPlayerNode.data.availableActions).to.deep.equal(['all in', 'raise', 'check', 'fold']);
    currentPlayerNode = nextPlayerNode;
    currentPlayerNode = currentPlayerNode.data.check(); // BB

    expect(game.getStage().getCurrentStage()).to.equal(GameStage.FLOP);
  });
});

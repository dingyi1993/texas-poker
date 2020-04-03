import { expect } from 'chai';
import { gameFactory } from '../src/game';


describe('#玩家位置名字正常', () => {
  it('小于等于4个', () => {
    const game = gameFactory.makeGame({ playerNumber: 3 });
    game.start();
    expect(game.players[0].positionName).to.equal('BTN');
    expect(game.players[1].positionName).to.equal('SB');
    expect(game.players[2].positionName).to.equal('BB');
    expect(game.players[0].positionName2).to.equal('UTG');
  });
  it('大于4个小于等于6个', () => {
    const game = gameFactory.makeGame({ playerNumber: 5 });
    game.start();
    expect(game.players[0].positionName).to.equal('BTN');
    expect(game.players[1].positionName).to.equal('SB');
    expect(game.players[2].positionName).to.equal('BB');
    expect(game.players[3].positionName).to.equal('UTG');
    expect(game.players[4].positionName).to.equal('CO');
  });
  it('大于6', () => {
    const game = gameFactory.makeGame({ playerNumber: 7 });
    game.start();
    expect(game.players[0].positionName).to.equal('BTN');
    expect(game.players[1].positionName).to.equal('SB');
    expect(game.players[2].positionName).to.equal('BB');
    expect(game.players[3].positionName).to.equal('UTG');
    expect(game.players[4].positionName).to.equal('+1');
    expect(game.players[5].positionName).to.equal('HJ');
    expect(game.players[6].positionName).to.equal('CO');
  });
});

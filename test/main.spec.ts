import { expect } from 'chai';
import { GameStage, gameFactory } from '../src/game';

const game = gameFactory.makeGame({ playerNumber: 6, buyIn: [600, 600, 400, 200, 200, 200] });
const { smallBlind, bigBlind } = game.options;
let currentPlayerNode = game.start();
let mainPot = game.pot.mainPot.amount;
let sidePot1 = 0;

describe('#初始化', () => {
  it('游戏配置正常', () => {
    // 玩家数大于等于2
    // 扑克52张正确
  });
});

describe('#翻前', () => {
  it('发牌', () => {
    expect(game.getStage().getCurrentStage()).to.equal(GameStage.PRE_FLOP);
    // SB 面前 1 块钱
    expect(game.getSbPlayerNode().data.currentPot).to.equal(smallBlind);
    // BB 面前 2 块钱
    expect(game.getBbPlayerNode().data.currentPot).to.equal(bigBlind);
    // 底池 3 块钱
    expect(game.pot.mainPot.amount).to.equal(smallBlind + bigBlind);
  });
  it('action', () => {
    // UTG 可能的 action
    expect(currentPlayerNode.data.availableActions).to.deep.equal(['all in', 'raise', 'call', 'fold']);
    // UTG call
    let nextPlayerNode = currentPlayerNode.data.call(); // UTG
    mainPot += bigBlind;
    // action 后无法再次 action
    expect(currentPlayerNode.data.availableActions).to.deep.equal([]);
    // 主池金额正确
    expect(game.pot.mainPot.amount).to.equal(mainPot);
    // 投入筹码数量正确
    expect(currentPlayerNode.data.currentPot).to.equal(bigBlind);
    // 后手正确
    expect(currentPlayerNode.data.selfStack).to.equal(200 - bigBlind);
    currentPlayerNode = nextPlayerNode;

    expect(currentPlayerNode.data.availableActions).to.deep.equal(['all in', 'raise', 'call', 'fold']);
    nextPlayerNode = currentPlayerNode.data.raise(150); // HJ
    mainPot += 150;
    expect(game.pot.mainPot.amount).to.equal(mainPot);
    expect(currentPlayerNode.data.currentPot).to.equal(150);
    expect(currentPlayerNode.data.selfStack).to.equal(50);
    currentPlayerNode = nextPlayerNode;
  });
  it('all in', () => {
    expect(currentPlayerNode.data.availableActions).to.deep.equal(['all in', 'call', 'fold']);
    const nextPlayerNode = currentPlayerNode.data.allIn(); // CO
    mainPot += 200;
    expect(game.pot.mainPot.amount).to.equal(mainPot);
    expect(currentPlayerNode.data.currentPot).to.equal(200);
    expect(currentPlayerNode.data.selfStack).to.equal(0);
    currentPlayerNode = nextPlayerNode;
  });
  it('re-raise', () => {
    expect(currentPlayerNode.data.availableActions).to.deep.equal(['all in', 'raise', 'call', 'fold']);
    let nextPlayerNode = currentPlayerNode.data.raise(400); // BTN
    mainPot += 400;
    // sidePot1 += 400 - 200;
    expect(game.pot.mainPot.amount).to.equal(mainPot);
    // expect(game.pot.sidePot[0].amount).to.equal(sidePot1);
    expect(currentPlayerNode.data.currentPot).to.equal(400);
    expect(currentPlayerNode.data.selfStack).to.equal(200);
    currentPlayerNode = nextPlayerNode;

    nextPlayerNode = currentPlayerNode.data.call(); // SB
    mainPot += 400 - 1;
    // sidePot1 += 400 - 200;
    expect(game.pot.mainPot.amount).to.equal(mainPot);
    // expect(game.pot.sidePot[0].amount).to.equal(sidePot1);
    expect(currentPlayerNode.data.currentPot).to.equal(400);
    expect(currentPlayerNode.data.selfStack).to.equal(200);
    currentPlayerNode = nextPlayerNode;

    expect(currentPlayerNode.data.availableActions).to.deep.equal(['all in', 'fold']);
    nextPlayerNode = currentPlayerNode.data.fold(); // BB
    expect(currentPlayerNode.data.isPlaying()).to.equal(false);
    currentPlayerNode = nextPlayerNode;

    expect(currentPlayerNode.data.availableActions).to.deep.equal(['all in', 'fold']);
    nextPlayerNode = currentPlayerNode.data.fold(); // UTG
    currentPlayerNode = nextPlayerNode;

    expect(currentPlayerNode.data.availableActions).to.deep.equal(['all in', 'fold']);
    nextPlayerNode = currentPlayerNode.data.allIn(); // HJ
    currentPlayerNode = nextPlayerNode;

    // expect(currentPlayerNode.data.availableActions).to.deep.equal(['all in', 'fold']);
    // nextPlayerNode = currentPlayerNode.data.fold(); // CO
    // currentPlayerNode = nextPlayerNode;
  });
  it('side pot', () => {
    // 计算边池
  });
  it('进入下一轮', () => {
    // 当没有all in的玩家下注量相等时，则进入下一轮
    // 阶段正确
    expect(game.getStage().getCurrentStage()).to.equal(GameStage.FLOP);
    // 先行动的是 SB，还有 200 后手
    expect(game.getCurrentPlayerNode()).to.equal(game.getSbPlayerNode());
  });
});
describe('#翻牌、转牌、河牌', () => {
  it('发牌', () => {
    // 发翻牌、转牌、河牌
  });
  it('action', () => {
    // SB开始行动，，最小下注为1BB，SB 行动前，其他玩家无法行动
  });
  it('进入下一轮', () => {
    // 如果是河牌，则进入show down阶段
  });
});

describe('#结算', () => {
  it('有边池', () => {
    // 最终赢的玩家赢的主池，其他边池对应的参与玩家，则在参与玩家中比较牌的大小，来决定谁来赢走这个边池
  });
  it('无边池', () => {
    // 最终赢的玩家赢的主池
  });
});

describe('#中途场外', () => {
  it('添加新玩家', () => {
    // 新来的可以直接分配位置，但是要当前游戏结束才能坐下
  });
  it('玩家弃牌离场', () => {
    // 保留当前玩家直到游戏结束
  });
  it('已有玩家买入', () => {
    // 最终赢的玩家赢的主池
  });
});

describe('#游戏结束', () => {
  it('买入', () => {
    // 如果有玩家需要买入筹码，则在此阶段
  });
  it('玩家数更新', () => {
    // 如果有新增玩家或者玩家离场，则需要更新游戏信息
  });
});

import { expect } from 'chai';
import { Game, GameStage, gameFactory } from '../src/game';

const game = gameFactory.makeGame();
const currentPlayerNode = game.start();
const { smallBlind, bigBlind } = game.options;

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
    expect(game.getSbPlayerNode().player.currentPot).to.equal(smallBlind);
    // BB 面前 2 块钱
    expect(game.getBbPlayerNode().player.currentPot).to.equal(bigBlind);
    // 底池 3 块钱
    expect(game.pot.mainPot.amount).to.equal(smallBlind + bigBlind);
  });
  it('action', () => {
    // UTG行动，最小下注为1BB，UTG 行动前，其他玩家无法行动
    // UTG 行动后，UTG+1行动前，其他玩家无法行动
    // UTG+1的加注量要为前面2倍，如果不够2倍，则all in
    // 如果此时就剩一位玩家，则游戏结束，底池归这个玩家所有
    currentPlayerNode.player.call();
    expect(game.pot.mainPot.amount).to.equal(smallBlind + bigBlind + bigBlind);
    expect(currentPlayerNode.player.currentPot).to.equal(bigBlind);
  });
  it('all in', () => {
    // all in时要分池，判断此时各个池子数量是否正确
  });
  it('进入下一轮', () => {
    // 当没有all in的玩家下注量相等时，则进入下一轮
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

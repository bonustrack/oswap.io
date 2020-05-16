import { numberFromSeed } from './';

export default class Factory {
  public pools: [];
  public pairs: [];

  constructor(pools, pairs) {
    this.pools = pools;
    this.pairs = pairs;
  }

  getPoolsByPair(assetA, assetB) {
    const order = numberFromSeed(assetA) > numberFromSeed(assetB);
    const asset0 = order ? assetA : assetB;
    const asset1 = order ? assetB : assetA;
    const pair = this.pairs[`${asset0}_${asset1}`];
    return pair && pair.pools ? pair.pools : [];
  }
}

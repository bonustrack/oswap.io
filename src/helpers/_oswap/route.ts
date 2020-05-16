import Pool from './pool';

export default class Route {
  public pools: [Pool];

  constructor(pools: [Pool]) {
    this.pools = pools;
  }

  async init() {
    const promises = this.pools.map(pool => pool.init());
    await Promise.all(promises);
  }

  hasLiquidity() {
    this.pools.forEach(pool => {
      if (!pool.hasLiquidity()) return false;
    });
    return true;
  }

  getAmountBought(inputAmount, inputAsset) {
    let i = 0;
    while (this.pools[i]) {
      inputAmount = this.pools[i].getAmountBought(inputAmount, inputAsset);
      inputAsset =
        this.pools[i].asset0 === inputAsset ? this.pools[i].asset1 : this.pools[i].asset0;
      i++;
    }
    return inputAmount;
  }

  getAmountSold(outputAmount, outputAsset) {
    let i = this.pools.length - 1;
    while (this.pools[i]) {
      outputAmount = this.pools[i].getAmountSold(outputAmount, outputAsset);
      outputAsset =
        this.pools[i].asset0 === outputAsset ? this.pools[i].asset1 : this.pools[i].asset0;
      i--;
    }
    return outputAmount;
  }
}

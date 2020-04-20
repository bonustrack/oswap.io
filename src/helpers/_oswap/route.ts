import Pair from './pair';

export default class Route {
  public pairs: [Pair];

  constructor(pairs: [Pair]) {
    this.pairs = pairs;
  }

  async init() {
    const promises = this.pairs.map(pair => pair.init());
    await Promise.all(promises);
  }

  hasLiquidity() {
    this.pairs.forEach(pair => {
      if (!pair.hasLiquidity()) return false;
    });
    return true;
  }

  getAmountBought(inputAmount, inputAsset) {
    let i = 0;
    while (this.pairs[i]) {
      inputAmount = this.pairs[i].getAmountBought(inputAmount, inputAsset);
      inputAsset =
        this.pairs[i].asset0 === inputAsset ? this.pairs[i].asset1 : this.pairs[i].asset0;
      i++;
    }
    return inputAmount;
  }

  getAmountSold(outputAmount, outputAsset) {
    let i = this.pairs.length - 1;
    while (this.pairs[i]) {
      outputAmount = this.pairs[i].getAmountSold(outputAmount, outputAsset);
      outputAsset =
        this.pairs[i].asset0 === outputAsset ? this.pairs[i].asset1 : this.pairs[i].asset0;
      i--;
    }
    return outputAmount;
  }
}

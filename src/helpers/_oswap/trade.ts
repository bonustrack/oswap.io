import Route from './route';
import Pair from './pair';

export default class Trade {
  public factory: any;
  public inputAsset: string;
  public outputAsset: string;
  public routes?: [] = [];

  constructor(factory, inputAsset, outputAsset) {
    this.factory = factory;
    this.inputAsset = inputAsset;
    this.outputAsset = outputAsset;
  }

  getRoute(inputAmount) {
    let bestRoute: any;
    let maxAmount = 0;
    // @ts-ignore
    this.routes.forEach((route, i) => {
      // @ts-ignore
      const outputAmount = route.getAmountBought(inputAmount, this.inputAsset);
      if (outputAmount > maxAmount) {
        maxAmount = outputAmount;
        bestRoute = route;
      }
    });
    return bestRoute;
  }

  getAmountBought(inputAmount) {
    let maxAmount = 0;
    // @ts-ignore
    this.routes.forEach((route, i) => {
      // @ts-ignore
      const outputAmount = route.getAmountBought(inputAmount, this.inputAsset);
      if (outputAmount > maxAmount) maxAmount = outputAmount;
    });
    return maxAmount;
  }

  getAmountSold(outputAmount) {
    let minAmount = 0;
    // @ts-ignore
    this.routes.forEach((route, i) => {
      // @ts-ignore
      const inputAmount = route.getAmountSold(outputAmount, this.outputAsset);
      if (!minAmount || inputAmount < minAmount) minAmount = inputAmount;
    });
    return minAmount;
  }

  async init() {
    const directPair = this.factory.allPairs[`${this.inputAsset}_${this.outputAsset}`];
    // @ts-ignore
    if (directPair) this.routes.push(this.toRoute([directPair]));
    if (this.inputAsset !== 'base' && this.outputAsset !== 'base') {
      const swap0 = this.factory.allPairs[`${this.inputAsset}_base`];
      const swap1 = this.factory.allPairs[`base_${this.outputAsset}`];
      // @ts-ignore
      if (swap0 && swap1) this.routes.push(this.toRoute([swap0, swap1]));
    }
    // @ts-ignore
    const promises = this.routes.map(route => route.init());
    await Promise.all(promises);
  }

  toRoute(addresses): Route {
    const pairs = addresses.map(address => {
      const assets = this.factory.getPair[address].split('_');
      return new Pair(address, assets);
    });
    return new Route(pairs);
  }
}

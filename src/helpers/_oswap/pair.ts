import { getInfo, getAmountBought, getAmountSold } from './';

export default class Pair {
  public ready: boolean = false;
  public address: string;
  public asset0: string;
  public asset1: string;
  public reserve0?: number;
  public reserve1?: number;
  public supply?: number;

  constructor(address, assets) {
    this.asset0 = assets[0];
    this.asset1 = assets[1];
    this.address = address;
  }

  async init() {
    const info = await getInfo(this.address);
    this.reserve0 = parseInt(info.reserve0);
    this.reserve1 = parseInt(info.reserve1);
    this.supply = parseInt(info.supply);
    this.ready = true;
  }

  hasLiquidity() {
    return !(!this.reserve0 || !this.reserve1 || !this.supply);
  }

  getAmountBought(inputAmount, inputAsset) {
    const inputReserve = inputAsset === this.asset0 ? this.reserve0 : this.reserve1;
    const outputReserve = inputAsset === this.asset1 ? this.reserve0 : this.reserve1;
    return getAmountBought(inputAmount, inputReserve, outputReserve);
  }

  getAmountSold(outputAmount, outputAsset) {
    const inputReserve = outputAsset === this.asset1 ? this.reserve0 : this.reserve1;
    const outputReserve = outputAsset === this.asset0 ? this.reserve0 : this.reserve1;
    return getAmountSold(outputAmount, outputReserve, inputReserve);
  }
}

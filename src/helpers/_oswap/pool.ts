import { getInfo, getAmountBought, getAmountSold } from './';

export default class Pool {
  public ready: boolean = false;
  public address: string;
  public asset0: string;
  public asset1: string;
  public swapFee: number = 0;
  public asset?: string;
  public reserve0?: number;
  public reserve1?: number;
  public supply?: number;
  public base?: number;

  constructor(address, assets) {
    this.asset0 = assets[0];
    this.asset1 = assets[1];
    this.address = address;
  }

  async init() {
    const info = await getInfo(this.address);
    this.swapFee = Math.floor(parseFloat(info.swap_fee));
    this.asset = info.asset;
    this.reserve0 = Math.floor(parseFloat(info.reserve0));
    this.reserve1 = Math.floor(parseFloat(info.reserve1));
    this.supply = Math.floor(parseFloat(info.supply));
    if (info.asset0 === 'base') this.base = info.reserve0;
    if (info.asset1 === 'base') this.base = info.reserve1;
    this.ready = true;
  }

  hasLiquidity() {
    return !(!this.reserve0 || !this.reserve1 || !this.supply);
  }

  getAmountBought(inputAmount, inputAsset) {
    const inputReserve = inputAsset === this.asset0 ? this.reserve0 : this.reserve1;
    const outputReserve = inputAsset === this.asset1 ? this.reserve0 : this.reserve1;
    return getAmountBought(inputAmount, inputReserve, outputReserve, this.swapFee);
  }

  getAmountSold(outputAmount, outputAsset) {
    const inputReserve = outputAsset === this.asset1 ? this.reserve0 : this.reserve1;
    const outputReserve = outputAsset === this.asset0 ? this.reserve0 : this.reserve1;
    return getAmountSold(outputAmount, outputReserve, inputReserve, this.swapFee);
  }

  assetValue(value, asset) {
    const decimals = asset ? asset.decimals : 0;
    return value / 10 ** decimals;
  }

  getPrice(assetId, settings) {
    if (this.reserve0 && this.reserve1) {
      const asset = settings.assets[assetId];
      const decimals = asset ? asset.decimals : 0;
      if (this.asset0 == assetId) {
        return (this.reserve1 / this.reserve0) * 10 ** decimals;
      } else if (this.asset1 == assetId) {
        return (this.reserve0 / this.reserve1) * 10 ** decimals;
      }
    }
    return 0;
  }

  getMarketcap(settings) {
    let assetValue0 = 0;
    let assetValue1 = 0;
    if (this.base) {
      assetValue0 = assetValue1 = (settings.exchangeRates.GBYTE_USD / 1e9) * this.base;
    } else {
      const assetId0 = this.asset0 === 'base' ? 'GBYTE' : this.asset0;
      const assetId1 = this.asset1 === 'base' ? 'GBYTE' : this.asset1;
      const asset0 = settings.assets[assetId0];
      const asset1 = settings.assets[assetId1];
      assetValue0 = settings.exchangeRates[`${assetId0}_USD`]
        ? settings.exchangeRates[`${assetId0}_USD`] * this.assetValue(this.reserve0, asset0)
        : 0;
      assetValue1 = settings.exchangeRates[`${assetId1}_USD`]
        ? settings.exchangeRates[`${assetId1}_USD`] * this.assetValue(this.reserve1, asset1)
        : 0;
    }
    return assetValue0 && assetValue1 ? assetValue0 + assetValue1 : 0;
  }
}

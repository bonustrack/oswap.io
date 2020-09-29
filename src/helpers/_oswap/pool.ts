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
    this.swapFee = parseInt(info.swap_fee);
    this.asset = info.asset;
    this.reserve0 = parseInt(info.reserve0);
    this.reserve1 = parseInt(info.reserve1);
    this.supply = parseInt(info.supply);
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

  getMarketcap(pool, settings) {
    let assetValue0 = 0;
    let assetValue1 = 0;
    if (pool.base) {
      assetValue0 = assetValue1 = (settings.exchangeRates.GBYTE_USD / 1e9) * pool.base;
    } else {
      const assetId0 = pool.asset0 === 'base' ? 'GBYTE' : pool.asset0;
      const assetId1 = pool.asset1 === 'base' ? 'GBYTE' : pool.asset1;
      const asset0 = settings.assets[assetId0];
      const asset1 = settings.assets[assetId1];
      assetValue0 = settings.exchangeRates[`${assetId0}_USD`]
        ? settings.exchangeRates[`${assetId0}_USD`] * this.assetValue(pool.reserve0, asset0)
        : 0;
      assetValue1 = settings.exchangeRates[`${assetId1}_USD`]
        ? settings.exchangeRates[`${assetId1}_USD`] * this.assetValue(pool.reserve1, asset1)
        : 0;
    }
    return assetValue0 && assetValue1 ? assetValue0 + assetValue1 : 0;
  }
}

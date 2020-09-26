<template>
  <div v-if="pool">
    <div>
      <label class="d-block">Swap fee</label>
      <span class="text-white" v-text="`${pool.swapFee / 1e9}%`" />
      <label class="d-block">Current pool size</label>
      <a :href="_explorerLink(pool.address)" target="_blank">
        <Amount :value="pool.reserve0" :asset="pool.asset0" /> <Ticker :asset="pool.asset0" /> +
        <Amount :value="pool.reserve1" :asset="pool.asset1" /> <Ticker :asset="pool.asset1" />
        <span v-if="pool.hasLiquidity() && usdValue"> ≈ ${{ usdValue.toFixed(2) }}</span>
        <Icon name="external-link" class="ml-1" size="18" />
      </a>
    </div>
    <div v-if="share">
      <label class="d-block">Your pool share</label>
      <span class="text-white">
        <Pie v-if="share > 1" class="mr-2" :percent="share" />
        {{ share }}%
      </span>
    </div>
  </div>
</template>

<script>
import { getBalance } from '@/helpers/_oswap';

export default {
  props: ['pool'],
  data() {
    return {
      share: 0
    };
  },
  created() {
    const balance = getBalance(this.auth.balances, this.pool.asset);
    this.share = parseFloat(((100 / this.pool.supply) * balance).toFixed(3));
  },
  watch: {
    async pool(value, oldValue) {
      if (value !== oldValue) {
        const balance = getBalance(this.auth.balances, this.pool.asset);
        this.share = parseFloat(((100 / this.pool.supply) * balance).toFixed(3));
      }
    }
  },
  methods: {
    assetValue(value, assetId) {
      const asset = this.settings.assets[assetId];
      const decimals = asset ? asset.decimals : 0;
      return value / 10 ** decimals;
    }
  },
  computed: {
    exchangeRates() {
      return this.settings.exchangeRates;
    },
    usdValue() {
      let assetValue0 = 0;
      let assetValue1 = 0;
      if (this.pool.base) {
        assetValue0 = assetValue1 = (this.exchangeRates.GBYTE_USD / 1e9) * this.pool.base;
      } else {
        const assetId0 = this.pool.asset0 === 'base' ? 'GBYTE' : this.pool.asset0;
        const assetId1 = this.pool.asset1 === 'base' ? 'GBYTE' : this.pool.asset1;
        assetValue0 = this.exchangeRates[`${assetId0}_USD`]
          ? this.exchangeRates[`${assetId0}_USD`] *
            this.assetValue(this.pool.reserve0, this.pool.asset0)
          : 0;
        assetValue1 = this.exchangeRates[`${assetId1}_USD`]
          ? this.exchangeRates[`${assetId1}_USD`] *
            this.assetValue(this.pool.reserve1, this.pool.asset1)
          : 0;
      }
      return assetValue0 && assetValue1 ? assetValue0 + assetValue1 : 0;
    }
  }
};
</script>

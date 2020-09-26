<template>
  <div class="container-sm px-3">
    <PoolNav :default="3" />
    <Box v-for="(pool, i) in pools" :key="i">
      <label class="d-block">Pool</label>
      <router-link class="d-block" :to="{ name: 'mint1', params: { address: pool.address } }">
        <Ticker class="h2" :asset="`${pool.asset0}_${pool.asset1}`" />
      </router-link>
      <PoolInfo :pool="pool" />
    </Box>
  </div>
</template>

<script>
import Pool from '@/helpers/_oswap/pool';

export default {
  data() {
    return {
      pools: {}
    };
  },
  async created() {
    const pools = [];
    const promises = [];
    Object.entries(this.settings.pools).forEach(([address, pool]) => {
      const p = new Pool(address, [pool.asset0, pool.asset1]);
      promises.push(p.init());
      pools.push(p);
    });
    await Promise.all(promises);
    this.pools = pools
      .map(pool => {
        pool.marketcap = this.getMarketcap(pool);
        return pool;
      })
      .sort((a, b) => (a.marketcap > b.marketcap ? -1 : 1));
  },
  methods: {
    assetValue(value, assetId) {
      const asset = this.settings.assets[assetId];
      const decimals = asset ? asset.decimals : 0;
      return value / 10 ** decimals;
    },
    getMarketcap(pool) {
      let assetValue0 = 0;
      let assetValue1 = 0;
      if (pool.base) {
        assetValue0 = assetValue1 = (this.settings.exchangeRates.GBYTE_USD / 1e9) * pool.base;
      } else {
        const assetId0 = pool.asset0 === 'base' ? 'GBYTE' : pool.asset0;
        const assetId1 = pool.asset1 === 'base' ? 'GBYTE' : pool.asset1;
        assetValue0 = this.settings.exchangeRates[`${assetId0}_USD`]
          ? this.settings.exchangeRates[`${assetId0}_USD`] *
            this.assetValue(pool.reserve0, pool.asset0)
          : 0;
        assetValue1 = this.settings.exchangeRates[`${assetId1}_USD`]
          ? this.settings.exchangeRates[`${assetId1}_USD`] *
            this.assetValue(pool.reserve1, pool.asset1)
          : 0;
      }
      return assetValue0 && assetValue1 ? assetValue0 + assetValue1 : 0;
    }
  }
};
</script>

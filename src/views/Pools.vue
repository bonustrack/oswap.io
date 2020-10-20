<template>
  <div class="container-sm px-3">
    <PoolNav :default="3" />
    <Box v-for="(pool, i) in pools" :key="i">
      <label class="d-block">Pool</label>
      <router-link class="d-block" :to="{ name: 'mint1', params: { poolAddress: pool.address } }">
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
        pool.marketcap = pool.getMarketcap(this.settings);
        return pool;
      })
      .sort((a, b) => (a.marketcap == b.marketcap ? 0 : a.marketcap > b.marketcap ? -1 : 1))
      .sort((a, b) =>
        a.hasLiquidity() == b.hasLiquidity() ? 0 : a.hasLiquidity() > b.hasLiquidity() ? -1 : 1
      );
  }
};
</script>

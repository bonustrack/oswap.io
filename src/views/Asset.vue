<template>
  <div class="container-sm px-3">
    <Box>
      <h1 v-if="id.length === 44 || id === 'base'">
        <span v-if="id !== 'base'">{{ id | shorten }}</span>
        <span v-else><Ticker class="h2" :asset="`${id}`"/></span>
      </h1>
      <h1 v-else>Invalid asset ID</h1>
      <div v-if="symbol" class="mt-2">
        <label>Symbol</label>
        <p v-text="symbol" class="text-white" />
        <label>Decimals</label>
        <p v-text="decimals" class="text-white" />
      </div>
      <div v-if="id.length === 44 && id !== 'base'">
        <router-link :to="'/create-pool/' + id" class="btn-mktg">
          Create new pool
        </router-link>
        <a
          v-if="!symbol"
          :href="`https://${config.testnet ? 'testnet.' : ''}tokens.ooo/`"
          class="btn-mktg ml-2"
        >
          Register token symbol
        </a>
      </div>
    </Box>
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
import { b64UriDec } from '@/helpers/utils';
import Pool from '@/helpers/_oswap/pool';
import config from '@/helpers/config';

export default {
  data() {
    return {
      id: b64UriDec(this.$route.params[0] || this.$route.params.pathMatch || ''),
      pools: {},
      config
    };
  },
  async created() {
    const pools = [];
    const promises = [];
    Object.entries(this.settings.pools)
      .filter(([address, pool]) => pool.asset0 === this.id || pool.asset1 === this.id)
      .forEach(([address, pool]) => {
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
  },
  computed: {
    symbol() {
      return this.settings.assetToSymbol[this.id] || '';
    },
    decimals() {
      return this.settings.decimals[this.id] || 0;
    }
  }
};
</script>

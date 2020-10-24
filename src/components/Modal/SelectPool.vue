<template>
  <Modal :open="open" @close="$emit('close')">
    <div>
      <input
        ref="query"
        id="query"
        autofocus
        autocomplete="off"
        class="form-control input-amount border-0 m-0 p-4 width-full"
        placeholder="Search"
        v-model="query"
      />
    </div>
    <div class="modal-body flex-auto mb-5">
      <a
        class="d-block py-2 px-4 text-white highlight d-flex"
        @click="selectPool(pool.address)"
        v-for="(pool, i) in pools"
        :key="i"
      >
        <div class="flex-auto">
          <Ticker :asset="`${pool.asset0}_${pool.asset1}`" />
          <span class="text-gray ml-2" v-text="`${pool.swapFee / 1e9}%`" />
        </div>
        <Amount
          class="ml-2"
          v-if="balances[pool.asset] && getBalance(balances, pool.asset) > 0"
          :asset="pool.asset"
          :value="getBalance(balances, pool.asset)"
        />
      </a>
      <router-link :to="{ name: 'create' }" class="d-block py-2 px-4 text-white">
        Create a pool
      </router-link>
    </div>
  </Modal>
</template>

<script>
import Pool from '@/helpers/_oswap/pool';
import { getBalance } from '@/helpers/_oswap';

export default {
  props: ['open', 'not'],
  data() {
    return {
      query: '',
      pools: {},
      allPools: {}
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
    this.allPools = this.pools = pools
      .map(pool => {
        pool.marketcap = pool.getMarketcap(this.settings);
        return pool;
      })
      .sort((a, b) => (a.marketcap == b.marketcap ? 0 : a.marketcap > b.marketcap ? -1 : 1))
      .sort((a, b) =>
        a.hasLiquidity() == b.hasLiquidity() ? 0 : a.hasLiquidity() > b.hasLiquidity() ? -1 : 1
      );
  },
  watch: {
    async query(value, oldValue) {
      if (value !== oldValue) {
        const assets = this.settings.assets;
        this.pools = [];
        Object.entries(this.allPools).forEach(([address, pool]) => {
          let str = `${assets[pool.asset0].symbol}-${assets[pool.asset1].symbol}`;
          str += `${pool.asset0}-${pool.asset1}`;
          if (pool.asset && str.toLowerCase().includes(this.query.toLowerCase())) {
            this.pools.push(pool);
          }
        });
      }
    }
  },
  computed: {
    balances() {
      return this.auth.balances;
    }
  },
  methods: {
    selectPool(poolAddress) {
      // this.$emit('pool', poolAddress);
      // this.$emit('close');
      this.$router.push({ name: this.$router.name, params: { poolAddress } });
    },
    getBalance
  }
};
</script>

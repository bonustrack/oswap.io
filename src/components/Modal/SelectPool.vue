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
        @click="selectPool(i)"
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
          :asset="i"
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
      query: ''
    };
  },
  computed: {
    pools() {
      const pools = {};
      const assets = this.settings.assets;
      Object.entries(this.settings.pools).forEach(pool => {
        let str = `${assets[pool[1].asset0].symbol}-${assets[pool[1].asset1].symbol}`;
        str += `${pool[1].asset0}-${pool[1].asset1}`;
        if (pool[1].asset && str.toLowerCase().includes(this.query.toLowerCase())) {
          pools[pool[0]] = new Pool(pool[0], [pool[1].asset0, pool[1].asset1]);
          pools[pool[0]].asset = pool[1].asset;
          pools[pool[0]].swapFee = pool[1].swap_fee;
        }
      });
      return pools;
    },
    balances() {
      return this.auth.balances;
    }
  },
  methods: {
    selectPool(pool) {
      // this.$emit('pool', pool);
      // this.$emit('close');
      this.$router.push({ name: this.$router.name, params: { pool_address: pool } });
    },
    getBalance
  }
};
</script>

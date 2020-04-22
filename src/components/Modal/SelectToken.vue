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
        class="d-block py-2 px-4 text-white highlight"
        @click="selectAsset(i)"
        v-for="(asset, i) in assets"
        :key="i"
      >
        <Ticker :asset="i" />
        <Amount
          class="float-right"
          v-if="balances[i] && getBalance(balances, i) > 0"
          :asset="i"
          :value="getBalance(balances, i)"
        />
      </a>
      <router-link to="/create-pair" class="d-block py-2 px-4 text-white">
        Create pair
      </router-link>
    </div>
  </Modal>
</template>

<script>
import { getBalance } from '@/helpers/_oswap';

export default {
  props: ['open', 'not', 'values'],
  data() {
    return {
      query: ''
    };
  },
  computed: {
    assets() {
      const assets = {};
      Object.entries(this.$store.state.settings.assets).forEach(asset => {
        const str = `${asset[1].symbol}-${asset[0]}`;
        if (
          str.toLowerCase().includes(this.query.toLowerCase()) &&
          asset[0] !== this.not &&
          (!this.values || this.values.includes(asset[0]))
        )
          assets[asset[0]] = asset[1];
      });
      return assets;
    },
    balances() {
      return this.$store.state.auth.balances;
    }
  },
  methods: {
    selectAsset(asset) {
      this.$emit('asset', asset);
      this.$emit('close');
    },
    getBalance
  }
};
</script>

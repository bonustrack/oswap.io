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
        @click="selectPair(i)"
        v-for="(pair, i) in pairs"
        :key="i"
      >
        <Ticker :asset="i" />
        <Amount
          class="float-right"
          v-if="balances[pair.asset] && getBalance(balances, pair.asset) > 0"
          :asset="i"
          :value="getBalance(balances, pair.asset)"
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
  props: ['open', 'not'],
  data() {
    return {
      query: ''
    };
  },
  computed: {
    pairs() {
      const pairs = {};
      const assets = this.$store.state.settings.assets;
      Object.entries(this.$store.state.settings.getPair).forEach(pair => {
        const [asset0, asset1] = pair[1].split('_');
        if (assets[asset0] && assets[asset1]) {
          const asset = this.$store.state.settings.getAsset[pair[0]];
          const str = `${assets[asset0].symbol}-${assets[asset1].symbol}-${asset0}-${asset1}`;
          if (asset && str.toLowerCase().includes(this.query.toLowerCase()))
            pairs[pair[1]] = { asset, asset0, asset1 };
        }
      });
      return pairs;
    },
    balances() {
      return this.$store.state.auth.balances;
    }
  },
  methods: {
    selectPair(pair) {
      this.$emit('pair', pair);
      this.$emit('close');
    },
    getBalance
  }
};
</script>

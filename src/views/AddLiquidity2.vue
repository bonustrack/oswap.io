<template>
  <form @submit.prevent="handleSubmit">
    <div class="container-sm px-3">
      <PoolNav :default="1" />
      <Box>
        <label class="d-block">Pool</label>
        <ButtonSelectPair customClass="h2 d-block" v-model="id" />
        <div v-if="pair">
          <label class="d-block">Current pool size</label>
          <a :href="`https://testnetexplorer.obyte.org/#${pair.address}`" target="_blank">
            <Amount :value="pair.reserve0" :asset="pair.asset0" /> <Ticker :asset="pair.asset0" /> +
            <Amount :value="pair.reserve1" :asset="pair.asset1" /> <Ticker :asset="pair.asset1" />
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
      </Box>
      <Box v-if="pair.asset0 && pair.reserve0 && pair.reserve1" class="d-flex">
        <div class="flex-auto">
          <label for="amount" class="d-block">
            Deposit
            <LabelBalance :asset="asset" @select="setAmount" />
          </label>
          <InputAmount id="amount" v-model="amount" :asset="asset" />
        </div>
        <div class="text-right mt-4 ml-4">
          <ButtonSelectToken
            :default="pair.asset0"
            :values="[pair.asset0, pair.asset1]"
            v-model="asset"
          />
        </div>
      </Box>
      <div class="text-center">
        <button class="btn-submit px-6 rounded-2 mb-3" type="submit" :disabled="!asset || !amount">
          Add liquidity
        </button>
      </div>
    </div>
  </form>
</template>

<script>
import Pair from '@/helpers/_oswap/pair';
import { generateUri, getBalance } from '@/helpers/_oswap';

export default {
  data() {
    return {
      id: false,
      pair: false,
      asset: '',
      amount: '',
      share: 0
    };
  },
  watch: {
    async id(value, oldValue) {
      if (value !== oldValue) {
        this.amount = '';
        const address = this.$store.state.settings.allPairs[value];
        const pair = new Pair(address, value.split('_'));
        await pair.init();
        const balance = getBalance(this.$store.state.auth.balances, pair.asset);
        this.share = parseFloat(((100 / pair.supply) * balance).toFixed(3));
        this.pair = pair;
      }
    }
  },
  methods: {
    setAmount(amount) {
      this.amount = amount;
    },
    handleSubmit() {
      const data = { mint: '1' };
      const address = this.pair.address;
      location.href = generateUri(address, data, this.amount, this.asset);
    }
  }
};
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div class="container-sm px-3">
      <Box class="d-flex">
        <div class="flex-auto">
          <label for="inputAmount" class="d-block">
            Pool tokens
            <LabelBalance :asset="asset" @select="selectAmount" />
          </label>
          <InputAmount id="inputAmount" v-model="inputAmount" />
        </div>
        <div class="text-right mt-4 ml-4">
          <ButtonSelectPair v-model="pair" />
        </div>
      </Box>
      <Box>
        <label for="outputAmounts" class="d-block">Output</label>
        <input
          readonly
          id="outputAmounts"
          type="text"
          autocomplete="off"
          class="form-control input-amount border-0 p-0"
          :value="outputAmounts"
        />
      </Box>
      <div class="text-center">
        <button
          class="btn-submit px-6 rounded-2 mb-3"
          type="submit"
          :disabled="!pair || !inputAmount"
        >
          Remove liquidity
        </button>
        <p>Or, <router-link to="/add-liquidity">add liquidity</router-link></p>
      </div>
    </div>
  </form>
</template>

<script>
import { getInfo, toString, generateUri } from '@/helpers/_oswap';
import { shorten } from '@/helpers/utils';

export default {
  data() {
    return {
      inputAmount: 0,
      pair: null,
      asset: null,
      supply: 0,
      asset0: null,
      asset1: null,
      reserve0: 0,
      reserve1: 0
    };
  },
  watch: {
    async pair(value, oldValue) {
      if (value && value !== oldValue) {
        this.reset();
        const address = this.$store.state.settings.allPairs[value];
        const info = await getInfo(address);
        this.asset = info.asset;
        this.supply = info.supply;
        this.asset0 = info.asset0;
        this.asset1 = info.asset1;
        this.reserve0 = info.reserve0;
        this.reserve1 = info.reserve1;
      }
    }
  },
  computed: {
    outputAmounts() {
      if (
        !this.pair ||
        !this.inputAmount ||
        isNaN(this.inputAmount) ||
        !this.reserve0 ||
        !this.reserve1
      )
        return '';
      const { assets } = this.$store.state.settings;
      const asset0Str = assets[this.asset0].symbol || shorten(this.asset0);
      const asset1Str = assets[this.asset1].symbol || shorten(this.asset1);
      const investorShare = this.inputAmount / parseInt(this.supply);
      const minted0 = toString(investorShare * this.reserve0, assets[this.asset0].decimals);
      const minted1 = toString(investorShare * this.reserve1, assets[this.asset1].decimals);
      return `${minted0} ${asset0Str} + ${minted1} ${asset1Str}`;
    }
  },
  methods: {
    selectAmount(amount) {
      this.inputAmount = amount;
    },
    reset() {
      this.asset = null;
      this.supply = 0;
      this.asset0 = null;
      this.asset1 = null;
      this.reserve0 = 0;
      this.reserve1 = 0;
    },
    handleSubmit() {
      const address = this.$store.state.settings.allPairs[this.pair];
      location.href = generateUri(address, {}, this.inputAmount, this.asset);
    }
  }
};
</script>

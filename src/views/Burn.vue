<template>
  <form @submit.prevent="handleSubmit">
    <div class="container-sm px-3">
      <PoolNav :default="2" />
      <Box class="d-flex">
        <div class="flex-auto">
          <label for="inputAmount" class="d-block">
            Pool tokens
            <LabelBalance :asset="asset" @select="selectAmount" />
          </label>
          <InputAmount id="inputAmount" v-model="inputAmount" />
        </div>
        <div class="text-right mt-4 ml-4">
          <ButtonSelectPool :default="poolAddress" v-model="selectedPool" />
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
          :disabled="!selectedPool || !inputAmount"
        >
          Remove liquidity
        </button>
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
      selectedPool: null,
      asset: null,
      supply: 0,
      poolAddress: this.$route.params.poolAddress,
      asset0: null,
      asset1: null,
      reserve0: 0,
      reserve1: 0
    };
  },
  watch: {
    async selectedPool(value, oldValue) {
      if (value && value !== oldValue) {
        this.reset();
        const info = await getInfo(value);
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
        !this.selectedPool ||
        !this.inputAmount ||
        isNaN(this.inputAmount) ||
        !this.reserve0 ||
        !this.reserve1
      )
        return '';
      const { assets } = this.settings;
      const asset0Str = assets[this.asset0].symbol || shorten(this.asset0);
      const asset1Str = assets[this.asset1].symbol || shorten(this.asset1);
      const investorShare = this.inputAmount / parseInt(this.supply);
      const amount0 = Math.floor(investorShare * this.reserve0);
      const minted0 = toString(amount0, assets[this.asset0].decimals);
      const amount1 = Math.floor(investorShare * this.reserve1);
      const minted1 = toString(amount1, assets[this.asset1].decimals);
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
      const url = generateUri(this.selectedPool, {}, this.inputAmount, this.asset);
      if (navigator.userAgent.indexOf('Firefox') != -1) {
        const opener = window.open(url, '', 'width=1,height=1,resizable=no');
        setTimeout(function() {
          opener.close();
        }, 5000);
      } else {
        location.href = generateUri(url);
      }
    }
  }
};
</script>

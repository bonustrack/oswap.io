<template>
  <form @submit.prevent="handleSubmit">
    <div class="container-sm px-3">
      <PoolNav :default="1" />
      <BoxSelectPool :poolAddress="poolAddress" v-model="selectedPool" />
      <Box
        v-if="selectedPool.asset0 && selectedPool.reserve0 && selectedPool.reserve1"
        class="d-flex"
      >
        <div class="flex-auto">
          <label for="amount" class="d-block">
            Deposit
            <LabelBalance :asset="asset" @select="setAmount" />
          </label>
          <InputAmount id="amount" v-model="amount" :asset="asset" />
        </div>
        <div class="text-right mt-4 ml-4">
          <ButtonSelectToken :values="[selectedPool.asset0, selectedPool.asset1]" v-model="asset" />
        </div>
      </Box>
      <Box>
        <p class="text-white m-0">
          Adding liquidity with just one token is same as swapping a token, and then automatically adding
          liquidity with both tokens. Use with caution!
        </p>
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
import { generateUri } from '@/helpers/_oswap';

export default {
  data() {
    return {
      selectedPool: false,
      asset: '',
      poolAddress: this.$route.params.poolAddress,
      amount: ''
    };
  },
  watch: {
    async selectedPool(value, oldValue) {
      if (value !== oldValue) {
        this.amount = '';
      }
    }
  },
  methods: {
    setAmount(amount) {
      this.amount = amount;
    },
    handleSubmit() {
      const data = { mint: '1' };
      const address = this.selectedPool.address;
      const url = generateUri(address, data, this.amount, this.asset);
      if (navigator.userAgent.indexOf('Firefox') != -1) {
        const opener = window.open(url, '', 'width=1,height=1,resizable=no');
        setTimeout(function() {
          opener.close();
        }, 5000);
      } else {
        location.href = url;
      }
    }
  }
};
</script>

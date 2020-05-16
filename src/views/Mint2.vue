<template>
  <form @submit.prevent="handleSubmit">
    <div class="container-sm px-3">
      <PoolNav :default="1" />
      <BoxSelectPool v-model="pool" />
      <Box v-if="pool.asset0 && pool.reserve0 && pool.reserve1" class="d-flex">
        <div class="flex-auto">
          <label for="amount" class="d-block">
            Deposit
            <LabelBalance :asset="asset" @select="setAmount" />
          </label>
          <InputAmount id="amount" v-model="amount" :asset="asset" />
        </div>
        <div class="text-right mt-4 ml-4">
          <ButtonSelectToken
            :default="pool.asset0"
            :values="[pool.asset0, pool.asset1]"
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
import { generateUri } from '@/helpers/_oswap';

export default {
  data() {
    return {
      pool: false,
      asset: '',
      amount: ''
    };
  },
  watch: {
    async pool(value, oldValue) {
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
      const address = this.pool.address;
      location.href = generateUri(address, data, this.amount, this.asset);
    }
  }
};
</script>

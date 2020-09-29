<template>
  <form @submit.prevent="handleSubmit">
    <div class="container-sm px-3">
      <PoolNav :default="1" />
      <BoxSelectPool :pool_address="pool_address" v-model="selected_pool" />
      <Box
        v-if="selected_pool.asset0 && selected_pool.reserve0 && selected_pool.reserve1"
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
          <ButtonSelectToken
            :default="selected_pool.asset0"
            :values="[selected_pool.asset0, selected_pool.asset1]"
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
      selected_pool: false,
      asset: '',
      pool_address: this.$route.params.pool_address,
      amount: ''
    };
  },
  watch: {
    async selected_pool(value, oldValue) {
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
      const address = this.selected_pool.address;
      location.href = generateUri(address, data, this.amount, this.asset);
    }
  }
};
</script>

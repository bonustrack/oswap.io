<template>
  <form @submit.prevent="handleSubmit">
    <div class="container-sm px-3">
      <PoolNav />
      <BoxSelectPool :pool_address="pool_address" v-model="selected_pool" />
      <template v-if="selected_pool.asset0">
        <Box class="d-flex">
          <div class="flex-auto">
            <label for="amount0" class="d-block">
              Deposit
              <LabelBalance :asset="selected_pool.asset0" @select="setAmount0" />
            </label>
            <InputAmount
              id="amount0"
              v-model="amount0"
              :asset="selected_pool.asset0"
              @change="updateAmount1"
            />
          </div>
          <div class="text-right mt-4 ml-4">
            <router-link :to="'/asset/' + selected_pool.asset0" class="btn-mktg">
              <Ticker :asset="selected_pool.asset0" />
            </router-link>
          </div>
        </Box>
        <Box class="d-flex">
          <div class="flex-auto">
            <label for="amount1" class="d-block">
              Deposit
              <LabelBalance :asset="selected_pool.asset1" @select="setAmount1" />
            </label>
            <InputAmount
              id="amount1"
              v-model="amount1"
              :asset="selected_pool.asset1"
              @change="updateAmount0"
            />
          </div>
          <div class="text-right mt-4 ml-4">
            <router-link :to="'/asset/' + selected_pool.asset1" class="btn-mktg">
              <Ticker :asset="selected_pool.asset1" />
            </router-link>
          </div>
        </Box>
      </template>
      <div class="text-center">
        <button
          class="btn-submit px-6 rounded-2 mb-3"
          type="submit"
          :disabled="!selected_pool || !amount0"
        >
          Add liquidity
        </button>
      </div>
    </div>
  </form>
</template>

<script>
import { randomBytes } from 'crypto';
import texto from '@/helpers/texto';
import { generatePaymentMessage } from '@/helpers/_oswap';
import { shorten } from '@/helpers/utils';

export default {
  data() {
    return {
      selected_pool: false,
      amount0: '',
      amount1: '',
      pool_address: this.$route.params.pool_address
    };
  },
  watch: {
    async selected_pool(value, oldValue) {
      if (value !== oldValue) {
        this.amount0 = '';
        this.amount1 = '';
      }
    }
  },
  methods: {
    setAmount0(amount) {
      this.amount0 = amount;
      this.updateAmount1();
    },
    setAmount1(amount) {
      this.amount1 = amount;
      this.updateAmount0();
    },
    updateAmount0() {
      if (!this.amount1 || !this.selected_pool || !this.selected_pool.hasLiquidity()) return;
      const k = this.selected_pool.reserve0 / this.selected_pool.reserve1;
      this.amount0 = (k * this.amount1).toFixed();
    },
    updateAmount1() {
      if (!this.amount0 || !this.selected_pool || !this.selected_pool.hasLiquidity()) return;
      const k = this.selected_pool.reserve0 / this.selected_pool.reserve1;
      this.amount1 = (this.amount0 / k).toFixed();
    },
    handleSubmit() {
      const assets = this.settings.assets;
      const address = this.selected_pool.address;
      const payments = [
        { address, amount: parseInt(this.amount0), asset: this.selected_pool.asset0 },
        { address, amount: parseInt(this.amount1), asset: this.selected_pool.asset1 }
      ];
      if (this.selected_pool.asset0 !== 'base' && this.selected_pool.asset1 !== 'base')
        payments.push({ address, amount: 1e4 });
      const paymentJsonBase64 = generatePaymentMessage({ payments });
      const asset0Str =
        assets[this.selected_pool.asset0].symbol || shorten(this.selected_pool.asset0);
      const asset1Str =
        assets[this.selected_pool.asset1].symbol || shorten(this.selected_pool.asset1);
      const pool = `${asset0Str}-${asset1Str}`;
      const message = `Add liquidity ${pool}\n[add-liquidity](payment:${paymentJsonBase64})`;
      const requestId = randomBytes(32).toString('base64');
      texto.on('pairing', msg => {
        if (msg.body.pairing_secret === requestId) msg.reply(message);
      });
      location.href = `${this.auth.invite}#${requestId}`;
    }
  }
};
</script>

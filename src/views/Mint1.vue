<template>
  <form @submit.prevent="handleSubmit">
    <div class="container-sm px-3">
      <PoolNav />
      <BoxSelectPool :address="address" v-model="pool" />
      <template v-if="pool.asset0">
        <Box class="d-flex">
          <div class="flex-auto">
            <label for="amount0" class="d-block">
              Deposit
              <LabelBalance :asset="pool.asset0" @select="setAmount0" />
            </label>
            <InputAmount
              id="amount0"
              v-model="amount0"
              :asset="pool.asset0"
              @change="updateAmount1"
            />
          </div>
          <div class="text-right mt-4 ml-4">
            <Ticker class="btn-mktg" :asset="pool.asset0" />
          </div>
        </Box>
        <Box class="d-flex">
          <div class="flex-auto">
            <label for="amount1" class="d-block">
              Deposit
              <LabelBalance :asset="pool.asset1" @select="setAmount1" />
            </label>
            <InputAmount
              id="amount1"
              v-model="amount1"
              :asset="pool.asset1"
              @change="updateAmount0"
            />
          </div>
          <div class="text-right mt-4 ml-4">
            <Ticker class="btn-mktg" :asset="pool.asset1" />
          </div>
        </Box>
      </template>
      <div class="text-center">
        <button class="btn-submit px-6 rounded-2 mb-3" type="submit" :disabled="!pool || !amount0">
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
      pool: false,
      amount0: '',
      amount1: '',
      address: this.$route.params.address
    };
  },
  watch: {
    async pool(value, oldValue) {
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
      if (!this.amount1 || !this.pool || !this.pool.hasLiquidity()) return;
      const k = this.pool.reserve0 / this.pool.reserve1;
      this.amount0 = (k * this.amount1).toFixed();
    },
    updateAmount1() {
      if (!this.amount0 || !this.pool || !this.pool.hasLiquidity()) return;
      const k = this.pool.reserve0 / this.pool.reserve1;
      this.amount1 = (this.amount0 / k).toFixed();
    },
    handleSubmit() {
      const assets = this.$store.state.settings.assets;
      const address = this.pool.address;
      const payments = [
        { address, amount: parseInt(this.amount0), asset: this.pool.asset0 },
        { address, amount: parseInt(this.amount1), asset: this.pool.asset1 }
      ];
      if (this.pool.asset0 !== 'base' && this.pool.asset1 !== 'base')
        payments.push({ address, amount: 1e4 });
      const paymentJsonBase64 = generatePaymentMessage({ payments });
      const asset0Str = assets[this.pool.asset0].symbol || shorten(this.pool.asset0);
      const asset1Str = assets[this.pool.asset1].symbol || shorten(this.pool.asset1);
      const pool = `${asset0Str}-${asset1Str}`;
      const message = `Add liquidity ${pool}\n[add-liquidity](payment:${paymentJsonBase64})`;
      const requestId = randomBytes(32).toString('base64');
      texto.on('pairing', msg => {
        if (msg.body.pairing_secret === requestId) msg.reply(message);
      });
      location.href = `${this.$store.state.auth.invite}#${requestId}`;
    }
  }
};
</script>

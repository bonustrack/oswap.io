<template>
  <form @submit.prevent="handleSubmit">
    <div class="container-sm px-3">
      <PoolNav />
      <Box>
        <label class="d-block">Pool</label>
        <ButtonSelectPair customClass="h2 d-block" v-model="id" />
        <div v-if="pair">
          <label class="d-block">
            Current pool size
          </label>
          <a :href="`https://testnetexplorer.obyte.org/#${pair.address}`" target="_blank">
            <Amount :value="pair.reserve0" :asset="pair.asset0" /> <Ticker :asset="pair.asset0" /> +
            <Amount :value="pair.reserve1" :asset="pair.asset1" /> <Ticker :asset="pair.asset1" />
            <Icon name="external-link" class="ml-1" size="18" />
          </a>
        </div>
      </Box>
      <template v-if="pair.asset0">
        <Box class="d-flex">
          <div class="flex-auto">
            <label for="amount0" class="d-block">
              Deposit
              <LabelBalance :asset="pair.asset0" @select="setAmount0" />
            </label>
            <InputAmount
              id="amount0"
              v-model="amount0"
              :asset="pair.asset0"
              @change="updateAmount1"
            />
          </div>
          <div class="text-right mt-4 ml-4">
            <Ticker class="btn-mktg" :asset="pair.asset0" />
          </div>
        </Box>
        <Box class="d-flex">
          <div class="flex-auto">
            <label for="amount1" class="d-block">
              Deposit
              <LabelBalance :asset="pair.asset1" @select="setAmount1" />
            </label>
            <InputAmount
              id="amount1"
              v-model="amount1"
              :asset="pair.asset1"
              @change="updateAmount0"
            />
          </div>
          <div class="text-right mt-4 ml-4">
            <Ticker class="btn-mktg" :asset="pair.asset1" />
          </div>
        </Box>
      </template>
      <div class="text-center">
        <button class="btn-submit px-6 rounded-2 mb-3" type="submit" :disabled="!id || !amount0">
          Add liquidity
        </button>
      </div>
    </div>
  </form>
</template>

<script>
import { randomBytes } from 'crypto';
import texto from '@/helpers/texto';
import Pair from '@/helpers/_oswap/pair';
import { generatePaymentMessage } from '@/helpers/_oswap';
import { shorten } from '@/helpers/utils';

export default {
  data() {
    return {
      id: false,
      pair: false,
      amount0: '',
      amount1: ''
    };
  },
  watch: {
    async id(value, oldValue) {
      if (value !== oldValue) {
        this.amount0 = '';
        this.amount1 = '';
        const address = this.$store.state.settings.allPairs[value];
        const pair = new Pair(address, value.split('_'));
        await pair.init();
        this.pair = pair;
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
      if (!this.amount1 || !this.pair || !this.pair.hasLiquidity()) return;
      const k = this.pair.reserve0 / this.pair.reserve1;
      this.amount0 = (k * this.amount1).toFixed();
    },
    updateAmount1() {
      if (!this.amount0 || !this.pair || !this.pair.hasLiquidity()) return;
      const k = this.pair.reserve0 / this.pair.reserve1;
      this.amount1 = (this.amount0 / k).toFixed();
    },
    handleSubmit() {
      const assets = this.$store.state.settings.assets;
      const address = this.pair.address;
      const payments = [
        { address, amount: parseInt(this.amount0), asset: this.pair.asset0 },
        { address, amount: parseInt(this.amount1), asset: this.pair.asset1 }
      ];
      if (this.pair.asset0 !== 'base' && this.pair.asset1 !== 'base')
        payments.push({ address, amount: 1e4 });
      const paymentJsonBase64 = generatePaymentMessage({ payments });
      const asset0Str = assets[this.pair.asset0].symbol || shorten(this.pair.asset0);
      const asset1Str = assets[this.pair.asset1].symbol || shorten(this.pair.asset1);
      const pair = `${asset0Str}-${asset1Str}`;
      const message = `Add liquidity ${pair}\n[add-liquidity](payment:${paymentJsonBase64})`;
      const requestId = randomBytes(32).toString('base64');
      texto.on('pairing', msg => {
        if (msg.body.pairing_secret === requestId) msg.reply(message);
      });
      location.href = `${this.$store.state.auth.invite}#${requestId}`;
    }
  }
};
</script>

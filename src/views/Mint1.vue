<template>
  <form @submit.prevent="handleSubmit">
    <div class="container-sm px-3">
      <PoolNav />
      <BoxSelectPool :poolAddress="poolAddress" v-model="selectedPool" />
      <template v-if="selectedPool.asset0">
        <Box class="d-flex">
          <div class="flex-auto">
            <label for="amount0" class="d-block">
              Deposit
              <LabelBalance :asset="selectedPool.asset0" @select="setAmount0" />
            </label>
            <InputAmount
              id="amount0"
              v-model="amount0"
              :asset="selectedPool.asset0"
              @change="updateAmount1"
            />
          </div>
          <div class="text-right mt-4 ml-4">
            <router-link :to="'/asset/' + selectedPool.asset0" class="btn-mktg">
              <Ticker :asset="selectedPool.asset0" />
            </router-link>
          </div>
        </Box>
        <Box class="d-flex">
          <div class="flex-auto">
            <label for="amount1" class="d-block">
              Deposit
              <LabelBalance :asset="selectedPool.asset1" @select="setAmount1" />
            </label>
            <InputAmount
              id="amount1"
              v-model="amount1"
              :asset="selectedPool.asset1"
              @change="updateAmount0"
            />
          </div>
          <div class="text-right mt-4 ml-4">
            <router-link :to="'/asset/' + selectedPool.asset1" class="btn-mktg">
              <Ticker :asset="selectedPool.asset1" />
            </router-link>
          </div>
        </Box>
      </template>
      <div class="text-center">
        <button
          class="btn-submit px-6 rounded-2 mb-3"
          type="submit"
          :disabled="!selectedPool || !amount0"
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
      selectedPool: false,
      amount0: '',
      amount1: '',
      poolAddress: this.$route.params.poolAddress
    };
  },
  watch: {
    async selectedPool(value, oldValue) {
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
      if (!this.amount1 || !this.selectedPool || !this.selectedPool.hasLiquidity()) return;
      const k = this.selectedPool.reserve0 / this.selectedPool.reserve1;
      this.amount0 = (k * this.amount1).toFixed();
    },
    updateAmount1() {
      if (!this.amount0 || !this.selectedPool || !this.selectedPool.hasLiquidity()) return;
      const k = this.selectedPool.reserve0 / this.selectedPool.reserve1;
      this.amount1 = (this.amount0 / k).toFixed();
    },
    handleSubmit() {
      const assets = this.settings.assets;
      const address =
        !this.selectedPool.reserve0 || !this.selectedPool.reserve1 // check if pool has ratio
          ? this.selectedPool.address
          : this.settings.poolToProxy[this.selectedPool.address] || this.selectedPool.address;
      let amount0 = this.amount0;
      let amount1 = this.amount1;
      // add 2000 extra bytes when via proxy
      if (address !== this.selectedPool.address) {
        if (this.selectedPool.asset0 === 'base') {
          amount0 += 2e3;
        }
        if (this.selectedPool.asset1 === 'base') {
          amount1 += 2e3;
        }
      }
      const payments = [
        { address, amount: Math.floor(parseFloat(amount0)), asset: this.selectedPool.asset0 },
        { address, amount: Math.floor(parseFloat(amount1)), asset: this.selectedPool.asset1 }
      ];
      if (this.selectedPool.asset0 !== 'base' && this.selectedPool.asset1 !== 'base')
        payments.push({ address, amount: 1e4 });
      const paymentJsonBase64 = generatePaymentMessage({ payments });
      const asset0Str =
        assets[this.selectedPool.asset0].symbol || shorten(this.selectedPool.asset0);
      const asset1Str =
        assets[this.selectedPool.asset1].symbol || shorten(this.selectedPool.asset1);
      const pool =
        `${asset0Str}-${asset1Str}` +
        (address !== this.selectedPool.address ? ' via proxy AA' : '');
      const message = `Add liquidity ${pool}\n[add-liquidity](payment:${paymentJsonBase64})`;
      const requestId = randomBytes(32).toString('base64');
      texto.on('pairing', msg => {
        if (msg.body.pairing_secret === requestId) msg.reply(message);
      });
      const url = `${this.auth.invite}#${requestId}`;
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

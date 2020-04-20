<template>
  <form @submit.prevent="handleSubmit">
    <div class="container-sm px-3">
      <Box class="d-flex">
        <div class="flex-auto">
          <label for="amountA" class="d-block">
            Deposit
            <LabelBalance :asset="assetA" @select="selectAAmount" />
          </label>
          <InputAmount id="amountA" v-model="amountA" :asset="assetA" @change="updateAmountB" />
        </div>
        <div class="text-right mt-4 ml-4">
          <ButtonSelectToken default="base" :not="assetB" v-model="assetA" />
        </div>
      </Box>
      <Box class="d-flex">
        <div class="flex-auto">
          <label for="amountB" class="d-block">
            Deposit
            <LabelBalance :asset="assetB" @select="selectBAmount" />
          </label>
          <InputAmount id="amountB" v-model="amountB" :asset="assetB" @change="updateAmountA" />
        </div>
        <div class="text-right mt-4 ml-4">
          <ButtonSelectToken :not="assetA" v-model="assetB" />
        </div>
      </Box>
      <Box v-if="pair.reserve0 && pair.reserve1">
        <a
          :href="`https://testnetexplorer.obyte.org/#${pair.address}`"
          target="_blank"
          class="float-right"
        >
          <Amount :value="pair.reserve0" :asset="pair.asset0" /> <Ticker :asset="pair.asset0" /> +
          <Amount :value="pair.reserve1" :asset="pair.asset1" /> <Ticker :asset="pair.asset1" />
          <Icon name="external-link" class="ml-1" size="18" />
        </a>
        <label for="to">Current pool size</label>
      </Box>
      <div class="text-center">
        <button
          class="btn-submit px-6 rounded-2 mb-3"
          type="submit"
          :disabled="!assetB || !amountA"
        >
          Add liquidity
        </button>
        <p>Or, <router-link to="/remove-liquidity">remove liquidity</router-link></p>
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
      pair: false,
      assetA: 'base',
      assetB: '',
      amountA: '',
      amountB: ''
    };
  },
  watch: {
    async assetA(value, oldValue) {
      if (value !== oldValue) {
        this.amountB = '';
        const address = this.$store.state.settings.allPairs[`${this.assetB}_${value}`];
        const assets = this.$store.state.settings.getPair[address];
        this.pair = false;
        if (address) {
          this.pair = new Pair(address, assets.split('_'));
          await this.pair.init();
          this.updateAmountB();
        }
      }
    },
    async assetB(value, oldValue) {
      if (value !== oldValue) {
        this.amountB = '';
        const address = this.$store.state.settings.allPairs[`${this.assetA}_${value}`];
        const assets = this.$store.state.settings.getPair[address];
        this.pair = false;
        if (address) {
          this.pair = new Pair(address, assets.split('_'));
          await this.pair.init();
          this.updateAmountB();
        }
      }
    }
  },
  methods: {
    selectAAmount(amount) {
      this.amountA = amount;
      this.updateAmountB();
    },
    selectBAmount(amount) {
      this.amountB = amount;
      this.updateAmountA();
    },
    updateAmountA() {
      if (!this.amountB || !this.pair || !this.pair.hasLiquidity()) return;
      const k = this.pair.reserve0 / this.pair.reserve1;
      this.amountA =
        this.pair.asset0 === this.assetA
          ? (k * this.amountB).toFixed()
          : (this.amountB / k).toFixed();
    },
    updateAmountB() {
      if (!this.amountA || !this.pair || !this.pair.hasLiquidity()) return;
      const k = this.pair.reserve0 / this.pair.reserve1;
      this.amountB =
        this.pair.asset0 === this.assetB
          ? (k * this.amountA).toFixed()
          : (this.amountA / k).toFixed();
    },
    handleSubmit() {
      const assets = this.$store.state.settings.assets;
      const address = this.pair.address;
      const payments = [
        { address, amount: parseInt(this.amountA), asset: this.assetA },
        { address, amount: parseInt(this.amountB), asset: this.assetB }
      ];
      if (this.assetA !== 'base' && this.assetB !== 'base') payments.push({ address, amount: 1e4 });
      const paymentJsonBase64 = generatePaymentMessage({ payments });
      const assetAStr = assets[this.assetA].symbol || shorten(this.assetA);
      const assetBStr = assets[this.assetB].symbol || shorten(this.assetB);
      const pair = `${assetAStr}-${assetBStr}`;
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

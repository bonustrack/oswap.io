<template>
  <form @submit.prevent="handleSubmit">
    <div class="container-sm px-3">
      <Box class="d-flex">
        <div class="flex-auto">
          <label for="input" class="d-block">
            Input
            <LabelBalance :asset="inputAsset" @select="selectAmount" />
          </label>
          <InputAmount
            id="input"
            v-model="inputAmount"
            @change="updateOutputAmount"
            :asset="inputAsset"
          />
        </div>
        <div class="text-right mt-4 d-flex">
          <a class="ml-2 p-2 color-gray-6" @click="switchAssets"><Icon name="switch"/></a>
          <ButtonSelectToken default="base" :not="outputAsset" v-model="inputAsset" />
        </div>
      </Box>
      <Box class="d-flex">
        <div class="flex-auto">
          <label for="output" class="d-block">Output</label>
          <InputAmount
            id="output"
            v-model="outputAmount"
            @change="updateInputAmount"
            :asset="outputAsset"
          />
        </div>
        <div class="text-right mt-4 d-flex">
          <a class="ml-2 p-2 color-gray-6" @click="switchAssets"><Icon name="switch"/></a>
          <ButtonSelectToken :not="inputAsset" v-model="outputAsset" />
        </div>
      </Box>
      <Box v-if="$route.name === 'send'">
        <label for="to" class="d-block">Recipient address</label>
        <input
          id="to"
          type="text"
          autocomplete="off"
          class="form-control input-amount border-0 p-0"
          placeholder="FAB6TH7I..."
          v-model="to"
        />
      </Box>
      <Box v-if="rate">
        <p class="text-white float-right m-0">
          1 <Ticker :asset="outputAsset" /> = {{ rate }} <Ticker :asset="inputAsset" />
        </p>
        <label for="to">Exchange rate</label>
      </Box>
      <div class="text-center mb-4">
        <button
          class="btn-submit px-6 rounded-2 mb-4"
          type="submit"
          :disabled="!inputAsset || !outputAsset || !inputAmount || !outputAmount"
        >
          <template v-if="$route.name === 'send'">Send</template>
          <template v-else>Swap</template>
        </button>
      </div>
    </div>
  </form>
</template>

<script>
import Trade from '@/helpers/_oswap/trade';
import { generateUri, toString } from '@/helpers/_oswap';

export default {
  data() {
    return {
      trade: false,
      inputAsset: '',
      outputAsset: '',
      inputAmount: '',
      outputAmount: '',
      to: this.$route.query.to
    };
  },
  watch: {
    async inputAsset(value, oldValue) {
      if (value !== oldValue) {
        await this.init();
        this.updateOutputAmount();
      }
    },
    async outputAsset(value, oldValue) {
      if (value !== oldValue) {
        await this.init();
        this.updateOutputAmount();
      }
    }
  },
  computed: {
    rate() {
      if (!this.inputAsset || !this.outputAsset) return;
      const { assets } = this.$store.state.settings;
      const inputAmount = toString(this.inputAmount, assets[this.inputAsset].decimals);
      const outputAmount = toString(this.outputAmount, assets[this.outputAsset].decimals);
      const rate = parseFloat((inputAmount / outputAmount).toFixed(6));
      if (rate <= 0 || rate === Infinity) return;
      return rate;
    }
  },
  methods: {
    selectAmount(amount) {
      this.inputAmount = amount;
      this.updateOutputAmount();
    },
    async switchAssets() {
      const inputAsset = this.inputAsset;
      this.inputAsset = this.outputAsset;
      this.outputAsset = inputAsset;
      this.outputAmount = '';
      this.inputAmount = '';
      await this.init();
    },
    async init() {
      this.trade = new Trade(this.$store.state.settings, this.inputAsset, this.outputAsset);
      await this.trade.init();
    },
    handleSubmit() {
      const data = {};
      const route = this.trade.getRoute(this.inputAmount);
      const address = route.pairs[0].address;
      if (this.to && this.$route.name === 'send') data.to = this.to;
      if (route.pairs[1]) data.to_aa = route.pairs[1].address;
      location.href = generateUri(address, data, this.inputAmount, this.inputAsset);
    },
    updateOutputAmount() {
      if (this.inputAmount) this.outputAmount = this.trade.getAmountBought(this.inputAmount) || '';
    },
    updateInputAmount() {
      if (this.outputAmount) this.inputAmount = this.trade.getAmountSold(this.outputAmount) || '';
    }
  }
};
</script>

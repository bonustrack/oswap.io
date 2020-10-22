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
          <ButtonSelectToken
            :default="inputAsset || 'base'"
            :not="outputAsset"
            v-model="inputAsset"
          />
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
          <ButtonSelectToken :default="outputAsset" :not="inputAsset" v-model="outputAsset" />
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
      <BoxSelectThreshold v-model="bounceThreshold" />
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
import Factory from '@/helpers/_oswap/factory';
import { getInfo, generateUri, toString } from '@/helpers/_oswap';
import { b64UriDec } from '@/helpers/utils';

export default {
  data() {
    return {
      id: b64UriDec(
        this.$route.params.poolAddress ||
          this.$route.params[0] ||
          this.$route.params.pathMatch ||
          ''
      ),
      trade: false,
      inputAsset: '',
      outputAsset: '',
      inputAmount: '',
      outputAmount: '',
      bounceThreshold: 1,
      to: this.$route.query.to,
      rate: 0
    };
  },
  async created() {
    if (this.id.length === 44) {
      this.outputAsset = this.id;
      [this.inputAsset, this.outputAsset] = this.$route.query.reverse
        ? [this.outputAsset, 'base']
        : ['base', this.outputAsset];
    } else if (this.id) {
      const info = await getInfo(this.id);
      if (info && Object.keys(info).length) {
        [this.inputAsset, this.outputAsset] = this.$route.query.reverse
          ? [info.asset1, info.asset0]
          : [info.asset0, info.asset1];
      }
    }
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
  methods: {
    getDecimals(assetId) {
      return this.settings.decimals[assetId] || 0;
    },
    updateRate() {
      if (!this.inputAsset || !this.outputAsset) {
        this.rate = 0;
        return;
      }
      const inputAmount = toString(this.inputAmount, this.getDecimals(this.inputAsset));
      const outputAmount = toString(this.outputAmount, this.getDecimals(this.outputAsset));
      const rate = parseFloat((inputAmount / outputAmount).toFixed(6));
      if (rate <= 0 || rate === Infinity) {
        this.rate = 0;
        return;
      }
      this.rate = rate;
    },
    selectAmount(amount) {
      this.inputAmount = amount;
      this.updateOutputAmount();
    },
    async switchAssets() {
      [this.inputAsset, this.outputAsset] = [this.outputAsset, this.inputAsset];
      this.outputAmount = '';
      this.inputAmount = '';
      await this.init();
    },
    async init() {
      if (!this.inputAsset || !this.outputAsset) return;
      const settings = this.settings;
      const factory = new Factory(settings.pools, settings.pairs);
      this.trade = new Trade(factory, this.inputAsset, this.outputAsset);
      await this.trade.init();
    },
    handleSubmit() {
      const data = {};
      if (this.bounceThreshold < 100) {
        if (!this.bounceThreshold) {
          data.amount_out_min = this.outputAmount;
        } else {
          data.amount_out_min = Math.round(this.outputAmount * (1 - this.bounceThreshold / 100));
        }
      }
      const route = this.trade.getRoute(this.inputAmount);
      const address = route.pools[0].address;
      if (this.to && this.$route.name === 'send') data.to = this.to;
      if (route.pools[1]) data.to_aa = route.pools[1].address;
      const url = generateUri(address, data, this.inputAmount, this.inputAsset);
      if (navigator.userAgent.indexOf('Firefox') != -1) {
        const opener = window.open(url, '', 'width=1,height=1,resizable=no');
        setTimeout(function() {
          opener.close();
        }, 5000);
      } else {
        location.href = url;
      }
    },
    updateOutputAmount() {
      if (!this.inputAsset || !this.outputAsset) return;
      if (this.inputAmount) this.outputAmount = this.trade.getAmountBought(this.inputAmount) || '';
      this.updateRate();
    },
    updateInputAmount() {
      if (!this.inputAsset || !this.outputAsset) return;
      if (this.outputAmount) this.inputAmount = this.trade.getAmountSold(this.outputAmount) || '';
      this.updateRate();
    }
  }
};
</script>

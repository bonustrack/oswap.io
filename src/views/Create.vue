<template>
  <form @submit.prevent="handleSubmit">
    <div class="container-sm px-3">
      <Box>
        <label for="assetA" class="d-block">Asset A unit</label>
        <input
          id="assetA"
          class="form-control input-amount border-0 p-0"
          autocomplete="off"
          placeholder="WhsD...Rhs="
          v-model="assetA"
        />
        <div v-if="symbolA" class="mt-2">
          <label>Symbol</label>
          <p v-text="symbolA" class="text-white" />
          <label>Decimals</label>
          <p v-text="decimalsA" class="text-white" />
        </div>
      </Box>
      <Box>
        <label for="assetB" class="d-block">Asset B unit</label>
        <input
          id="assetB"
          class="form-control input-amount border-0 p-0"
          autocomplete="off"
          placeholder="WhsD...Rhs="
          v-model="assetB"
        />
        <div v-if="symbolB" class="mt-2">
          <label>Symbol</label>
          <p v-text="symbolB" class="text-white" />
          <label>Decimals</label>
          <p v-text="decimalsB" class="text-white" />
        </div>
      </Box>
      <Box>
        <label for="swapFee" class="d-block">Swap fee (%)</label>
        <input
          id="swapFee"
          class="form-control input-amount border-0 p-0"
          autocomplete="off"
          placeholder="0.000000000"
          v-model="swapFee"
          type="number"
          step="0.000000001"
          min="0.0001"
          max="10"
        />
      </Box>
      <div class="text-center mb-4">
        <button class="btn-submit px-6 rounded-2 mb-3" type="submit" :disabled="!assetA || !assetB">
          Create a pool
        </button>
      </div>
    </div>
  </form>
</template>

<script>
import { b64UriDec } from '@/helpers/utils';
import { generateCreateUri } from '@/helpers/_oswap';

export default {
  data() {
    return {
      assetA: 'base',
      assetB: '',
      swapFee: '1',
      symbolA: false,
      symbolB: false,
      decimalsA: 0,
      decimalsB: 0
    };
  },
  watch: {
    assetA(value, oldValue) {
      if (value !== oldValue) {
        this.symbolA = false;
        this.decimalsA = 0;
        if (this.assetToSymbol[value]) {
          this.symbolA = this.assetToSymbol[value];
          this.decimalsA = this.decimals[value] || 0;
        }
      }
    },
    assetB(value, oldValue) {
      if (value !== oldValue) {
        this.symbolB = false;
        this.decimalsB = 0;
        if (this.assetToSymbol[value]) {
          this.symbolB = this.assetToSymbol[value];
          this.decimalsB = this.decimals[value] || 0;
        }
      }
    }
  },
  computed: {
    assetToSymbol() {
      return this.settings.assetToSymbol;
    },
    decimals() {
      return this.settings.decimals;
    }
  },
  created() {
    const assetB = this.$route.params[0] || this.$route.params.pathMatch;
    if (assetB) this.assetB = b64UriDec(assetB);
  },
  methods: {
    handleSubmit() {
      const swapFee = parseFloat(this.swapFee) * 1e9;
      location.href = generateCreateUri([this.assetA, this.assetB], swapFee);
    }
  }
};
</script>

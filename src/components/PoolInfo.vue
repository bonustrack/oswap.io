<template>
  <div v-if="pool">
    <div>
      <label class="d-block">Swap fee</label>
      <span class="text-white" v-text="`${pool.swapFee / 1e9}%`" />
      <label class="d-block">Current pool size</label>
      <a :href="_explorerLink(pool.address)" target="_blank">
        <Amount :value="pool.reserve0" :asset="pool.asset0" /> <Ticker :asset="pool.asset0" /> +
        <Amount :value="pool.reserve1" :asset="pool.asset1" /> <Ticker :asset="pool.asset1" />
        <span
          v-if="pool.hasLiquidity() && pool.marketcap"
          v-text="` ≈ $ ${pool.marketcap.toFixed(2)}`"
        />
        <Icon name="external-link" class="ml-1" size="18" />
      </a>
    </div>
    <div v-if="share">
      <label class="d-block">Your pool share</label>
      <span class="text-white">
        <Pie v-if="share > 1" class="mr-2" :percent="share" />
        {{ share }}%
      </span>
    </div>
  </div>
</template>

<script>
import { getBalance } from '@/helpers/_oswap';

export default {
  props: ['pool'],
  data() {
    return {
      share: 0
    };
  },
  created() {
    const balance = getBalance(this.auth.balances, this.pool.asset);
    this.share = parseFloat(((100 / this.pool.supply) * balance).toFixed(3));
  },
  watch: {
    async pool(value, oldValue) {
      if (value !== oldValue) {
        const balance = getBalance(this.auth.balances, this.pool.asset);
        this.share = parseFloat(((100 / this.pool.supply) * balance).toFixed(3));
      }
    }
  }
};
</script>

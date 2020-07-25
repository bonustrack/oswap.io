<template>
  <span v-if="balance">
    (max
    <a class="color-gray-6" @click="select"> <Amount :asset="asset" :value="balance" /> </a>)
  </span>
</template>

<script>
import { getBalance } from '@/helpers/_oswap';

export default {
  props: ['asset'],
  computed: {
    balance() {
      const { balances } = this.auth;
      return this.asset ? getBalance(balances, this.asset) : 0;
    }
  },
  methods: {
    select() {
      this.$emit('select', this.balance);
    }
  }
};
</script>

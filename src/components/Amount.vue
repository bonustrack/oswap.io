<template>
  <span v-text="$n(str)" />
</template>

<script>
import { toString } from '@/helpers/_oswap';

export default {
  props: ['value', 'asset'],
  computed: {
    str() {
      const asset = this.$store.state.settings.assets[this.asset];
      const decimals = asset ? asset.decimals : 0;
      return toString(this.value, decimals);
    }
  }
};
</script>

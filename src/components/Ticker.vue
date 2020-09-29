<template>
  <span v-text="ticker" />
</template>

<script>
import { shorten } from '@/helpers/utils';

export default {
  props: ['asset'],
  computed: {
    ticker() {
      const assets = this.settings.assets;
      let ticker = '';
      this.asset.split('_').forEach((asset, i) => {
        ticker += assets[asset] && assets[asset].symbol ? assets[asset].symbol : shorten(asset);
        if (this.asset.split('_').length === 2 && i === 0) ticker += '-';
      });
      return ticker;
    }
  }
};
</script>

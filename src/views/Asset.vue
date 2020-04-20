<template>
  <div class="container-sm px-3">
    <Box>
      <h1>
        <a :href="`https://testnetexplorer.obyte.org/#${id}`" target="_blank">
          {{ id | shorten }}
          <Icon name="external-link" class="ml-1" size="18" />
        </a>
      </h1>
      <div v-if="symbol" class="mt-2">
        <label>Symbol</label>
        <p v-text="symbol" class="text-white" />
        <label>Decimals</label>
        <p v-text="decimals" class="text-white" />
      </div>
    </Box>
  </div>
</template>

<script>
import { b64UriDec } from '@/helpers/utils';

export default {
  data() {
    return {
      id: b64UriDec(this.$route.params.id),
      symbol: this.$store.state.settings.assetToSymbol[b64UriDec(this.$route.params.id)],
      decimals: this.$store.state.settings.decimals[b64UriDec(this.$route.params.id)] || 0
    };
  }
};
</script>

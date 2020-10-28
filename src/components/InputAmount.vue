<template>
  <input
    type="number"
    autocomplete="off"
    class="form-control input-amount border-0 p-0"
    v-model="input"
    @keyup="handleChange"
    :step="1 / 10 ** this.decimals"
    :placeholder="placeholder"
  />
</template>

<script>
import { fromString, toString } from '@/helpers/_oswap';

export default {
  props: ['value', 'asset'],
  data() {
    return {
      input: null
    };
  },
  watch: {
    input(value) {
      this.$emit('input', fromString(value, this.decimals));
    },
    value(value) {
      if (value === '') {
        this.input = '';
      } else {
        this.input = toString(value, this.decimals);
      }
    },
    asset() {
      // if asset has changed, we apply the potentially new decimals to amount
      this.$emit('input', fromString(this.input, this.decimals));
    }
  },
  computed: {
    decimals() {
      const asset = this.settings.assets[this.asset];
      return asset ? asset.decimals : 0;
    },
    placeholder() {
      return `0${this.decimals ? '.' : ''}${'0'.repeat(this.decimals)}`;
    }
  },
  methods: {
    handleChange() {
      this.$emit('change');
    }
  }
};
</script>

<template>
  <input
    type="text"
    autocomplete="off"
    class="form-control input-amount border-0 p-0"
    v-model="input"
    @keyup="handleChange"
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
    }
  },
  computed: {
    decimals() {
      const asset = this.$store.state.settings.assets[this.asset];
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

<template>
  <span>
    <a :class="customClass || 'btn-mktg'" @click="modalOpen = true">
      <Ticker v-if="input" :asset="input" />
      <template v-else>Select<span class="hide-sm"> a pair</span></template>
    </a>
    <ModalSelectPair :open="modalOpen" @close="modalOpen = false" @pair="input = $event" />
  </span>
</template>

<script>
export default {
  props: ['value', 'default', 'customClass'],
  data() {
    return {
      input: null,
      modalOpen: false
    };
  },
  watch: {
    input(value) {
      this.$emit('input', value);
    },
    value(value) {
      this.input = value;
    }
  },
  mounted() {
    if (this.default) this.input = this.default;
  }
};
</script>

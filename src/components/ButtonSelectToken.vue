<template>
  <span>
    <a class="btn-mktg" @click="modalOpen = true">
      <Ticker v-if="input" :asset="input" />
      <template v-else>Select<span class="hide-sm"> a token</span></template>
    </a>
    <ModalSelectToken
      :values="values"
      :not="not"
      :open="modalOpen"
      @close="modalOpen = false"
      @asset="input = $event"
    />
  </span>
</template>

<script>
export default {
  props: ['value', 'default', 'not', 'values'],
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

<template>
  <Box>
    <label>Bounce if the price increases</label>
    <div class="d-flex">
      <label class="text-white p-2">
        <input type="radio" id="any" value="0" v-model="bounceThreshold" />
        exact prediction
      </label>
      <label v-for="choice in choices" class="text-white p-2" v-bind:key="choice">
        <input type="radio" :id="choice + '%'" :value="choice" v-model="bounceThreshold" />
        {{ choice }}%
      </label>
      <label class="text-white p-2">
        <input type="radio" id="never" value="100" v-model="bounceThreshold" />
        don't bounce
      </label>
    </div>
  </Box>
</template>

<script>
export default {
  props: ['value'],
  data() {
    return {
      bounceThreshold: this.value.toString(),
      choices: ['0.1', '1', '5']
    };
  },
  watch: {
    async bounceThreshold(value, oldValue) {
      if (value !== oldValue) {
        this.$emit('input', parseInt(value));
      }
    }
  }
};
</script>

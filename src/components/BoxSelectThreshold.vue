<template>
  <Box>
    <label>Bounce if price has increased</label>
    <div class="d-flex">
      <label class="text-white p-2">
        <input type="radio" id="no" value="0" v-model="bounceThreshold" />
        no
      </label>
      <label v-for="choice in choices" class="text-white p-2" v-bind:key="choice">
        <input type="radio" :id="choice + '%'" :value="choice" v-model="bounceThreshold" />
        {{ choice }}%
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
      choices: ['1', '5', '10']
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

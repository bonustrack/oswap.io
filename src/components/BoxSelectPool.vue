<template>
  <Box>
    <label class="d-block">Pool</label>
    <ButtonSelectPool customClass="h2 d-block" :default="address" v-model="id" />
    <PoolInfo :pool="pool" />
  </Box>
</template>

<script>
import Pool from '@/helpers/_oswap/pool';

export default {
  props: ['address'],
  data() {
    return {
      id: false,
      pool: false
    };
  },
  watch: {
    async id(value, oldValue) {
      if (value !== oldValue) {
        const { asset0, asset1 } = this.$store.state.settings.pools[value];
        const pool = new Pool(value, [asset0, asset1]);
        await pool.init();
        this.pool = pool;
        this.$emit('input', pool);
      }
    }
  }
};
</script>

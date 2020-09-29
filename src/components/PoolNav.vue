<template>
  <Box>
    <a class="d-flex" @click="open = !open">
      <h2 class="flex-auto" v-text="items[current].name" />
      <Icon class="mt-1" :name="open ? 'arrow-up' : 'arrow-down'" />
    </a>
    <div v-if="open">
      <router-link
        v-for="(item, i) in items.filter((item, i) => i !== current)"
        :key="i"
        :to="{ name: item.to, params: { poolAddress: $route.params.poolAddress } }"
        class="d-block"
      >
        <h2 v-text="item.name" class="mt-2" />
      </router-link>
    </div>
  </Box>
</template>

<script>
export default {
  props: ['default'],
  data() {
    return {
      open: false,
      current: this.default || 0,
      items: [
        { name: 'Add liquidity', to: 'mint1' },
        { name: 'Add liquidity (deposit one token)', to: 'mint2' },
        { name: 'Remove liquidity', to: 'burn' },
        { name: 'Pools', to: 'pools' }
      ]
    };
  },
  methods: {
    select(i) {
      this.open = false;
      this.current = i;
    }
  }
};
</script>

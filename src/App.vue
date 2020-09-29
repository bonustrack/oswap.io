<template>
  <div>
    <VueLoadingIndicator v-if="isLoading" class="overlay big" />
    <div id="app" class="pb-6" v-else>
      <Nav />
      <router-view :key="$route.path" />
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    isLoading() {
      return this.settings.isLoading;
    }
  },
  created() {
    this.$store.dispatch('init');
  }
};
</script>

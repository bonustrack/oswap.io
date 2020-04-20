<template>
  <div>
    <VueLoadingIndicator v-if="isLoading" class="overlay big" />
    <div id="app" class="pb-4" v-else>
      <Nav />
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    isLoading() {
      return this.$store.state.settings.isLoading;
    }
  },
  created() {
    this.$store.dispatch('init');
  }
};
</script>

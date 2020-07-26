<template>
  <Modal :open="open" @close="$emit('close')">
    <div class="modal-body flex-auto my-5 px-4">
      <h2 class="mb-3 text-white">Account</h2>
      <p>
        <a :href="_explorerLink(address)" target="_blank" class="d-block py-2 text-white">
          <Avatar :address="address" size="18" class="mr-1" /> {{ address }}
          <Icon name="external-link" class="ml-1" size="18" />
        </a>
      </p>
      <a @click="logout" class="btn-outline">Log out</a>
    </div>
  </Modal>
</template>

<script>
export default {
  props: ['open'],
  computed: {
    address() {
      return this.auth.address;
    }
  },
  methods: {
    logout() {
      this.$store.dispatch('logout');
      this.$emit('close');
    }
  }
};
</script>

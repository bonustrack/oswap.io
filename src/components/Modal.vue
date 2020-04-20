<template>
  <div v-if="open" class="modal">
    <div class="backdrop" @click="$emit('close')" />
    <div class="shell bg-gray-9 overflow-hidden container-sm rounded-2">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  props: ['open']
};
</script>

<style lang="scss">
.modal {
  position: fixed;
  display: flex;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  align-items: center;
  justify-content: center;
  z-index: 10;

  .backdrop {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 99;
    background: rgba(0, 0, 0, 0.4);
  }

  .shell {
    display: flex;
    flex-direction: column;
    z-index: 999;
    margin: 0 auto;
    width: 100%;
    min-height: 48vh;
    max-height: 48vh;

    .modal-body {
      text-align: initial;
      overflow-y: auto;
      overflow-x: hidden;
    }
  }
}
</style>

<template>
  <span class="d-inline-block">
    <svg height="20" width="20" viewBox="0 0 20 20">
      <circle r="10" cx="10" cy="10" fill="gray" />
      <circle
        r="5"
        cx="10"
        cy="10"
        fill="transparent"
        stroke="white"
        stroke-width="10"
        :stroke-dasharray="`calc(${percent.toFixed()} * 31.4 / 100) 31.4`"
        transform="rotate(-90) translate(-20)"
      />
    </svg>
  </span>
</template>

<script>
export default {
  props: ['percent']
};
</script>

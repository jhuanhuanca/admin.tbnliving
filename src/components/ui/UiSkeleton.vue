<template>
  <div class="skeleton" :class="klass" />
</template>

<script setup>
defineProps({
  klass: { type: String, default: 'h-6 w-full rounded-xl' },
})
</script>


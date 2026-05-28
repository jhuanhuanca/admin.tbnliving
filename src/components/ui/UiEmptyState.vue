<template>
  <div class="rounded-2xl border border-border bg-panel p-6">
    <p class="text-sm font-semibold text-text">{{ title }}</p>
    <p v-if="description" class="mt-1 text-sm text-text-muted">{{ description }}</p>
    <div v-if="$slots.actions" class="mt-4">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: 'Sin datos' },
  description: { type: String, default: '' },
})
</script>


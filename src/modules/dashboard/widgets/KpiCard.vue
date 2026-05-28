<template>
  <div class="card">
    <div class="card-body">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="text-xs font-semibold text-text-muted">{{ title }}</p>
          <p class="mt-2 truncate text-2xl font-semibold text-text">{{ value }}</p>
          <p v-if="hint" class="mt-1 text-xs text-text-muted">{{ hint }}</p>
        </div>
        <div class="grid h-10 w-10 place-items-center rounded-xl bg-bg-2 ring-1 ring-white/5">
          <slot />
        </div>
      </div>
      <div v-if="delta != null" class="mt-4 flex items-center gap-2 text-xs">
        <span class="badge" :class="delta >= 0 ? 'badge-success' : 'badge-danger'">
          {{ delta >= 0 ? '+' : '' }}{{ delta }}%
        </span>
        <span class="text-text-muted">{{ deltaLabel }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  value: { type: String, required: true },
  hint: { type: String, default: '' },
  delta: { type: Number, default: null },
  deltaLabel: { type: String, default: 'vs periodo anterior' },
})
</script>


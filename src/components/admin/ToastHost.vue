<template>
  <div class="pointer-events-none fixed right-4 top-4 z-50 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-3">
    <div
      v-for="t in ui.toasts"
      :key="t.id"
      class="pointer-events-auto card overflow-hidden"
    >
      <div class="flex items-start gap-3 p-4">
        <div class="mt-0.5 h-2.5 w-2.5 rounded-full" :class="dotClass(t.type)" />
        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between gap-3">
            <p class="truncate text-sm font-semibold text-text">{{ t.title }}</p>
            <button class="btn btn-ghost !p-1 text-text-muted" @click="ui.dismissToast(t.id)">✕</button>
          </div>
          <p v-if="t.message" class="mt-1 text-sm text-text-muted">
            {{ t.message }}
          </p>
        </div>
      </div>
      <div class="h-0.5 w-full bg-white/5" />
    </div>
  </div>
</template>

<script setup>
import { useUiStore } from '@/stores/uiStore'

const ui = useUiStore()

function dotClass(type) {
  if (type === 'success') return 'bg-success'
  if (type === 'danger') return 'bg-danger'
  if (type === 'warn') return 'bg-warn'
  return 'bg-info'
}
</script>


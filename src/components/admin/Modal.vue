<template>
  <teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-black/60" @click="$emit('close')" />
      <div class="absolute inset-0 overflow-y-auto p-4">
        <div class="mx-auto w-full max-w-2xl">
          <div class="card overflow-hidden">
            <div class="card-header">
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold text-text">{{ title }}</p>
                <p v-if="subtitle" class="truncate text-xs text-text-muted">{{ subtitle }}</p>
              </div>
              <button class="btn btn-ghost !p-2 text-text-muted" @click="$emit('close')">✕</button>
            </div>
            <div class="card-body">
              <slot />
            </div>
          </div>
          <div class="h-6" />
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
defineProps({
  open: { type: Boolean, required: true },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
})
defineEmits(['close'])
</script>


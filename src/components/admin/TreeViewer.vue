<template>
  <div class="card">
    <div class="card-header">
      <div>
        <p class="text-sm font-semibold text-text">Árbol</p>
        <p class="text-xs text-text-muted">Placeholder (se reemplaza por visualización ECharts).</p>
      </div>
    </div>
    <div class="card-body">
      <pre class="overflow-auto rounded-lg border border-border bg-bg-2 p-4 text-xs text-text-muted">{{ tree }}</pre>
    </div>
  </div>
</template>

<script setup>
defineProps({
  tree: { type: Object, required: true },
})
</script>


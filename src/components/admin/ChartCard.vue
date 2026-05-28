<template>
  <div class="card">
    <div class="card-header">
      <div>
        <p class="text-sm font-semibold text-text">{{ title }}</p>
        <p v-if="subtitle" class="text-xs text-text-muted">{{ subtitle }}</p>
      </div>
      <slot name="actions" />
    </div>
    <div class="card-body">
      <div v-if="loading" class="space-y-3">
        <div class="skeleton h-4 w-40" />
        <div class="skeleton h-56 w-full" />
      </div>
      <div v-else class="h-72">
        <canvas ref="canvasRef"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  type: { type: String, default: 'line' },
  labels: { type: Array, default: () => [] },
  datasets: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const canvasRef = ref(null)
let chart = null

const data = computed(() => ({
  labels: props.labels,
  datasets: props.datasets,
}))

function render() {
  if (!canvasRef.value) return
  if (chart) chart.destroy()
  chart = new Chart(canvasRef.value, {
    type: props.type,
    data: data.value,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
      },
      scales: {
        x: { ticks: { color: '#9aa4b2' }, grid: { color: 'rgba(255,255,255,0.06)' } },
        y: { ticks: { color: '#9aa4b2' }, grid: { color: 'rgba(255,255,255,0.06)' } },
      },
    },
  })
}

onMounted(() => {
  if (!props.loading) render()
})

watch(
  () => [props.loading, props.type, props.labels, props.datasets],
  () => {
    if (!props.loading) render()
  },
  { deep: true }
)

onBeforeUnmount(() => {
  if (chart) chart.destroy()
})
</script>
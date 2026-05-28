<template>
  <div class="relative">
    <div v-if="loading" class="absolute inset-0 grid place-items-center">
      <div class="skeleton h-64 w-full rounded-2xl" />
    </div>
    <UiEmptyState
      v-else-if="empty"
      title="Sin datos para este filtro"
      description="Ajusta el rango de fechas o el país."
    />
    <div v-else ref="el" class="h-[320px] w-full rounded-2xl" />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useUiStore } from '@/stores/uiStore'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'

const props = defineProps({
  option: { type: Object, required: true },
  loading: { type: Boolean, default: false },
  empty: { type: Boolean, default: false },
})

const ui = useUiStore()
const el = ref(null)
let chart = null
let ro = null
let echarts = null

const themedOption = computed(() => {
  const isDark = ui.isDark
  return {
    backgroundColor: 'transparent',
    textStyle: { color: isDark ? '#E8EAED' : '#111827' },
    tooltip: { trigger: 'axis', confine: true },
    grid: { left: 14, right: 14, top: 28, bottom: 18, containLabel: true },
    ...props.option,
  }
})

async function ensure() {
  if (echarts) return echarts
  const mod = await import('echarts')
  echarts = mod
  return echarts
}

async function render() {
  if (!el.value || props.loading || props.empty) return
  const e = await ensure()
  if (!chart) chart = e.init(el.value, null, { renderer: 'canvas' })
  chart.setOption(themedOption.value, { notMerge: true })
  chart.resize()
}

onMounted(async () => {
  if (!el.value) return
  ro = new ResizeObserver(() => chart?.resize())
  ro.observe(el.value)
  await render()
})

onBeforeUnmount(() => {
  ro?.disconnect()
  ro = null
  chart?.dispose()
  chart = null
})

watch([() => props.loading, () => props.empty, themedOption, () => ui.isDark], () => {
  render()
})
</script>


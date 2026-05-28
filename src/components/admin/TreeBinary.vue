<template>
  <div class="card">
    <div class="card-header">
      <div class="min-w-0">
        <p class="truncate text-sm font-semibold text-text">Árbol binario</p>
        <p class="truncate text-xs text-text-muted">
          Click en un nodo para expandir. Scroll / pinch para zoom. Drag para navegar.
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button class="btn btn-ghost" :disabled="loading" @click="$emit('refresh')">Recargar</button>
        <button class="btn btn-ghost" :disabled="loading" @click="resetZoom">Reset</button>
      </div>
    </div>

    <div class="card-body">
      <div v-if="loading" class="space-y-3">
        <div class="skeleton h-4 w-52" />
        <div class="skeleton h-[520px] w-full" />
      </div>
      <div v-else ref="el" class="h-[560px] w-full rounded-xl border border-border bg-bg-2" />
      <p class="mt-3 text-xs text-text-muted">
        Estado: <span class="text-success">verde activo</span> · <span class="text-danger">rojo inactivo</span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Object, default: null }, // root node
  loading: { type: Boolean, default: false },
})
const emit = defineEmits(['expand', 'refresh'])

const el = ref(null)
let chart = null
let echartsLib = null

function toEchartsNode(node) {
  if (!node) return null
  const active = !!node.active
  const color = active ? '#2ebd85' : '#f6465d'
  return {
    id: String(node.id),
    name: node.name,
    value: { id: node.id, active: node.active, rank: node.rank, lazy: node.lazy },
    itemStyle: { color },
    label: { color: '#eaecef', backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 8, padding: [4, 8] },
    children: (node.children ?? []).map(toEchartsNode),
    _lazy: !!node.lazy,
  }
}

function option(root) {
  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
      formatter: (p) => {
        const v = p?.data?.value
        if (!v) return p?.name ?? ''
        const status = v.active ? 'Activo' : 'Inactivo'
        return `<div style="min-width:180px">
          <div style="font-weight:600;margin-bottom:4px">${p.name}</div>
          <div style="opacity:.8">Rango: ${v.rank ?? '-'}</div>
          <div style="opacity:.8">Estado: ${status}</div>
        </div>`
      },
      borderWidth: 1,
      backgroundColor: 'rgba(18, 23, 35, 0.95)',
      borderColor: '#232a3a',
      textStyle: { color: '#eaecef' },
    },
    series: [
      {
        type: 'tree',
        data: [root],
        top: '3%',
        left: '3%',
        bottom: '3%',
        right: '3%',
        symbol: 'circle',
        symbolSize: 16,
        roam: true,
        expandAndCollapse: true,
        initialTreeDepth: 2,
        lineStyle: { color: 'rgba(255,255,255,0.10)', width: 1.2 },
        label: { position: 'right', verticalAlign: 'middle', align: 'left', fontSize: 12 },
        leaves: { label: { position: 'right', verticalAlign: 'middle', align: 'left' } },
        emphasis: { focus: 'descendant' },
        animationDurationUpdate: 450,
      },
    ],
  }
}

function render() {
  if (!el.value) return
  if (!echartsLib) return
  if (!chart) chart = echartsLib.init(el.value)
  const root = toEchartsNode(props.modelValue)
  if (!root) return
  chart.setOption(option(root), { notMerge: true })

  chart.off('click')
  chart.on('click', (p) => {
    const v = p?.data?.value
    const lazy = p?.data?._lazy
    const hasChildren = Array.isArray(p?.data?.children) && p.data.children.length > 0
    if (v?.id && lazy && !hasChildren) emit('expand', v.id)
  })
}

function resetZoom() {
  if (!chart) return
  chart.dispatchAction({ type: 'restore' })
}

function onResize() {
  chart?.resize()
}

onMounted(() => {
  window.addEventListener('resize', onResize)
  import('echarts').then((m) => {
    echartsLib = m
    if (!props.loading) render()
  })
})

watch(
  () => [props.loading, props.modelValue],
  () => {
    if (!props.loading) render()
  },
  { deep: true }
)

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  chart?.dispose()
  chart = null
})
</script>


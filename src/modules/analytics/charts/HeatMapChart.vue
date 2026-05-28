<template>
  <BaseChart :option="opt" :loading="loading" :empty="empty" />
</template>

<script setup>
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'

// data: [[xIndex, yIndex, value]]
const props = defineProps({
  loading: { type: Boolean, default: false },
  empty: { type: Boolean, default: false },
  xLabels: { type: Array, default: () => [] },
  yLabels: { type: Array, default: () => [] },
  data: { type: Array, default: () => [] },
})

const opt = computed(() => ({
  tooltip: { position: 'top' },
  grid: { height: '70%', top: 30, left: 60, right: 20 },
  xAxis: { type: 'category', data: props.xLabels, splitArea: { show: true } },
  yAxis: { type: 'category', data: props.yLabels, splitArea: { show: true } },
  visualMap: { min: 0, max: 100, calculable: true, orient: 'horizontal', left: 'center', bottom: 0 },
  series: [
    {
      type: 'heatmap',
      data: props.data,
      label: { show: false },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.25)' } },
    },
  ],
}))
</script>


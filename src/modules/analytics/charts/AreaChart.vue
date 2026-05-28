<template>
  <BaseChart :option="opt" :loading="loading" :empty="empty" />
</template>

<script setup>
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'

const props = defineProps({
  loading: { type: Boolean, default: false },
  empty: { type: Boolean, default: false },
  x: { type: Array, default: () => [] },
  series: { type: Array, default: () => [] }, // [{ name, data }]
})

const opt = computed(() => ({
  xAxis: { type: 'category', data: props.x, boundaryGap: false },
  yAxis: { type: 'value' },
  series: props.series.map((s) => ({
    type: 'line',
    smooth: true,
    showSymbol: false,
    name: s.name,
    data: s.data,
    areaStyle: { opacity: 0.18 },
  })),
  legend: { show: props.series.length > 1 },
}))
</script>


<template>
  <BaseChart :option="opt" :loading="loading" :empty="empty" />
</template>

<script setup>
import { computed } from 'vue'
import BaseChart from '@/modules/analytics/charts/BaseChart.vue'

const props = defineProps({
  loading: { type: Boolean, default: false },
  empty: { type: Boolean, default: false },
  categories: { type: Array, default: () => [] },
  values: { type: Array, default: () => [] },
  horizontal: { type: Boolean, default: false },
  currency: { type: Boolean, default: true },
})

const palette = ['#84cc16', '#38bdf8', '#facc15', '#fb7185', '#a78bfa', '#2dd4bf', '#f97316']

const opt = computed(() => {
  const data = props.values.map((v, i) => ({
    value: Number(v) || 0,
    itemStyle: {
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [
          { offset: 0, color: palette[i % palette.length] },
          { offset: 1, color: `${palette[i % palette.length]}99` },
        ],
      },
      borderRadius: props.horizontal ? [0, 8, 8, 0] : [8, 8, 0, 0],
      shadowBlur: 12,
      shadowColor: 'rgba(0,0,0,0.12)',
    },
  }))

  const axisLabel = props.currency
    ? {
        formatter: (v) =>
          new Intl.NumberFormat('es-BO', { notation: 'compact', maximumFractionDigits: 1 }).format(v),
      }
    : {}

  if (props.horizontal) {
    return {
      tooltip: {
        trigger: 'axis',
        valueFormatter: (v) =>
          props.currency
            ? new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(v)
            : v,
      },
      xAxis: { type: 'value', ...axisLabel },
      yAxis: { type: 'category', data: props.categories, axisLabel: { width: 120, overflow: 'truncate' } },
      series: [{ type: 'bar', data, barMaxWidth: 28 }],
      grid: { left: 8, right: 24, top: 12, bottom: 8, containLabel: true },
    }
  }

  return {
    tooltip: {
      trigger: 'axis',
      valueFormatter: (v) =>
        props.currency
          ? new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(v)
          : v,
    },
    xAxis: { type: 'category', data: props.categories, axisLabel: { rotate: props.categories.length > 4 ? 24 : 0 } },
    yAxis: { type: 'value', ...axisLabel },
    series: [{ type: 'bar', data, barMaxWidth: 48 }],
    grid: { left: 12, right: 12, top: 20, bottom: props.categories.length > 4 ? 36 : 18, containLabel: true },
  }
})
</script>

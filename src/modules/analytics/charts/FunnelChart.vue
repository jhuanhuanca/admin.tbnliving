<template>
  <BaseChart :option="opt" :loading="loading" :empty="empty" />
</template>

<script setup>
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'

const props = defineProps({
  loading: { type: Boolean, default: false },
  empty: { type: Boolean, default: false },
  data: { type: Array, default: () => [] }, // [{ name, value }]
})

const opt = computed(() => ({
  tooltip: { trigger: 'item' },
  series: [
    {
      type: 'funnel',
      top: 24,
      bottom: 16,
      left: '10%',
      width: '80%',
      minSize: '20%',
      maxSize: '100%',
      sort: 'descending',
      gap: 6,
      label: { show: true, position: 'inside', formatter: '{b}' },
      data: props.data,
    },
  ],
}))
</script>


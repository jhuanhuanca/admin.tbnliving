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
      type: 'pie',
      radius: ['55%', '78%'],
      label: { show: false },
      itemStyle: { borderRadius: 8, borderWidth: 2, borderColor: 'rgba(0,0,0,0)' },
      data: props.data,
    },
  ],
}))
</script>


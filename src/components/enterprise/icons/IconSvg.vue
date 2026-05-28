<template>
  <span class="inline-flex h-5 w-5 items-center justify-center" v-html="svg" />
</template>

<script setup>
import { computed } from 'vue'
import { Icon } from './icons'

const props = defineProps({
  name: { type: String, required: true },
})

const svg = computed(() => Icon[props.name] || Icon.grid)
</script>


<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useUiStore } from '@/stores/uiStore'

const ui = useUiStore()

onMounted(() => {
  ui.initTheme()
})

</script>

<template>
  <router-view />
</template>
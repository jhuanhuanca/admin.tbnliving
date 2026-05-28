<template>
  <div class="space-y-6">
    <div class="card">
      <div class="card-body flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-xl font-semibold text-text">Network Analytics</h1>
          <p class="text-sm text-text-muted">Crecimiento de red MLM.</p>
        </div>
        <button class="btn btn-ghost" :disabled="a.loading.network === 'loading'" @click="a.fetchNetwork(true)">Actualizar</button>
      </div>
    </div>

    <UiCard>
      <template #header>
        <div>
          <p class="text-sm font-semibold text-text">Usuarios / Activos</p>
          <p class="text-xs text-text-muted">network_growth_snapshots</p>
        </div>
      </template>
      <LineChart
        :loading="a.loading.network === 'loading'"
        :empty="!x.length"
        :x="x"
        :series="[
          { name: 'Usuarios', data: users },
          { name: 'Activos', data: active },
        ]"
      />
    </UiCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAnalyticsStore } from '../stores/analyticsStore'
import UiCard from '@/components/ui/UiCard.vue'
import LineChart from '../charts/LineChart.vue'

const a = useAnalyticsStore()
onMounted(() => {
  if (!a.networkGrowth.length) a.fetchNetwork()
})

const x = computed(() => a.networkGrowth.map((r: any) => r.day))
const users = computed(() => a.networkGrowth.map((r: any) => Number(r.total_users || 0)))
const active = computed(() => a.networkGrowth.map((r: any) => Number(r.total_active_users || 0)))
</script>


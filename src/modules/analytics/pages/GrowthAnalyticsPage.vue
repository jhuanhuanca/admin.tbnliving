<template>
  <div class="space-y-6">
    <div class="card">
      <div class="card-body flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-xl font-semibold text-text">Growth Analytics</h1>
          <p class="text-sm text-text-muted">Afiliaciones / churn / retención (affiliate_growth_metrics).</p>
        </div>
        <button class="btn btn-ghost" :disabled="a.loading.growth === 'loading'" @click="a.fetchGrowth(true)">Actualizar</button>
      </div>
    </div>

    <UiCard>
      <template #header>
        <div>
          <p class="text-sm font-semibold text-text">Afiliaciones / Churn</p>
          <p class="text-xs text-text-muted">Serie diaria</p>
        </div>
      </template>
      <LineChart
        :loading="a.loading.growth === 'loading'"
        :empty="!x.length"
        :x="x"
        :series="[
          { name: 'Afiliaciones', data: joined },
          { name: 'Churn', data: churn },
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
  if (!a.growth.length) a.fetchGrowth()
})

const x = computed(() => a.growth.map((r: any) => r.day))
const joined = computed(() => a.growth.map((r: any) => Number(r.joined_count || r.new_affiliates || 0)))
const churn = computed(() => a.growth.map((r: any) => Number(r.churned_count || r.churn || 0)))
</script>


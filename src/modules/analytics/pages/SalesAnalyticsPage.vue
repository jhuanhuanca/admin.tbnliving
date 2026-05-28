<template>
  <div class="space-y-6">
    <div class="card">
      <div class="card-body flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-xl font-semibold text-text">Sales Analytics</h1>
          <p class="text-sm text-text-muted">Daily & Monthly snapshots.</p>
        </div>
        <div class="flex items-center gap-2">
          <button class="btn btn-ghost" :disabled="a.loading.sales === 'loading'" @click="a.fetchSales(true)">Actualizar</button>
          <RouterLink class="btn btn-ghost" to="/admin/analytics">Overview</RouterLink>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <UiCard>
        <template #header>
          <div>
            <p class="text-sm font-semibold text-text">Ventas diarias</p>
            <p class="text-xs text-text-muted">daily_sales_summary</p>
          </div>
        </template>
        <AreaChart :loading="a.loading.sales === 'loading'" :empty="!dailyX.length" :x="dailyX" :series="dailySeries" />
      </UiCard>

      <UiCard>
        <template #header>
          <div>
            <p class="text-sm font-semibold text-text">Ventas mensuales</p>
            <p class="text-xs text-text-muted">monthly_sales_summary</p>
          </div>
        </template>
        <BarChart :loading="a.loading.sales === 'loading'" :empty="!monthlyX.length" :x="monthlyX" :series="monthlySeries" />
      </UiCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAnalyticsStore } from '../stores/analyticsStore'
import UiCard from '@/components/ui/UiCard.vue'
import AreaChart from '../charts/AreaChart.vue'
import BarChart from '../charts/BarChart.vue'

const a = useAnalyticsStore()

onMounted(() => {
  if (!a.salesDaily.length) a.fetchSales()
})

const dailyX = computed(() => a.salesDaily.map((r: any) => r.day))
const dailySeries = computed(() => [{ name: 'Ventas', data: a.salesDaily.map((r: any) => Number(r.sales_total || 0)) }])

const monthlyX = computed(() => a.salesMonthly.map((r: any) => r.month))
const monthlySeries = computed(() => [{ name: 'Ventas', data: a.salesMonthly.map((r: any) => Number(r.sales_total || 0)) }])
</script>


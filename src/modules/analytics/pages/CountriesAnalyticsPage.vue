<template>
  <div class="space-y-6">
    <div class="card">
      <div class="card-body flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-xl font-semibold text-text">Countries Analytics</h1>
          <p class="text-sm text-text-muted">Métricas por país (country_metrics).</p>
        </div>
        <button class="btn btn-ghost" :disabled="a.loading.countries === 'loading'" @click="a.fetchCountries(true)">Actualizar</button>
      </div>
    </div>

    <UiCard>
      <template #header>
        <div>
          <p class="text-sm font-semibold text-text">Ventas por país (Top)</p>
          <p class="text-xs text-text-muted">Agregado en rango</p>
        </div>
      </template>
      <DonutChart :loading="a.loading.countries === 'loading'" :empty="!donut.length" :data="donut" />
    </UiCard>

    <EnterpriseDataTable
      title="Ranking países"
      subtitle="Ventas / Órdenes / Nuevos / Activos"
      :columns="cols"
      :fetcher="fetcher"
      :page-size="25"
      :searchable="false"
      row-key-field="country_code"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAnalyticsStore } from '../stores/analyticsStore'
import UiCard from '@/components/ui/UiCard.vue'
import DonutChart from '../charts/DonutChart.vue'
import EnterpriseDataTable from '../components/EnterpriseDataTable.vue'

const a = useAnalyticsStore()
onMounted(() => {
  if (!a.countryMetrics.length) a.fetchCountries()
})

const cols = [
  { key: 'country_code', label: 'País' },
  { key: 'sales_total', label: 'Ventas', align: 'end', sortable: true },
  { key: 'orders_count', label: 'Órdenes', align: 'end', sortable: true },
  { key: 'new_users', label: 'Nuevos', align: 'end', sortable: true },
  { key: 'active_users', label: 'Activos', align: 'end', sortable: true },
]

const donut = computed(() =>
  (a.countryMetrics || []).slice(0, 8).map((r: any) => ({ name: r.country_code, value: Number(r.sales_total || 0) }))
)

async function fetcher() {
  return { rows: a.countryMetrics }
}
</script>


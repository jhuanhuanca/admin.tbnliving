<template>
  <div class="space-y-6">
    <div class="card overflow-hidden border-brand/20 bg-gradient-to-br from-bg-2 to-bg">
      <div class="card-body flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-xl font-semibold text-text">Analytics</h1>
          <p class="text-sm text-text-muted">Overview BI (snapshots) — rápido, scalable, enterprise.</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button class="btn btn-ghost" :disabled="a.loading.overview === 'loading'" @click="refresh">Actualizar</button>
          <RouterLink to="/admin/analytics/sales" class="btn btn-primary">Ventas</RouterLink>
        </div>
      </div>
    </div>

    <p v-if="a.error" class="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
      {{ a.error }}
    </p>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard title="Ventas (rango)" :value="money(a.overview?.cards?.sales_total)" hint="BOB">
        <IconSvg name="chart" />
      </KpiCard>
      <KpiCard title="Órdenes (rango)" :value="String(a.overview?.cards?.orders_count ?? '0')" hint="Completadas">
        <IconSvg name="receipt" />
      </KpiCard>
      <KpiCard title="Compradores" :value="String(a.overview?.cards?.buyers_count ?? '0')" hint="Únicos">
        <IconSvg name="users" />
      </KpiCard>
      <KpiCard title="PV (rango)" :value="String(a.overview?.cards?.pv_total ?? '0')" hint="Total PV">
        <IconSvg name="coins" />
      </KpiCard>
    </div>

    <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <UiCard>
        <template #header>
          <div>
            <p class="text-sm font-semibold text-text">Ventas diarias</p>
            <p class="text-xs text-text-muted">sales_total (daily_sales_summary)</p>
          </div>
        </template>
        <AreaChart
          :loading="a.loading.overview === 'loading'"
          :empty="!dailyX.length"
          :x="dailyX"
          :series="[{ name: 'Ventas', data: dailyY }]"
        />
      </UiCard>

      <UiCard>
        <template #header>
          <div>
            <p class="text-sm font-semibold text-text">Crecimiento de red</p>
            <p class="text-xs text-text-muted">users + placements (network_growth_snapshots)</p>
          </div>
        </template>
        <LineChart
          :loading="a.loading.overview === 'loading'"
          :empty="!growthX.length"
          :x="growthX"
          :series="[
            { name: 'Usuarios', data: growthUsers },
            { name: 'Activos', data: growthActive },
          ]"
        />
      </UiCard>
    </div>

    <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <EnterpriseDataTable
        title="Top países"
        subtitle="country_metrics agregado"
        :columns="countryCols"
        :fetcher="fetchCountries"
        :page-size="10"
        :searchable="false"
        row-key-field="country_code"
      />

      <EnterpriseDataTable
        title="Top productos"
        subtitle="product_sales_metrics agregado"
        :columns="productCols"
        :fetcher="fetchProducts"
        :page-size="10"
        :searchable="false"
        row-key-field="product_id"
      >
        <template #cell:product_id="{ value }">
          <span class="badge badge-info">#{{ value }}</span>
        </template>
      </EnterpriseDataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAnalyticsStore } from '../stores/analyticsStore'
import UiCard from '@/components/ui/UiCard.vue'
import KpiCard from '@/modules/dashboard/widgets/KpiCard.vue'
import IconSvg from '@/components/enterprise/icons/IconSvg.vue'
import AreaChart from '../charts/AreaChart.vue'
import LineChart from '../charts/LineChart.vue'
import EnterpriseDataTable from '../components/EnterpriseDataTable.vue'

const a = useAnalyticsStore()

onMounted(async () => {
  await Promise.all([a.fetchOverview(), a.fetchProducts(), a.fetchCountries(), a.fetchNetwork()])
})

function refresh() {
  return Promise.all([a.fetchOverview(true), a.fetchProducts(true), a.fetchCountries(true), a.fetchNetwork(true)])
}

const dailyX = computed(() => (a.overview?.daily_sales || []).map((r: any) => r.day))
const dailyY = computed(() => (a.overview?.daily_sales || []).map((r: any) => Number(r.sales_total || 0)))

const growthX = computed(() => (a.overview?.network_growth || []).map((r: any) => r.day))
const growthUsers = computed(() => (a.overview?.network_growth || []).map((r: any) => Number(r.total_users || 0)))
const growthActive = computed(() => (a.overview?.network_growth || []).map((r: any) => Number(r.total_active_users || 0)))

function money(v: any) {
  const n = Number(v || 0)
  return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB', minimumFractionDigits: 2 }).format(n)
}

const countryCols = [
  { key: 'country_code', label: 'País' },
  { key: 'sales_total', label: 'Ventas', align: 'end', sortable: true },
  { key: 'orders_count', label: 'Órdenes', align: 'end', sortable: true },
]
const productCols = [
  { key: 'product_id', label: 'Producto' },
  { key: 'sales_total', label: 'Ventas', align: 'end', sortable: true },
  { key: 'qty', label: 'Qty', align: 'end', sortable: true },
]

async function fetchCountries({ pageSize }: any) {
  // por ahora el backend devuelve top ya ordenado; table actúa como render
  return { rows: (a.countryMetrics || []).slice(0, pageSize) }
}

async function fetchProducts({ pageSize }: any) {
  return { rows: (a.topProducts || []).slice(0, pageSize) }
}
</script>


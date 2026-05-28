<template>
  <div class="space-y-6">
    <div class="card overflow-hidden border-brand/25 bg-gradient-to-br from-brand/10 via-bg-2 to-bg">
      <div class="card-body flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-xl font-semibold text-text">Panel ejecutivo MLM</h1>
          <p class="mt-1 max-w-2xl text-sm text-text-muted">
            Comisiones, ingresos, rangos y activación mensual de socios — datos en tiempo real desde el API.
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <span v-for="r in perms.roles" :key="r" class="badge badge-info">{{ r }}</span>
          <button class="btn btn-ghost" type="button" :disabled="dash.loading" @click="dash.fetchKpis()">
            Actualizar
          </button>
        </div>
      </div>
    </div>

    <p v-if="dash.error" class="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
      {{ dash.error }}
    </p>

    <template v-if="dash.loading && !dash.stats">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <UiSkeleton v-for="i in 8" :key="i" klass="h-28 w-full rounded-2xl" />
      </div>
      <UiSkeleton klass="h-80 w-full rounded-2xl" />
      <UiSkeleton klass="h-80 w-full rounded-2xl" />
    </template>

    <template v-else-if="!dash.stats && !dash.kpis.length">
      <UiEmptyState
        title="No se recibieron datos del dashboard"
        description="Verifica sesión admin y GET /api/v1/admin/dashboard/kpis."
      >
        <template #actions>
          <button class="btn btn-primary" @click="dash.fetchKpis()">Reintentar</button>
        </template>
      </UiEmptyState>
    </template>

    <template v-else>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Ingresos pedidos" :value="money(kpi('orders_revenue_total'))" hint="Completados (hist.)">
          <IconSvg name="chart" />
        </KpiCard>
        <KpiCard title="Comisiones pagadas" :value="money(kpi('commissions_paid_total'))" hint="Ledger acumulado">
          <IconSvg name="coins" />
        </KpiCard>
        <KpiCard title="Socios activos (mes)" :value="kpi('active_members', kpi('active_users'))" hint="Activación mensual">
          <IconSvg name="users" />
        </KpiCard>
        <KpiCard title="Nuevos socios (mes)" :value="kpi('users_new_this_month')" hint="Registros del mes">
          <IconSvg name="users" />
        </KpiCard>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Socios totales" :value="kpi('users_total')" hint="Base de red">
          <IconSvg name="users" />
        </KpiCard>
        <RouterLink to="/admin/withdrawals" class="block transition hover:opacity-95">
          <KpiCard title="Retiros pendientes" :value="kpi('withdrawals_pending')" hint="Ir a gestión de retiros →">
            <IconSvg name="wallet" />
          </KpiCard>
        </RouterLink>
        <KpiCard title="Pedidos hoy" :value="kpi('orders_today')" hint="Operación diaria">
          <IconSvg name="receipt" />
        </KpiCard>
        <KpiCard
          title="Volumen binario"
          :value="formatPv(kpi('binary_volume_current_period'))"
          :hint="`Periodo ${dash.stats?.binary_period_key || '—'}`"
        >
          <IconSvg name="tree" />
        </KpiCard>
      </div>

      <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <UiCard>
          <template #header>
            <div>
              <p class="text-sm font-semibold text-text">Comisiones pagadas por tipo</p>
              <p class="text-xs text-text-muted">Montos históricos acumulados (BIR, binario, residual, liderazgo…)</p>
            </div>
          </template>
          <MlmStyledBarChart
            :loading="dash.loading"
            :empty="!commissionLabels.length"
            :categories="commissionLabels"
            :values="commissionValues"
          />
        </UiCard>

        <UiCard>
          <template #header>
            <div>
              <p class="text-sm font-semibold text-text">Fuentes de ingreso a la empresa</p>
              <p class="text-xs text-text-muted">Pedidos completados e inscripciones de socios</p>
            </div>
          </template>
          <DonutChart
            :loading="dash.loading"
            :empty="!revenueDonut.length"
            :data="revenueDonut"
          />
        </UiCard>
      </div>

      <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <UiCard>
          <template #header>
            <div>
              <p class="text-sm font-semibold text-text">Socios por rango</p>
              <p class="text-xs text-text-muted">Distribución según volumen de grupo (PV)</p>
            </div>
          </template>
          <MlmStyledBarChart
            :loading="dash.loading"
            :empty="!rankLabels.length"
            :categories="rankLabels"
            :values="rankValues"
            :currency="false"
          />
        </UiCard>

        <UiCard>
          <template #header>
            <div>
              <p class="text-sm font-semibold text-text">Activación mensual vs sin activación</p>
              <p class="text-xs text-text-muted">
                Socios que cumplen PV mínimo ({{ activationThreshold }} PV) frente al resto de la base
              </p>
            </div>
          </template>
          <LineChart
            :loading="dash.loading"
            :empty="!activationMonths.length"
            :x="activationMonths"
            :series="[
              { name: 'Con activación', data: activationActive },
              { name: 'Sin activación', data: activationInactive },
            ]"
          />
        </UiCard>
      </div>

      <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <UiCard>
          <template #header>
            <div>
              <p class="text-sm font-semibold text-text">Ingreso por socios registrados</p>
              <p class="text-xs text-text-muted">Valor del paquete de inscripción por mes de alta</p>
            </div>
          </template>
          <AreaChart
            :loading="dash.loading"
            :empty="!partnerMonths.length"
            :x="partnerMonths"
            :series="[{ name: 'Ingreso inscripciones (Bs.)', data: partnerTotals }]"
          />
        </UiCard>

        <UiCard>
          <template #header>
            <div>
              <p class="text-sm font-semibold text-text">Ventas completadas — últimos 6 meses</p>
              <p class="text-xs text-text-muted">Total BOB de pedidos en estado completado</p>
            </div>
          </template>
          <BarChart
            :loading="dash.loading"
            :empty="!salesMonths.length"
            :x="salesMonths"
            :series="[{ name: 'Ventas (Bs.)', data: salesTotals }]"
          />
        </UiCard>
      </div>

      <UiCard v-if="dash.topMembers.length">
        <template #header>
          <div>
            <p class="text-sm font-semibold text-text">Top socios — PV mensual</p>
            <p class="text-xs text-text-muted">Los 10 socios con mayor calificación del periodo</p>
          </div>
        </template>
        <div class="overflow-x-auto">
          <table class="min-w-full text-left text-sm">
            <thead class="bg-white/3 text-xs text-text-muted">
              <tr>
                <th class="px-4 py-3 font-semibold">#</th>
                <th class="px-4 py-3 font-semibold">Socio</th>
                <th class="px-4 py-3 font-semibold">Código</th>
                <th class="px-4 py-3 font-semibold">Rango</th>
                <th class="px-4 py-3 text-end font-semibold">PV mes</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(m, idx) in dash.topMembers" :key="m.id" class="border-t border-border">
                <td class="px-4 py-3 text-text-muted">{{ idx + 1 }}</td>
                <td class="px-4 py-3 font-medium text-text">{{ m.name }}</td>
                <td class="px-4 py-3 text-text-muted">{{ m.member_code }}</td>
                <td class="px-4 py-3">
                  <span class="badge badge-warn">{{ m.rank_name }}</span>
                </td>
                <td class="px-4 py-3 text-end font-semibold text-text">{{ formatPv(m.monthly_qualifying_pv) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </UiCard>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useDashboardStore } from '@/modules/dashboard/stores/dashboardStore'
import { usePermissionsStore } from '@/stores/permissionsStore'
import UiSkeleton from '@/components/ui/UiSkeleton.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'
import UiCard from '@/components/ui/UiCard.vue'
import KpiCard from '@/modules/dashboard/widgets/KpiCard.vue'
import MlmStyledBarChart from '@/modules/dashboard/widgets/MlmStyledBarChart.vue'
import IconSvg from '@/components/enterprise/icons/IconSvg.vue'
import BarChart from '@/modules/analytics/charts/BarChart.vue'
import LineChart from '@/modules/analytics/charts/LineChart.vue'
import DonutChart from '@/modules/analytics/charts/DonutChart.vue'
import AreaChart from '@/modules/analytics/charts/AreaChart.vue'

const dash = useDashboardStore()
const perms = usePermissionsStore()

const charts = computed(() => dash.charts || {})

onMounted(() => {
  if (!dash.stats) dash.fetchKpis()
})

function kpi(key, fallback = '0') {
  const row = (dash.kpis || []).find((r) => r.key === key)
  if (row) return row.value == null ? fallback : String(row.value)
  const v = dash.stats?.[key]
  return v == null ? fallback : String(v)
}

function money(v) {
  const n = Number(v)
  if (Number.isNaN(n)) return String(v ?? '—')
  return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB', minimumFractionDigits: 2 }).format(n)
}

function formatPv(value) {
  const n = Number(value)
  if (Number.isNaN(n)) return '—'
  return `${n.toLocaleString('es-BO', { maximumFractionDigits: 2 })} PV`
}

const commissionRows = computed(() => {
  const labeled = charts.value.commissions_by_type_labeled
  if (Array.isArray(labeled) && labeled.length) return labeled
  const raw = charts.value.commissions_by_type || {}
  return Object.entries(raw).map(([type, total]) => ({
    type,
    label: type.toUpperCase(),
    total: String(total),
  }))
})

const commissionLabels = computed(() => commissionRows.value.map((r) => r.label))
const commissionValues = computed(() => commissionRows.value.map((r) => Number(r.total) || 0))

const revenueDonut = computed(() =>
  (charts.value.revenue_by_source || [])
    .filter((r) => Number(r.total) > 0)
    .map((r) => ({ name: r.label, value: Number(r.total) || 0 })),
)

const rankRows = computed(() => charts.value.rank_distribution || [])
const rankLabels = computed(() => rankRows.value.map((r) => r.name || r.slug))
const rankValues = computed(() => rankRows.value.map((r) => r.total ?? 0))

const activationSeries = computed(() => charts.value.monthly_member_activation || [])
const activationMonths = computed(() => activationSeries.value.map((r) => r.month))
const activationActive = computed(() => activationSeries.value.map((r) => r.active ?? 0))
const activationInactive = computed(() => activationSeries.value.map((r) => r.inactive ?? 0))
const activationThreshold = computed(() => {
  const first = activationSeries.value[0]
  return first?.threshold_pv != null ? `${first.threshold_pv}` : '200'
})

const partnerSeries = computed(() => charts.value.partner_registration_revenue_by_month || [])
const partnerMonths = computed(() => partnerSeries.value.map((r) => r.month))
const partnerTotals = computed(() => partnerSeries.value.map((r) => Number(r.total) || 0))

const salesSeries = computed(() => charts.value.sales_last_6_months || [])
const salesMonths = computed(() => salesSeries.value.map((r) => r.month))
const salesTotals = computed(() => salesSeries.value.map((r) => Number(r.total) || 0))
</script>
